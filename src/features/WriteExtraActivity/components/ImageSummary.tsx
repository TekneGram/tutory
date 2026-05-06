import type { WriteExtraImageRefDto } from "@/app/ports/activities/writeextra.ports";
import ImageContainer from "@/features/ActivitySubComponents/ImageContainer/ImageContainer";

type ImageSummaryProps = {
  imageRefs: WriteExtraImageRefDto[];
  assetBase: string | null;
};

const ImageSummary = ({ imageRefs, assetBase }: ImageSummaryProps) => {
  if (imageRefs.length === 0) {
    return null;
  }

  return <ImageContainer imageRefs={imageRefs} assetBase={assetBase} />;
};

export default ImageSummary;
