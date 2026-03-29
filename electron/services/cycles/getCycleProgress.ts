import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";
import { getLearnerRowById } from "@electron/db/repositories/learnerRepositories";
import {
    getCycleProgressCountsRow,
    getUnitCycleIdentityRowById,
} from "@electron/db/repositories/cycleRepositories";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "@electron/utilities/logger";
import type {
    GetCycleProgressRequest,
    GetCycleProgressResponse,
} from "@electron/ipc/contracts/cycles.contracts";
import {
    toCycleProgressHoverDto,
    toCycleProgressSummaryDto,
} from "./cyclesDtos";

export async function getCycleProgress(
    request: GetCycleProgressRequest,
    ctx: RequestContext
): Promise<GetCycleProgressResponse> {
    logger.info("Loading cycle progress", {
        correlationId: ctx.correlationId,
        learnerId: request.learnerId,
        unitCycleId: request.unitCycleId,
    });

    const appDatabase = createAppDatabase(getRuntimeDbPath());

    try {
        const learner = getLearnerRowById(appDatabase.db, request.learnerId);

        if (!learner) {
            raiseAppError("RESOURCE_NOT_FOUND", `Learner "${request.learnerId}" was not found.`);
        }

        const cycle = getUnitCycleIdentityRowById(appDatabase.db, request.unitCycleId);

        if (!cycle) {
            raiseAppError("RESOURCE_NOT_FOUND", `Unit cycle "${request.unitCycleId}" was not found.`);
        }

        const counts = getCycleProgressCountsRow(
            appDatabase.db,
            request.learnerId,
            request.unitCycleId
        );
        const summary = toCycleProgressSummaryDto(
            request.learnerId,
            request.unitCycleId,
            counts
        );

        logger.info("Cycle progress loaded", {
            correlationId: ctx.correlationId,
            learnerId: request.learnerId,
            unitCycleId: request.unitCycleId,
            totalActivities: summary.totalActivities,
            completedActivities: summary.completedActivities,
        });

        return toCycleProgressHoverDto(cycle, summary);
    } finally {
        appDatabase.close();
    }
}
