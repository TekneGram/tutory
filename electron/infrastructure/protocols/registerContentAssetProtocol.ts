import { app, net, protocol } from 'electron';
import path from "node:path";
import { pathToFileURL } from "node:url";
import { randomUUID } from 'node:crypto';
import fs from "node:fs";

import { raiseAppError } from '@electron/core/appException';
import { toAppError } from '@electron/core/appError';
import { logger } from '@electron/services/logger';

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

            return net.fetch(pathToFileURL(assetPath).toString());
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