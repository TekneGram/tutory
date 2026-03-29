import { z } from "zod";
import type {
    CreateLearnerProfileRequest,
    GetLearnerProfileRequest,
    ListLearnersRequest,
    UpdateLearnerProfileRequest,
} from "../contracts/learners.contracts";

const learnerIdSchema = z.string().min(1);
const avatarIdSchema = z.string().min(1).nullable();
const statusTextSchema = z.string();

export const listLearnersSchema = z
    .union([z.undefined(), z.object({}).strict()])
    .transform(() => ({} as ListLearnersRequest)) as z.ZodType<ListLearnersRequest>;

export const getLearnerProfileSchema: z.ZodType<GetLearnerProfileRequest> = z.object({
    learnerId: learnerIdSchema,
});

export const createLearnerProfileSchema: z.ZodType<CreateLearnerProfileRequest> = z.object({
    name: z.string().trim().min(1),
    avatarId: avatarIdSchema,
    statusText: statusTextSchema,
});

export const updateLearnerProfileSchema: z.ZodType<UpdateLearnerProfileRequest> = z.object({
    learnerId: learnerIdSchema,
    name: z.string().trim().min(1),
    avatarId: avatarIdSchema,
    statusText: statusTextSchema,
});
