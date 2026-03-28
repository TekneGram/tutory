function encodePathSegmentPath(value: string): string{
    return value
        .split("/")
        .map((part) => encodeURIComponent(part))
        .join("/");
}

export function buildContentAssetUrl(assetBase: string, ref: string): string {
    return `app-asset://content/${encodePathSegmentPath(assetBase)}/${encodePathSegmentPath(ref)}`;
}