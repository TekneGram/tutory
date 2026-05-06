import type { WriteExtraAudioRefDto } from "@/app/ports/activities/writeextra.ports";

type ListenToSummaryProps = {
  audioRefs: WriteExtraAudioRefDto[];
  assetBase: string | null;
};

function encodePathSegmentPath(value: string): string {
  return value
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function buildContentAssetUrl(assetBase: string, ref: string): string {
  return `app-asset://content/${encodePathSegmentPath(assetBase)}/${encodePathSegmentPath(ref)}`;
}

function resolveAudioSrc(assetBase: string | null, audioRef: string): string {
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(audioRef) || audioRef.startsWith("/")) {
    return audioRef;
  }

  if (assetBase === null) {
    return audioRef;
  }

  return buildContentAssetUrl(assetBase, audioRef);
}

const ListenToSummary = ({ audioRefs, assetBase }: ListenToSummaryProps) => {
  if (audioRefs.length === 0) {
    return null;
  }

  const firstAudio = [...audioRefs].sort((left, right) => left.order - right.order)[0];

  return (
    <section className="write-extra__audio" aria-label="Listen to summary">
      <h3>Listen to summary</h3>
      <audio controls preload="metadata" src={resolveAudioSrc(assetBase, firstAudio.audioRef)}>
        Your browser does not support the audio element.
      </audio>
    </section>
  );
};

export default ListenToSummary;
