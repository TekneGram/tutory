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
    id?: string;
    unit_cycle_activity_id: string;
    content_json: string;
};

export type ActivityContentPrimaryRow = {
    id: string;
    activity_content_id: string;
    instructions: string;
    advice: string;
    title: string;
    asset_base: string | null;
};

export type ActivityContentAssetRow = {
    id: string;
    activity_content_id: string;
    asset_kind: "image" | "audio" | "video";
    asset_order: number;
    asset_ref: string;
};

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
    is_correct: boolean;
};

export type MultiChoiceQuizQuestionIdentityRow = {
    id: string;
    activity_content_id: string;
    question_text: string;
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
                ac.id AS id,
                ac.unit_cycle_activity_id AS unit_cycle_activity_id,
                ac.content_json AS content_json
            FROM activity_content ac
            WHERE ac.unit_cycle_activity_id = ?
            LIMIT 1
        `,
        [unitCycleActivityId]
    );
}

export function getActivityContentPrimaryRowByActivityContentId(
    db: SqliteDatabase,
    activityContentId: string
): ActivityContentPrimaryRow | undefined {
    return queryOne<ActivityContentPrimaryRow>(
        db,
        `
            SELECT
                acp.id AS id,
                acp.activity_content_id AS activity_content_id,
                acp.instructions AS instructions,
                acp.advice AS advice,
                acp.title AS title,
                acp.asset_base AS asset_base
            FROM activity_content_primary acp
            WHERE acp.activity_content_id = ?
            LIMIT 1
        `,
        [activityContentId]
    );
}

export function listActivityContentAssetRowsByActivityContentId(
    db: SqliteDatabase,
    activityContentId: string
): ActivityContentAssetRow[] {
    return queryAll<ActivityContentAssetRow>(
        db,
        `
            SELECT
                aca.id AS id,
                aca.activity_content_id AS activity_content_id,
                aca.asset_kind AS asset_kind,
                aca.asset_order AS asset_order,
                aca.asset_ref AS asset_ref
            FROM activity_content_assets aca
            WHERE aca.activity_content_id = ?
            ORDER BY aca.asset_kind ASC, aca.asset_order ASC
        `,
        [activityContentId]
    );
}

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

/**
 * Multi Choice Quiz
 */
export type ActivityMultiChoiceQuizAnswerRow = {
    attempt_id: string;
    learner_id: string;
    unit_cycle_activity_id: string;
    question_id: string;
    question: string;
    is_answered: boolean;
    selected_option: string | null;
    is_correct: boolean;
    created_at: string;
    updated_at: string;
};

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
