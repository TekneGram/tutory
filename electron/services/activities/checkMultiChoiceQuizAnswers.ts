import { randomUUID } from "node:crypto";
import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";
import {
    getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId,
    getMultiChoiceQuizAnswerRowsByAttemptId,
    getMultiChoiceQuizOptionRowByIdAndQuestionId,
    getMultiChoiceQuizQuestionRowByIdAndUnitCycleActivityId,
    getMultiChoiceQuizStateRowByAttemptId,
    getUnitCycleActivityIdentityRowById,
    insertActivityAttemptRow,
    upsertMultiChoiceQuizAnswerRow,
    upsertMultiChoiceQuizStateRow,
} from "@electron/db/repositories/activityRepositories";
import { runInTransaction } from "@electron/db/sqlite";
import type {
    CheckMultiChoiceQuizAnswersRequest,
    CheckMultiChoiceQuizAnswersResponse,
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

export async function checkMultiChoiceQuizAnswers(
    request: CheckMultiChoiceQuizAnswersRequest,
    ctx: RequestContext
): Promise<CheckMultiChoiceQuizAnswersResponse> {
    logger.info("Checking multi choice quiz answers", {
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

            const checkedAt = new Date().toISOString();
            let finalScore = 0;

            for (const answer of request.answers) {
                const question = getMultiChoiceQuizQuestionRowByIdAndUnitCycleActivityId(
                    appDatabase.db,
                    answer.questionId,
                    request.unitCycleActivityId
                );
                if (!question) {
                    raiseAppError("VALIDATION_INVALID_STATE", `Question "${answer.questionId}" does not belong to this activity.`);
                }

                const option = getMultiChoiceQuizOptionRowByIdAndQuestionId(
                    appDatabase.db,
                    answer.selectedOption,
                    answer.questionId
                );
                if (!option) {
                    raiseAppError("VALIDATION_INVALID_STATE", `Option "${answer.selectedOption}" does not belong to question "${answer.questionId}".`);
                }

                const isCorrect = Boolean(option.is_correct);
                if (isCorrect) finalScore += 1;

                upsertMultiChoiceQuizAnswerRow(appDatabase.db, {
                    attempt_id: attempt.id,
                    learner_id: request.learnerId,
                    unit_cycle_activity_id: request.unitCycleActivityId,
                    question_id: answer.questionId,
                    question: question.question_text,
                    is_answered: 1,
                    selected_option: answer.selectedOption,
                    is_correct: isCorrect ? 1 : 0,
                    created_at: checkedAt,
                    updated_at: checkedAt,
                });
            }

            const existingState = getMultiChoiceQuizStateRowByAttemptId(appDatabase.db, attempt.id);
            upsertMultiChoiceQuizStateRow(appDatabase.db, {
                attempt_id: attempt.id,
                learner_id: request.learnerId,
                unit_cycle_activity_id: request.unitCycleActivityId,
                is_checked: 1,
                final_score: finalScore,
                checked_at: checkedAt,
                created_at: existingState?.created_at ?? checkedAt,
                updated_at: checkedAt,
            });

            const learnerAnswers = toMultiChoiceQuizLearnerAnswers(
                getMultiChoiceQuizAnswerRowsByAttemptId(appDatabase.db, attempt.id)
            );

            return {
                learnerAnswers,
                quizState: {
                    isChecked: true,
                    finalScore,
                    checkedAt,
                },
            };
        });
    } finally {
        appDatabase.close();
    }
}
