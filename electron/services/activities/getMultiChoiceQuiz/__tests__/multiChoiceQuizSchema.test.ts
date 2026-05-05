import { describe, expect, it } from "vitest";
import {
  toMultiChoiceQuizLearnerAnswers,
  toMultiChoiceQuizQuestions,
} from "../multiChoiceQuizSchema";

describe("multiChoiceQuizSchema", () => {
  it("maps numeric db correctness flags to boolean in questions", () => {
    const result = toMultiChoiceQuizQuestions(
      [{ id: "q1", activity_content_id: "ac1", question_order: 1, question_text: "2+2?" }],
      [
        {
          id: "o1",
          question_id: "q1",
          option_key: "a",
          option_order: 1,
          answer_text: "4",
          is_correct: 1,
        },
        {
          id: "o2",
          question_id: "q1",
          option_key: "b",
          option_order: 2,
          answer_text: "3",
          is_correct: 0,
        },
      ]
    );

    expect(result[0]?.answers[0]?.is_correct).toBe(true);
    expect(result[0]?.answers[1]?.is_correct).toBe(false);
  });

  it("maps numeric db answer flags to boolean in learner answers", () => {
    const result = toMultiChoiceQuizLearnerAnswers([
      {
        attempt_id: "attempt-1",
        learner_id: "learner-1",
        unit_cycle_activity_id: "activity-1",
        question_id: "q1",
        question: "2+2?",
        is_answered: 1,
        selected_option: "o1",
        is_correct: 0,
        created_at: "2026-05-05T00:00:00.000Z",
        updated_at: "2026-05-05T00:00:00.000Z",
      },
    ]);

    expect(result[0]?.isAnswered).toBe(true);
    expect(result[0]?.isCorrect).toBe(false);
  });
});
