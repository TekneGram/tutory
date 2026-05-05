import { z } from "zod";
import type {
    CheckMultiChoiceQuizAnswersRequest,
    GetMultiChoiceQuizActivityRequest,
    RetryMultiChoiceQuizRequest,
    GetStoryActivityRequest,
    ListUnitCycleActivitiesRequest,
    SubmitStoryFeedbackRequest,
} from "../contracts/activities.contracts";

const unitCycleIdSchema = z.string().trim().min(1);
const learnerIdSchema = z.string().trim().min(1);
const unitCycleActivityIdSchema = z.string().trim().min(1);
const selectedAnswerSchema = z.string().trim().min(1);
const questionIdSchema = z.string().trim().min(1);
const selectedOptionSchema = z.string().trim().min(1);
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
