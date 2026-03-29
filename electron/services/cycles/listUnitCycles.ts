import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";
import {
    getUnitIdentityForCyclesRowById,
    listUnitCycleRowsByUnitId,
} from "@electron/db/repositories/cycleRepositories";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "@electron/utilities/logger";
import type {
    ListUnitCyclesRequest,
    ListUnitCyclesResponse,
} from "@electron/ipc/contracts/cycles.contracts";
import { toLearningUnitCycleCardDto } from "./cyclesDtos";

export async function listUnitCycles(
    request: ListUnitCyclesRequest,
    ctx: RequestContext
): Promise<ListUnitCyclesResponse> {
    logger.info("Listing unit cycles", {
        correlationId: ctx.correlationId,
        unitId: request.unitId,
    });

    const appDatabase = createAppDatabase(getRuntimeDbPath());

    try {
        const unit = getUnitIdentityForCyclesRowById(appDatabase.db, request.unitId);

        if (!unit) {
            raiseAppError("RESOURCE_NOT_FOUND", `Unit "${request.unitId}" was not found.`);
        }

        const rows = listUnitCycleRowsByUnitId(appDatabase.db, request.unitId);

        logger.info("Unit cycles listed", {
            correlationId: ctx.correlationId,
            unitId: request.unitId,
            learningType: unit.learning_type,
            count: rows.length,
        });

        return {
            unit: {
                unitId: unit.unit_id,
                title: unit.title,
                learningType: unit.learning_type,
            },
            cycles: rows.map(toLearningUnitCycleCardDto),
        };
    } finally {
        appDatabase.close();
    }
}
