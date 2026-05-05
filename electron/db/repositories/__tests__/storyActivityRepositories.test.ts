import { describe, expect, it, vi } from "vitest";

import type { SqliteDatabase } from "../../sqlite";
import { executeRun, queryOne } from "../../sqlite";
import {
    getActivityContentRowByUnitCycleActivityId,
    getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId,
    getUnitCycleActivityIdentityRowById,
    insertActivityAttemptRow,
    updateActivityAttemptStatusRow,
} from "../activityRepositories";
import {
    getActivityStoryAnswerRowByAttemptId,
    upsertActivityStoryAnswerRow,
} from "../activity.storyRespositories";

vi.mock("../../sqlite", () => ({
    executeRun: vi.fn(),
    queryOne: vi.fn(),
}));

describe("storyActivityRepositories", () => {
    it("loads a story activity identity by id", () => {
        vi.mocked(queryOne).mockReturnValue(undefined);

        getUnitCycleActivityIdentityRowById({} as SqliteDatabase, "activity-1");

        expect(queryOne).toHaveBeenCalledTimes(1);
        const sql = vi.mocked(queryOne).mock.calls[0][1];
        expect(sql).toContain("INNER JOIN activity_types at");
        expect(sql).toContain("cta.activity_type_id AS activity_type_id");
        expect(sql).toContain("WHERE uca.id = ?");
    });

    it("loads activity content by unit cycle activity id", () => {
        vi.mocked(queryOne).mockReturnValue(undefined);

        getActivityContentRowByUnitCycleActivityId({} as SqliteDatabase, "activity-1");

        expect(queryOne).toHaveBeenCalledTimes(1);
        expect(vi.mocked(queryOne).mock.calls[0][1]).toContain("FROM activity_content ac");
        expect(vi.mocked(queryOne).mock.calls[0][1]).toContain(
            "WHERE ac.unit_cycle_activity_id = ?"
        );
    });

    it("loads the latest attempt for a learner and activity", () => {
        vi.mocked(queryOne).mockReturnValue(undefined);

        getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId(
            {} as SqliteDatabase,
            "learner-1",
            "activity-1"
        );

        const sql = vi.mocked(queryOne).mock.calls[0][1];
        expect(sql).toContain("FROM activity_attempts a");
        expect(sql).toContain("ORDER BY a.attempt_number DESC, a.started_at DESC");
        expect(vi.mocked(queryOne).mock.calls[0][2]).toEqual(["learner-1", "activity-1"]);
    });

    it("inserts an attempt with the expected columns", () => {
        insertActivityAttemptRow({} as SqliteDatabase, {
            id: "attempt-1",
            learner_id: "learner-1",
            unit_cycle_activity_id: "activity-1",
            activity_type_id: 1,
            attempt_number: 1,
            status: "in_progress",
            score: null,
            started_at: "2026-03-30T00:00:00.000Z",
            submitted_at: null,
            content_snapshot_json: "{}",
        });

        expect(executeRun).toHaveBeenCalledTimes(1);
        const sql = vi.mocked(executeRun).mock.calls[0][1];
        expect(sql).toContain("INSERT OR IGNORE INTO activity_attempts");
        expect(sql).toContain("content_snapshot_json");
    });

    it("updates attempt completion state", () => {
        updateActivityAttemptStatusRow({} as SqliteDatabase, {
            id: "attempt-1",
            status: "completed",
            submitted_at: "2026-03-30T00:01:00.000Z",
        });

        expect(executeRun).toHaveBeenCalledTimes(1);
        expect(vi.mocked(executeRun).mock.calls[0][1]).toContain("UPDATE activity_attempts");
    });

    it("upserts story answers", () => {
        upsertActivityStoryAnswerRow({} as SqliteDatabase, {
            attempt_id: "attempt-1",
            learner_id: "learner-1",
            unit_cycle_activity_id: "activity-1",
            feedback: "🥰",
            comment: "Nice story",
            created_at: "2026-03-30T00:00:00.000Z",
            updated_at: "2026-03-30T00:01:00.000Z",
        });

        expect(executeRun).toHaveBeenCalledTimes(1);
        const sql = vi.mocked(executeRun).mock.calls[0][1];
        expect(sql).toContain("INSERT INTO activity_story_answers");
        expect(sql).toContain("ON CONFLICT(attempt_id) DO UPDATE SET");
    });

    it("loads a story answer by attempt id", () => {
        vi.mocked(queryOne).mockReturnValue(undefined);

        getActivityStoryAnswerRowByAttemptId({} as SqliteDatabase, "attempt-1");

        expect(queryOne).toHaveBeenCalledTimes(1);
        expect(vi.mocked(queryOne).mock.calls[0][1]).toContain("FROM activity_story_answers asa");
    });
});
