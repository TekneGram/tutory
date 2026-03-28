```ts

// electron/ipc/contracts/media.contracts.ts
  export type GetActivityMediaRequest = {
    activityId: string;
  };

  export type GetActivityMediaResponse = {
    activityId: string;
    story: string;
    imageUrl: string | null;
    audioUrl: string | null;
  };

  // src/app/ports/media.ports.ts
  import type { AppResult } from "@/app/types/result";

  export interface GetActivityMediaRequest {
    activityId: string;
  }

  export interface GetActivityMediaResponse {
    activityId: string;
    story: string;
    imageUrl: string | null;
    audioUrl: string | null;
  }

  export interface MediaPort {
    getActivityMedia(
      request: GetActivityMediaRequest
    ): Promise<AppResult<GetActivityMediaResponse>>;
  }

  // src/app/adapters/media.adapters.ts
  import { invokeRequest } from "@/app/adapters/invokeRequest";
  import type {
    GetActivityMediaRequest,
    GetActivityMediaResponse,
    MediaPort,
  } from "@/app/ports/media.ports";

  export const mediaAdapter: MediaPort = {
    async getActivityMedia(request) {
      return invokeRequest<GetActivityMediaRequest, GetActivityMediaResponse>(
        "media:activity:get",
        request
      );
    },
  };

  // electron/ipc/registerHandlers/register.media.ts
  import { safeHandle } from "../safeHandle";
  import { validateOrThrow } from "../validate";
  import { z } from "zod";
  import { getActivityMedia } from "@electron/services/media/getActivityMedia";

  const getActivityMediaSchema = z.object({
    activityId: z.string().min(1),
  });

  export function registerMediaHandlers(): void {
    safeHandle("media:activity:get", async (_event, rawArgs, ctx) => {
      const args = validateOrThrow(getActivityMediaSchema, rawArgs);
      return getActivityMedia(args, ctx);
    });
  }

  // electron/services/media/getActivityMedia.ts
  import type { RequestContext } from "@electron/core/requestContext";

  type ActivityAssetJson = {
    activityId: string;
    assetBase: string;
    content: {
      story: string;
      imageRef?: string;
      audioRef?: string;
    };
  };

  export async function getActivityMedia(
    request: { activityId: string },
    _ctx: RequestContext
  ): Promise<{
    activityId: string;
    story: string;
    imageUrl: string | null;
    audioUrl: string | null;
  }> {
    const payload = /* fetch JSON column from sqlite by activityId */ null as unknown as ActivityAssetJson;

    return {
      activityId: payload.activityId,
      story: payload.content.story,
      imageUrl: payload.content.imageRef
        ? buildContentAssetUrl(payload.assetBase, payload.content.imageRef)
        : null,
      audioUrl: payload.content.audioRef
        ? buildContentAssetUrl(payload.assetBase, payload.content.audioRef)
        : null,
    };
  }

  // electron/services/media/assetUrl.ts
  function encodePathSegmentPath(value: string): string {
    return value
      .split("/")
      .map((part) => encodeURIComponent(part))
      .join("/");
  }

  export function buildContentAssetUrl(assetBase: string, ref: string): string {
    return `tutory-asset://content/${encodePathSegmentPath(assetBase)}/${encodePathSegmentPath(ref)}`;
  }

  The important backend piece is the protocol:

  // electron/infrastructure/protocols/registerContentAssetProtocol.ts
  import { app, net, protocol } from "electron";
  import path from "node:path";
  import { pathToFileURL } from "node:url";

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
      throw new Error("Invalid asset path.");
    }

    return absolute;
  }

  export function registerContentAssetProtocol(): void {
    protocol.handle("tutory-asset", async (request) => {
      const url = new URL(request.url);

      if (url.hostname !== "content") {
        return new Response("Not found", { status: 404 });
      }

      const relativePath = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
      const assetPath = resolveSafeContentPath(relativePath);

      return net.fetch(pathToFileURL(assetPath).toString());
    });
  }

  Then compose it in startup:

  // electron/main.ts
  app.whenReady().then(() => {
    bootstrapStorage();
    initializeDatabase();
    registerContentAssetProtocol();
    registerHandlers();
    createWindow();
  });

  Renderer usage stays simple:

  // src/features/MediaDescriptionContainer/hooks/useActivityMediaQuery.ts
  import { useQuery } from "@tanstack/react-query";
  import { mediaAdapter } from "@/app/adapters/media.adapters";
  import { getActivityMedia } from "../services/getActivityMedia.service";

  export function useActivityMediaQuery(activityId: string) {
    return useQuery({
      queryKey: ["activity-media", activityId],
      queryFn: () => getActivityMedia(mediaAdapter, { activityId }),
      enabled: Boolean(activityId),
    });
  }

  // src/features/MediaDescriptionContainer/MediaDescriptionContainer.tsx
  export function MediaDescriptionContainer({ activityId }: { activityId: string }) {
    const { data, isPending } = useActivityMediaQuery(activityId);

    if (isPending) return <div>Loading...</div>;
    if (!data) return null;

    return (
      <section>
        <p>{data.story}</p>
        {data.imageUrl ? <img src={data.imageUrl} alt="" /> : null}
        {data.audioUrl ? <audio controls src={data.audioUrl} /> : null}
      </section>
    );
  }
  
```