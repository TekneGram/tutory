import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";
import { getLearnerRowById } from "@electron/db/repositories/learnerRepositories";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "@electron/utilities/logger";
import type { GetLearnerProfileRequest, GetLearnerProfileResponse } from "@electron/ipc/contracts/learners.contracts";
import { toLearnerProfileDto } from "./learnerDtos";

export async function getLearnerProfile(
    request: GetLearnerProfileRequest,
    ctx: RequestContext
): Promise<GetLearnerProfileResponse> {
    const appDatabase = createAppDatabase(getRuntimeDbPath());

    try {
        logger.info("Loading learner profile", {
            correlationId: ctx.correlationId,
            learnerId: request.learnerId,
        });

        const row = getLearnerRowById(appDatabase.db, request.learnerId);

        if (!row) {
            raiseAppError("RESOURCE_NOT_FOUND", `Learner "${request.learnerId}" was not found.`);
        }

        return {
            learner: toLearnerProfileDto(row),
        };
    } finally {
        appDatabase.close();
    }
}
