import type { RequestContext } from "@electron/core/requestContext";
import { createAppDatabase } from "@electron/db/appDatabase";
import { listLearnerRows } from "@electron/db/repositories/learnerRepositories";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "@electron/utilities/logger";
import type { ListLearnersResponse } from "@electron/ipc/contracts/learners.contracts";
import { toLearnerCardDto } from "./learnerDtos";

export async function listLearners(ctx: RequestContext): Promise<ListLearnersResponse> {
    logger.info("Listing learners", {
        correlationId: ctx.correlationId,
    });

    const appDatabase = createAppDatabase(getRuntimeDbPath());

    try {
        const rows = listLearnerRows(appDatabase.db);

        logger.info("Learners listed", {
            correlationId: ctx.correlationId,
            count: rows.length,
        });

        return {
            learners: rows.map(toLearnerCardDto),
        };
    } finally {
        appDatabase.close();
    }
}
