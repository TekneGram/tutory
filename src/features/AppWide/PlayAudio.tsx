import { useMemo, useState } from "react";
import type { AudioRef } from "@/app/types/media";

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

function getAudioMimeType(audioRef: string): string {
  const extension = audioRef.split("?")[0].split(".").pop()?.toLowerCase();
  switch (extension) {
    case "ogg":
      return "audio/ogg";
    case "mp3":
      return "audio/mpeg";
    case "wav":
      return "audio/wav";
    default:
      return "audio/*";
  }
}

type PlayAudioProps = {
  audioRefs: AudioRef[];
  assetBase: string | null;
};

const PlayAudio = ({ audioRefs, assetBase }: PlayAudioProps) => {
  const [hasError, setHasError] = useState(false);
  const [retryNonce, setRetryNonce] = useState(0);

  if (audioRefs.length === 0) {
    return null;
  }

  const firstAudio = [...audioRefs].sort((left, right) => left.order - right.order)[0];
  const audioSrc = useMemo(() => resolveAudioSrc(assetBase, firstAudio.audioRef), [assetBase, firstAudio.audioRef]);
  const audioType = useMemo(() => getAudioMimeType(firstAudio.audioRef), [firstAudio.audioRef]);

  return (
    <section className="write-extra__audio" aria-label="Listen to summary">
      <h3>Listen to summary</h3>
      <audio
        key={`${audioSrc}-${retryNonce}`}
        controls
        preload="metadata"
        onError={() => setHasError(true)}
        onCanPlay={() => setHasError(false)}
      >
        <source src={audioSrc} type={audioType} />
        Your browser does not support the audio element.
      </audio>
      {hasError ? (
        <div className="write-extra__audio-error">
          <p className="write-extra__error">Audio could not be loaded. Please try again.</p>
          <button
            type="button"
            onClick={() => {
              setHasError(false);
              setRetryNonce((current) => current + 1);
            }}
          >
            Retry audio
          </button>
        </div>
      ) : null}
    </section>
  );
};

export default PlayAudio;
