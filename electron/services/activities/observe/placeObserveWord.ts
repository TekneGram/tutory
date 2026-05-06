import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";
import {
  getActivityContentRowByUnitCycleActivityId,
  getUnitCycleActivityIdentityRowById,
  updateActivityAttemptStatusRow,
} from "@electron/db/repositories/activityRepositories";
import {
  getObserveAnswerKeyRowByWordId,
  getObserveAnswerRowsByAttemptId,
  getObserveCategoryRowByIdAndUnitCycleActivityId,
  getObserveStateRowByAttemptId,
  getObserveWordRowByIdAndUnitCycleActivityId,
  listObserveWordRowsByActivityContentId,
  upsertObserveAnswerRow,
  upsertObserveStateRow,
} from "@electron/db/repositories/activity.observeRepositories";
import { runInTransaction } from "@electron/db/sqlite";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "@electron/utilities/logger";
import { toObserveProgressDto } from "./observeDtos";
import { buildStateRow, ensureObserveAttemptRow, toProgressFromRows } from "./observeShared";
import type { PlaceObserveWordRequest, PlaceObserveWordResponse } from "./observeTypes";

export async function placeObserveWord(
  request: PlaceObserveWordRequest,
  ctx: RequestContext,
): Promise<PlaceObserveWordResponse> {
  logger.info("Placing observe word", {
    correlationId: ctx.correlationId,
    learnerId: request.learnerId,
    unitCycleActivityId: request.unitCycleActivityId,
    wordId: request.wordId,
    categoryId: request.categoryId,
  });

  const appDatabase = createAppDatabase(getRuntimeDbPath());

  try {
    return runInTransaction(appDatabase.db, () => {
      const activity = getUnitCycleActivityIdentityRowById(appDatabase.db, request.unitCycleActivityId);

      if (!activity) {
        raiseAppError("RESOURCE_NOT_FOUND", `Observe activity "${request.unitCycleActivityId}" was not found.`);
      }

      if (activity.activity_type !== "observe") {
        raiseAppError(
          "VALIDATION_INVALID_STATE",
          `Activity "${request.unitCycleActivityId}" is not an observe activity.`,
        );
      }

      const contentRow = getActivityContentRowByUnitCycleActivityId(appDatabase.db, request.unitCycleActivityId);

      if (!contentRow?.id) {
        raiseAppError(
          "DB_QUERY_FAILED",
          `Observe activity content for "${request.unitCycleActivityId}" was not found.`,
        );
      }

      const word = getObserveWordRowByIdAndUnitCycleActivityId(
        appDatabase.db,
        request.wordId,
        request.unitCycleActivityId,
      );

      if (!word) {
        raiseAppError(
          "VALIDATION_INVALID_STATE",
          `Word "${request.wordId}" does not belong to this observe activity.`,
        );
      }

      const category = getObserveCategoryRowByIdAndUnitCycleActivityId(
        appDatabase.db,
        request.categoryId,
        request.unitCycleActivityId,
      );

      if (!category) {
        raiseAppError(
          "VALIDATION_INVALID_STATE",
          `Category "${request.categoryId}" does not belong to this observe activity.`,
        );
      }

      const answerKey = getObserveAnswerKeyRowByWordId(appDatabase.db, request.wordId);

      if (!answerKey) {
        raiseAppError("DB_QUERY_FAILED", `Answer key for word "${request.wordId}" was not found.`);
      }

      const attempt = ensureObserveAttemptRow(
        appDatabase.db,
        request.learnerId,
        request.unitCycleActivityId,
        activity.activity_type_id,
      );

      const checkedAt = new Date().toISOString();
      const isCorrect = answerKey.category_id === request.categoryId;

      upsertObserveAnswerRow(appDatabase.db, {
        attempt_id: attempt.id,
        learner_id: request.learnerId,
        unit_cycle_activity_id: request.unitCycleActivityId,
        word_id: request.wordId,
        selected_category_id: request.categoryId,
        is_placed: 1,
        is_correct: isCorrect ? 1 : 0,
        checked_at: checkedAt,
        created_at: checkedAt,
        updated_at: checkedAt,
      });

      const words = listObserveWordRowsByActivityContentId(appDatabase.db, contentRow.id);
      const answers = getObserveAnswerRowsByAttemptId(appDatabase.db, attempt.id);
      const progress = toProgressFromRows(words, answers);
      const existingState = getObserveStateRowByAttemptId(appDatabase.db, attempt.id);

      upsertObserveStateRow(
        appDatabase.db,
        buildStateRow(
          progress,
          {
            attemptId: attempt.id,
            learnerId: request.learnerId,
            unitCycleActivityId: request.unitCycleActivityId,
          },
          existingState,
          checkedAt,
        ),
      );

      updateActivityAttemptStatusRow(appDatabase.db, {
        id: attempt.id,
        status: progress.isFinished ? "completed" : "in_progress",
        submitted_at: progress.isFinished ? checkedAt : null,
      });

      const placedAnswer = answers.find((answer) => answer.word_id === request.wordId);

      if (!placedAnswer) {
        raiseAppError("DB_QUERY_FAILED", `Placed answer for word "${request.wordId}" could not be loaded.`);
      }

      return {
        learnerWordState: {
          wordId: request.wordId,
          selectedCategoryId: placedAnswer.selected_category_id,
          isPlaced: Boolean(placedAnswer.is_placed),
          isCorrect: Boolean(placedAnswer.is_correct),
          checkedAt: placedAnswer.checked_at,
        },
        progress: toObserveProgressDto(progress),
      };
    });
  } finally {
    appDatabase.close();
  }
}
