import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StoryContainer from "../StoryContainer";

const { imageContainerSpy, textDisplaySpy, feedbackSpy } = vi.hoisted(() => ({
  imageContainerSpy: vi.fn(),
  textDisplaySpy: vi.fn(),
  feedbackSpy: vi.fn(),
}));

vi.mock("@/features/ActivitySubComponents/ImageContainer/ImageContainer", () => ({
  default: (props: unknown) => {
    imageContainerSpy(props);
    return <div data-testid="image-container" />;
  },
}));

vi.mock("@/features/ActivitySubComponents/TextDisplay/TextDisplay", () => ({
  default: (props: unknown) => {
    textDisplaySpy(props);
    return <div data-testid="text-display" />;
  },
}));

vi.mock("@/features/ActivitySubComponents/Feedback/Feedback", () => ({
  default: (props: unknown) => {
    feedbackSpy(props);
    return <div data-testid="feedback" />;
  },
}));

const story = {
  instructions: "Read the story and practice the words.",
  advice: "Check the highlighted words.",
  title: "Fau-chan's bad day",
  assetBase: "english/unit_1/cycle_1",
  passage: {
    pages: [{ order: 2, text: "Page two." }, { order: 1, text: "Page one." }],
  },
  assets: {
    imageRefs: [{ order: 1, imageRef: "story_image_1.webp" }],
    audioRefs: [],
    videoRefs: [],
  },
  words: [{ word: "quiet", japanese: "静かな", position: 27 }],
  feedback: {
    question: "Was it easy or tough?",
    answers: ["🥰", "👌", "😓"] as [string, string, string],
    comment: "",
  },
  completion: {
    isCompleted: false,
  },
};

describe("StoryContainer", () => {
  beforeEach(() => {
    imageContainerSpy.mockReset();
    textDisplaySpy.mockReset();
    feedbackSpy.mockReset();
  });

  it("renders the title and instructions, and reveals hint text on hover", () => {
    render(
      <StoryContainer story={story} isCompleted={false} onSubmitFeedback={vi.fn()} />,
    );

    expect(screen.getByRole("heading", { name: "Fau-chan's bad day" })).toBeTruthy();
    expect(screen.getByText("Read the story and practice the words.")).toBeTruthy();
    expect(screen.queryByText("Check the highlighted words.")).toBeNull();

    fireEvent.mouseEnter(screen.getByRole("button", { name: "Hint" }));
    expect(screen.getByText("Check the highlighted words.")).toBeTruthy();

    fireEvent.mouseLeave(screen.getByRole("button", { name: "Hint" }));
    expect(screen.queryByText("Check the highlighted words.")).toBeNull();
  });

  it("wires passage, words, image refs, asset base, and feedback into the subcomponents", () => {
    render(
      <StoryContainer story={story} isCompleted={false} onSubmitFeedback={vi.fn()} />,
    );

    expect(imageContainerSpy.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        imageRefs: story.assets.imageRefs,
        assetBase: story.assetBase,
      }),
    );
    expect(textDisplaySpy.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        passage: story.passage,
        words: story.words,
      }),
    );
    expect(feedbackSpy.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        feedback: story.feedback,
        disabled: false,
        onSubmit: expect.any(Function),
      }),
    );
  });
});
