import { z } from "zod";
import type {
    GetMultiChoiceQuizActivityRequest,
    GetStoryActivityRequest,
    ListUnitCycleActivitiesRequest,
    SubmitStoryFeedbackRequest,
} from "../contracts/activities.contracts";

const unitCycleIdSchema = z.string().trim().min(1);
const learnerIdSchema = z.string().trim().min(1);
const unitCycleActivityIdSchema = z.string().trim().min(1);
const selectedAnswerSchema = z.string().trim().min(1);
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
