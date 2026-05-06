import { describe, expect, it, vi } from "vitest";

import type { SqliteDatabase } from "../../sqlite";
import { executeRun, queryAll, queryOne } from "../../sqlite";
import {
  getObserveCategoryRowByIdAndUnitCycleActivityId,
  listObserveWordRowsByActivityContentId,
  resetObserveAnswerRowsByAttemptId,
  upsertObserveAnswerRow,
  upsertObserveStateRow,
} from "../activity.observeRepositories";

vi.mock("../../sqlite", () => ({
  executeRun: vi.fn(),
  queryAll: vi.fn(),
  queryOne: vi.fn(),
}));

describe("activity.observeRepositories", () => {
  it("lists observe words by activity content id ordered by word order", () => {
    vi.mocked(queryAll).mockReturnValue([]);

    listObserveWordRowsByActivityContentId({} as SqliteDatabase, "content-1");

    expect(queryAll).toHaveBeenCalledTimes(1);
    const sql = vi.mocked(queryAll).mock.calls[0][1];
    expect(sql).toContain("FROM observe_words ow");
    expect(sql).toContain("ORDER BY ow.word_order ASC");
    expect(vi.mocked(queryAll).mock.calls[0][2]).toEqual(["content-1"]);
  });

  it("loads a category by id scoped to owning unit cycle activity", () => {
    vi.mocked(queryOne).mockReturnValue(undefined);

    getObserveCategoryRowByIdAndUnitCycleActivityId(
      {} as SqliteDatabase,
      "category-1",
      "activity-1",
    );

    expect(queryOne).toHaveBeenCalledTimes(1);
    const sql = vi.mocked(queryOne).mock.calls[0][1];
    expect(sql).toContain("FROM observe_categories oc");
    expect(sql).toContain("INNER JOIN activity_content ac");
    expect(sql).toContain("ac.unit_cycle_activity_id = ?");
    expect(vi.mocked(queryOne).mock.calls[0][2]).toEqual(["category-1", "activity-1"]);
  });

  it("upserts an observe answer row by attempt and word", () => {
    upsertObserveAnswerRow({} as SqliteDatabase, {
      attempt_id: "attempt-1",
      learner_id: "learner-1",
      unit_cycle_activity_id: "activity-1",
      word_id: "word-1",
      selected_category_id: "category-1",
      is_placed: 1,
      is_correct: 1,
      checked_at: "2026-05-06T00:00:00.000Z",
      created_at: "2026-05-06T00:00:00.000Z",
      updated_at: "2026-05-06T00:00:00.000Z",
    });

    expect(executeRun).toHaveBeenCalledTimes(1);
    const sql = vi.mocked(executeRun).mock.calls[0][1];
    expect(sql).toContain("INSERT INTO observe_answers");
    expect(sql).toContain("ON CONFLICT(attempt_id, word_id) DO UPDATE SET");
    expect(sql).toContain("selected_category_id = excluded.selected_category_id");
  });

  it("upserts observe aggregate state by attempt", () => {
    upsertObserveStateRow({} as SqliteDatabase, {
      attempt_id: "attempt-1",
      learner_id: "learner-1",
      unit_cycle_activity_id: "activity-1",
      placed_count: 2,
      correct_count: 1,
      total_count: 10,
      is_finished: 0,
      completed_at: null,
      created_at: "2026-05-06T00:00:00.000Z",
      updated_at: "2026-05-06T00:00:00.000Z",
    });

    expect(executeRun).toHaveBeenCalledTimes(1);
    const sql = vi.mocked(executeRun).mock.calls[0][1];
    expect(sql).toContain("INSERT INTO observe_state");
    expect(sql).toContain("ON CONFLICT(attempt_id) DO UPDATE SET");
    expect(sql).toContain("is_finished = excluded.is_finished");
  });

  it("resets all observe answer rows for an attempt", () => {
    resetObserveAnswerRowsByAttemptId(
      {} as SqliteDatabase,
      "attempt-1",
      "2026-05-06T00:00:00.000Z",
    );

    expect(executeRun).toHaveBeenCalledTimes(1);
    const sql = vi.mocked(executeRun).mock.calls[0][1];
    expect(sql).toContain("UPDATE observe_answers");
    expect(sql).toContain("SET selected_category_id = NULL");
    expect(sql).toContain("WHERE attempt_id = ?");
  });
});
