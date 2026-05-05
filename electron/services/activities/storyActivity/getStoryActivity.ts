import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";
import {
    getActivityContentRowByUnitCycleActivityId,
    getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId,
    getUnitCycleActivityIdentityRowById,
    insertActivityAttemptRow,
} from "@electron/db/repositories/activityRepositories";
import { getActivityStoryAnswerRowByAttemptId } from "@electron/db/repositories/activity.storyRespositories";
import { runInTransaction } from "@electron/db/sqlite";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "@electron/utilities/logger";
import type {
    GetStoryActivityRequest,
    GetStoryActivityResponse,
} from "@electron/ipc/contracts/activities.contracts";
import {
    parseStoryContent,
    toStoryAudioRefDtos,
    toStoryFeedbackDto,
    toStoryImageRefDtos,
    toStoryPageDtos,
    toStoryVideoRefDtos,
    toStoryWordDtos,
} from "./storyDtos";
import { randomUUID } from "node:crypto";

function ensureStartedAttempt(
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
            "Story activity attempt could not be created or loaded."
        );
    }

    return createdAttempt;
}

export async function getStoryActivity(
    request: GetStoryActivityRequest,
    ctx: RequestContext
): Promise<GetStoryActivityResponse> {
    logger.info("Loading story activity", {
        correlationId: ctx.correlationId,
        learnerId: request.learnerId,
        unitCycleActivityId: request.unitCycleActivityId,
    });

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

            const content = parseStoryContent(contentRow.content_json);
            const attempt = ensureStartedAttempt(
                appDatabase.db,
                request.learnerId,
                request.unitCycleActivityId,
                activity.activity_type_id
            );
            const answer = getActivityStoryAnswerRowByAttemptId(appDatabase.db, attempt.id);
            const feedbackComment = answer?.comment ?? "";

            logger.info("Story activity loaded", {
                correlationId: ctx.correlationId,
                learnerId: request.learnerId,
                unitCycleActivityId: request.unitCycleActivityId,
                isCompleted: attempt.status === "completed",
            });

            return {
                story: {
                    instructions: content.instructions,
                    advice: content.advice,
                    title: content.title,
                    assetBase: content.assetBase?.trim() || null,
                    passage: {
                        pages: toStoryPageDtos(content.passage.pages),
                    },
                    assets: {
                        imageRefs: toStoryImageRefDtos(content.assets.imageRefs),
                        audioRefs: toStoryAudioRefDtos(content.assets.audioRefs),
                        videoRefs: toStoryVideoRefDtos(content.assets.videoRefs),
                    },
                    words: toStoryWordDtos(content.words),
                    feedback: toStoryFeedbackDto(feedbackComment),
                    completion: {
                        isCompleted: attempt.status === "completed",
                    },
                },
            };
        });
    } finally {
        appDatabase.close();
    }
}
