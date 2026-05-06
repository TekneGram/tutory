import { describe, expect, it, vi } from "vitest";

import type { SqliteDatabase } from "../../sqlite";
import { executeRun, queryOne } from "../../sqlite";
import {
  getWriteExtraAnswerRowByAttemptId,
  getWriteExtraPromptRowByActivityContentId,
  getWriteExtraStateRowByAttemptId,
  upsertWriteExtraAnswerRow,
  upsertWriteExtraStateRow,
} from "../activity.writeExtraRepositories";

vi.mock("../../sqlite", () => ({
  executeRun: vi.fn(),
  queryOne: vi.fn(),
}));

describe("activity.writeExtraRepositories", () => {
  it("loads write extra prompt by activity content id", () => {
    vi.mocked(queryOne).mockReturnValue(undefined);

    getWriteExtraPromptRowByActivityContentId({} as SqliteDatabase, "content-1");

    expect(queryOne).toHaveBeenCalledTimes(1);
    const sql = vi.mocked(queryOne).mock.calls[0][1];
    expect(sql).toContain("FROM write_extra_prompts wep");
    expect(sql).toContain("WHERE wep.activity_content_id = ?");
    expect(vi.mocked(queryOne).mock.calls[0][2]).toEqual(["content-1"]);
  });

  it("loads write extra answer by attempt id", () => {
    vi.mocked(queryOne).mockReturnValue(undefined);

    getWriteExtraAnswerRowByAttemptId({} as SqliteDatabase, "attempt-1");

    expect(queryOne).toHaveBeenCalledTimes(1);
    const sql = vi.mocked(queryOne).mock.calls[0][1];
    expect(sql).toContain("FROM write_extra_answers wea");
    expect(sql).toContain("WHERE wea.attempt_id = ?");
  });

  it("upserts write extra answer by attempt", () => {
    upsertWriteExtraAnswerRow({} as SqliteDatabase, {
      attempt_id: "attempt-1",
      learner_id: "learner-1",
      unit_cycle_activity_id: "activity-1",
      learner_text: "This is my story extension.",
      created_at: "2026-05-06T00:00:00.000Z",
      updated_at: "2026-05-06T00:00:00.000Z",
    });

    expect(executeRun).toHaveBeenCalledTimes(1);
    const sql = vi.mocked(executeRun).mock.calls[0][1];
    expect(sql).toContain("INSERT INTO write_extra_answers");
    expect(sql).toContain("ON CONFLICT(attempt_id) DO UPDATE SET");
    expect(sql).toContain("learner_text = excluded.learner_text");
  });

  it("loads write extra state by attempt id", () => {
    vi.mocked(queryOne).mockReturnValue(undefined);

    getWriteExtraStateRowByAttemptId({} as SqliteDatabase, "attempt-1");

    expect(queryOne).toHaveBeenCalledTimes(1);
    const sql = vi.mocked(queryOne).mock.calls[0][1];
    expect(sql).toContain("FROM write_extra_state wes");
    expect(sql).toContain("WHERE wes.attempt_id = ?");
  });

  it("upserts write extra state by attempt", () => {
    upsertWriteExtraStateRow({} as SqliteDatabase, {
      attempt_id: "attempt-1",
      learner_id: "learner-1",
      unit_cycle_activity_id: "activity-1",
      is_completed: 1,
      completed_at: "2026-05-06T00:00:00.000Z",
      created_at: "2026-05-06T00:00:00.000Z",
      updated_at: "2026-05-06T00:00:00.000Z",
    });

    expect(executeRun).toHaveBeenCalledTimes(1);
    const sql = vi.mocked(executeRun).mock.calls[0][1];
    expect(sql).toContain("INSERT INTO write_extra_state");
    expect(sql).toContain("ON CONFLICT(attempt_id) DO UPDATE SET");
    expect(sql).toContain("is_completed = excluded.is_completed");
  });
});
