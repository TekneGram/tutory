import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";
import {
  getActivityContentRowByUnitCycleActivityId,
  getUnitCycleActivityIdentityRowById,
  updateActivityAttemptStatusRow,
} from "@electron/db/repositories/activityRepositories";
import {
  getObserveAnswerRowsByAttemptId,
  getObserveStateRowByAttemptId,
  listObserveWordRowsByActivityContentId,
  resetObserveAnswerRowsByAttemptId,
  upsertObserveStateRow,
} from "@electron/db/repositories/activity.observeRepositories";
import { runInTransaction } from "@electron/db/sqlite";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "@electron/utilities/logger";
import { toObserveLearnerWordStateDtos, toObserveProgressDto } from "./observeDtos";
import { buildStateRow, ensureObserveAttemptRow, toProgressFromRows } from "./observeShared";
import type { ResetObserveActivityRequest, ResetObserveActivityResponse } from "./observeTypes";

export async function resetObserveActivity(
  request: ResetObserveActivityRequest,
  ctx: RequestContext,
): Promise<ResetObserveActivityResponse> {
  logger.info("Resetting observe activity", {
    correlationId: ctx.correlationId,
    learnerId: request.learnerId,
    unitCycleActivityId: request.unitCycleActivityId,
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

      const words = listObserveWordRowsByActivityContentId(appDatabase.db, contentRow.id);

      const attempt = ensureObserveAttemptRow(
        appDatabase.db,
        request.learnerId,
        request.unitCycleActivityId,
        activity.activity_type_id,
      );

      const updatedAt = new Date().toISOString();
      resetObserveAnswerRowsByAttemptId(appDatabase.db, attempt.id, updatedAt);

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
          updatedAt,
        ),
      );

      updateActivityAttemptStatusRow(appDatabase.db, {
        id: attempt.id,
        status: "in_progress",
        submitted_at: null,
      });

      return {
        learnerWordStates: toObserveLearnerWordStateDtos(words, answers),
        progress: toObserveProgressDto(progress),
      };
    });
  } finally {
    appDatabase.close();
  }
}
