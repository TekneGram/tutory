import { randomUUID } from "node:crypto";

import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";
import { insertLearner, insertLearnerStatus, getLearnerRowById } from "@electron/db/repositories/learnerRepositories";
import { runInTransaction } from "@electron/db/sqlite";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "@electron/utilities/logger";
import type { CreateLearnerProfileRequest, CreateLearnerProfileResponse } from "@electron/ipc/contracts/learners.contracts";
import { toLearnerProfileDto } from "./learnerDtos";

export async function createLearnerProfile(
    request: CreateLearnerProfileRequest,
    ctx: RequestContext
): Promise<CreateLearnerProfileResponse> {
    const name = request.name.trim();
    const statusText = request.statusText.trim();

    if (!name) {
        raiseAppError("VALIDATION_MISSING_FIELD", "Learner name cannot be empty.");
    }

    const appDatabase = createAppDatabase(getRuntimeDbPath());

    try {
        logger.info("Creating learner profile", {
            correlationId: ctx.correlationId,
            name,
        });

        const learnerId = randomUUID();
        const now = new Date().toISOString();

        runInTransaction(appDatabase.db, () => {
            insertLearner(appDatabase.db, {
                id: learnerId,
                name,
                avatar_id: request.avatarId,
                created_at: now,
                updated_at: now,
            });
            insertLearnerStatus(appDatabase.db, {
                learner_id: learnerId,
                status: statusText,
                updated_at: now,
            });
        });

        const learner = getLearnerRowById(appDatabase.db, learnerId);

        if (!learner) {
            raiseAppError("DB_QUERY_FAILED", "Created learner could not be reloaded.");
        }

        return {
            learner: toLearnerProfileDto(learner),
        };
    } finally {
        appDatabase.close();
    }
}
