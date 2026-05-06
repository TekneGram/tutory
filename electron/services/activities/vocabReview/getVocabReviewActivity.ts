import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";
import {
    getActivityContentPrimaryRowByActivityContentId,
    getActivityContentRowByUnitCycleActivityId,
    getUnitCycleActivityIdentityRowById,
    updateActivityAttemptStatusRow,
} from "@electron/db/repositories/activityRepositories";
import {
    getVocabReviewAnswerRowsByAttemptId,
    getVocabReviewStateRowByAttemptId,
    listVocabReviewWordRowsByActivityContentId,
    upsertVocabReviewStateRow,
} from "@electron/db/repositories/activity.vocabreviewRepositories";
import { runInTransaction } from "@electron/db/sqlite";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "@electron/utilities/logger";
import {
    toVocabReviewLearnerWordStateDtos,
    toVocabReviewProgressDto,
    toVocabReviewWordDtos,
} from "./vocabReviewDtos";
import { buildStateRow, ensureVocabReviewAttemptRow, toProgressFromRows } from "./vocabReviewShared";
import type { GetVocabReviewActivityRequest, GetVocabReviewActivityResponse } from "./vocabReviewTypes";

export async function getVocabReviewActivity(
    request: GetVocabReviewActivityRequest,
    ctx: RequestContext
): Promise<GetVocabReviewActivityResponse> {
    logger.info("Loading vocab review activity", {
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

            const primary = getActivityContentPrimaryRowByActivityContentId(appDatabase.db, contentRow.id);

            if (!primary) {
                raiseAppError(
                    "DB_QUERY_FAILED",
                    `Primary vocab review content for "${request.unitCycleActivityId}" was not found.`
                );
            }

            const words = listVocabReviewWordRowsByActivityContentId(appDatabase.db, contentRow.id);
            const attempt = ensureVocabReviewAttemptRow(
                appDatabase.db,
                request.learnerId,
                request.unitCycleActivityId,
                activity.activity_type_id
            );
            const answers = getVocabReviewAnswerRowsByAttemptId(appDatabase.db, attempt.id);
            const existingState = getVocabReviewStateRowByAttemptId(appDatabase.db, attempt.id);

            const progress = toProgressFromRows(words, answers);
            const updatedAt = new Date().toISOString();
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
            if (progress.isFinished && attempt.status !== "completed") {
                updateActivityAttemptStatusRow(appDatabase.db, {
                    id: attempt.id,
                    status: "completed",
                    submitted_at: progress.completedAt ?? updatedAt,
                });
            } else if (!progress.isFinished && attempt.status === "completed") {
                updateActivityAttemptStatusRow(appDatabase.db, {
                    id: attempt.id,
                    status: "in_progress",
                    submitted_at: null,
                });
            }

            return {
                vocabReview: {
                    instructions: primary.instructions,
                    advice: primary.advice,
                    title: primary.title,
                    assetBase: primary.asset_base?.trim() || null,
                    words: toVocabReviewWordDtos(words),
                    learnerWordStates: toVocabReviewLearnerWordStateDtos(words, answers),
                    progress: toVocabReviewProgressDto(progress),
                },
            };
        });
    } finally {
        appDatabase.close();
    }
}
