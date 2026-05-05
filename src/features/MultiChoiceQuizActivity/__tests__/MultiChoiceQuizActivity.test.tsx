import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MultiChoiceQuizActivity from "../MultiChoiceQuizActivity";

const {
  useMultiChoiceQuizActivityQueryMock,
  useCheckMultiChoiceQuizAnswersMutationMock,
  useRetryMultiChoiceQuizMutationMock,
} = vi.hoisted(() => ({
  useMultiChoiceQuizActivityQueryMock: vi.fn(),
  useCheckMultiChoiceQuizAnswersMutationMock: vi.fn(),
  useRetryMultiChoiceQuizMutationMock: vi.fn(),
}));

vi.mock("../hooks/useMultiChoiceQuizActivityQuery", () => ({
  useMultiChoiceQuizActivityQuery: useMultiChoiceQuizActivityQueryMock,
}));

vi.mock("../hooks/useCheckMultiChoiceQuizAnswersMutation", () => ({
  useCheckMultiChoiceQuizAnswersMutation: useCheckMultiChoiceQuizAnswersMutationMock,
}));

vi.mock("../hooks/useRetryMultiChoiceQuizMutation", () => ({
  useRetryMultiChoiceQuizMutation: useRetryMultiChoiceQuizMutationMock,
}));

const quizResponse = {
  multiChoiceQuiz: {
    instructions: "Choose one answer for each question.",
    advice: "Read carefully.",
    title: "Quick Math Quiz",
    assetBase: null,
    assets: { imageRefs: [], audioRefs: [], videoRefs: [] },
    questions: [
      {
        questionId: "q1",
        question: "2 + 2 = ?",
        answers: [
          { optionId: "q1a", option: "A", answer: "3", is_correct: false },
          { optionId: "q1b", option: "B", answer: "4", is_correct: true },
        ],
      },
      {
        questionId: "q2",
        question: "3 + 1 = ?",
        answers: [
          { optionId: "q2a", option: "A", answer: "4", is_correct: true },
          { optionId: "q2b", option: "B", answer: "5", is_correct: false },
        ],
      },
    ],
    learnerAnswers: [
      {
        attemptId: "attempt-1",
        learnerId: "learner-1",
        unitCycleActivityId: "activity-1",
        questionId: "q1",
        isAnswered: false,
        selectedOption: null,
        isCorrect: false,
        createdAt: "2026-05-05T00:00:00.000Z",
        updatedAt: "2026-05-05T00:00:00.000Z",
      },
      {
        attemptId: "attempt-1",
        learnerId: "learner-1",
        unitCycleActivityId: "activity-1",
        questionId: "q2",
        isAnswered: false,
        selectedOption: null,
        isCorrect: false,
        createdAt: "2026-05-05T00:00:00.000Z",
        updatedAt: "2026-05-05T00:00:00.000Z",
      },
    ],
    quizState: {
      isChecked: false,
      finalScore: 0,
      checkedAt: null,
    },
  },
};

describe("MultiChoiceQuizActivity", () => {
  beforeEach(() => {
    useMultiChoiceQuizActivityQueryMock.mockReset();
    useCheckMultiChoiceQuizAnswersMutationMock.mockReset();
    useRetryMultiChoiceQuizMutationMock.mockReset();
  });

  afterEach(() => cleanup());

  it("renders loading, error, and success states", () => {
    useCheckMultiChoiceQuizAnswersMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    useRetryMultiChoiceQuizMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });

    useMultiChoiceQuizActivityQueryMock.mockReturnValue({ data: undefined, isLoading: true, isError: false, error: null });
    const { rerender } = render(
      <MultiChoiceQuizActivity learnerId="learner-1" learningType="english" unitId="unit-1" unitCycleId="cycle-1" unitCycleActivityId="activity-1" />
    );
    expect(screen.getByText("Loading quiz...")).toBeTruthy();

    useMultiChoiceQuizActivityQueryMock.mockReturnValue({ data: undefined, isLoading: false, isError: true, error: new Error("Unable to load quiz.") });
    rerender(
      <MultiChoiceQuizActivity learnerId="learner-1" learningType="english" unitId="unit-1" unitCycleId="cycle-1" unitCycleActivityId="activity-1" />
    );
    expect(screen.getByText("Unable to load quiz.")).toBeTruthy();

    useMultiChoiceQuizActivityQueryMock.mockReturnValue({ data: quizResponse, isLoading: false, isError: false, error: null });
    rerender(
      <MultiChoiceQuizActivity learnerId="learner-1" learningType="english" unitId="unit-1" unitCycleId="cycle-1" unitCycleActivityId="activity-1" />
    );
    expect(screen.getByRole("heading", { name: "Quick Math Quiz" })).toBeTruthy();
  });

  it("checks all answers in one request payload", async () => {
    const checkMutateAsync = vi.fn().mockResolvedValue({});
    useMultiChoiceQuizActivityQueryMock.mockReturnValue({ data: quizResponse, isLoading: false, isError: false, error: null });
    useCheckMultiChoiceQuizAnswersMutationMock.mockReturnValue({ mutateAsync: checkMutateAsync, isPending: false });
    useRetryMultiChoiceQuizMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });

    render(
      <MultiChoiceQuizActivity learnerId="learner-1" learningType="english" unitId="unit-1" unitCycleId="cycle-1" unitCycleActivityId="activity-1" />
    );

    fireEvent.click(screen.getByRole("radio", { name: "B. 4" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("radio", { name: "A. 4" }));
    fireEvent.click(screen.getByRole("button", { name: "Check answers" }));

    await waitFor(() => {
      expect(checkMutateAsync).toHaveBeenCalledWith({
        learnerId: "learner-1",
        unitCycleActivityId: "activity-1",
        answers: [
          { questionId: "q1", selectedOption: "q1b" },
          { questionId: "q2", selectedOption: "q2a" },
        ],
      });
    });
  });
});
