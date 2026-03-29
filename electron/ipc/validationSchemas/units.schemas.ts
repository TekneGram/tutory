import { z } from "zod";
import type {
    GetUnitProgressRequest,
    ListLearningUnitsRequest,
    LearningType,
} from "../contracts/units.contracts";

const learningTypeSchema: z.ZodType<LearningType> = z.enum(["english", "mathematics"]);
const learnerIdSchema = z.string().min(1);
const unitIdSchema = z.string().min(1);

export const listLearningUnitsSchema: z.ZodType<ListLearningUnitsRequest> = z
    .object({
        learningType: learningTypeSchema,
    })
    .strict();

export const getUnitProgressSchema: z.ZodType<GetUnitProgressRequest> = z
    .object({
        learnerId: learnerIdSchema,
        unitId: unitIdSchema,
    })
    .strict();
