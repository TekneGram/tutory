import type { IpcDependencies } from "../registerHandlers";
import { safeHandle } from "../safeHandle";
import { validateOrThrow } from "../validate";
import type {
    GetUnitProgressRequest,
    GetUnitProgressResponse,
    ListLearningUnitsRequest,
    ListLearningUnitsResponse,
} from "../contracts/units.contracts";
import {
    getUnitProgressSchema,
    listLearningUnitsSchema,
} from "../validationSchemas/units.schemas";
import { getUnitProgress } from "@electron/services/units/getUnitProgress";
import { listLearningUnits } from "@electron/services/units/listLearningUnits";

export function RegisterUnitsHandlers(dependencies: IpcDependencies): void {
    void dependencies;

    safeHandle<ListLearningUnitsRequest, ListLearningUnitsResponse>(
        "units:list",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(listLearningUnitsSchema, rawArgs);
            return listLearningUnits(args, ctx);
        }
    );

    safeHandle<GetUnitProgressRequest, GetUnitProgressResponse>(
        "units:get-progress",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(getUnitProgressSchema, rawArgs);
            return getUnitProgress(args, ctx);
        }
    );
}
