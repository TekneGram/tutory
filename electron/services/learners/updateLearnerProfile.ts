import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";
import {
    getLearnerRowById,
    updateLearner,
    updateLearnerStatus,
} from "@electron/db/repositories/learnerRepositories";
import { runInTransaction } from "@electron/db/sqlite";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "@electron/utilities/logger";
import type { UpdateLearnerProfileRequest, UpdateLearnerProfileResponse } from "@electron/ipc/contracts/learners.contracts";
import { toLearnerProfileDto } from "./learnerDtos";

export async function updateLearnerProfile(
    request: UpdateLearnerProfileRequest,
    ctx: RequestContext
): Promise<UpdateLearnerProfileResponse> {
    const name = request.name.trim();
    const statusText = request.statusText.trim();

    if (!name) {
        raiseAppError("VALIDATION_MISSING_FIELD", "Learner name cannot be empty.");
    }

    const appDatabase = createAppDatabase(getRuntimeDbPath());

    try {
        const existingLearner = getLearnerRowById(appDatabase.db, request.learnerId);

        if (!existingLearner) {
            raiseAppError("RESOURCE_NOT_FOUND", `Learner "${request.learnerId}" was not found.`);
        }

        logger.info("Updating learner profile", {
            correlationId: ctx.correlationId,
            learnerId: request.learnerId,
        });

        const updatedAt = new Date().toISOString();

        runInTransaction(appDatabase.db, () => {
            updateLearner(appDatabase.db, {
                id: request.learnerId,
                name,
                avatar_id: request.avatarId,
                updated_at: updatedAt,
            });
            updateLearnerStatus(appDatabase.db, {
                learner_id: request.learnerId,
                status: statusText,
                updated_at: updatedAt,
            });
        });

        const learner = getLearnerRowById(appDatabase.db, request.learnerId);

        if (!learner) {
            raiseAppError("DB_QUERY_FAILED", "Updated learner could not be reloaded.");
        }

        return {
            learner: toLearnerProfileDto(learner),
        };
    } finally {
        appDatabase.close();
    }
}
