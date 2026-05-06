import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import VocabReviewActivity from "../VocabReviewActivity";

const {
  useVocabReviewActivityQueryMock,
  useCheckVocabReviewWordMutationMock,
  useRetryVocabReviewWordMutationMock,
  useResetVocabReviewActivityMutationMock,
} = vi.hoisted(() => ({
  useVocabReviewActivityQueryMock: vi.fn(),
  useCheckVocabReviewWordMutationMock: vi.fn(),
  useRetryVocabReviewWordMutationMock: vi.fn(),
  useResetVocabReviewActivityMutationMock: vi.fn(),
}));

vi.mock("../hooks/useVocabReviewActivityQuery", () => ({
  useVocabReviewActivityQuery: useVocabReviewActivityQueryMock,
}));

vi.mock("../hooks/useCheckVocabReviewWordMutation", () => ({
  useCheckVocabReviewWordMutation: useCheckVocabReviewWordMutationMock,
}));

vi.mock("../hooks/useRetryVocabReviewWordMutation", () => ({
  useRetryVocabReviewWordMutation: useRetryVocabReviewWordMutationMock,
}));

vi.mock("../hooks/useResetVocabReviewActivityMutation", () => ({
  useResetVocabReviewActivityMutation: useResetVocabReviewActivityMutationMock,
}));

const response = {
  vocabReview: {
    instructions: "Review these words.",
    advice: "Click a word to practice spelling.",
    title: "Vocabulary Review",
    assetBase: null,
    words: [
      { wordId: "word-1", word: "would", japanese: "〜だろう", order: 1 },
      { wordId: "word-2", word: "quiet", japanese: "静かな", order: 2 },
    ],
    learnerWordStates: [
      {
        wordId: "word-1",
        learnerInput: null,
        isChecked: false,
        isCorrect: false,
        checkedAt: null,
      },
      {
        wordId: "word-2",
        learnerInput: null,
        isChecked: false,
        isCorrect: false,
        checkedAt: null,
      },
    ],
    progress: {
      checkedCount: 0,
      correctCount: 0,
      totalCount: 2,
      isFinished: false,
      completedAt: null,
    },
  },
};

describe("VocabReviewActivity", () => {
  beforeEach(() => {
    useVocabReviewActivityQueryMock.mockReset();
    useCheckVocabReviewWordMutationMock.mockReset();
    useRetryVocabReviewWordMutationMock.mockReset();
    useResetVocabReviewActivityMutationMock.mockReset();
  });

  afterEach(() => cleanup());

  it("renders loading, error, and success states", () => {
    useCheckVocabReviewWordMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    useRetryVocabReviewWordMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    useResetVocabReviewActivityMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });

    useVocabReviewActivityQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });

    const { rerender } = render(
      <VocabReviewActivity
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
        unitCycleActivityId="activity-1"
      />,
    );

    expect(screen.getByText("Loading vocabulary review...")).toBeTruthy();

    useVocabReviewActivityQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Unable to load vocab review."),
    });

    rerender(
      <VocabReviewActivity
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
        unitCycleActivityId="activity-1"
      />,
    );

    expect(screen.getByText("Unable to load vocab review.")).toBeTruthy();

    useVocabReviewActivityQueryMock.mockReturnValue({
      data: response,
      isLoading: false,
      isError: false,
      error: null,
    });

    rerender(
      <VocabReviewActivity
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
        unitCycleActivityId="activity-1"
      />,
    );

    expect(screen.getByRole("heading", { name: "Vocabulary Review" })).toBeTruthy();
    expect(screen.getByText("Review these words.")).toBeTruthy();
  });

  it("checks a selected word through mutation payload", async () => {
    const checkMutateAsync = vi.fn().mockResolvedValue({
      learnerWordState: {
        wordId: "word-1",
        learnerInput: "would",
        isChecked: true,
        isCorrect: true,
        checkedAt: "2026-05-06T00:00:00.000Z",
      },
      progress: {
        checkedCount: 1,
        correctCount: 1,
        totalCount: 2,
        isFinished: false,
        completedAt: null,
      },
    });

    useVocabReviewActivityQueryMock.mockReturnValue({
      data: response,
      isLoading: false,
      isError: false,
      error: null,
    });
    useCheckVocabReviewWordMutationMock.mockReturnValue({ mutateAsync: checkMutateAsync, isPending: false });
    useRetryVocabReviewWordMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    useResetVocabReviewActivityMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });

    render(
      <VocabReviewActivity
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
        unitCycleActivityId="activity-1"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "would" }));
    fireEvent.change(screen.getByLabelText("Spelling input"), { target: { value: "would" } });
    fireEvent.click(screen.getByRole("button", { name: "Check" }));

    await waitFor(() => {
      expect(checkMutateAsync).toHaveBeenCalledWith({
        learnerId: "learner-1",
        unitCycleActivityId: "activity-1",
        wordId: "word-1",
        learnerInput: "would",
      });
    });
  });

  it("shows japanese on the active wheel word while card is selected", () => {
    useVocabReviewActivityQueryMock.mockReturnValue({
      data: response,
      isLoading: false,
      isError: false,
      error: null,
    });
    useCheckVocabReviewWordMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    useRetryVocabReviewWordMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    useResetVocabReviewActivityMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });

    render(
      <VocabReviewActivity
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
        unitCycleActivityId="activity-1"
      />,
    );

    expect(screen.getAllByText("would").length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByRole("button", { name: "would" })[0]);
    const japaneseMatches = screen.getAllByText("〜だろう");
    const wheelItem = japaneseMatches
      .map((node) => node.closest("button"))
      .find((button) => button?.className.includes("vocab-review-wheel__word"));
    expect(wheelItem?.className).toContain("vocab-review-wheel__word--active");
  });

  it("autofocuses spelling input when card enters selected mode", () => {
    useVocabReviewActivityQueryMock.mockReturnValue({
      data: response,
      isLoading: false,
      isError: false,
      error: null,
    });
    useCheckVocabReviewWordMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    useRetryVocabReviewWordMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    useResetVocabReviewActivityMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });

    render(
      <VocabReviewActivity
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
        unitCycleActivityId="activity-1"
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "would" })[0]);
    const input = screen.getByLabelText("Spelling input");
    expect(document.activeElement).toBe(input);
  });

  it("shows reset when finished and sends reset mutation", async () => {
    const resetMutateAsync = vi.fn().mockResolvedValue({
      learnerWordStates: [],
      progress: {
        checkedCount: 0,
        correctCount: 0,
        totalCount: 2,
        isFinished: false,
        completedAt: null,
      },
    });

    useVocabReviewActivityQueryMock.mockReturnValue({
      data: {
        ...response,
        vocabReview: {
          ...response.vocabReview,
          learnerWordStates: [
            {
              wordId: "word-1",
              learnerInput: "would",
              isChecked: true,
              isCorrect: true,
              checkedAt: "2026-05-06T00:00:00.000Z",
            },
            {
              wordId: "word-2",
              learnerInput: "quiet",
              isChecked: true,
              isCorrect: true,
              checkedAt: "2026-05-06T00:00:00.000Z",
            },
          ],
          progress: {
            checkedCount: 2,
            correctCount: 2,
            totalCount: 2,
            isFinished: true,
            completedAt: "2026-05-06T00:00:00.000Z",
          },
        },
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    useCheckVocabReviewWordMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    useRetryVocabReviewWordMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    useResetVocabReviewActivityMutationMock.mockReturnValue({ mutateAsync: resetMutateAsync, isPending: false });

    render(
      <VocabReviewActivity
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
        unitCycleActivityId="activity-1"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    await waitFor(() => {
      expect(resetMutateAsync).toHaveBeenCalledWith({
        learnerId: "learner-1",
        unitCycleActivityId: "activity-1",
      });
    });
  });
});
