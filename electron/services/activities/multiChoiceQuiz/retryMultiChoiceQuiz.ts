import { randomUUID } from "node:crypto";
import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";
import {
    getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId,
    getUnitCycleActivityIdentityRowById,
    insertActivityAttemptRow,
} from "@electron/db/repositories/activityRepositories";
import {
    getMultiChoiceQuizAnswerRowsByAttemptId,
    getMultiChoiceQuizStateRowByAttemptId,
    resetMultiChoiceQuizAnswerRowsByAttemptId,
    upsertMultiChoiceQuizStateRow,
} from "@electron/db/repositories/activity.multichoicequizRepositories";
import { runInTransaction } from "@electron/db/sqlite";
import type {
    RetryMultiChoiceQuizRequest,
    RetryMultiChoiceQuizResponse,
} from "@electron/ipc/contracts/activities.contracts";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "@electron/utilities/logger";
import { toMultiChoiceQuizLearnerAnswers } from "./getMultiChoiceQuiz/multiChoiceQuizSchema";

function ensureAttemptRow(
    db: Parameters<typeof getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId>[0],
    learnerId: string,
    unitCycleActivityId: string,
    activityTypeId: number
) {
    const existingAttempt = getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId(
        db,
        learnerId,
        unitCycleActivityId
    );
    if (existingAttempt) return existingAttempt;

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
        content_snapshot_json: null,
    });

    const createdAttempt = getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId(
        db,
        learnerId,
        unitCycleActivityId
    );
    if (!createdAttempt) {
        raiseAppError("DB_QUERY_FAILED", "Multi choice quiz attempt could not be created or loaded.");
    }
    return createdAttempt;
}

export async function retryMultiChoiceQuiz(
    request: RetryMultiChoiceQuizRequest,
    ctx: RequestContext
): Promise<RetryMultiChoiceQuizResponse> {
    logger.info("Retrying multi choice quiz", {
        correlationId: ctx.correlationId,
        learnerId: request.learnerId,
        unitCycleActivityId: request.unitCycleActivityId,
    });
    const appDatabase = createAppDatabase(getRuntimeDbPath());
    try {
        return runInTransaction(appDatabase.db, () => {
            const activity = getUnitCycleActivityIdentityRowById(appDatabase.db, request.unitCycleActivityId);
            if (!activity) {
                raiseAppError("RESOURCE_NOT_FOUND", `Multi choice quiz activity "${request.unitCycleActivityId}" was not found.`);
            }
            if (activity.activity_type !== "multi-choice-quiz") {
                raiseAppError("VALIDATION_INVALID_STATE", `Activity "${request.unitCycleActivityId}" is not a multi choice quiz activity.`);
            }
            const attempt = ensureAttemptRow(
                appDatabase.db,
                request.learnerId,
                request.unitCycleActivityId,
                activity.activity_type_id
            );

            const updatedAt = new Date().toISOString();
            resetMultiChoiceQuizAnswerRowsByAttemptId(appDatabase.db, attempt.id, updatedAt);
            const existingState = getMultiChoiceQuizStateRowByAttemptId(appDatabase.db, attempt.id);
            upsertMultiChoiceQuizStateRow(appDatabase.db, {
                attempt_id: attempt.id,
                learner_id: request.learnerId,
                unit_cycle_activity_id: request.unitCycleActivityId,
                is_checked: 0,
                final_score: 0,
                checked_at: null,
                created_at: existingState?.created_at ?? updatedAt,
                updated_at: updatedAt,
            });

            return {
                learnerAnswers: toMultiChoiceQuizLearnerAnswers(
                    getMultiChoiceQuizAnswerRowsByAttemptId(appDatabase.db, attempt.id)
                ),
                quizState: {
                    isChecked: false,
                    finalScore: 0,
                    checkedAt: null,
                },
            };
        });
    } finally {
        appDatabase.close();
    }
}
