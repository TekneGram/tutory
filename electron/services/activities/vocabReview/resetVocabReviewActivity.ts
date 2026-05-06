import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";
import {
    getActivityContentRowByUnitCycleActivityId,
    getUnitCycleActivityIdentityRowById,
    updateActivityAttemptStatusRow,
} from "@electron/db/repositories/activityRepositories";
import {
    getVocabReviewAnswerRowsByAttemptId,
    getVocabReviewStateRowByAttemptId,
    listVocabReviewWordRowsByActivityContentId,
    resetVocabReviewAnswerRowsByAttemptId,
    upsertVocabReviewStateRow,
} from "@electron/db/repositories/activity.vocabreviewRepositories";
import { runInTransaction } from "@electron/db/sqlite";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "@electron/utilities/logger";
import { toVocabReviewLearnerWordStateDtos, toVocabReviewProgressDto } from "./vocabReviewDtos";
import { buildStateRow, ensureVocabReviewAttemptRow, toProgressFromRows } from "./vocabReviewShared";
import type { ResetVocabReviewActivityRequest, ResetVocabReviewActivityResponse } from "./vocabReviewTypes";

export async function resetVocabReviewActivity(
    request: ResetVocabReviewActivityRequest,
    ctx: RequestContext
): Promise<ResetVocabReviewActivityResponse> {
    logger.info("Resetting vocab review activity", {
        correlationId: ctx.correlationId,
        learnerId: request.learnerId,
        unitCycleActivityId: request.unitCycleActivityId,
    });

    const appDatabase = createAppDatabase(getRuntimeDbPath());

    try {
        return runInTransaction(appDatabase.db, () => {
            const activity = getUnitCycleActivityIdentityRowById(appDatabase.db, request.unitCycleActivityId);

            if (!activity) {
                raiseAppError(
                    "RESOURCE_NOT_FOUND",
                    `Vocab review activity "${request.unitCycleActivityId}" was not found.`
                );
            }

            if (activity.activity_type !== "vocab-review") {
                raiseAppError(
                    "VALIDATION_INVALID_STATE",
                    `Activity "${request.unitCycleActivityId}" is not a vocab review activity.`
                );
            }

            const contentRow = getActivityContentRowByUnitCycleActivityId(appDatabase.db, request.unitCycleActivityId);
            if (!contentRow?.id) {
                raiseAppError(
                    "DB_QUERY_FAILED",
                    `Vocab review content for "${request.unitCycleActivityId}" was not found.`
                );
            }

            const words = listVocabReviewWordRowsByActivityContentId(appDatabase.db, contentRow.id);

            const attempt = ensureVocabReviewAttemptRow(
                appDatabase.db,
                request.learnerId,
                request.unitCycleActivityId,
                activity.activity_type_id
            );

            const updatedAt = new Date().toISOString();
            resetVocabReviewAnswerRowsByAttemptId(appDatabase.db, attempt.id, updatedAt);

            const answers = getVocabReviewAnswerRowsByAttemptId(appDatabase.db, attempt.id);
            const progress = toProgressFromRows(words, answers);
            const existingState = getVocabReviewStateRowByAttemptId(appDatabase.db, attempt.id);

            upsertVocabReviewStateRow(
                appDatabase.db,
                buildStateRow(
                    progress,
                    {
                        attemptId: attempt.id,
                        learnerId: request.learnerId,
                        unitCycleActivityId: request.unitCycleActivityId,
                    },
                    existingState,
                    updatedAt
                )
            );
            updateActivityAttemptStatusRow(appDatabase.db, {
                id: attempt.id,
                status: "in_progress",
                submitted_at: null,
            });

            return {
                learnerWordStates: toVocabReviewLearnerWordStateDtos(words, answers),
                progress: toVocabReviewProgressDto(progress),
            };
        });
    } finally {
        appDatabase.close();
    }
}
