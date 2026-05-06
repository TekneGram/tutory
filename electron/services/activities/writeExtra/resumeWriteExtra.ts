import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";
import {
  getActivityContentRowByUnitCycleActivityId,
  getUnitCycleActivityIdentityRowById,
  updateActivityAttemptStatusRow,
} from "@electron/db/repositories/activityRepositories";
import { getWriteExtraStateRowByAttemptId, upsertWriteExtraStateRow } from "@electron/db/repositories/activity.writeExtraRepositories";
import { runInTransaction } from "@electron/db/sqlite";
import type {
  ResumeWriteExtraRequest,
  ResumeWriteExtraResponse,
} from "@electron/ipc/contracts/activities.contracts";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "@electron/utilities/logger";
import { ensureWriteExtraAttemptRow } from "./writeExtraShared";

export async function resumeWriteExtra(
  request: ResumeWriteExtraRequest,
  ctx: RequestContext,
): Promise<ResumeWriteExtraResponse> {
  logger.info("Resuming write extra activity", {
    correlationId: ctx.correlationId,
    learnerId: request.learnerId,
    unitCycleActivityId: request.unitCycleActivityId,
  });

  const appDatabase = createAppDatabase(getRuntimeDbPath());

  try {
    runInTransaction(appDatabase.db, () => {
      const activity = getUnitCycleActivityIdentityRowById(appDatabase.db, request.unitCycleActivityId);

      if (!activity) {
        raiseAppError(
          "RESOURCE_NOT_FOUND",
          `Write extra activity "${request.unitCycleActivityId}" was not found.`,
        );
      }

      if (activity.activity_type !== "write-extra") {
        raiseAppError(
          "VALIDATION_INVALID_STATE",
          `Activity "${request.unitCycleActivityId}" is not a write extra activity.`,
        );
      }

      const contentRow = getActivityContentRowByUnitCycleActivityId(appDatabase.db, request.unitCycleActivityId);

      if (!contentRow) {
        raiseAppError(
          "DB_QUERY_FAILED",
          `Write extra activity content for "${request.unitCycleActivityId}" was not found.`,
        );
      }

      const attempt = ensureWriteExtraAttemptRow(
        appDatabase.db,
        request.learnerId,
        request.unitCycleActivityId,
        activity.activity_type_id,
      );

      const timestamp = new Date().toISOString();
      const existingState = getWriteExtraStateRowByAttemptId(appDatabase.db, attempt.id);

      upsertWriteExtraStateRow(appDatabase.db, {
        attempt_id: attempt.id,
        learner_id: request.learnerId,
        unit_cycle_activity_id: request.unitCycleActivityId,
        is_completed: 0,
        completed_at: null,
        created_at: existingState?.created_at ?? timestamp,
        updated_at: timestamp,
      });

      updateActivityAttemptStatusRow(appDatabase.db, {
        id: attempt.id,
        status: "in_progress",
        submitted_at: null,
      });
    });

    logger.info("Write extra activity resumed", {
      correlationId: ctx.correlationId,
      learnerId: request.learnerId,
      unitCycleActivityId: request.unitCycleActivityId,
    });

    return {
      completion: {
        isCompleted: false,
      },
    };
  } finally {
    appDatabase.close();
  }
}
