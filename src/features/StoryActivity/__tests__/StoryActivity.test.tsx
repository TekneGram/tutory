import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import StoryActivity from "../StoryActivity";

const { useStoryActivityQueryMock, useSubmitStoryFeedbackMutationMock } = vi.hoisted(() => ({
  useStoryActivityQueryMock: vi.fn(),
  useSubmitStoryFeedbackMutationMock: vi.fn(),
}));

vi.mock("../hooks/useStoryActivityQuery", () => ({
  useStoryActivityQuery: useStoryActivityQueryMock,
}));

vi.mock("../hooks/useSubmitStoryFeedbackMutation", () => ({
  useSubmitStoryFeedbackMutation: useSubmitStoryFeedbackMutationMock,
}));

const storyResponse = {
  story: {
    instructions: "Read the story and practice the words.",
    advice: "Check the highlighted words.",
    title: "Fau-chan's bad day",
    assetBase: "english/unit_1/cycle_1",
    passage: {
      pages: [{ order: 1, text: "One afternoon, Fau-chan would not eat." }],
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
  },
};

describe("StoryActivity", () => {
  beforeEach(() => {
    useStoryActivityQueryMock.mockReset();
    useSubmitStoryFeedbackMutationMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders loading, error, and success states", () => {
    useSubmitStoryFeedbackMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    useStoryActivityQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });

    const { rerender } = render(
      <StoryActivity
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
        unitCycleActivityId="activity-1"
      />,
    );

    expect(screen.getByText("Loading story...")).toBeTruthy();

    useStoryActivityQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Unable to load story."),
    });

    rerender(
      <StoryActivity
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
        unitCycleActivityId="activity-1"
      />,
    );

    expect(screen.getByText("Unable to load story.")).toBeTruthy();

    useStoryActivityQueryMock.mockReturnValue({
      data: storyResponse,
      isLoading: false,
      isError: false,
      error: null,
    });

    rerender(
      <StoryActivity
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
        unitCycleActivityId="activity-1"
      />,
    );

    expect(screen.getByRole("heading", { name: "Fau-chan's bad day" })).toBeTruthy();
    expect(screen.getByText("Read the story and practice the words.")).toBeTruthy();
  });

  it("submits feedback through the story mutation and reveals the completed state", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({
      completion: {
        isCompleted: true,
      },
    });

    useStoryActivityQueryMock.mockReturnValue({
      data: storyResponse,
      isLoading: false,
      isError: false,
      error: null,
    });

    useSubmitStoryFeedbackMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    render(
      <StoryActivity
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
        unitCycleActivityId="activity-1"
      />,
    );

    fireEvent.click(screen.getByLabelText("👌"));
    fireEvent.change(screen.getByLabelText("Comment"), { target: { value: "Good pacing." } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        learnerId: "learner-1",
        unitCycleActivityId: "activity-1",
        selectedAnswer: "👌",
        comment: "Good pacing.",
      });
    });

    await waitFor(() => {
      expect(screen.getByText("well done!")).toBeTruthy();
    });
  });

  it("shows the completed state immediately when the fetched story is already completed", () => {
    useStoryActivityQueryMock.mockReturnValue({
      data: {
        story: {
          ...storyResponse.story,
          completion: {
            isCompleted: true,
          },
        },
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    useSubmitStoryFeedbackMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    render(
      <StoryActivity
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
        unitCycleActivityId="activity-1"
      />,
    );

    expect(screen.getByText("well done!")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Send" }).hasAttribute("disabled")).toBe(true);
  });
});
