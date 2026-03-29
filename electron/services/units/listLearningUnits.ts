import type { RequestContext } from "@electron/core/requestContext";
import { createAppDatabase } from "@electron/db/appDatabase";
import { listUnitRowsByLearningType } from "@electron/db/repositories/unitRepositories";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "@electron/utilities/logger";
import type {
    ListLearningUnitsRequest,
    ListLearningUnitsResponse,
} from "@electron/ipc/contracts/units.contracts";
import { toLearningUnitCardDto } from "./unitsDtos";

export async function listLearningUnits(
    request: ListLearningUnitsRequest,
    ctx: RequestContext
): Promise<ListLearningUnitsResponse> {
    logger.info("Listing learning units", {
        correlationId: ctx.correlationId,
        learningType: request.learningType,
    });

    const appDatabase = createAppDatabase(getRuntimeDbPath());

    try {
        const rows = listUnitRowsByLearningType(appDatabase.db, request.learningType);

        logger.info("Learning units listed", {
            correlationId: ctx.correlationId,
            learningType: request.learningType,
            count: rows.length,
        });

        return {
            units: rows.map(toLearningUnitCardDto),
        };
    } finally {
        appDatabase.close();
    }
}
