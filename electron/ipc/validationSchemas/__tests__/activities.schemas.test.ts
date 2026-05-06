import { describe, expect, it } from "vitest";

import {
    checkMultiChoiceQuizAnswersSchema,
    checkVocabReviewWordSchema,
    getVocabReviewActivitySchema,
    getStoryActivitySchema,
    listUnitCycleActivitiesSchema,
    resetVocabReviewActivitySchema,
    retryMultiChoiceQuizSchema,
    retryVocabReviewWordSchema,
    submitStoryFeedbackSchema,
} from "../activities.schemas";

describe("activities schemas", () => {
    it("accepts a unit cycle id for listUnitCycleActivities", () => {
        expect(listUnitCycleActivitiesSchema.parse({ unitCycleId: "cycle-1" })).toEqual({
            unitCycleId: "cycle-1",
        });
    });

    it("rejects blank unit cycle ids", () => {
        expect(() => listUnitCycleActivitiesSchema.parse({ unitCycleId: "   " })).toThrow();
    });

    it("rejects extra keys for listUnitCycleActivities", () => {
        expect(() =>
            listUnitCycleActivitiesSchema.parse({
                unitCycleId: "cycle-1",
                extra: true,
            })
        ).toThrow();
    });

    it("accepts a valid getStoryActivity request", () => {
        expect(
            getStoryActivitySchema.parse({
                learnerId: "learner-1",
                unitCycleActivityId: "activity-1",
            })
        ).toEqual({
            learnerId: "learner-1",
            unitCycleActivityId: "activity-1",
        });
    });

    it("rejects blank getStoryActivity fields", () => {
        expect(() =>
            getStoryActivitySchema.parse({
                learnerId: "   ",
                unitCycleActivityId: "activity-1",
            })
        ).toThrow();
    });

    it("accepts a valid submitStoryFeedback request", () => {
        expect(
            submitStoryFeedbackSchema.parse({
                learnerId: "learner-1",
                unitCycleActivityId: "activity-1",
                selectedAnswer: "🥰",
                comment: "",
            })
        ).toEqual({
            learnerId: "learner-1",
            unitCycleActivityId: "activity-1",
            selectedAnswer: "🥰",
            comment: "",
        });
    });

    it("rejects blank selected answers", () => {
        expect(() =>
            submitStoryFeedbackSchema.parse({
                learnerId: "learner-1",
                unitCycleActivityId: "activity-1",
                selectedAnswer: "   ",
                comment: "",
            })
        ).toThrow();
    });

    it("accepts a valid checkMultiChoiceQuizAnswers request", () => {
        expect(
            checkMultiChoiceQuizAnswersSchema.parse({
                learnerId: "learner-1",
                unitCycleActivityId: "activity-1",
                answers: [
                    {
                        questionId: "question-1",
                        selectedOption: "option-a",
                    },
                ],
            })
        ).toEqual({
            learnerId: "learner-1",
            unitCycleActivityId: "activity-1",
            answers: [
                {
                    questionId: "question-1",
                    selectedOption: "option-a",
                },
            ],
        });
    });

    it("rejects blank checkMultiChoiceQuizAnswers fields", () => {
        expect(() =>
            checkMultiChoiceQuizAnswersSchema.parse({
                learnerId: "learner-1",
                unitCycleActivityId: "activity-1",
                answers: [
                    {
                        questionId: "   ",
                        selectedOption: "option-a",
                    },
                ],
            })
        ).toThrow();
    });

    it("rejects empty answers for checkMultiChoiceQuizAnswers", () => {
        expect(() =>
            checkMultiChoiceQuizAnswersSchema.parse({
                learnerId: "learner-1",
                unitCycleActivityId: "activity-1",
                answers: [],
            })
        ).toThrow();
    });

    it("accepts a valid retryMultiChoiceQuiz request", () => {
        expect(
            retryMultiChoiceQuizSchema.parse({
                learnerId: "learner-1",
                unitCycleActivityId: "activity-1",
            })
        ).toEqual({
            learnerId: "learner-1",
            unitCycleActivityId: "activity-1",
        });
    });

    it("accepts a valid getVocabReviewActivity request", () => {
        expect(
            getVocabReviewActivitySchema.parse({
                learnerId: "learner-1",
                unitCycleActivityId: "activity-1",
            })
        ).toEqual({
            learnerId: "learner-1",
            unitCycleActivityId: "activity-1",
        });
    });

    it("accepts a valid checkVocabReviewWord request", () => {
        expect(
            checkVocabReviewWordSchema.parse({
                learnerId: "learner-1",
                unitCycleActivityId: "activity-1",
                wordId: "word-1",
                learnerInput: " would ",
            })
        ).toEqual({
            learnerId: "learner-1",
            unitCycleActivityId: "activity-1",
            wordId: "word-1",
            learnerInput: " would ",
        });
    });

    it("rejects blank checkVocabReviewWord fields", () => {
        expect(() =>
            checkVocabReviewWordSchema.parse({
                learnerId: "learner-1",
                unitCycleActivityId: "activity-1",
                wordId: "   ",
                learnerInput: "would",
            })
        ).toThrow();
    });

    it("accepts a valid retryVocabReviewWord request", () => {
        expect(
            retryVocabReviewWordSchema.parse({
                learnerId: "learner-1",
                unitCycleActivityId: "activity-1",
                wordId: "word-1",
            })
        ).toEqual({
            learnerId: "learner-1",
            unitCycleActivityId: "activity-1",
            wordId: "word-1",
        });
    });

    it("accepts a valid resetVocabReviewActivity request", () => {
        expect(
            resetVocabReviewActivitySchema.parse({
                learnerId: "learner-1",
                unitCycleActivityId: "activity-1",
            })
        ).toEqual({
            learnerId: "learner-1",
            unitCycleActivityId: "activity-1",
        });
    });
});
