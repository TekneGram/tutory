import type { ImageRef } from "@/app/types/media";
import ImageContainer from "@/features/ActivitySubComponents/ImageContainer/ImageContainer";

type MultipleImageDisplayProps = {
  imageRefs: ImageRef[];
  assetBase: string | null;
  autoScroll?: boolean;
};

const MultipleImageDisplay = ({ imageRefs, assetBase, autoScroll = false }: MultipleImageDisplayProps) => {
  if (imageRefs.length === 0) {
    return null;
  }

  return <ImageContainer imageRefs={imageRefs} assetBase={assetBase} autoScroll={autoScroll} />;
};

export default MultipleImageDisplay;
