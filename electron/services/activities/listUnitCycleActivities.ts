import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";
import {
    getUnitCycleIdentityRowById,
    listUnitCycleActivityRowsByUnitCycleId,
} from "@electron/db/repositories/activityRepositories";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "@electron/utilities/logger";
import type {
    ListUnitCycleActivitiesRequest,
    ListUnitCycleActivitiesResponse,
} from "@electron/ipc/contracts/activities.contracts";
import { toUnitCycleActivityListItemDto } from "./activitiesDtos";

export async function listUnitCycleActivities(
    request: ListUnitCycleActivitiesRequest,
    ctx: RequestContext
): Promise<ListUnitCycleActivitiesResponse> {
    logger.info("Listing unit cycle activities", {
        correlationId: ctx.correlationId,
        unitCycleId: request.unitCycleId,
    });

    const appDatabase = createAppDatabase(getRuntimeDbPath());

    try {
        const cycle = getUnitCycleIdentityRowById(appDatabase.db, request.unitCycleId);

        if (!cycle) {
            raiseAppError(
                "RESOURCE_NOT_FOUND",
                `Unit cycle "${request.unitCycleId}" was not found.`
            );
        }

        const rows = listUnitCycleActivityRowsByUnitCycleId(appDatabase.db, request.unitCycleId);

        logger.info("Unit cycle activities listed", {
            correlationId: ctx.correlationId,
            unitCycleId: request.unitCycleId,
            unitId: cycle.unit_id,
            count: rows.length,
        });

        return {
            cycle: {
                unitCycleId: cycle.unit_cycle_id,
                unitId: cycle.unit_id,
                title: cycle.title,
            },
            activities: rows.map(toUnitCycleActivityListItemDto),
        };
    } finally {
        appDatabase.close();
    }
}
