import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";
import {
  getActivityContentRowByUnitCycleActivityId,
  getUnitCycleActivityIdentityRowById,
  updateActivityAttemptStatusRow,
} from "@electron/db/repositories/activityRepositories";
import {
  getWriteExtraAnswerRowByAttemptId,
  getWriteExtraPromptRowByActivityContentId,
  getWriteExtraStateRowByAttemptId,
  upsertWriteExtraStateRow,
} from "@electron/db/repositories/activity.writeExtraRepositories";
import { runInTransaction } from "@electron/db/sqlite";
import type {
  GetWriteExtraActivityRequest,
  GetWriteExtraActivityResponse,
} from "@electron/ipc/contracts/activities.contracts";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "@electron/utilities/logger";
import { toWriteExtraAudioRefDtos, toWriteExtraImageRefDtos } from "./writeExtraDtos";
import { ensureWriteExtraAttemptRow } from "./writeExtraShared";

export async function getWriteExtraActivity(
  request: GetWriteExtraActivityRequest,
  ctx: RequestContext,
): Promise<GetWriteExtraActivityResponse> {
  logger.info("Loading write extra activity", {
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

      if (!contentRow?.id) {
        raiseAppError(
          "DB_QUERY_FAILED",
          `Write extra activity content for "${request.unitCycleActivityId}" was not found.`,
        );
      }

      const prompt = getWriteExtraPromptRowByActivityContentId(appDatabase.db, contentRow.id);

      if (!prompt) {
        raiseAppError(
          "DB_QUERY_FAILED",
          `Write extra prompt content for "${request.unitCycleActivityId}" was not found.`,
        );
      }

      const attempt = ensureWriteExtraAttemptRow(
        appDatabase.db,
        request.learnerId,
        request.unitCycleActivityId,
        activity.activity_type_id,
      );

      const answer = getWriteExtraAnswerRowByAttemptId(appDatabase.db, attempt.id);
      const existingState = getWriteExtraStateRowByAttemptId(appDatabase.db, attempt.id);
      const updatedAt = new Date().toISOString();

      const stateRow = {
        attempt_id: attempt.id,
        learner_id: request.learnerId,
        unit_cycle_activity_id: request.unitCycleActivityId,
        is_completed: existingState?.is_completed ?? (attempt.status === "completed" ? 1 : 0),
        completed_at: existingState?.completed_at ?? attempt.submitted_at,
        created_at: existingState?.created_at ?? updatedAt,
        updated_at: updatedAt,
      } as const;

      upsertWriteExtraStateRow(appDatabase.db, stateRow);

      if (stateRow.is_completed === 1 && attempt.status !== "completed") {
        updateActivityAttemptStatusRow(appDatabase.db, {
          id: attempt.id,
          status: "completed",
          submitted_at: stateRow.completed_at ?? updatedAt,
        });
      } else if (stateRow.is_completed === 0 && attempt.status === "completed") {
        updateActivityAttemptStatusRow(appDatabase.db, {
          id: attempt.id,
          status: "in_progress",
          submitted_at: null,
        });
      }

      logger.info("Write extra activity loaded", {
        correlationId: ctx.correlationId,
        learnerId: request.learnerId,
        unitCycleActivityId: request.unitCycleActivityId,
        isCompleted: stateRow.is_completed === 1,
      });

      return {
        writeExtra: {
          instructions: prompt.instructions,
          advice: prompt.advice,
          title: prompt.title,
          assetBase: prompt.asset_base?.trim() || null,
          assets: {
            imageRefs: toWriteExtraImageRefDtos(prompt.image_refs_json),
            audioRefs: toWriteExtraAudioRefDtos(prompt.audio_refs_json),
          },
          storyText: prompt.story_text,
          learnerText: answer?.learner_text ?? "",
          completion: {
            isCompleted: stateRow.is_completed === 1,
          },
        },
      };
    });
  } finally {
    appDatabase.close();
  }
}
