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
  getObservePromptRowByActivityContentId,
  getObserveStateRowByAttemptId,
  listObserveCategoryRowsByActivityContentId,
  listObserveWordRowsByActivityContentId,
  upsertObserveStateRow,
} from "@electron/db/repositories/activity.observeRepositories";
import { runInTransaction } from "@electron/db/sqlite";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "@electron/utilities/logger";
import {
  toObserveCategoryDtos,
  toObserveImageRefDtos,
  toObserveLearnerWordStateDtos,
  toObserveProgressDto,
  toObserveWordDtos,
} from "./observeDtos";
import { buildStateRow, ensureObserveAttemptRow, toProgressFromRows } from "./observeShared";
import type { GetObserveActivityRequest, GetObserveActivityResponse } from "./observeTypes";

export async function getObserveActivity(
  request: GetObserveActivityRequest,
  ctx: RequestContext,
): Promise<GetObserveActivityResponse> {
  logger.info("Loading observe activity", {
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

      const prompt = getObservePromptRowByActivityContentId(appDatabase.db, contentRow.id);

      if (!prompt) {
        raiseAppError(
          "DB_QUERY_FAILED",
          `Observe prompt content for "${request.unitCycleActivityId}" was not found.`,
        );
      }

      const words = listObserveWordRowsByActivityContentId(appDatabase.db, contentRow.id);
      const categories = listObserveCategoryRowsByActivityContentId(appDatabase.db, contentRow.id);
      const attempt = ensureObserveAttemptRow(
        appDatabase.db,
        request.learnerId,
        request.unitCycleActivityId,
        activity.activity_type_id,
      );
      const answers = getObserveAnswerRowsByAttemptId(appDatabase.db, attempt.id);
      const existingState = getObserveStateRowByAttemptId(appDatabase.db, attempt.id);

      const progress = toProgressFromRows(words, answers);
      const updatedAt = new Date().toISOString();

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
        observe: {
          instructions: prompt.instructions,
          advice: prompt.advice,
          title: prompt.title,
          assetBase: prompt.asset_base?.trim() || null,
          assets: {
            imageRefs: toObserveImageRefDtos(prompt.image_refs_json),
          },
          words: toObserveWordDtos(words),
          categories: toObserveCategoryDtos(categories),
          learnerWordStates: toObserveLearnerWordStateDtos(words, answers),
          progress: toObserveProgressDto(progress),
        },
      };
    });
  } finally {
    appDatabase.close();
  }
}
