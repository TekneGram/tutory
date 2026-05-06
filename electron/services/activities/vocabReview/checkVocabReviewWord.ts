import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";
import {
    getUnitCycleActivityIdentityRowById,
    getActivityContentRowByUnitCycleActivityId,
} from "@electron/db/repositories/activityRepositories";
import {
    getVocabReviewAnswerRowsByAttemptId,
    getVocabReviewStateRowByAttemptId,
    getVocabReviewWordRowByIdAndUnitCycleActivityId,
    listVocabReviewWordRowsByActivityContentId,
    upsertVocabReviewAnswerRow,
    upsertVocabReviewStateRow,
} from "@electron/db/repositories/activity.vocabreviewRepositories";
import { runInTransaction } from "@electron/db/sqlite";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "@electron/utilities/logger";
import { toVocabReviewProgressDto } from "./vocabReviewDtos";
import {
    buildStateRow,
    ensureVocabReviewAttemptRow,
    normalizeForComparison,
    toProgressFromRows,
} from "./vocabReviewShared";
import type { CheckVocabReviewWordRequest, CheckVocabReviewWordResponse } from "./vocabReviewTypes";

export async function checkVocabReviewWord(
    request: CheckVocabReviewWordRequest,
    ctx: RequestContext
): Promise<CheckVocabReviewWordResponse> {
    logger.info("Checking vocab review word", {
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

            const checkedAt = new Date().toISOString();
            const isCorrect = normalizeForComparison(request.learnerInput) === normalizeForComparison(word.word_text);

            upsertVocabReviewAnswerRow(appDatabase.db, {
                attempt_id: attempt.id,
                learner_id: request.learnerId,
                unit_cycle_activity_id: request.unitCycleActivityId,
                word_id: word.id,
                learner_input: request.learnerInput,
                is_checked: 1,
                is_correct: isCorrect ? 1 : 0,
                checked_at: checkedAt,
                created_at: checkedAt,
                updated_at: checkedAt,
            });

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
                    checkedAt
                )
            );

            const checkedAnswer = answers.find((answer) => answer.word_id === word.id);
            if (!checkedAnswer) {
                raiseAppError("DB_QUERY_FAILED", `Checked answer for word "${word.id}" could not be loaded.`);
            }

            return {
                learnerWordState: {
                    wordId: word.id,
                    learnerInput: checkedAnswer.learner_input,
                    isChecked: Boolean(checkedAnswer.is_checked),
                    isCorrect: Boolean(checkedAnswer.is_correct),
                    checkedAt: checkedAnswer.checked_at,
                },
                progress: toVocabReviewProgressDto(progress),
            };
        });
    } finally {
        appDatabase.close();
    }
}
