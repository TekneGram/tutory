import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MultiChoiceQuizActivity from "../MultiChoiceQuizActivity";

const { useMultiChoiceQuizActivityQueryMock, useSubmitMultiChoiceQuizAnswerMutationMock } = vi.hoisted(() => ({
  useMultiChoiceQuizActivityQueryMock: vi.fn(),
  useSubmitMultiChoiceQuizAnswerMutationMock: vi.fn(),
}));

vi.mock("../hooks/useMultiChoiceQuizActivityQuery", () => ({
  useMultiChoiceQuizActivityQuery: useMultiChoiceQuizActivityQueryMock,
}));

vi.mock("../hooks/useSubmitMultiChoiceQuizAnswerMutation", () => ({
  useSubmitMultiChoiceQuizAnswerMutation: useSubmitMultiChoiceQuizAnswerMutationMock,
}));

const quizResponse = {
  multiChoiceQuiz: {
    instructions: "Choose one answer for each question.",
    advice: "Read carefully.",
    title: "Quick Math Quiz",
    assetBase: null,
    assets: {
      imageRefs: [],
      audioRefs: [],
      videoRefs: [],
    },
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
  },
};

describe("MultiChoiceQuizActivity", () => {
  beforeEach(() => {
    useMultiChoiceQuizActivityQueryMock.mockReset();
    useSubmitMultiChoiceQuizAnswerMutationMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders loading, error, and success states", () => {
    useSubmitMultiChoiceQuizAnswerMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    useMultiChoiceQuizActivityQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });

    const { rerender } = render(
      <MultiChoiceQuizActivity
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
        unitCycleActivityId="activity-1"
      />,
    );

    expect(screen.getByText("Loading quiz...")).toBeTruthy();

    useMultiChoiceQuizActivityQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Unable to load quiz."),
    });

    rerender(
      <MultiChoiceQuizActivity
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
        unitCycleActivityId="activity-1"
      />,
    );

    expect(screen.getByText("Unable to load quiz.")).toBeTruthy();

    useMultiChoiceQuizActivityQueryMock.mockReturnValue({
      data: quizResponse,
      isLoading: false,
      isError: false,
      error: null,
    });

    rerender(
      <MultiChoiceQuizActivity
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
        unitCycleActivityId="activity-1"
      />,
    );

    expect(screen.getByRole("heading", { name: "Quick Math Quiz" })).toBeTruthy();
    expect(screen.getByText("Choose one answer for each question.")).toBeTruthy();
  });

  it("submits all answers on check and supports retry", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useMultiChoiceQuizActivityQueryMock.mockReturnValue({
      data: quizResponse,
      isLoading: false,
      isError: false,
      error: null,
    });

    useSubmitMultiChoiceQuizAnswerMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    render(
      <MultiChoiceQuizActivity
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
        unitCycleActivityId="activity-1"
      />,
    );

    const checkButton = screen.getByRole("button", { name: "Check answers" });
    expect(checkButton.hasAttribute("disabled")).toBe(true);

    fireEvent.click(screen.getByRole("radio", { name: "B. 4" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("radio", { name: "A. 4" }));

    expect(checkButton.hasAttribute("disabled")).toBe(false);
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledTimes(2);
    });

    expect(mutateAsync).toHaveBeenNthCalledWith(1, {
      learnerId: "learner-1",
      unitCycleActivityId: "activity-1",
      questionId: "q1",
      selectedOption: "q1b",
      isCorrect: true,
    });
    expect(mutateAsync).toHaveBeenNthCalledWith(2, {
      learnerId: "learner-1",
      unitCycleActivityId: "activity-1",
      questionId: "q2",
      selectedOption: "q2a",
      isCorrect: true,
    });

    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(screen.getByText("Score: 0/2")).toBeTruthy();
  });
});
