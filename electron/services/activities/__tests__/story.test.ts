import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RequestContext } from "@electron/core/requestContext";
import { createAppDatabase } from "@electron/db/appDatabase";
import {
    getActivityContentRowByUnitCycleActivityId,
    getActivityStoryAnswerRowByAttemptId,
    getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId,
    getUnitCycleActivityIdentityRowById,
    insertActivityAttemptRow,
    updateActivityAttemptStatusRow,
    upsertActivityStoryAnswerRow,
} from "@electron/db/repositories/activityRepositories";
import { runInTransaction } from "@electron/db/sqlite";

import { getStoryActivity } from "../storyActivity/getStoryActivity";
import { submitStoryFeedback } from "../storyActivity/submitStoryFeedback";

function makeContext(correlationId: string): RequestContext {
    return {
        correlationId,
        sendEvent: vi.fn() as RequestContext["sendEvent"],
    };
}

vi.mock("@electron/db/appDatabase", () => ({
    createAppDatabase: vi.fn(),
}));

vi.mock("@electron/db/sqlite", () => ({
    runInTransaction: vi.fn((_, work) => work()),
}));

vi.mock("@electron/db/repositories/activityRepositories", () => ({
    getActivityContentRowByUnitCycleActivityId: vi.fn(),
    getActivityStoryAnswerRowByAttemptId: vi.fn(),
    getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId: vi.fn(),
    getUnitCycleActivityIdentityRowById: vi.fn(),
    insertActivityAttemptRow: vi.fn(),
    updateActivityAttemptStatusRow: vi.fn(),
    upsertActivityStoryAnswerRow: vi.fn(),
}));

vi.mock("@electron/runtime/runtimePaths", () => ({
    getRuntimeDbPath: vi.fn(() => "/tmp/app.sqlite"),
}));

vi.mock("@electron/utilities/logger", () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

describe("story services", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(createAppDatabase).mockReturnValue({
            db: {},
            close: vi.fn(),
        } as unknown as ReturnType<typeof createAppDatabase>);
    });

    it("returns parsed story content and starts an attempt when needed", async () => {
        vi.mocked(getUnitCycleActivityIdentityRowById).mockReturnValue({
            unit_cycle_activity_id: "activity-1",
            unit_cycle_id: "cycle-1",
            activity_type_id: 11,
            activity_type: "story",
        });
        vi.mocked(getActivityContentRowByUnitCycleActivityId).mockReturnValue({
            unit_cycle_activity_id: "activity-1",
            content_json: JSON.stringify({
                instructions: "Read the story and practice the words.",
                advice: "Check the highlighted words.",
                title: "Fau-chan's bad day",
                passage: {
                    pages: [
                        { order: 2, text: "Second" },
                        { order: 1, text: "First" },
                    ],
                },
                assets: {
                    imageRefs: [{ order: 2, imageRef: "story-2.webp" }, { order: 1, imageRef: "story-1.webp" }],
                    audioRefs: [],
                    videoRefs: [],
                },
                words: [
                    { word: "second", japanese: "2", position: 2 },
                    { word: "first", japanese: "1", position: 1 },
                ],
            }),
        });
        vi.mocked(getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId).mockReturnValueOnce(undefined);
        vi.mocked(getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId).mockReturnValueOnce({
            id: "attempt-1",
            learner_id: "learner-1",
            unit_cycle_activity_id: "activity-1",
            activity_type_id: 11,
            attempt_number: 1,
            status: "in_progress",
            score: null,
            started_at: "2026-03-30T00:00:00.000Z",
            submitted_at: null,
            content_snapshot_json: "{}",
        });
        vi.mocked(getActivityStoryAnswerRowByAttemptId).mockReturnValue(undefined);

        await expect(
            getStoryActivity(
                { learnerId: "learner-1", unitCycleActivityId: "activity-1" },
                makeContext("ctx-1")
            )
        ).resolves.toEqual({
            story: {
                instructions: "Read the story and practice the words.",
                advice: "Check the highlighted words.",
                title: "Fau-chan's bad day",
                assetBase: null,
                passage: {
                    pages: [
                        { order: 1, text: "First" },
                        { order: 2, text: "Second" },
                    ],
                },
                assets: {
                    imageRefs: [
                        { order: 1, imageRef: "story-1.webp" },
                        { order: 2, imageRef: "story-2.webp" },
                    ],
                    audioRefs: [],
                    videoRefs: [],
                },
                words: [
                    { word: "first", japanese: "1", position: 1 },
                    { word: "second", japanese: "2", position: 2 },
                ],
                feedback: {
                    question: "Was it easy or tough?",
                    answers: ["🥰", "👌", "😓"],
                    comment: "",
                },
                completion: {
                    isCompleted: false,
                },
            },
        });

        expect(insertActivityAttemptRow).toHaveBeenCalledTimes(1);
        expect(runInTransaction).toHaveBeenCalledTimes(1);
    });

    it("returns an existing completion state and stored feedback comment", async () => {
        vi.mocked(getUnitCycleActivityIdentityRowById).mockReturnValue({
            unit_cycle_activity_id: "activity-1",
            unit_cycle_id: "cycle-1",
            activity_type_id: 11,
            activity_type: "story",
        });
        vi.mocked(getActivityContentRowByUnitCycleActivityId).mockReturnValue({
            unit_cycle_activity_id: "activity-1",
            content_json: JSON.stringify({
                instructions: "Read the story.",
                advice: "Look closely.",
                title: "Fau-chan's bad day",
                passage: { pages: [{ order: 1, text: "Story" }] },
                assets: { imageRefs: [], audioRefs: [], videoRefs: [] },
                words: [],
            }),
        });
        vi.mocked(getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId).mockReturnValue({
            id: "attempt-1",
            learner_id: "learner-1",
            unit_cycle_activity_id: "activity-1",
            activity_type_id: 11,
            attempt_number: 1,
            status: "completed",
            score: null,
            started_at: "2026-03-30T00:00:00.000Z",
            submitted_at: "2026-03-30T00:01:00.000Z",
            content_snapshot_json: "{}",
        });
        vi.mocked(getActivityStoryAnswerRowByAttemptId).mockReturnValue({
            attempt_id: "attempt-1",
            learner_id: "learner-1",
            unit_cycle_activity_id: "activity-1",
            feedback: "🥰",
            comment: "Nice work",
            created_at: "2026-03-30T00:01:00.000Z",
            updated_at: "2026-03-30T00:01:00.000Z",
        });

        await expect(
            getStoryActivity(
                { learnerId: "learner-1", unitCycleActivityId: "activity-1" },
                makeContext("ctx-2")
            )
        ).resolves.toMatchObject({
            story: {
                completion: {
                    isCompleted: true,
                },
                feedback: {
                    comment: "Nice work",
                },
            },
        });

        expect(insertActivityAttemptRow).not.toHaveBeenCalled();
    });

    it("throws when the unit cycle activity is not a story", async () => {
        vi.mocked(getUnitCycleActivityIdentityRowById).mockReturnValue({
            unit_cycle_activity_id: "activity-1",
            unit_cycle_id: "cycle-1",
            activity_type_id: 12,
            activity_type: "multi-choice-quiz",
        });

        await expect(
            getStoryActivity(
                { learnerId: "learner-1", unitCycleActivityId: "activity-1" },
                makeContext("ctx-3")
            )
        ).rejects.toMatchObject({
            code: "VALIDATION_INVALID_STATE",
        });
    });

    it("submits story feedback and marks the attempt completed", async () => {
        vi.mocked(getUnitCycleActivityIdentityRowById).mockReturnValue({
            unit_cycle_activity_id: "activity-1",
            unit_cycle_id: "cycle-1",
            activity_type_id: 11,
            activity_type: "story",
        });
        vi.mocked(getActivityContentRowByUnitCycleActivityId).mockReturnValue({
            unit_cycle_activity_id: "activity-1",
            content_json: JSON.stringify({
                instructions: "Read the story.",
                advice: "Look closely.",
                title: "Fau-chan's bad day",
                passage: { pages: [{ order: 1, text: "Story" }] },
                assets: { imageRefs: [], audioRefs: [], videoRefs: [] },
                words: [],
            }),
        });
        vi.mocked(getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId).mockReturnValue({
            id: "attempt-1",
            learner_id: "learner-1",
            unit_cycle_activity_id: "activity-1",
            activity_type_id: 11,
            attempt_number: 1,
            status: "in_progress",
            score: null,
            started_at: "2026-03-30T00:00:00.000Z",
            submitted_at: null,
            content_snapshot_json: "{}",
        });

        await expect(
            submitStoryFeedback(
                {
                    learnerId: "learner-1",
                    unitCycleActivityId: "activity-1",
                    selectedAnswer: "🥰",
                    comment: "Nice story",
                },
                makeContext("ctx-4")
            )
        ).resolves.toEqual({
            completion: {
                isCompleted: true,
            },
        });

        expect(upsertActivityStoryAnswerRow).toHaveBeenCalledTimes(1);
        expect(updateActivityAttemptStatusRow).toHaveBeenCalledTimes(1);
    });

    it("creates an attempt when submitting without a prior start", async () => {
        vi.mocked(getUnitCycleActivityIdentityRowById).mockReturnValue({
            unit_cycle_activity_id: "activity-1",
            unit_cycle_id: "cycle-1",
            activity_type_id: 11,
            activity_type: "story",
        });
        vi.mocked(getActivityContentRowByUnitCycleActivityId).mockReturnValue({
            unit_cycle_activity_id: "activity-1",
            content_json: JSON.stringify({
                instructions: "Read the story.",
                advice: "Look closely.",
                title: "Fau-chan's bad day",
                passage: { pages: [{ order: 1, text: "Story" }] },
                assets: { imageRefs: [], audioRefs: [], videoRefs: [] },
                words: [],
            }),
        });
        vi.mocked(getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId).mockReturnValueOnce(undefined);
        vi.mocked(getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId).mockReturnValueOnce({
            id: "attempt-1",
            learner_id: "learner-1",
            unit_cycle_activity_id: "activity-1",
            activity_type_id: 11,
            attempt_number: 1,
            status: "in_progress",
            score: null,
            started_at: "2026-03-30T00:00:00.000Z",
            submitted_at: null,
            content_snapshot_json: "{}",
        });

        await expect(
            submitStoryFeedback(
                {
                    learnerId: "learner-1",
                    unitCycleActivityId: "activity-1",
                    selectedAnswer: "👌",
                    comment: "",
                },
                makeContext("ctx-5")
            )
        ).resolves.toEqual({
            completion: {
                isCompleted: true,
            },
        });

        expect(insertActivityAttemptRow).toHaveBeenCalledTimes(1);
        expect(upsertActivityStoryAnswerRow).toHaveBeenCalledTimes(1);
    });

    it("rejects invalid story answers", async () => {
        await expect(
            submitStoryFeedback(
                {
                    learnerId: "learner-1",
                    unitCycleActivityId: "activity-1",
                    selectedAnswer: "nope",
                    comment: "",
                },
                makeContext("ctx-6")
            )
        ).rejects.toMatchObject({
            code: "VALIDATION_INVALID_STATE",
        });
    });
});
