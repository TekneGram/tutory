import type { SqliteDatabase } from "../sqlite";
import { executeRun, queryAll, queryOne } from "../sqlite";

export type VocabReviewWordRow = {
    id: string;
    activity_content_id: string;
    word_order: number;
    word_text: string;
    japanese_text: string;
};

export type VocabReviewWordIdentityRow = {
    id: string;
    activity_content_id: string;
    word_text: string;
    japanese_text: string;
};

export type VocabReviewAnswerRow = {
    attempt_id: string;
    learner_id: string;
    unit_cycle_activity_id: string;
    word_id: string;
    learner_input: string | null;
    is_checked: 0 | 1;
    is_correct: 0 | 1;
    checked_at: string | null;
    created_at: string;
    updated_at: string;
};

export type VocabReviewStateRow = {
    attempt_id: string;
    learner_id: string;
    unit_cycle_activity_id: string;
    checked_count: number;
    correct_count: number;
    total_count: number;
    is_finished: 0 | 1;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
};

export function listVocabReviewWordRowsByActivityContentId(
    db: SqliteDatabase,
    activityContentId: string
): VocabReviewWordRow[] {
    return queryAll<VocabReviewWordRow>(
        db,
        `
            SELECT
                vrw.id AS id,
                vrw.activity_content_id AS activity_content_id,
                vrw.word_order AS word_order,
                vrw.word_text AS word_text,
                vrw.japanese_text AS japanese_text
            FROM vocab_review_words vrw
            WHERE vrw.activity_content_id = ?
            ORDER BY vrw.word_order ASC
        `,
        [activityContentId]
    );
}

export function getVocabReviewWordRowByIdAndUnitCycleActivityId(
    db: SqliteDatabase,
    wordId: string,
    unitCycleActivityId: string
): VocabReviewWordIdentityRow | undefined {
    return queryOne<VocabReviewWordIdentityRow>(
        db,
        `
            SELECT
                vrw.id AS id,
                vrw.activity_content_id AS activity_content_id,
                vrw.word_text AS word_text,
                vrw.japanese_text AS japanese_text
            FROM vocab_review_words vrw
            INNER JOIN activity_content ac
                ON ac.id = vrw.activity_content_id
            WHERE vrw.id = ?
              AND ac.unit_cycle_activity_id = ?
            LIMIT 1
        `,
        [wordId, unitCycleActivityId]
    );
}

export function getVocabReviewAnswerRowsByAttemptId(
    db: SqliteDatabase,
    attemptId: string
): VocabReviewAnswerRow[] {
    return queryAll<VocabReviewAnswerRow>(
        db,
        `
            SELECT
                vra.attempt_id AS attempt_id,
                vra.learner_id AS learner_id,
                vra.unit_cycle_activity_id AS unit_cycle_activity_id,
                vra.word_id AS word_id,
                vra.learner_input AS learner_input,
                vra.is_checked AS is_checked,
                vra.is_correct AS is_correct,
                vra.checked_at AS checked_at,
                vra.created_at AS created_at,
                vra.updated_at AS updated_at
            FROM vocab_review_answers vra
            WHERE vra.attempt_id = ?
        `,
        [attemptId]
    );
}

export function getVocabReviewAnswerRowByAttemptIdAndWordId(
    db: SqliteDatabase,
    attemptId: string,
    wordId: string
): VocabReviewAnswerRow | undefined {
    return queryOne<VocabReviewAnswerRow>(
        db,
        `
            SELECT
                vra.attempt_id AS attempt_id,
                vra.learner_id AS learner_id,
                vra.unit_cycle_activity_id AS unit_cycle_activity_id,
                vra.word_id AS word_id,
                vra.learner_input AS learner_input,
                vra.is_checked AS is_checked,
                vra.is_correct AS is_correct,
                vra.checked_at AS checked_at,
                vra.created_at AS created_at,
                vra.updated_at AS updated_at
            FROM vocab_review_answers vra
            WHERE vra.attempt_id = ?
              AND vra.word_id = ?
            LIMIT 1
        `,
        [attemptId, wordId]
    );
}

export function upsertVocabReviewAnswerRow(
    db: SqliteDatabase,
    row: VocabReviewAnswerRow
): void {
    executeRun(
        db,
        `
            INSERT INTO vocab_review_answers (
                attempt_id,
                learner_id,
                unit_cycle_activity_id,
                word_id,
                learner_input,
                is_checked,
                is_correct,
                checked_at,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(attempt_id, word_id) DO UPDATE SET
                learner_id = excluded.learner_id,
                unit_cycle_activity_id = excluded.unit_cycle_activity_id,
                learner_input = excluded.learner_input,
                is_checked = excluded.is_checked,
                is_correct = excluded.is_correct,
                checked_at = excluded.checked_at,
                updated_at = excluded.updated_at
        `,
        [
            row.attempt_id,
            row.learner_id,
            row.unit_cycle_activity_id,
            row.word_id,
            row.learner_input,
            row.is_checked,
            row.is_correct,
            row.checked_at,
            row.created_at,
            row.updated_at,
        ]
    );
}

export function resetVocabReviewAnswerRowByAttemptIdAndWordId(
    db: SqliteDatabase,
    attemptId: string,
    wordId: string,
    updatedAt: string
): void {
    executeRun(
        db,
        `
            UPDATE vocab_review_answers
            SET learner_input = NULL,
                is_checked = 0,
                is_correct = 0,
                checked_at = NULL,
                updated_at = ?
            WHERE attempt_id = ?
              AND word_id = ?
        `,
        [updatedAt, attemptId, wordId]
    );
}

export function resetVocabReviewAnswerRowsByAttemptId(
    db: SqliteDatabase,
    attemptId: string,
    updatedAt: string
): void {
    executeRun(
        db,
        `
            UPDATE vocab_review_answers
            SET learner_input = NULL,
                is_checked = 0,
                is_correct = 0,
                checked_at = NULL,
                updated_at = ?
            WHERE attempt_id = ?
        `,
        [updatedAt, attemptId]
    );
}

export function getVocabReviewStateRowByAttemptId(
    db: SqliteDatabase,
    attemptId: string
): VocabReviewStateRow | undefined {
    return queryOne<VocabReviewStateRow>(
        db,
        `
            SELECT
                vrs.attempt_id AS attempt_id,
                vrs.learner_id AS learner_id,
                vrs.unit_cycle_activity_id AS unit_cycle_activity_id,
                vrs.checked_count AS checked_count,
                vrs.correct_count AS correct_count,
                vrs.total_count AS total_count,
                vrs.is_finished AS is_finished,
                vrs.completed_at AS completed_at,
                vrs.created_at AS created_at,
                vrs.updated_at AS updated_at
            FROM vocab_review_state vrs
            WHERE vrs.attempt_id = ?
            LIMIT 1
        `,
        [attemptId]
    );
}

export function upsertVocabReviewStateRow(
    db: SqliteDatabase,
    row: VocabReviewStateRow
): void {
    executeRun(
        db,
        `
            INSERT INTO vocab_review_state (
                attempt_id,
                learner_id,
                unit_cycle_activity_id,
                checked_count,
                correct_count,
                total_count,
                is_finished,
                completed_at,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(attempt_id) DO UPDATE SET
                learner_id = excluded.learner_id,
                unit_cycle_activity_id = excluded.unit_cycle_activity_id,
                checked_count = excluded.checked_count,
                correct_count = excluded.correct_count,
                total_count = excluded.total_count,
                is_finished = excluded.is_finished,
                completed_at = excluded.completed_at,
                updated_at = excluded.updated_at
        `,
        [
            row.attempt_id,
            row.learner_id,
            row.unit_cycle_activity_id,
            row.checked_count,
            row.correct_count,
            row.total_count,
            row.is_finished,
            row.completed_at,
            row.created_at,
            row.updated_at,
        ]
    );
}
