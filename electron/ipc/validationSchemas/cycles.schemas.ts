import { z } from "zod";
import type {
    GetCycleProgressRequest,
    ListUnitCyclesRequest,
} from "../contracts/cycles.contracts";

const learnerIdSchema = z.string().min(1);
const unitIdSchema = z.string().min(1);
const unitCycleIdSchema = z.string().min(1);

export const listUnitCyclesSchema: z.ZodType<ListUnitCyclesRequest> = z
    .object({
        unitId: unitIdSchema,
    })
    .strict();

export const getCycleProgressSchema: z.ZodType<GetCycleProgressRequest> = z
    .object({
        learnerId: learnerIdSchema,
        unitCycleId: unitCycleIdSchema,
    })
    .strict();
