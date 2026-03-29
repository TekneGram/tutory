import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";
import { getLearnerRowById } from "@electron/db/repositories/learnerRepositories";
import {
    getUnitProgressCountsRow,
    getUnitRowById,
} from "@electron/db/repositories/unitRepositories";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "@electron/utilities/logger";
import type {
    GetUnitProgressRequest,
    GetUnitProgressResponse,
} from "@electron/ipc/contracts/units.contracts";
import {
    toUnitProgressHoverDto,
    toUnitProgressSummaryDto,
} from "./unitsDtos";

export async function getUnitProgress(
    request: GetUnitProgressRequest,
    ctx: RequestContext
): Promise<GetUnitProgressResponse> {
    const appDatabase = createAppDatabase(getRuntimeDbPath());

    try {
        logger.info("Loading unit progress", {
            correlationId: ctx.correlationId,
            learnerId: request.learnerId,
            unitId: request.unitId,
        });

        const learner = getLearnerRowById(appDatabase.db, request.learnerId);

        if (!learner) {
            raiseAppError("RESOURCE_NOT_FOUND", `Learner "${request.learnerId}" was not found.`);
        }

        const unit = getUnitRowById(appDatabase.db, request.unitId);

        if (!unit) {
            raiseAppError("RESOURCE_NOT_FOUND", `Unit "${request.unitId}" was not found.`);
        }

        const counts = getUnitProgressCountsRow(
            appDatabase.db,
            request.learnerId,
            request.unitId
        );

        const progress = toUnitProgressSummaryDto(
            request.learnerId,
            request.unitId,
            counts
        );

        logger.info("Unit progress loaded", {
            correlationId: ctx.correlationId,
            learnerId: request.learnerId,
            unitId: request.unitId,
            totalActivities: progress.totalActivities,
            completedActivities: progress.completedActivities,
        });

        return toUnitProgressHoverDto(unit, progress);
    } finally {
        appDatabase.close();
    }
}
