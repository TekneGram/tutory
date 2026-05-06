import { z } from "zod";
import type {
    CheckMultiChoiceQuizAnswersRequest,
    GetObserveActivityRequest,
    CheckVocabReviewWordRequest,
    GetMultiChoiceQuizActivityRequest,
    GetVocabReviewActivityRequest,
    GetWriteExtraActivityRequest,
    PlaceObserveWordRequest,
    ResetObserveActivityRequest,
    ResetVocabReviewActivityRequest,
    ResumeWriteExtraRequest,
    RetryMultiChoiceQuizRequest,
    RetryVocabReviewWordRequest,
    GetStoryActivityRequest,
    ListUnitCycleActivitiesRequest,
    SubmitWriteExtraRequest,
    SubmitStoryFeedbackRequest,
} from "../contracts/activities.contracts";

const unitCycleIdSchema = z.string().trim().min(1);
const learnerIdSchema = z.string().trim().min(1);
const unitCycleActivityIdSchema = z.string().trim().min(1);
const selectedAnswerSchema = z.string().trim().min(1);
const questionIdSchema = z.string().trim().min(1);
const selectedOptionSchema = z.string().trim().min(1);
const wordIdSchema = z.string().trim().min(1);
const categoryIdSchema = z.string().trim().min(1);
const learnerInputSchema = z.string();
const commentSchema = z.string();

export const listUnitCycleActivitiesSchema: z.ZodType<ListUnitCycleActivitiesRequest> = z
    .object({
        unitCycleId: unitCycleIdSchema,
    })
    .strict();

export const getStoryActivitySchema: z.ZodType<GetStoryActivityRequest> = z
    .object({
        learnerId: learnerIdSchema,
        unitCycleActivityId: unitCycleActivityIdSchema,
    })
    .strict();

export const submitStoryFeedbackSchema: z.ZodType<SubmitStoryFeedbackRequest> = z
    .object({
        learnerId: learnerIdSchema,
        unitCycleActivityId: unitCycleActivityIdSchema,
        selectedAnswer: selectedAnswerSchema,
        comment: commentSchema,
    })
    .strict();

export const getMultiChoiceQuizActivitySchema: z.ZodType<GetMultiChoiceQuizActivityRequest> = z
    .object({
        learnerId: learnerIdSchema,
        unitCycleActivityId: unitCycleActivityIdSchema,
    })
    .strict();

export const checkMultiChoiceQuizAnswersSchema: z.ZodType<CheckMultiChoiceQuizAnswersRequest> = z
    .object({
        learnerId: learnerIdSchema,
        unitCycleActivityId: unitCycleActivityIdSchema,
        answers: z.array(
            z
                .object({
                    questionId: questionIdSchema,
                    selectedOption: selectedOptionSchema,
                })
                .strict()
        ).min(1),
    })
    .strict();

export const retryMultiChoiceQuizSchema: z.ZodType<RetryMultiChoiceQuizRequest> = z
    .object({
        learnerId: learnerIdSchema,
        unitCycleActivityId: unitCycleActivityIdSchema,
    })
    .strict();

export const getVocabReviewActivitySchema: z.ZodType<GetVocabReviewActivityRequest> = z
    .object({
        learnerId: learnerIdSchema,
        unitCycleActivityId: unitCycleActivityIdSchema,
    })
    .strict();

export const checkVocabReviewWordSchema: z.ZodType<CheckVocabReviewWordRequest> = z
    .object({
        learnerId: learnerIdSchema,
        unitCycleActivityId: unitCycleActivityIdSchema,
        wordId: wordIdSchema,
        learnerInput: learnerInputSchema,
    })
    .strict();

export const retryVocabReviewWordSchema: z.ZodType<RetryVocabReviewWordRequest> = z
    .object({
        learnerId: learnerIdSchema,
        unitCycleActivityId: unitCycleActivityIdSchema,
        wordId: wordIdSchema,
    })
    .strict();

export const resetVocabReviewActivitySchema: z.ZodType<ResetVocabReviewActivityRequest> = z
    .object({
        learnerId: learnerIdSchema,
        unitCycleActivityId: unitCycleActivityIdSchema,
    })
    .strict();

export const getObserveActivitySchema: z.ZodType<GetObserveActivityRequest> = z
    .object({
        learnerId: learnerIdSchema,
        unitCycleActivityId: unitCycleActivityIdSchema,
    })
    .strict();

export const placeObserveWordSchema: z.ZodType<PlaceObserveWordRequest> = z
    .object({
        learnerId: learnerIdSchema,
        unitCycleActivityId: unitCycleActivityIdSchema,
        wordId: wordIdSchema,
        categoryId: categoryIdSchema,
    })
    .strict();

export const resetObserveActivitySchema: z.ZodType<ResetObserveActivityRequest> = z
    .object({
        learnerId: learnerIdSchema,
        unitCycleActivityId: unitCycleActivityIdSchema,
    })
    .strict();

export const getWriteExtraActivitySchema: z.ZodType<GetWriteExtraActivityRequest> = z
    .object({
        learnerId: learnerIdSchema,
        unitCycleActivityId: unitCycleActivityIdSchema,
    })
    .strict();

export const submitWriteExtraSchema: z.ZodType<SubmitWriteExtraRequest> = z
    .object({
        learnerId: learnerIdSchema,
        unitCycleActivityId: unitCycleActivityIdSchema,
        learnerText: z.string(),
    })
    .strict();

export const resumeWriteExtraSchema: z.ZodType<ResumeWriteExtraRequest> = z
    .object({
        learnerId: learnerIdSchema,
        unitCycleActivityId: unitCycleActivityIdSchema,
    })
    .strict();
