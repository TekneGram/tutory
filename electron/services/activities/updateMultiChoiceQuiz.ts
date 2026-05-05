import { randomUUID } from "node:crypto";
import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";
import {
    getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId,
    getMultiChoiceQuizAnswerRowByAttemptIdAndQuestionId,
    getMultiChoiceQuizOptionRowByIdAndQuestionId,
    getMultiChoiceQuizQuestionRowByIdAndUnitCycleActivityId,
    getUnitCycleActivityIdentityRowById,
    insertActivityAttemptRow,
    upsertMultiChoiceQuizAnswerRow,
} from "@electron/db/repositories/activityRepositories";
import { runInTransaction } from "@electron/db/sqlite";
import type {
    SubmitMultiChoiceQuizAnswerRequest,
    SubmitMultiChoiceQuizAnswerResponse,
} from "@electron/ipc/contracts/activities.contracts";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "@electron/utilities/logger";
import { toSubmitMultiChoiceQuizAnswerResponse } from "./updateMultiChoiceQuiz/updateMultiChoiceQuizSchema";

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
        content_snapshot_json: null,
    });

    const createdAttempt = getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId(
        db,
        learnerId,
        unitCycleActivityId
    );

    if (!createdAttempt) {
        raiseAppError(
            "DB_QUERY_FAILED",
            "Multi choice quiz attempt could not be created or loaded."
        );
    }

    return createdAttempt;
}

export async function updateMultiChoiceQuiz(
    request: SubmitMultiChoiceQuizAnswerRequest,
    ctx: RequestContext
): Promise<SubmitMultiChoiceQuizAnswerResponse> {
    logger.info("Submitting multi choice quiz answer", {
        correlationId: ctx.correlationId,
        learnerId: request.learnerId,
        unitCycleActivityId: request.unitCycleActivityId,
        questionId: request.questionId,
    });

    const appDatabase = createAppDatabase(getRuntimeDbPath());

    try {
        const response = runInTransaction(appDatabase.db, () => {
            const activity = getUnitCycleActivityIdentityRowById(
                appDatabase.db,
                request.unitCycleActivityId
            );

            if (!activity) {
                raiseAppError(
                    "RESOURCE_NOT_FOUND",
                    `Multi choice quiz activity "${request.unitCycleActivityId}" was not found.`
                );
            }

            if (activity.activity_type !== "multi-choice-quiz") {
                raiseAppError(
                    "VALIDATION_INVALID_STATE",
                    `Activity "${request.unitCycleActivityId}" is not a multi choice quiz activity.`
                );
            }

            const question = getMultiChoiceQuizQuestionRowByIdAndUnitCycleActivityId(
                appDatabase.db,
                request.questionId,
                request.unitCycleActivityId
            );

            if (!question) {
                raiseAppError(
                    "VALIDATION_INVALID_STATE",
                    `Question "${request.questionId}" does not belong to multi choice quiz activity "${request.unitCycleActivityId}".`
                );
            }

            const option = getMultiChoiceQuizOptionRowByIdAndQuestionId(
                appDatabase.db,
                request.selectedOption,
                request.questionId
            );

            if (!option) {
                raiseAppError(
                    "VALIDATION_INVALID_STATE",
                    `Option "${request.selectedOption}" does not belong to question "${request.questionId}".`
                );
            }

            if (option.is_correct !== request.isCorrect) {
                raiseAppError(
                    "VALIDATION_INVALID_STATE",
                    `Submitted correctness does not match stored correctness for option "${request.selectedOption}".`
                );
            }

            const attempt = ensureAttemptRow(
                appDatabase.db,
                request.learnerId,
                request.unitCycleActivityId,
                activity.activity_type_id
            );

            const existingAnswer = getMultiChoiceQuizAnswerRowByAttemptIdAndQuestionId(
                appDatabase.db,
                attempt.id,
                request.questionId
            );
            const timestamp = new Date().toISOString();

            upsertMultiChoiceQuizAnswerRow(appDatabase.db, {
                attempt_id: attempt.id,
                learner_id: request.learnerId,
                unit_cycle_activity_id: request.unitCycleActivityId,
                question_id: request.questionId,
                question: question.question_text,
                is_answered: true,
                selected_option: request.selectedOption,
                is_correct: request.isCorrect,
                created_at: existingAnswer?.created_at ?? timestamp,
                updated_at: timestamp,
            });

            const answer = getMultiChoiceQuizAnswerRowByAttemptIdAndQuestionId(
                appDatabase.db,
                attempt.id,
                request.questionId
            );

            if (!answer) {
                raiseAppError(
                    "DB_QUERY_FAILED",
                    "Updated multi choice quiz answer could not be loaded."
                );
            }

            return toSubmitMultiChoiceQuizAnswerResponse(answer);
        });

        logger.info("Submitted multi choice quiz answer", {
            correlationId: ctx.correlationId,
            learnerId: request.learnerId,
            unitCycleActivityId: request.unitCycleActivityId,
            questionId: request.questionId,
        });

        return response;
    } finally {
        appDatabase.close();
    }
}
