import type { SqliteDatabase } from "../sqlite";
import { executeRun, queryOne } from "../sqlite";

export type WriteExtraPromptRow = {
  id: string;
  activity_content_id: string;
  instructions: string;
  advice: string;
  title: string;
  asset_base: string | null;
  story_text: string;
  image_refs_json: string;
  audio_refs_json: string;
  created_at: string;
  updated_at: string;
};

export type WriteExtraAnswerRow = {
  attempt_id: string;
  learner_id: string;
  unit_cycle_activity_id: string;
  learner_text: string;
  created_at: string;
  updated_at: string;
};

export type WriteExtraStateRow = {
  attempt_id: string;
  learner_id: string;
  unit_cycle_activity_id: string;
  is_completed: 0 | 1;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export function getWriteExtraPromptRowByActivityContentId(
  db: SqliteDatabase,
  activityContentId: string,
): WriteExtraPromptRow | undefined {
  return queryOne<WriteExtraPromptRow>(
    db,
    `
      SELECT
        wep.id AS id,
        wep.activity_content_id AS activity_content_id,
        wep.instructions AS instructions,
        wep.advice AS advice,
        wep.title AS title,
        wep.asset_base AS asset_base,
        wep.story_text AS story_text,
        wep.image_refs_json AS image_refs_json,
        wep.audio_refs_json AS audio_refs_json,
        wep.created_at AS created_at,
        wep.updated_at AS updated_at
      FROM write_extra_prompts wep
      WHERE wep.activity_content_id = ?
      LIMIT 1
    `,
    [activityContentId],
  );
}

export function getWriteExtraAnswerRowByAttemptId(
  db: SqliteDatabase,
  attemptId: string,
): WriteExtraAnswerRow | undefined {
  return queryOne<WriteExtraAnswerRow>(
    db,
    `
      SELECT
        wea.attempt_id AS attempt_id,
        wea.learner_id AS learner_id,
        wea.unit_cycle_activity_id AS unit_cycle_activity_id,
        wea.learner_text AS learner_text,
        wea.created_at AS created_at,
        wea.updated_at AS updated_at
      FROM write_extra_answers wea
      WHERE wea.attempt_id = ?
      LIMIT 1
    `,
    [attemptId],
  );
}

export function upsertWriteExtraAnswerRow(
  db: SqliteDatabase,
  row: WriteExtraAnswerRow,
): void {
  executeRun(
    db,
    `
      INSERT INTO write_extra_answers (
        attempt_id,
        learner_id,
        unit_cycle_activity_id,
        learner_text,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(attempt_id) DO UPDATE SET
        learner_id = excluded.learner_id,
        unit_cycle_activity_id = excluded.unit_cycle_activity_id,
        learner_text = excluded.learner_text,
        updated_at = excluded.updated_at
    `,
    [
      row.attempt_id,
      row.learner_id,
      row.unit_cycle_activity_id,
      row.learner_text,
      row.created_at,
      row.updated_at,
    ],
  );
}

export function getWriteExtraStateRowByAttemptId(
  db: SqliteDatabase,
  attemptId: string,
): WriteExtraStateRow | undefined {
  return queryOne<WriteExtraStateRow>(
    db,
    `
      SELECT
        wes.attempt_id AS attempt_id,
        wes.learner_id AS learner_id,
        wes.unit_cycle_activity_id AS unit_cycle_activity_id,
        wes.is_completed AS is_completed,
        wes.completed_at AS completed_at,
        wes.created_at AS created_at,
        wes.updated_at AS updated_at
      FROM write_extra_state wes
      WHERE wes.attempt_id = ?
      LIMIT 1
    `,
    [attemptId],
  );
}

export function upsertWriteExtraStateRow(
  db: SqliteDatabase,
  row: WriteExtraStateRow,
): void {
  executeRun(
    db,
    `
      INSERT INTO write_extra_state (
        attempt_id,
        learner_id,
        unit_cycle_activity_id,
        is_completed,
        completed_at,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(attempt_id) DO UPDATE SET
        learner_id = excluded.learner_id,
        unit_cycle_activity_id = excluded.unit_cycle_activity_id,
        is_completed = excluded.is_completed,
        completed_at = excluded.completed_at,
        updated_at = excluded.updated_at
    `,
    [
      row.attempt_id,
      row.learner_id,
      row.unit_cycle_activity_id,
      row.is_completed,
      row.completed_at,
      row.created_at,
      row.updated_at,
    ],
  );
}
