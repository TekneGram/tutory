import type { ActivityType } from "@electron/ipc/contracts/activities.contracts";
import type { SqliteDatabase } from "../sqlite";
import { executeRun, queryAll, queryOne } from "../sqlite";

export type UnitCycleIdentityRow = {
    unit_cycle_id: string;
    unit_id: string;
    title: string;
};

export type UnitCycleActivityRow = {
    unit_cycle_activity_id: string;
    unit_cycle_id: string;
    activity_type: ActivityType;
    title: string | null;
    activity_order: number;
    is_required: number;
};

export type UnitCycleActivityIdentityRow = {
    unit_cycle_activity_id: string;
    unit_cycle_id: string;
    activity_type_id: number;
    activity_type: ActivityType;
};

export type ActivityContentRow = {
    unit_cycle_activity_id: string;
    content_json: string;
};

export type ActivityAttemptRow = {
    id: string;
    learner_id: string;
    unit_cycle_activity_id: string;
    activity_type_id: number;
    attempt_number: number;
    status: string;
    score: number | null;
    started_at: string;
    submitted_at: string | null;
    content_snapshot_json: string | null;
};

export type ActivityStoryAnswerRow = {
    attempt_id: string;
    learner_id: string;
    unit_cycle_activity_id: string;
    feedback: string;
    comment: string | null;
    created_at: string;
    updated_at: string;
};

export function getUnitCycleIdentityRowById(
    db: SqliteDatabase,
    unitCycleId: string
): UnitCycleIdentityRow | undefined {
    return queryOne<UnitCycleIdentityRow>(
        db,
        `
            SELECT
                uc.id AS unit_cycle_id,
                uc.unit_id AS unit_id,
                uc.title AS title
            FROM unit_cycles uc
            WHERE uc.id = ?
            LIMIT 1
        `,
        [unitCycleId]
    );
}

export function listUnitCycleActivityRowsByUnitCycleId(
    db: SqliteDatabase,
    unitCycleId: string
): UnitCycleActivityRow[] {
    return queryAll<UnitCycleActivityRow>(
        db,
        `
            SELECT
                uca.id AS unit_cycle_activity_id,
                uca.unit_cycle_id AS unit_cycle_id,
                at.name AS activity_type,
                uca.title AS title,
                uca.activity_order AS activity_order,
                uca.is_required AS is_required
            FROM unit_cycle_activities uca
            INNER JOIN cycle_type_activities cta
                ON cta.id = uca.cycle_type_activity_id
            INNER JOIN activity_types at
                ON at.id = cta.activity_type_id
            WHERE uca.unit_cycle_id = ?
            ORDER BY uca.activity_order ASC
        `,
        [unitCycleId]
    );
}

export function getUnitCycleActivityIdentityRowById(
    db: SqliteDatabase,
    unitCycleActivityId: string
): UnitCycleActivityIdentityRow | undefined {
    return queryOne<UnitCycleActivityIdentityRow>(
        db,
        `
            SELECT
                uca.id AS unit_cycle_activity_id,
                uca.unit_cycle_id AS unit_cycle_id,
                cta.activity_type_id AS activity_type_id,
                at.name AS activity_type
            FROM unit_cycle_activities uca
            INNER JOIN cycle_type_activities cta
                ON cta.id = uca.cycle_type_activity_id
            INNER JOIN activity_types at
                ON at.id = cta.activity_type_id
            WHERE uca.id = ?
            LIMIT 1
        `,
        [unitCycleActivityId]
    );
}

export function getActivityContentRowByUnitCycleActivityId(
    db: SqliteDatabase,
    unitCycleActivityId: string
): ActivityContentRow | undefined {
    return queryOne<ActivityContentRow>(
        db,
        `
            SELECT
                ac.unit_cycle_activity_id AS unit_cycle_activity_id,
                ac.content_json AS content_json
            FROM activity_content ac
            WHERE ac.unit_cycle_activity_id = ?
            LIMIT 1
        `,
        [unitCycleActivityId]
    );
}

export function getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId(
    db: SqliteDatabase,
    learnerId: string,
    unitCycleActivityId: string
): ActivityAttemptRow | undefined {
    return queryOne<ActivityAttemptRow>(
        db,
        `
            SELECT
                a.id AS id,
                a.learner_id AS learner_id,
                a.unit_cycle_activity_id AS unit_cycle_activity_id,
                a.activity_type_id AS activity_type_id,
                a.attempt_number AS attempt_number,
                a.status AS status,
                a.score AS score,
                a.started_at AS started_at,
                a.submitted_at AS submitted_at,
                a.content_snapshot_json AS content_snapshot_json
            FROM activity_attempts a
            WHERE a.learner_id = ?
              AND a.unit_cycle_activity_id = ?
            ORDER BY a.attempt_number DESC, a.started_at DESC
            LIMIT 1
        `,
        [learnerId, unitCycleActivityId]
    );
}

export function insertActivityAttemptRow(
    db: SqliteDatabase,
    row: ActivityAttemptRow
): void {
    executeRun(
        db,
        `
            INSERT OR IGNORE INTO activity_attempts (
                id,
                learner_id,
                unit_cycle_activity_id,
                activity_type_id,
                attempt_number,
                status,
                score,
                started_at,
                submitted_at,
                content_snapshot_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            row.id,
            row.learner_id,
            row.unit_cycle_activity_id,
            row.activity_type_id,
            row.attempt_number,
            row.status,
            row.score,
            row.started_at,
            row.submitted_at,
            row.content_snapshot_json,
        ]
    );
}

export function updateActivityAttemptStatusRow(
    db: SqliteDatabase,
    row: {
        id: string;
        status: string;
        submitted_at: string | null;
    }
): void {
    executeRun(
        db,
        `
            UPDATE activity_attempts
            SET status = ?,
                submitted_at = ?
            WHERE id = ?
        `,
        [row.status, row.submitted_at, row.id]
    );
}

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
