import { useEffect, useState } from "react";
import "./ImageContainer.css";

export type StoryImageRefDto = {
  order: number;
  imageRef: string;
};

export type ImageContainerProps = {
  imageRefs: StoryImageRefDto[];
  assetBase: string | null;
  autoScroll?: boolean;
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

function resolveImageSrc(assetBase: string | null, imageRef: string): string {
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(imageRef) || imageRef.startsWith("/")) {
    return imageRef;
  }

  if (assetBase === null) {
    return imageRef;
  }

  return buildContentAssetUrl(assetBase, imageRef);
}

const ImageContainer = ({ imageRefs, assetBase, autoScroll = false }: ImageContainerProps) => {
  const orderedImageRefs = [...imageRefs].sort((left, right) => left.order - right.order);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (orderedImageRefs.length === 0) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex((currentIndex) => Math.min(currentIndex, orderedImageRefs.length - 1));
  }, [orderedImageRefs.length]);

  useEffect(() => {
    if (!autoScroll || orderedImageRefs.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % orderedImageRefs.length);
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [autoScroll, orderedImageRefs.length]);

  if (orderedImageRefs.length === 0) {
    return null;
  }

  const activeImage = orderedImageRefs[activeIndex];
  const canNavigate = orderedImageRefs.length > 1;

  function handlePrevious() {
    setActiveIndex((currentIndex) =>
      (currentIndex - 1 + orderedImageRefs.length) % orderedImageRefs.length,
    );
  }

  function handleNext() {
    setActiveIndex((currentIndex) => (currentIndex + 1) % orderedImageRefs.length);
  }

  return (
    <section className="image-container" aria-label="Story images">
      <div className="image-container-shell">
        <button
          type="button"
          className="image-container-control image-container-control-prev"
          aria-label="Previous image"
          onClick={handlePrevious}
          disabled={!canNavigate}
        >
          <span aria-hidden="true">‹</span>
        </button>

        <figure className="image-container-frame">
          <img
            className="image-container-image"
            src={resolveImageSrc(assetBase, activeImage.imageRef)}
            alt={`Story image ${activeImage.order}`}
          />
        </figure>

        <button
          type="button"
          className="image-container-control image-container-control-next"
          aria-label="Next image"
          onClick={handleNext}
          disabled={!canNavigate}
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>

      <div className="image-container-footer" aria-live="polite">
        <span className="image-container-counter">
          {activeIndex + 1} of {orderedImageRefs.length}
        </span>
      </div>
    </section>
  );
};

export default ImageContainer;
