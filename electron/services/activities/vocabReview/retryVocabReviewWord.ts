import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";
import {
    getActivityContentRowByUnitCycleActivityId,
    getUnitCycleActivityIdentityRowById,
} from "@electron/db/repositories/activityRepositories";
import {
    getVocabReviewAnswerRowByAttemptIdAndWordId,
    getVocabReviewAnswerRowsByAttemptId,
    getVocabReviewStateRowByAttemptId,
    getVocabReviewWordRowByIdAndUnitCycleActivityId,
    listVocabReviewWordRowsByActivityContentId,
    resetVocabReviewAnswerRowByAttemptIdAndWordId,
    upsertVocabReviewStateRow,
} from "@electron/db/repositories/activity.vocabreviewRepositories";
import { runInTransaction } from "@electron/db/sqlite";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "@electron/utilities/logger";
import { toVocabReviewProgressDto } from "./vocabReviewDtos";
import { buildStateRow, ensureVocabReviewAttemptRow, toProgressFromRows } from "./vocabReviewShared";
import type { RetryVocabReviewWordRequest, RetryVocabReviewWordResponse } from "./vocabReviewTypes";

export async function retryVocabReviewWord(
    request: RetryVocabReviewWordRequest,
    ctx: RequestContext
): Promise<RetryVocabReviewWordResponse> {
    logger.info("Retrying vocab review word", {
        correlationId: ctx.correlationId,
        learnerId: request.learnerId,
        unitCycleActivityId: request.unitCycleActivityId,
        wordId: request.wordId,
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

            const word = getVocabReviewWordRowByIdAndUnitCycleActivityId(
                appDatabase.db,
                request.wordId,
                request.unitCycleActivityId
            );

            if (!word) {
                raiseAppError(
                    "VALIDATION_INVALID_STATE",
                    `Word "${request.wordId}" does not belong to this vocab review activity.`
                );
            }

            const attempt = ensureVocabReviewAttemptRow(
                appDatabase.db,
                request.learnerId,
                request.unitCycleActivityId,
                activity.activity_type_id
            );

            const updatedAt = new Date().toISOString();
            resetVocabReviewAnswerRowByAttemptIdAndWordId(appDatabase.db, attempt.id, word.id, updatedAt);

            const words = listVocabReviewWordRowsByActivityContentId(appDatabase.db, contentRow.id);
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

            const retriedAnswer = getVocabReviewAnswerRowByAttemptIdAndWordId(appDatabase.db, attempt.id, word.id);

            return {
                learnerWordState: {
                    wordId: word.id,
                    learnerInput: retriedAnswer?.learner_input ?? null,
                    isChecked: Boolean(retriedAnswer?.is_checked ?? 0),
                    isCorrect: Boolean(retriedAnswer?.is_correct ?? 0),
                    checkedAt: retriedAnswer?.checked_at ?? null,
                },
                progress: toVocabReviewProgressDto(progress),
            };
        });
    } finally {
        appDatabase.close();
    }
}
