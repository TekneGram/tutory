import type { SqliteDatabase } from "../sqlite";
import { executeRun, queryAll, queryOne } from "../sqlite";

export type MultiChoiceQuizQuestionRow = {
    id: string;
    activity_content_id: string;
    question_order: number;
    question_text: string;
};

export type MultiChoiceQuizOptionRow = {
    id: string;
    question_id: string;
    option_key: string;
    option_order: number;
    answer_text: string;
    is_correct: 0 | 1;
};

export type MultiChoiceQuizQuestionIdentityRow = {
    id: string;
    activity_content_id: string;
    question_text: string;
};

export type ActivityMultiChoiceQuizAnswerRow = {
    attempt_id: string;
    learner_id: string;
    unit_cycle_activity_id: string;
    question_id: string;
    question: string;
    is_answered: 0 | 1;
    selected_option: string | null;
    is_correct: 0 | 1;
    created_at: string;
    updated_at: string;
};

export type MultiChoiceQuizStateRow = {
    attempt_id: string;
    learner_id: string;
    unit_cycle_activity_id: string;
    is_checked: 0 | 1;
    final_score: number;
    checked_at: string | null;
    created_at: string;
    updated_at: string;
};

export function listMultiChoiceQuizQuestionRowsByActivityContentId(
    db: SqliteDatabase,
    activityContentId: string
): MultiChoiceQuizQuestionRow[] {
    return queryAll<MultiChoiceQuizQuestionRow>(
        db,
        `
            SELECT
                mq.id AS id,
                mq.activity_content_id AS activity_content_id,
                mq.question_order AS question_order,
                mq.question_text AS question_text
            FROM multichoicequiz_questions mq
            WHERE mq.activity_content_id = ?
            ORDER BY mq.question_order ASC
        `,
        [activityContentId]
    );
}

export function listMultiChoiceQuizOptionRowsByActivityContentId(
    db: SqliteDatabase,
    activityContentId: string
): MultiChoiceQuizOptionRow[] {
    return queryAll<MultiChoiceQuizOptionRow>(
        db,
        `
            SELECT
                mo.id AS id,
                mo.question_id AS question_id,
                mo.option_key AS option_key,
                mo.option_order AS option_order,
                mo.answer_text AS answer_text,
                mo.is_correct AS is_correct
            FROM multichoicequiz_options mo
            INNER JOIN multichoicequiz_questions mq
                ON mq.id = mo.question_id
            WHERE mq.activity_content_id = ?
            ORDER BY mq.question_order ASC, mo.option_order ASC
        `,
        [activityContentId]
    );
}

export function getMultiChoiceQuizQuestionRowByIdAndUnitCycleActivityId(
    db: SqliteDatabase,
    questionId: string,
    unitCycleActivityId: string
): MultiChoiceQuizQuestionIdentityRow | undefined {
    return queryOne<MultiChoiceQuizQuestionIdentityRow>(
        db,
        `
            SELECT
                mq.id AS id,
                mq.activity_content_id AS activity_content_id,
                mq.question_text AS question_text
            FROM multichoicequiz_questions mq
            INNER JOIN activity_content ac
                ON ac.id = mq.activity_content_id
            WHERE mq.id = ?
              AND ac.unit_cycle_activity_id = ?
            LIMIT 1
        `,
        [questionId, unitCycleActivityId]
    );
}

export function getMultiChoiceQuizOptionRowByIdAndQuestionId(
    db: SqliteDatabase,
    optionId: string,
    questionId: string
): MultiChoiceQuizOptionRow | undefined {
    return queryOne<MultiChoiceQuizOptionRow>(
        db,
        `
            SELECT
                mo.id AS id,
                mo.question_id AS question_id,
                mo.option_key AS option_key,
                mo.option_order AS option_order,
                mo.answer_text AS answer_text,
                mo.is_correct AS is_correct
            FROM multichoicequiz_options mo
            WHERE mo.id = ?
              AND mo.question_id = ?
            LIMIT 1
        `,
        [optionId, questionId]
    );
}

export function getMultiChoiceQuizAnswerRowsByAttemptId(
    db: SqliteDatabase,
    attemptId: string
) {
    return queryAll<ActivityMultiChoiceQuizAnswerRow>(
        db,
        `
            SELECT
                mcqa.attempt_id AS attempt_id,
                mcqa.learner_id AS learner_id,
                mcqa.unit_cycle_activity_id AS unit_cycle_activity_id,
                mcqa.question_id AS question_id,
                mcqa.question AS question,
                mcqa.is_answered AS is_answered,
                mcqa.selected_option AS selected_option,
                mcqa.is_correct AS is_correct,
                mcqa.created_at AS created_at,
                mcqa.updated_at AS updated_at
            FROM multi_choice_quiz_answers mcqa
            WHERE mcqa.attempt_id = ?
        `,
        [attemptId]
    );
}

export function getMultiChoiceQuizAnswerRowByAttemptIdAndQuestionId(
    db: SqliteDatabase,
    attemptId: string,
    questionId: string
): ActivityMultiChoiceQuizAnswerRow | undefined {
    return queryOne<ActivityMultiChoiceQuizAnswerRow>(
        db,
        `
            SELECT
                mcqa.attempt_id AS attempt_id,
                mcqa.learner_id AS learner_id,
                mcqa.unit_cycle_activity_id AS unit_cycle_activity_id,
                mcqa.question_id AS question_id,
                mcqa.question AS question,
                mcqa.is_answered AS is_answered,
                mcqa.selected_option AS selected_option,
                mcqa.is_correct AS is_correct,
                mcqa.created_at AS created_at,
                mcqa.updated_at AS updated_at
            FROM multi_choice_quiz_answers mcqa
            WHERE mcqa.attempt_id = ?
              AND mcqa.question_id = ?
            LIMIT 1
        `,
        [attemptId, questionId]
    );
}

export function upsertMultiChoiceQuizAnswerRow(
    db: SqliteDatabase,
    row: ActivityMultiChoiceQuizAnswerRow
): void {
    executeRun(
        db,
        `
            INSERT INTO multi_choice_quiz_answers (
                attempt_id,
                learner_id,
                unit_cycle_activity_id,
                question_id,
                question,
                is_answered,
                selected_option,
                is_correct,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(attempt_id, question_id) DO UPDATE SET
                learner_id = excluded.learner_id,
                unit_cycle_activity_id = excluded.unit_cycle_activity_id,
                question = excluded.question,
                is_answered = excluded.is_answered,
                selected_option = excluded.selected_option,
                is_correct = excluded.is_correct,
                updated_at = excluded.updated_at
        `,
        [
            row.attempt_id,
            row.learner_id,
            row.unit_cycle_activity_id,
            row.question_id,
            row.question,
            row.is_answered,
            row.selected_option,
            row.is_correct,
            row.created_at,
            row.updated_at,
        ]
    );
}

export function resetMultiChoiceQuizAnswerRowsByAttemptId(
    db: SqliteDatabase,
    attemptId: string,
    updatedAt: string
): void {
    executeRun(
        db,
        `
            UPDATE multi_choice_quiz_answers
            SET is_answered = 0,
                selected_option = NULL,
                is_correct = 0,
                updated_at = ?
            WHERE attempt_id = ?
        `,
        [updatedAt, attemptId]
    );
}

export function getMultiChoiceQuizStateRowByAttemptId(
    db: SqliteDatabase,
    attemptId: string
): MultiChoiceQuizStateRow | undefined {
    return queryOne<MultiChoiceQuizStateRow>(
        db,
        `
            SELECT
                mcqs.attempt_id AS attempt_id,
                mcqs.learner_id AS learner_id,
                mcqs.unit_cycle_activity_id AS unit_cycle_activity_id,
                mcqs.is_checked AS is_checked,
                mcqs.final_score AS final_score,
                mcqs.checked_at AS checked_at,
                mcqs.created_at AS created_at,
                mcqs.updated_at AS updated_at
            FROM multi_choice_quiz_state mcqs
            WHERE mcqs.attempt_id = ?
            LIMIT 1
        `,
        [attemptId]
    );
}

export function upsertMultiChoiceQuizStateRow(
    db: SqliteDatabase,
    row: MultiChoiceQuizStateRow
): void {
    executeRun(
        db,
        `
            INSERT INTO multi_choice_quiz_state (
                attempt_id,
                learner_id,
                unit_cycle_activity_id,
                is_checked,
                final_score,
                checked_at,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(attempt_id) DO UPDATE SET
                learner_id = excluded.learner_id,
                unit_cycle_activity_id = excluded.unit_cycle_activity_id,
                is_checked = excluded.is_checked,
                final_score = excluded.final_score,
                checked_at = excluded.checked_at,
                updated_at = excluded.updated_at
        `,
        [
            row.attempt_id,
            row.learner_id,
            row.unit_cycle_activity_id,
            row.is_checked,
            row.final_score,
            row.checked_at,
            row.created_at,
            row.updated_at,
        ]
    );
}
