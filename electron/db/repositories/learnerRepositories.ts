import type { SqliteDatabase } from "../sqlite";
import { executeRun, queryAll, queryOne } from "../sqlite";

export type LearnerRow = {
    learner_id: string;
    name: string;
    avatar_id: string | null;
    current_status: string;
};

export type LearnerIdentityRow = {
    id: string;
    name: string;
    avatar_id: string | null;
    created_at?: string;
    updated_at?: string;
};

export type LearnerStatusRow = {
    learner_id: string;
    status: string;
    updated_at?: string;
};

export function listLearnerRows(db: SqliteDatabase): LearnerRow[] {
    return queryAll<LearnerRow>(
        db,
        `
            SELECT
                l.id AS learner_id,
                l.name AS name,
                l.avatar_id AS avatar_id,
                s.status AS current_status
            FROM learners l
            INNER JOIN learners_status s
                ON s.learner_id = l.id
            ORDER BY l.name ASC, l.id ASC
        `
    );
}

export function getLearnerRowById(db: SqliteDatabase, learnerId: string): LearnerRow | undefined {
    return queryOne<LearnerRow>(
        db,
        `
            SELECT
                l.id AS learner_id,
                l.name AS name,
                l.avatar_id AS avatar_id,
                s.status AS current_status
            FROM learners l
            INNER JOIN learners_status s
                ON s.learner_id = l.id
            WHERE l.id = ?
        `,
        [learnerId]
    );
}

export function insertLearner(db: SqliteDatabase, row: LearnerIdentityRow): void {
    executeRun(
        db,
        `
            INSERT INTO learners (id, name, avatar_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
        `,
        [row.id, row.name, row.avatar_id, row.created_at ?? new Date().toISOString(), row.updated_at ?? new Date().toISOString()]
    );
}

export function updateLearner(db: SqliteDatabase, row: LearnerIdentityRow): void {
    executeRun(
        db,
        `
            UPDATE learners
            SET name = ?, avatar_id = ?, updated_at = ?
            WHERE id = ?
        `,
        [row.name, row.avatar_id, row.updated_at ?? new Date().toISOString(), row.id]
    );
}

export function insertLearnerStatus(db: SqliteDatabase, row: LearnerStatusRow): void {
    executeRun(
        db,
        `
            INSERT INTO learners_status (learner_id, status, updated_at)
            VALUES (?, ?, ?)
        `,
        [row.learner_id, row.status, row.updated_at ?? new Date().toISOString()]
    );
}

export function updateLearnerStatus(db: SqliteDatabase, row: LearnerStatusRow): void {
    executeRun(
        db,
        `
            UPDATE learners_status
            SET status = ?, updated_at = ?
            WHERE learner_id = ?
        `,
        [row.status, row.updated_at ?? new Date().toISOString(), row.learner_id]
    );
}
