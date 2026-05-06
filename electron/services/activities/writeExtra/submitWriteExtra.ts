import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";
import {
  getActivityContentRowByUnitCycleActivityId,
  getUnitCycleActivityIdentityRowById,
  updateActivityAttemptStatusRow,
} from "@electron/db/repositories/activityRepositories";
import {
  getWriteExtraStateRowByAttemptId,
  upsertWriteExtraAnswerRow,
  upsertWriteExtraStateRow,
} from "@electron/db/repositories/activity.writeExtraRepositories";
import { runInTransaction } from "@electron/db/sqlite";
import type {
  SubmitWriteExtraRequest,
  SubmitWriteExtraResponse,
} from "@electron/ipc/contracts/activities.contracts";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "@electron/utilities/logger";
import { countWords, ensureWriteExtraAttemptRow } from "./writeExtraShared";

const MIN_SUBMIT_WORDS = 25;

export async function submitWriteExtra(
  request: SubmitWriteExtraRequest,
  ctx: RequestContext,
): Promise<SubmitWriteExtraResponse> {
  logger.info("Submitting write extra activity", {
    correlationId: ctx.correlationId,
    learnerId: request.learnerId,
    unitCycleActivityId: request.unitCycleActivityId,
  });

  const wordCount = countWords(request.learnerText);
  if (wordCount < MIN_SUBMIT_WORDS) {
    raiseAppError(
      "VALIDATION_INVALID_STATE",
      `Write extra submission requires at least ${MIN_SUBMIT_WORDS} words.`,
    );
  }

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

      upsertWriteExtraAnswerRow(appDatabase.db, {
        attempt_id: attempt.id,
        learner_id: request.learnerId,
        unit_cycle_activity_id: request.unitCycleActivityId,
        learner_text: request.learnerText,
        created_at: attempt.started_at,
        updated_at: timestamp,
      });

      upsertWriteExtraStateRow(appDatabase.db, {
        attempt_id: attempt.id,
        learner_id: request.learnerId,
        unit_cycle_activity_id: request.unitCycleActivityId,
        is_completed: 1,
        completed_at: timestamp,
        created_at: existingState?.created_at ?? timestamp,
        updated_at: timestamp,
      });

      updateActivityAttemptStatusRow(appDatabase.db, {
        id: attempt.id,
        status: "completed",
        submitted_at: timestamp,
      });
    });

    logger.info("Write extra submission saved", {
      correlationId: ctx.correlationId,
      learnerId: request.learnerId,
      unitCycleActivityId: request.unitCycleActivityId,
      words: wordCount,
    });

    return {
      completion: {
        isCompleted: true,
      },
    };
  } finally {
    appDatabase.close();
  }
}
