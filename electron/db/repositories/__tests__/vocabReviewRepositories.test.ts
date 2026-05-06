import { describe, expect, it, vi } from "vitest";

import type { SqliteDatabase } from "../../sqlite";
import { executeRun, queryAll, queryOne } from "../../sqlite";
import {
  getVocabReviewWordRowByIdAndUnitCycleActivityId,
  listVocabReviewWordRowsByActivityContentId,
  resetVocabReviewAnswerRowsByAttemptId,
  upsertVocabReviewAnswerRow,
  upsertVocabReviewStateRow,
} from "../activity.vocabreviewRepositories";

vi.mock("../../sqlite", () => ({
  executeRun: vi.fn(),
  queryAll: vi.fn(),
  queryOne: vi.fn(),
}));

describe("activity.vocabreviewRepositories", () => {
  it("lists vocab words by activity content id ordered by word order", () => {
    vi.mocked(queryAll).mockReturnValue([]);

    listVocabReviewWordRowsByActivityContentId({} as SqliteDatabase, "content-1");

    expect(queryAll).toHaveBeenCalledTimes(1);
    const sql = vi.mocked(queryAll).mock.calls[0][1];
    expect(sql).toContain("FROM vocab_review_words vrw");
    expect(sql).toContain("ORDER BY vrw.word_order ASC");
    expect(vi.mocked(queryAll).mock.calls[0][2]).toEqual(["content-1"]);
  });

  it("loads a vocab word by id scoped to owning unit cycle activity", () => {
    vi.mocked(queryOne).mockReturnValue(undefined);

    getVocabReviewWordRowByIdAndUnitCycleActivityId(
      {} as SqliteDatabase,
      "word-1",
      "activity-1",
    );

    expect(queryOne).toHaveBeenCalledTimes(1);
    const sql = vi.mocked(queryOne).mock.calls[0][1];
    expect(sql).toContain("FROM vocab_review_words vrw");
    expect(sql).toContain("INNER JOIN activity_content ac");
    expect(sql).toContain("ac.unit_cycle_activity_id = ?");
    expect(vi.mocked(queryOne).mock.calls[0][2]).toEqual(["word-1", "activity-1"]);
  });

  it("upserts a vocab review answer row by attempt and word", () => {
    upsertVocabReviewAnswerRow({} as SqliteDatabase, {
      attempt_id: "attempt-1",
      learner_id: "learner-1",
      unit_cycle_activity_id: "activity-1",
      word_id: "word-1",
      learner_input: "would",
      is_checked: 1,
      is_correct: 1,
      checked_at: "2026-05-06T00:00:00.000Z",
      created_at: "2026-05-06T00:00:00.000Z",
      updated_at: "2026-05-06T00:00:00.000Z",
    });

    expect(executeRun).toHaveBeenCalledTimes(1);
    const sql = vi.mocked(executeRun).mock.calls[0][1];
    expect(sql).toContain("INSERT INTO vocab_review_answers");
    expect(sql).toContain("ON CONFLICT(attempt_id, word_id) DO UPDATE SET");
    expect(sql).toContain("is_correct = excluded.is_correct");
  });

  it("upserts vocab review aggregate state by attempt", () => {
    upsertVocabReviewStateRow({} as SqliteDatabase, {
      attempt_id: "attempt-1",
      learner_id: "learner-1",
      unit_cycle_activity_id: "activity-1",
      checked_count: 2,
      correct_count: 1,
      total_count: 10,
      is_finished: 0,
      completed_at: null,
      created_at: "2026-05-06T00:00:00.000Z",
      updated_at: "2026-05-06T00:00:00.000Z",
    });

    expect(executeRun).toHaveBeenCalledTimes(1);
    const sql = vi.mocked(executeRun).mock.calls[0][1];
    expect(sql).toContain("INSERT INTO vocab_review_state");
    expect(sql).toContain("ON CONFLICT(attempt_id) DO UPDATE SET");
    expect(sql).toContain("is_finished = excluded.is_finished");
  });

  it("resets all answer rows for an attempt", () => {
    resetVocabReviewAnswerRowsByAttemptId(
      {} as SqliteDatabase,
      "attempt-1",
      "2026-05-06T00:00:00.000Z",
    );

    expect(executeRun).toHaveBeenCalledTimes(1);
    const sql = vi.mocked(executeRun).mock.calls[0][1];
    expect(sql).toContain("UPDATE vocab_review_answers");
    expect(sql).toContain("SET learner_input = NULL");
    expect(sql).toContain("WHERE attempt_id = ?");
  });
});
