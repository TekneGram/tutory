import { app, net, protocol } from 'electron';
import path from "node:path";
import { pathToFileURL } from "node:url";
import { randomUUID } from 'node:crypto';
import fs from "node:fs";

import { raiseAppError } from '@electron/core/appException';
import { toAppError } from '@electron/core/appError';
import { logger } from "@electron/utilities/logger";

function getBundledContentRoot(): string {
    return app.isPackaged
        ? path.join(process.resourcesPath, "content")
        : path.join(process.cwd(), "electron", "assets", "content");
}

function resolveSafeContentPath(relativePath: string): string {
    const root = getBundledContentRoot();
    const absolute = path.resolve(root, relativePath);
    const normalizedRoot = path.resolve(root) + path.sep;

    if (!absolute.startsWith(normalizedRoot)) {
        raiseAppError("FS_PERMISSION_DENIED", "Invalid asset path.");
    }

    return absolute;
}

function toHttpStatus(code: string): number {
    switch (code) {
        case "VALIDATION_INVALID_PAYLOAD":
            return 400;
        case "FS_PERMISSION_DENIED":
            return 403;
        case "FS_NOT_FOUND":
            return 404;
        default:
            return 500;
    }
}

function resolveExistingContentPath(relativePath: string): string {
    const absolute = resolveSafeContentPath(relativePath);

    if (!fs.existsSync(absolute)) {
        raiseAppError("FS_NOT_FOUND", "Asset not found.");
    }

    return absolute;
}

export function getContentTypeForAssetPath(assetPath: string): string {
    const extension = path.extname(assetPath).toLowerCase();

    switch (extension) {
        case ".ogg":
            return "audio/ogg";
        case ".mp3":
            return "audio/mpeg";
        case ".wav":
            return "audio/wav";
        case ".webm":
            return "video/webm";
        case ".webp":
            return "image/webp";
        case ".png":
            return "image/png";
        case ".jpg":
        case ".jpeg":
            return "image/jpeg";
        default:
            return "application/octet-stream";
    }
}

type ByteRange = {
    start: number;
    end: number;
};

export function parseByteRangeHeader(rangeHeader: string | null, size: number): ByteRange | null {
    if (!rangeHeader) {
        return null;
    }

    const match = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader.trim());
    if (!match) {
        return null;
    }

    const rawStart = match[1];
    const rawEnd = match[2];

    if (rawStart === "" && rawEnd === "") {
        return null;
    }

    if (rawStart === "") {
        const suffixLength = Number.parseInt(rawEnd, 10);
        if (!Number.isFinite(suffixLength) || suffixLength <= 0) {
            return null;
        }
        const clampedSuffix = Math.min(suffixLength, size);
        return {
            start: Math.max(0, size - clampedSuffix),
            end: size - 1,
        };
    }

    const start = Number.parseInt(rawStart, 10);
    if (!Number.isFinite(start) || start < 0 || start >= size) {
        return null;
    }

    if (rawEnd === "") {
        return {
            start,
            end: size - 1,
        };
    }

    const end = Number.parseInt(rawEnd, 10);
    if (!Number.isFinite(end) || end < start) {
        return null;
    }

    return {
        start,
        end: Math.min(end, size - 1),
    };
}

export function registerContentAssetProtocol(): void {
    protocol.handle("app-asset", async (request) => {
        const correlationId = randomUUID();

        try {
            const url = new URL(request.url);
            if (url.hostname !== "content") {
                return new Response("Not found", { status: 404 });
            }

            const relativePath = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
            const assetPath = resolveExistingContentPath(relativePath);
            const contentType = getContentTypeForAssetPath(assetPath);
            const size = fs.statSync(assetPath).size;
            const headers = new Headers();
            headers.set("content-type", contentType);
            headers.set("accept-ranges", "bytes");
            headers.set("cache-control", "public, max-age=31536000, immutable");

            const method = request.method.toUpperCase();
            const rangeHeader = request.headers.get("range");
            const byteRange = parseByteRangeHeader(rangeHeader, size);

            if (method === "HEAD") {
                headers.set("content-length", String(size));

                logger.info("Content asset HEAD response", {
                    correlationId,
                    url: request.url,
                    contentType,
                    size,
                });

                return new Response(null, {
                    status: 200,
                    headers,
                });
            }

            if (byteRange !== null) {
                const chunkLength = byteRange.end - byteRange.start + 1;
                const buffer = fs.readFileSync(assetPath, {
                    encoding: null,
                    flag: "r",
                }).subarray(byteRange.start, byteRange.end + 1);

                headers.set("content-range", `bytes ${byteRange.start}-${byteRange.end}/${size}`);
                headers.set("content-length", String(chunkLength));

                logger.info("Content asset range response", {
                    correlationId,
                    url: request.url,
                    contentType,
                    size,
                    range: rangeHeader,
                    start: byteRange.start,
                    end: byteRange.end,
                });

                return new Response(buffer, {
                    status: 206,
                    headers,
                });
            }

            if (rangeHeader) {
                headers.set("content-range", `bytes */${size}`);

                logger.warn("Invalid media range request", {
                    correlationId,
                    url: request.url,
                    range: rangeHeader,
                    size,
                });

                return new Response("Invalid range.", {
                    status: 416,
                    headers,
                });
            }

            const response = await net.fetch(pathToFileURL(assetPath).toString());
            const responseHeaders = new Headers(response.headers);
            responseHeaders.set("content-type", contentType);
            responseHeaders.set("accept-ranges", "bytes");
            responseHeaders.set("content-length", String(size));

            logger.info("Content asset full response", {
                correlationId,
                url: request.url,
                contentType,
                size,
            });

            return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: responseHeaders,
            });
        } catch (error) {
            const appError = toAppError(error, "INTERNAL_UNEXPECTED");

            logger.error("Content asset protocol request failed.", {
                correlationId,
                url: request.url,
                error: appError,
            });

            return new Response(appError.message, {
                status: toHttpStatus(appError.code),
            });
        }
    });
}
