import type { SqliteDatabase } from "../sqlite";
import { executeRun, queryOne } from "../sqlite";

export type ActivityStoryAnswerRow = {
    attempt_id: string;
    learner_id: string;
    unit_cycle_activity_id: string;
    feedback: string;
    comment: string | null;
    created_at: string;
    updated_at: string;
};

export function getActivityStoryAnswerRowByAttemptId(
    db: SqliteDatabase,
    attemptId: string
): ActivityStoryAnswerRow | undefined {
    return queryOne<ActivityStoryAnswerRow>(
        db,
        `
            SELECT
                asa.attempt_id AS attempt_id,
                asa.learner_id AS learner_id,
                asa.unit_cycle_activity_id AS unit_cycle_activity_id,
                asa.feedback AS feedback,
                asa.comment AS comment,
                asa.created_at AS created_at,
                asa.updated_at AS updated_at
            FROM activity_story_answers asa
            WHERE asa.attempt_id = ?
            LIMIT 1
        `,
        [attemptId]
    );
}

export function upsertActivityStoryAnswerRow(
    db: SqliteDatabase,
    row: ActivityStoryAnswerRow
): void {
    executeRun(
        db,
        `
            INSERT INTO activity_story_answers (
                attempt_id,
                learner_id,
                unit_cycle_activity_id,
                feedback,
                comment,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(attempt_id) DO UPDATE SET
                learner_id = excluded.learner_id,
                unit_cycle_activity_id = excluded.unit_cycle_activity_id,
                feedback = excluded.feedback,
                comment = excluded.comment,
                updated_at = excluded.updated_at
        `,
        [
            row.attempt_id,
            row.learner_id,
            row.unit_cycle_activity_id,
            row.feedback,
            row.comment,
            row.created_at,
            row.updated_at,
        ]
    );
}
