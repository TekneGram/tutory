import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";

import { runInTransaction } from "@electron/db/sqlite";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "@electron/utilities/logger";

import type { 
    GetMultiChoiceQuizActivityRequest,
    GetMultiChoiceQuizActivityResponse,
} from "@electron/ipc/contracts/activities.contracts";

import {
    getActivityContentRowByUnitCycleActivityId,
    getActivityContentPrimaryRowByActivityContentId,
    getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId,
    getUnitCycleActivityIdentityRowById,
    insertActivityAttemptRow,
    listActivityContentAssetRowsByActivityContentId,
    updateActivityAttemptStatusRow,
} from "@electron/db/repositories/activityRepositories";
import {
    getMultiChoiceQuizAnswerRowsByAttemptId,
    getMultiChoiceQuizStateRowByAttemptId,
    listMultiChoiceQuizOptionRowsByActivityContentId,
    listMultiChoiceQuizQuestionRowsByActivityContentId,
} from "@electron/db/repositories/activity.multichoicequizRepositories";

import { randomUUID } from "node:crypto";

import { 
    toMultiChoiceQuizImageRefDtos,
    toMultiChoiceQuizAudioRefDtos,
    toMultiChoiceQuizVideoRefDtos,
    toMultiChoiceQuizQuestions,
    toMultiChoiceQuizLearnerAnswers,
} from "./getMultiChoiceQuiz/multiChoiceQuizSchema";

function ensureStartedAttempt(
    db: Parameters<typeof getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId>[0],
    learnerId: string,
    unitCycleActivityId: string,
    activityTypeId: number
) {
    const existingAttempt = getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId(
        db, learnerId, unitCycleActivityId
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
        content_snapshot_json: null
    });

    const createdAttempt = getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId(
        db,
        learnerId,
        unitCycleActivityId
    );

    if (!createdAttempt) {
        raiseAppError(
            "DB_QUERY_FAILED",
            "Multi Choice Quiz attempt could not be created or loaded."
        );
    }

    return createdAttempt;
}

export async function getMultiChoiceQuizActivity(
    request: GetMultiChoiceQuizActivityRequest,
    ctx: RequestContext
): Promise<GetMultiChoiceQuizActivityResponse> {
    logger.info("Loading multi choice quiz activity", {
        correlationId: ctx.correlationId,
        learnerId: request.learnerId,
        unitCycleActivity: request.unitCycleActivityId,
    })

    const appDatabase = createAppDatabase(getRuntimeDbPath());

    try {
        return runInTransaction(appDatabase.db, () => {
            const activity = getUnitCycleActivityIdentityRowById(
                appDatabase.db,
                request.unitCycleActivityId
            );

            if (!activity) {
                raiseAppError(
                    "RESOURCE_NOT_FOUND",
                    `Multi choice activity "${request.unitCycleActivityId}" was not found.`
                );
            }

            if (activity.activity_type !== "multi-choice-quiz") {
                raiseAppError(
                    "VALIDATION_INVALID_STATE",
                    `Activity "${request.unitCycleActivityId}" is not a multi choice quiz activity.`
                );
            }

            const contentRow = getActivityContentRowByUnitCycleActivityId(
                appDatabase.db,
                request.unitCycleActivityId
            );

            if (!contentRow) {
                raiseAppError(
                    "DB_QUERY_FAILED",
                    `Multi choice quiz activity content for "${request.unitCycleActivityId}" was not found.`
                );
            }
            if (!contentRow.id) {
                raiseAppError(
                    "DB_QUERY_FAILED",
                    `Multi choice quiz content id for "${request.unitCycleActivityId}" was not found.`
                );
            }

            const primary = getActivityContentPrimaryRowByActivityContentId(appDatabase.db, contentRow.id);
            if (!primary) {
                raiseAppError(
                    "DB_QUERY_FAILED",
                    `Primary multi choice quiz content for "${request.unitCycleActivityId}" was not found.`
                );
            }

            const assets = listActivityContentAssetRowsByActivityContentId(appDatabase.db, contentRow.id);
            const questions = listMultiChoiceQuizQuestionRowsByActivityContentId(appDatabase.db, contentRow.id);
            const options = listMultiChoiceQuizOptionRowsByActivityContentId(appDatabase.db, contentRow.id);

            const attempt = ensureStartedAttempt(
                appDatabase.db,
                request.learnerId,
                request.unitCycleActivityId,
                activity.activity_type_id
            );
            const answers = getMultiChoiceQuizAnswerRowsByAttemptId(appDatabase.db, attempt.id);
            const quizState = getMultiChoiceQuizStateRowByAttemptId(appDatabase.db, attempt.id);
            const isChecked = Boolean(quizState?.is_checked ?? 0);
            if (isChecked && attempt.status !== "completed") {
                updateActivityAttemptStatusRow(appDatabase.db, {
                    id: attempt.id,
                    status: "completed",
                    submitted_at: quizState?.checked_at ?? new Date().toISOString(),
                });
            } else if (!isChecked && attempt.status === "completed") {
                updateActivityAttemptStatusRow(appDatabase.db, {
                    id: attempt.id,
                    status: "in_progress",
                    submitted_at: null,
                });
            }

            const learnerAnswers = toMultiChoiceQuizLearnerAnswers(answers);
            
            logger.info("Multi Choice Quiz activity loaded", {
                correlationId: ctx.correlationId,
                learnerId: request.learnerId,
                unitCycleActivityId: request.unitCycleActivityId,
                isCompleted: attempt.status === "completed",
            });

            return {
                multiChoiceQuiz: {
                    instructions: primary.instructions,
                    advice: primary.advice,
                    title: primary.title,
                    assetBase: primary.asset_base?.trim() || null,
                    assets: {
                        imageRefs: toMultiChoiceQuizImageRefDtos(assets),
                        audioRefs: toMultiChoiceQuizAudioRefDtos(assets),
                        videoRefs: toMultiChoiceQuizVideoRefDtos(assets),
                    },
                    questions: toMultiChoiceQuizQuestions(questions, options),
                    learnerAnswers: learnerAnswers,
                    quizState: {
                        isChecked,
                        finalScore: quizState?.final_score ?? 0,
                        checkedAt: quizState?.checked_at ?? null,
                    },
                },
            };
        });
    } finally {
        appDatabase.close();
    }
}
