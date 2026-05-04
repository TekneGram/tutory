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
    getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId,
    getUnitCycleActivityIdentityRowById,
    insertActivityAttemptRow,
    getMultiChoiceQuizAnswerRowsByAttemptId,
} from "@electron/db/repositories/activityRepositories";

import { randomUUID } from "node:crypto";

import { 
    parseMultiChoiceQuizContent,
    toMultiChoiceQuizImageRefDtos,
    toMultiChoiceQuizAudioRefDtos,
    toMultiChoiceQuizVideoRefDtos,
    toMultiChoiceQuizLearnerAnswers,
} from "./getMultiChoiceQuiz/multiChoiceQuizSchema";

function ensureStartedAttempt(
    db: Parameters<typeof getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId>[0],
    learnerId: string,
    unitCycleActivityId: string,
    activityTypeId: number,
    contentSnapshotJson: string
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
        content_snapshot_json: contentSnapshotJson
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

            const content = parseMultiChoiceQuizContent(contentRow.content_json);
            const attempt = ensureStartedAttempt(
                appDatabase.db,
                request.learnerId,
                request.unitCycleActivityId,
                activity.activity_type_id,
                contentRow.content_json
            );
            const answers = getMultiChoiceQuizAnswerRowsByAttemptId(appDatabase.db, attempt.id);

            const learnerAnswers = toMultiChoiceQuizLearnerAnswers(answers);
            
            logger.info("Multi Choice Quiz activity loaded", {
                correlationId: ctx.correlationId,
                learnerId: request.learnerId,
                unitCycleActivityId: request.unitCycleActivityId,
                isCompleted: attempt.status === "completed",
            });

            return {
                multiChoiceQuiz: {
                    instructions: content.instruction,
                    advice: content.advice,
                    title: content.title,
                    assetBase: content.assetBase?.trim() || null,
                    assets: {
                        imageRefs: toMultiChoiceQuizImageRefDtos(content.assets.imageRefs),
                        audioRefs: toMultiChoiceQuizAudioRefDtos(content.assets.audioRefs),
                        videoRefs: toMultiChoiceQuizVideoRefDtos(content.assets.videoRefs),
                    },
                    questions: content.questions,
                    learnerAnswers: learnerAnswers
                },
            };
        });
    } finally {
        appDatabase.close();
    }
}