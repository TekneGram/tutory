import { randomUUID } from "node:crypto";
import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";
import {
    getActivityContentRowByUnitCycleActivityId,
    getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId,
    getUnitCycleActivityIdentityRowById,
    insertActivityAttemptRow,
    updateActivityAttemptStatusRow,
    upsertActivityStoryAnswerRow,
} from "@electron/db/repositories/activityRepositories";
import { runInTransaction } from "@electron/db/sqlite";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "@electron/utilities/logger";
import type {
    SubmitStoryFeedbackRequest,
    SubmitStoryFeedbackResponse,
} from "@electron/ipc/contracts/activities.contracts";
import { STORY_FEEDBACK_ANSWERS } from "./storyDtos";

function ensureAttemptRow(
    db: Parameters<typeof getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId>[0],
    learnerId: string,
    unitCycleActivityId: string,
    activityTypeId: number,
    contentSnapshotJson: string
) {
    const existingAttempt = getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId(
        db,
        learnerId,
        unitCycleActivityId
    );

    if (existingAttempt) {
        return existingAttempt;
    }

    const startedAt = new Date().toISOString();

    insertActivityAttemptRow(db, {
        id: randomUUID(),
        learner_id: learnerId,
        unit_cycle_activity_id: unitCycleActivityId,
        activity_type_id: activityTypeId,
        attempt_number: 1,
        status: "in_progress",
        score: null,
        started_at: startedAt,
        submitted_at: null,
        content_snapshot_json: contentSnapshotJson,
    });

    const createdAttempt = getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId(
        db,
        learnerId,
        unitCycleActivityId
    );

    if (!createdAttempt) {
        raiseAppError(
            "DB_QUERY_FAILED",
            "Story activity attempt could not be created or loaded."
        );
    }

    return createdAttempt;
}

export async function submitStoryFeedback(
    request: SubmitStoryFeedbackRequest,
    ctx: RequestContext
): Promise<SubmitStoryFeedbackResponse> {
    logger.info("Submitting story feedback", {
        correlationId: ctx.correlationId,
        learnerId: request.learnerId,
        unitCycleActivityId: request.unitCycleActivityId,
    });

    const selectedAnswer = request.selectedAnswer.trim();
    const comment = request.comment;

    if (!STORY_FEEDBACK_ANSWERS.includes(selectedAnswer as (typeof STORY_FEEDBACK_ANSWERS)[number])) {
        raiseAppError(
            "VALIDATION_INVALID_STATE",
            `Selected answer "${request.selectedAnswer}" is not valid for story feedback.`
        );
    }

    const appDatabase = createAppDatabase(getRuntimeDbPath());

    try {
        runInTransaction(appDatabase.db, () => {
            const activity = getUnitCycleActivityIdentityRowById(
                appDatabase.db,
                request.unitCycleActivityId
            );

            if (!activity) {
                raiseAppError(
                    "RESOURCE_NOT_FOUND",
                    `Story activity "${request.unitCycleActivityId}" was not found.`
                );
            }

            if (activity.activity_type !== "story") {
                raiseAppError(
                    "VALIDATION_INVALID_STATE",
                    `Activity "${request.unitCycleActivityId}" is not a story activity.`
                );
            }

            const contentRow = getActivityContentRowByUnitCycleActivityId(
                appDatabase.db,
                request.unitCycleActivityId
            );

            if (!contentRow) {
                raiseAppError(
                    "DB_QUERY_FAILED",
                    `Story activity content for "${request.unitCycleActivityId}" was not found.`
                );
            }

            const attempt = ensureAttemptRow(
                appDatabase.db,
                request.learnerId,
                request.unitCycleActivityId,
                activity.activity_type_id,
                contentRow.content_json
            );
            const timestamp = new Date().toISOString();

            upsertActivityStoryAnswerRow(appDatabase.db, {
                attempt_id: attempt.id,
                learner_id: request.learnerId,
                unit_cycle_activity_id: request.unitCycleActivityId,
                feedback: selectedAnswer,
                comment,
                created_at: attempt.started_at,
                updated_at: timestamp,
            });

            updateActivityAttemptStatusRow(appDatabase.db, {
                id: attempt.id,
                status: "completed",
                submitted_at: timestamp,
            });
        });

        logger.info("Story feedback submitted", {
            correlationId: ctx.correlationId,
            learnerId: request.learnerId,
            unitCycleActivityId: request.unitCycleActivityId,
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
