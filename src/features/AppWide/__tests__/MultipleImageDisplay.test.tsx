import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import MultipleImageDisplay from "../MultipleImageDisplay";

const imageContainerMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/ActivitySubComponents/ImageContainer/ImageContainer", () => ({
  default: imageContainerMock,
}));

describe("MultipleImageDisplay", () => {
  afterEach(() => {
    cleanup();
    imageContainerMock.mockReset();
  });

  it("renders nothing when there are no images", () => {
    const { container } = render(<MultipleImageDisplay imageRefs={[]} assetBase={null} />);

    expect(container.firstChild).toBeNull();
    expect(imageContainerMock).not.toHaveBeenCalled();
  });

  it("passes ordered image refs and asset base through to ImageContainer", () => {
    render(
      <MultipleImageDisplay
        assetBase="english/unit_1/cycle_2"
        imageRefs={[
          { order: 2, imageRef: "second.webp" },
          { order: 1, imageRef: "first.webp" },
        ]}
      />,
    );

    expect(imageContainerMock).toHaveBeenCalledTimes(1);
    expect(imageContainerMock).toHaveBeenCalledWith(
      {
        assetBase: "english/unit_1/cycle_2",
        autoScroll: false,
        imageRefs: [
          { order: 2, imageRef: "second.webp" },
          { order: 1, imageRef: "first.webp" },
        ],
      },
      {},
    );
  });
});
