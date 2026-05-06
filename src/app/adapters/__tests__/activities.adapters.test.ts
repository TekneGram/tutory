import { describe, expect, it, vi } from "vitest";
import { activitiesAdapter } from "../activities.adapters";
import { invokeRequest } from "../invokeRequest";

vi.mock("../invokeRequest", () => ({
  invokeRequest: vi.fn(),
}));

describe("activitiesAdapter", () => {
  it("invokes the canonical list channel with the request payload", async () => {
    vi.mocked(invokeRequest).mockResolvedValue({
      ok: true,
      value: {
        cycle: {
          unitCycleId: "cycle-1",
          unitId: "unit-1",
          title: "Cycle 1",
        },
        activities: [],
      },
    });

    await activitiesAdapter.listUnitCycleActivities({ unitCycleId: "cycle-1" });

    expect(invokeRequest).toHaveBeenCalledWith("activities:list-for-cycle", {
      unitCycleId: "cycle-1",
    });
  });

  it("invokes the story get channel with the request payload", async () => {
    vi.mocked(invokeRequest).mockResolvedValue({
      ok: true,
      value: {
        story: {
          instructions: "Read",
          advice: "Look closely",
          title: "A story",
          assetBase: null,
          passage: { pages: [] },
          assets: { imageRefs: [], audioRefs: [], videoRefs: [] },
          words: [],
          feedback: {
            question: "Was it easy or tough?",
            answers: ["🥰", "👌", "😓"],
            comment: "",
          },
          completion: { isCompleted: false },
        },
      },
    });

    await activitiesAdapter.getStoryActivity({
      learnerId: "learner-1",
      unitCycleActivityId: "activity-1",
    });

    expect(invokeRequest).toHaveBeenCalledWith("activities:story:get", {
      learnerId: "learner-1",
      unitCycleActivityId: "activity-1",
    });
  });

  it("invokes the story submit-feedback channel with the request payload", async () => {
    vi.mocked(invokeRequest).mockResolvedValue({
      ok: true,
      value: {
        completion: {
          isCompleted: true,
        },
      },
    });

    await activitiesAdapter.submitStoryFeedback({
      learnerId: "learner-1",
      unitCycleActivityId: "activity-1",
      selectedAnswer: "👌",
      comment: "Good pacing.",
    });

    expect(invokeRequest).toHaveBeenCalledWith("activities:story:submit-feedback", {
      learnerId: "learner-1",
      unitCycleActivityId: "activity-1",
      selectedAnswer: "👌",
      comment: "Good pacing.",
    });
  });

  it("invokes the multi choice quiz check-answers channel with the request payload", async () => {
    vi.mocked(invokeRequest).mockResolvedValue({
      ok: true,
      value: {
        learnerAnswers: [],
        quizState: {
          isChecked: true,
          finalScore: 2,
          checkedAt: "2026-05-05T00:00:00.000Z",
        },
      },
    });

    await activitiesAdapter.checkMultiChoiceQuizAnswers({
      learnerId: "learner-1",
      unitCycleActivityId: "activity-1",
      answers: [{ questionId: "question-1", selectedOption: "option-a" }],
    });

    expect(invokeRequest).toHaveBeenCalledWith("activities:multi-choice-quiz:check-answers", {
      learnerId: "learner-1",
      unitCycleActivityId: "activity-1",
      answers: [{ questionId: "question-1", selectedOption: "option-a" }],
    });
  });

  it("invokes the multi choice quiz retry channel with the request payload", async () => {
    vi.mocked(invokeRequest).mockResolvedValue({
      ok: true,
      value: {
        learnerAnswers: [],
        quizState: {
          isChecked: false,
          finalScore: 0,
          checkedAt: null,
        },
      },
    });

    await activitiesAdapter.retryMultiChoiceQuiz({
      learnerId: "learner-1",
      unitCycleActivityId: "activity-1",
    });

    expect(invokeRequest).toHaveBeenCalledWith("activities:multi-choice-quiz:retry", {
      learnerId: "learner-1",
      unitCycleActivityId: "activity-1",
    });
  });

  it("invokes the vocab review get channel with the request payload", async () => {
    vi.mocked(invokeRequest).mockResolvedValue({
      ok: true,
      value: {
        vocabReview: {
          instructions: "Practice words",
          advice: "Check your spelling",
          title: "Vocabulary Review",
          assetBase: null,
          words: [],
          learnerWordStates: [],
          progress: {
            checkedCount: 0,
            correctCount: 0,
            totalCount: 10,
            isFinished: false,
            completedAt: null,
          },
        },
      },
    });

    await activitiesAdapter.getVocabReviewActivity({
      learnerId: "learner-1",
      unitCycleActivityId: "activity-1",
    });

    expect(invokeRequest).toHaveBeenCalledWith("activities:vocab-review:get", {
      learnerId: "learner-1",
      unitCycleActivityId: "activity-1",
    });
  });

  it("invokes the vocab review check-word channel with the request payload", async () => {
    vi.mocked(invokeRequest).mockResolvedValue({
      ok: true,
      value: {
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
          totalCount: 10,
          isFinished: false,
          completedAt: null,
        },
      },
    });

    await activitiesAdapter.checkVocabReviewWord({
      learnerId: "learner-1",
      unitCycleActivityId: "activity-1",
      wordId: "word-1",
      learnerInput: "would",
    });

    expect(invokeRequest).toHaveBeenCalledWith("activities:vocab-review:check-word", {
      learnerId: "learner-1",
      unitCycleActivityId: "activity-1",
      wordId: "word-1",
      learnerInput: "would",
    });
  });

  it("invokes the vocab review retry-word channel with the request payload", async () => {
    vi.mocked(invokeRequest).mockResolvedValue({
      ok: true,
      value: {
        learnerWordState: {
          wordId: "word-1",
          learnerInput: null,
          isChecked: false,
          isCorrect: false,
          checkedAt: null,
        },
        progress: {
          checkedCount: 0,
          correctCount: 0,
          totalCount: 10,
          isFinished: false,
          completedAt: null,
        },
      },
    });

    await activitiesAdapter.retryVocabReviewWord({
      learnerId: "learner-1",
      unitCycleActivityId: "activity-1",
      wordId: "word-1",
    });

    expect(invokeRequest).toHaveBeenCalledWith("activities:vocab-review:retry-word", {
      learnerId: "learner-1",
      unitCycleActivityId: "activity-1",
      wordId: "word-1",
    });
  });

  it("invokes the vocab review reset channel with the request payload", async () => {
    vi.mocked(invokeRequest).mockResolvedValue({
      ok: true,
      value: {
        learnerWordStates: [],
        progress: {
          checkedCount: 0,
          correctCount: 0,
          totalCount: 10,
          isFinished: false,
          completedAt: null,
        },
      },
    });

    await activitiesAdapter.resetVocabReviewActivity({
      learnerId: "learner-1",
      unitCycleActivityId: "activity-1",
    });

    expect(invokeRequest).toHaveBeenCalledWith("activities:vocab-review:reset", {
      learnerId: "learner-1",
      unitCycleActivityId: "activity-1",
    });
  });

  it("invokes the write extra get channel with the request payload", async () => {
    vi.mocked(invokeRequest).mockResolvedValue({
      ok: true,
      value: {
        writeExtra: {
          instructions: "Read and write.",
          advice: "Use your own words.",
          title: "Write extra",
          assetBase: "english/unit_1/cycle_1",
          assets: {
            imageRefs: [],
            audioRefs: [],
          },
          storyText: "A story.",
          learnerText: "",
          completion: {
            isCompleted: false,
          },
        },
      },
    });

    await activitiesAdapter.getWriteExtraActivity({
      learnerId: "learner-1",
      unitCycleActivityId: "activity-1",
    });

    expect(invokeRequest).toHaveBeenCalledWith("activities:write-extra:get", {
      learnerId: "learner-1",
      unitCycleActivityId: "activity-1",
    });
  });

  it("invokes the write extra submit channel with the request payload", async () => {
    vi.mocked(invokeRequest).mockResolvedValue({
      ok: true,
      value: {
        completion: {
          isCompleted: true,
        },
      },
    });

    await activitiesAdapter.submitWriteExtra({
      learnerId: "learner-1",
      unitCycleActivityId: "activity-1",
      learnerText: "I wrote enough words here for submission.",
    });

    expect(invokeRequest).toHaveBeenCalledWith("activities:write-extra:submit", {
      learnerId: "learner-1",
      unitCycleActivityId: "activity-1",
      learnerText: "I wrote enough words here for submission.",
    });
  });

  it("invokes the write extra resume channel with the request payload", async () => {
    vi.mocked(invokeRequest).mockResolvedValue({
      ok: true,
      value: {
        completion: {
          isCompleted: false,
        },
      },
    });

    await activitiesAdapter.resumeWriteExtra({
      learnerId: "learner-1",
      unitCycleActivityId: "activity-1",
    });

    expect(invokeRequest).toHaveBeenCalledWith("activities:write-extra:resume", {
      learnerId: "learner-1",
      unitCycleActivityId: "activity-1",
    });
  });
});
