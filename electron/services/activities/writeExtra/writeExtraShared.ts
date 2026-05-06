import { randomUUID } from "node:crypto";
import { raiseAppError } from "@electron/core/appException";
import type { ActivityAttemptRow } from "@electron/db/repositories/activityRepositories";
import {
  getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId,
  insertActivityAttemptRow,
} from "@electron/db/repositories/activityRepositories";

export function ensureWriteExtraAttemptRow(
  db: Parameters<typeof getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId>[0],
  learnerId: string,
  unitCycleActivityId: string,
  activityTypeId: number,
): ActivityAttemptRow {
  const existingAttempt = getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId(
    db,
    learnerId,
    unitCycleActivityId,
  );

  if (existingAttempt) {
    return existingAttempt;
  }

  const startedAt = new Date().toISOString();
  insertActivityAttemptRow(db, {
    id: randomUUID(),
    learner_id: learnerId,
    unit_cycle_activity_id: unitCycleActivityId,
    activity_type_id: activityTypeId,
    attempt_number: 1,
    status: "in_progress",
    score: null,
    started_at: startedAt,
    submitted_at: null,
    content_snapshot_json: null,
  });

  const createdAttempt = getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId(
    db,
    learnerId,
    unitCycleActivityId,
  );

  if (!createdAttempt) {
    raiseAppError("DB_QUERY_FAILED", "Write extra activity attempt could not be created or loaded.");
  }

  return createdAttempt;
}

export function countWords(value: string): number {
  const tokens = value.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g);
  return tokens?.length ?? 0;
}
