import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ObserveActivity from "../ObserveActivity";

const {
  useObserveActivityQueryMock,
  usePlaceObserveWordMutationMock,
  useResetObserveActivityMutationMock,
} = vi.hoisted(() => ({
  useObserveActivityQueryMock: vi.fn(),
  usePlaceObserveWordMutationMock: vi.fn(),
  useResetObserveActivityMutationMock: vi.fn(),
}));

vi.mock("../hooks/useObserveActivityQuery", () => ({
  useObserveActivityQuery: useObserveActivityQueryMock,
}));

vi.mock("../hooks/usePlaceObserveWordMutation", () => ({
  usePlaceObserveWordMutation: usePlaceObserveWordMutationMock,
}));

vi.mock("../hooks/useResetObserveActivityMutation", () => ({
  useResetObserveActivityMutation: useResetObserveActivityMutationMock,
}));

const observeResponse = {
  observe: {
    instructions: "Drag the words into matching categories.",
    advice: "Think about meaning.",
    title: "Animals, Feelings, Actions",
    assetBase: "english/unit_1/cycle_2",
    assets: {
      imageRefs: [{ order: 1, imageRef: "image.webp" }],
    },
    words: [
      { wordId: "word-1", word: "lion", order: 1 },
      { wordId: "word-2", word: "run", order: 2 },
    ],
    categories: [
      { categoryId: "cat-animals", category: "animals", order: 1 },
      { categoryId: "cat-actions", category: "actions", order: 2 },
    ],
    learnerWordStates: [
      {
        wordId: "word-1",
        selectedCategoryId: null,
        isPlaced: false,
        isCorrect: false,
        checkedAt: null,
      },
      {
        wordId: "word-2",
        selectedCategoryId: null,
        isPlaced: false,
        isCorrect: false,
        checkedAt: null,
      },
    ],
    progress: {
      placedCount: 0,
      correctCount: 0,
      totalCount: 2,
      isFinished: false,
      completedAt: null,
    },
  },
};

describe("ObserveActivity", () => {
  beforeEach(() => {
    useObserveActivityQueryMock.mockReset();
    usePlaceObserveWordMutationMock.mockReset();
    useResetObserveActivityMutationMock.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders loading, error, and success states", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.1);
    usePlaceObserveWordMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    useResetObserveActivityMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });

    useObserveActivityQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });

    const { rerender } = render(
      <ObserveActivity
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
        unitCycleActivityId="activity-1"
      />,
    );

    expect(screen.getByText("Loading observe activity...")).toBeTruthy();

    useObserveActivityQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Unable to load observe activity."),
    });

    rerender(
      <ObserveActivity
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
        unitCycleActivityId="activity-1"
      />,
    );

    expect(screen.getByText("Unable to load observe activity.")).toBeTruthy();

    useObserveActivityQueryMock.mockReturnValue({
      data: observeResponse,
      isLoading: false,
      isError: false,
      error: null,
    });

    rerender(
      <ObserveActivity
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
        unitCycleActivityId="activity-1"
      />,
    );

    expect(screen.getByRole("heading", { name: "Animals, Feelings, Actions" })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: /lion|run/ }).map((button) => button.textContent)).toEqual([
      "run",
      "lion",
    ]);
    expect(screen.getByLabelText("Category animals")).toBeTruthy();
  });

  it("sends place-word mutation payload when dropped on a category", async () => {
    const placeMutateAsync = vi.fn().mockResolvedValue({
      learnerWordState: {
        wordId: "word-1",
        selectedCategoryId: "cat-animals",
        isPlaced: true,
        isCorrect: true,
        checkedAt: "2026-05-06T00:00:00.000Z",
      },
      progress: {
        placedCount: 1,
        correctCount: 1,
        totalCount: 2,
        isFinished: false,
        completedAt: null,
      },
    });

    useObserveActivityQueryMock.mockReturnValue({
      data: observeResponse,
      isLoading: false,
      isError: false,
      error: null,
    });
    usePlaceObserveWordMutationMock.mockReturnValue({ mutateAsync: placeMutateAsync, isPending: false });
    useResetObserveActivityMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });

    render(
      <ObserveActivity
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
        unitCycleActivityId="activity-1"
      />,
    );

    const dropZone = screen.getByLabelText("Category animals");
    fireEvent.drop(dropZone, {
      dataTransfer: {
        getData: () => "word-1",
      },
    });

    await waitFor(() => {
      expect(placeMutateAsync).toHaveBeenCalledWith({
        learnerId: "learner-1",
        unitCycleActivityId: "activity-1",
        wordId: "word-1",
        categoryId: "cat-animals",
      });
    });
  });

  it("shows completion and triggers reset mutation", async () => {
    const resetMutateAsync = vi.fn().mockResolvedValue({
      learnerWordStates: [],
      progress: {
        placedCount: 0,
        correctCount: 0,
        totalCount: 2,
        isFinished: false,
        completedAt: null,
      },
    });

    useObserveActivityQueryMock.mockReturnValue({
      data: {
        observe: {
          ...observeResponse.observe,
          learnerWordStates: [
            {
              wordId: "word-1",
              selectedCategoryId: "cat-animals",
              isPlaced: true,
              isCorrect: true,
              checkedAt: "2026-05-06T00:00:00.000Z",
            },
            {
              wordId: "word-2",
              selectedCategoryId: "cat-actions",
              isPlaced: true,
              isCorrect: true,
              checkedAt: "2026-05-06T00:00:00.000Z",
            },
          ],
          progress: {
            placedCount: 2,
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

    usePlaceObserveWordMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    useResetObserveActivityMutationMock.mockReturnValue({ mutateAsync: resetMutateAsync, isPending: false });

    render(
      <ObserveActivity
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
        unitCycleActivityId="activity-1"
      />,
    );

    expect(screen.getByText("Congratulations, you have successfully completed this activity.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    await waitFor(() => {
      expect(resetMutateAsync).toHaveBeenCalledWith({
        learnerId: "learner-1",
        unitCycleActivityId: "activity-1",
      });
    });
  });
});
