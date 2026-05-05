import { describe, expect, it } from "vitest";

import {
    getStoryActivitySchema,
    listUnitCycleActivitiesSchema,
    submitMultiChoiceQuizAnswerSchema,
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

    it("accepts a valid submitMultiChoiceQuizAnswer request", () => {
        expect(
            submitMultiChoiceQuizAnswerSchema.parse({
                learnerId: "learner-1",
                unitCycleActivityId: "activity-1",
                questionId: "question-1",
                selectedOption: "option-a",
                isCorrect: false,
            })
        ).toEqual({
            learnerId: "learner-1",
            unitCycleActivityId: "activity-1",
            questionId: "question-1",
            selectedOption: "option-a",
            isCorrect: false,
        });
    });

    it("rejects blank submitMultiChoiceQuizAnswer fields", () => {
        expect(() =>
            submitMultiChoiceQuizAnswerSchema.parse({
                learnerId: "learner-1",
                unitCycleActivityId: "activity-1",
                questionId: "   ",
                selectedOption: "option-a",
                isCorrect: true,
            })
        ).toThrow();
    });

    it("rejects non-boolean isCorrect for submitMultiChoiceQuizAnswer", () => {
        expect(() =>
            submitMultiChoiceQuizAnswerSchema.parse({
                learnerId: "learner-1",
                unitCycleActivityId: "activity-1",
                questionId: "question-1",
                selectedOption: "option-a",
                isCorrect: "true",
            })
        ).toThrow();
    });
});
