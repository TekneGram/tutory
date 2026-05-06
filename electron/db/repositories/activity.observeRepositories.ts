import type { SqliteDatabase } from "../sqlite";
import { executeRun, queryAll, queryOne } from "../sqlite";

export type ObservePromptRow = {
  id: string;
  activity_content_id: string;
  instructions: string;
  advice: string;
  title: string;
  asset_base: string | null;
  image_refs_json: string;
};

export type ObserveWordRow = {
  id: string;
  activity_content_id: string;
  word_order: number;
  word_text: string;
};

export type ObserveCategoryRow = {
  id: string;
  activity_content_id: string;
  category_order: number;
  category_text: string;
};

export type ObserveAnswerKeyRow = {
  word_id: string;
  category_id: string;
};

export type ObserveAnswerRow = {
  attempt_id: string;
  learner_id: string;
  unit_cycle_activity_id: string;
  word_id: string;
  selected_category_id: string | null;
  is_placed: 0 | 1;
  is_correct: 0 | 1;
  checked_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ObserveStateRow = {
  attempt_id: string;
  learner_id: string;
  unit_cycle_activity_id: string;
  placed_count: number;
  correct_count: number;
  total_count: number;
  is_finished: 0 | 1;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export function getObservePromptRowByActivityContentId(
  db: SqliteDatabase,
  activityContentId: string,
): ObservePromptRow | undefined {
  return queryOne<ObservePromptRow>(
    db,
    `
      SELECT
        op.id AS id,
        op.activity_content_id AS activity_content_id,
        op.instructions AS instructions,
        op.advice AS advice,
        op.title AS title,
        op.asset_base AS asset_base,
        op.image_refs_json AS image_refs_json
      FROM observe_prompts op
      WHERE op.activity_content_id = ?
      LIMIT 1
    `,
    [activityContentId],
  );
}

export function listObserveWordRowsByActivityContentId(
  db: SqliteDatabase,
  activityContentId: string,
): ObserveWordRow[] {
  return queryAll<ObserveWordRow>(
    db,
    `
      SELECT
        ow.id AS id,
        ow.activity_content_id AS activity_content_id,
        ow.word_order AS word_order,
        ow.word_text AS word_text
      FROM observe_words ow
      WHERE ow.activity_content_id = ?
      ORDER BY ow.word_order ASC
    `,
    [activityContentId],
  );
}

export function listObserveCategoryRowsByActivityContentId(
  db: SqliteDatabase,
  activityContentId: string,
): ObserveCategoryRow[] {
  return queryAll<ObserveCategoryRow>(
    db,
    `
      SELECT
        oc.id AS id,
        oc.activity_content_id AS activity_content_id,
        oc.category_order AS category_order,
        oc.category_text AS category_text
      FROM observe_categories oc
      WHERE oc.activity_content_id = ?
      ORDER BY oc.category_order ASC
    `,
    [activityContentId],
  );
}

export function listObserveAnswerKeyRowsByActivityContentId(
  db: SqliteDatabase,
  activityContentId: string,
): ObserveAnswerKeyRow[] {
  return queryAll<ObserveAnswerKeyRow>(
    db,
    `
      SELECT
        oak.word_id AS word_id,
        oak.category_id AS category_id
      FROM observe_answer_keys oak
      INNER JOIN observe_words ow
        ON ow.id = oak.word_id
      WHERE ow.activity_content_id = ?
    `,
    [activityContentId],
  );
}

export function getObserveWordRowByIdAndUnitCycleActivityId(
  db: SqliteDatabase,
  wordId: string,
  unitCycleActivityId: string,
): ObserveWordRow | undefined {
  return queryOne<ObserveWordRow>(
    db,
    `
      SELECT
        ow.id AS id,
        ow.activity_content_id AS activity_content_id,
        ow.word_order AS word_order,
        ow.word_text AS word_text
      FROM observe_words ow
      INNER JOIN activity_content ac
        ON ac.id = ow.activity_content_id
      WHERE ow.id = ?
        AND ac.unit_cycle_activity_id = ?
      LIMIT 1
    `,
    [wordId, unitCycleActivityId],
  );
}

export function getObserveCategoryRowByIdAndUnitCycleActivityId(
  db: SqliteDatabase,
  categoryId: string,
  unitCycleActivityId: string,
): ObserveCategoryRow | undefined {
  return queryOne<ObserveCategoryRow>(
    db,
    `
      SELECT
        oc.id AS id,
        oc.activity_content_id AS activity_content_id,
        oc.category_order AS category_order,
        oc.category_text AS category_text
      FROM observe_categories oc
      INNER JOIN activity_content ac
        ON ac.id = oc.activity_content_id
      WHERE oc.id = ?
        AND ac.unit_cycle_activity_id = ?
      LIMIT 1
    `,
    [categoryId, unitCycleActivityId],
  );
}

export function getObserveAnswerKeyRowByWordId(
  db: SqliteDatabase,
  wordId: string,
): ObserveAnswerKeyRow | undefined {
  return queryOne<ObserveAnswerKeyRow>(
    db,
    `
      SELECT
        oak.word_id AS word_id,
        oak.category_id AS category_id
      FROM observe_answer_keys oak
      WHERE oak.word_id = ?
      LIMIT 1
    `,
    [wordId],
  );
}

export function getObserveAnswerRowsByAttemptId(
  db: SqliteDatabase,
  attemptId: string,
): ObserveAnswerRow[] {
  return queryAll<ObserveAnswerRow>(
    db,
    `
      SELECT
        oa.attempt_id AS attempt_id,
        oa.learner_id AS learner_id,
        oa.unit_cycle_activity_id AS unit_cycle_activity_id,
        oa.word_id AS word_id,
        oa.selected_category_id AS selected_category_id,
        oa.is_placed AS is_placed,
        oa.is_correct AS is_correct,
        oa.checked_at AS checked_at,
        oa.created_at AS created_at,
        oa.updated_at AS updated_at
      FROM observe_answers oa
      WHERE oa.attempt_id = ?
    `,
    [attemptId],
  );
}

export function upsertObserveAnswerRow(
  db: SqliteDatabase,
  row: ObserveAnswerRow,
): void {
  executeRun(
    db,
    `
      INSERT INTO observe_answers (
        attempt_id,
        learner_id,
        unit_cycle_activity_id,
        word_id,
        selected_category_id,
        is_placed,
        is_correct,
        checked_at,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(attempt_id, word_id) DO UPDATE SET
        learner_id = excluded.learner_id,
        unit_cycle_activity_id = excluded.unit_cycle_activity_id,
        selected_category_id = excluded.selected_category_id,
        is_placed = excluded.is_placed,
        is_correct = excluded.is_correct,
        checked_at = excluded.checked_at,
        updated_at = excluded.updated_at
    `,
    [
      row.attempt_id,
      row.learner_id,
      row.unit_cycle_activity_id,
      row.word_id,
      row.selected_category_id,
      row.is_placed,
      row.is_correct,
      row.checked_at,
      row.created_at,
      row.updated_at,
    ],
  );
}

export function resetObserveAnswerRowsByAttemptId(
  db: SqliteDatabase,
  attemptId: string,
  updatedAt: string,
): void {
  executeRun(
    db,
    `
      UPDATE observe_answers
      SET selected_category_id = NULL,
          is_placed = 0,
          is_correct = 0,
          checked_at = NULL,
          updated_at = ?
      WHERE attempt_id = ?
    `,
    [updatedAt, attemptId],
  );
}

export function getObserveStateRowByAttemptId(
  db: SqliteDatabase,
  attemptId: string,
): ObserveStateRow | undefined {
  return queryOne<ObserveStateRow>(
    db,
    `
      SELECT
        os.attempt_id AS attempt_id,
        os.learner_id AS learner_id,
        os.unit_cycle_activity_id AS unit_cycle_activity_id,
        os.placed_count AS placed_count,
        os.correct_count AS correct_count,
        os.total_count AS total_count,
        os.is_finished AS is_finished,
        os.completed_at AS completed_at,
        os.created_at AS created_at,
        os.updated_at AS updated_at
      FROM observe_state os
      WHERE os.attempt_id = ?
      LIMIT 1
    `,
    [attemptId],
  );
}

export function upsertObserveStateRow(
  db: SqliteDatabase,
  row: ObserveStateRow,
): void {
  executeRun(
    db,
    `
      INSERT INTO observe_state (
        attempt_id,
        learner_id,
        unit_cycle_activity_id,
        placed_count,
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
        placed_count = excluded.placed_count,
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
      row.placed_count,
      row.correct_count,
      row.total_count,
      row.is_finished,
      row.completed_at,
      row.created_at,
      row.updated_at,
    ],
  );
}
