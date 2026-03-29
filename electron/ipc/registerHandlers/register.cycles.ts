import type { IpcDependencies } from "../registerHandlers";
import { safeHandle } from "../safeHandle";
import { validateOrThrow } from "../validate";
import type {
    GetCycleProgressRequest,
    GetCycleProgressResponse,
    ListUnitCyclesRequest,
    ListUnitCyclesResponse,
} from "../contracts/cycles.contracts";
import {
    getCycleProgressSchema,
    listUnitCyclesSchema,
} from "../validationSchemas/cycles.schemas";
import { getCycleProgress } from "@electron/services/cycles/getCycleProgress";
import { listUnitCycles } from "@electron/services/cycles/listUnitCycles";

export function RegisterCyclesHandlers(dependencies: IpcDependencies): void {
    void dependencies;

    safeHandle<ListUnitCyclesRequest, ListUnitCyclesResponse>(
        "cycles:list-for-unit",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(listUnitCyclesSchema, rawArgs);
            return listUnitCycles(args, ctx);
        }
    );

    safeHandle<GetCycleProgressRequest, GetCycleProgressResponse>(
        "cycles:get-progress",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(getCycleProgressSchema, rawArgs);
            return getCycleProgress(args, ctx);
        }
    );
}
