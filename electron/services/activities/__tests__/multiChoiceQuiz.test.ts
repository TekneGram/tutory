import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RequestContext } from "@electron/core/requestContext";
import { createAppDatabase } from "@electron/db/appDatabase";
import {
  getActivityContentPrimaryRowByActivityContentId,
  getActivityContentRowByUnitCycleActivityId,
  getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId,
  getUnitCycleActivityIdentityRowById,
  listActivityContentAssetRowsByActivityContentId,
  updateActivityAttemptStatusRow,
} from "@electron/db/repositories/activityRepositories";
import {
  getMultiChoiceQuizAnswerRowsByAttemptId,
  getMultiChoiceQuizOptionRowByIdAndQuestionId,
  getMultiChoiceQuizQuestionRowByIdAndUnitCycleActivityId,
  getMultiChoiceQuizStateRowByAttemptId,
  listMultiChoiceQuizOptionRowsByActivityContentId,
  listMultiChoiceQuizQuestionRowsByActivityContentId,
  resetMultiChoiceQuizAnswerRowsByAttemptId,
  upsertMultiChoiceQuizAnswerRow,
  upsertMultiChoiceQuizStateRow,
} from "@electron/db/repositories/activity.multichoicequizRepositories";
import { checkMultiChoiceQuizAnswers } from "../multiChoiceQuiz/checkMultiChoiceQuizAnswers";
import { getMultiChoiceQuizActivity } from "../multiChoiceQuiz/getMultiChoiceQuizAnswers";
import { retryMultiChoiceQuiz } from "../multiChoiceQuiz/retryMultiChoiceQuiz";

function makeContext(correlationId: string): RequestContext {
  return {
    correlationId,
    sendEvent: vi.fn() as RequestContext["sendEvent"],
  };
}

vi.mock("@electron/db/appDatabase", () => ({
  createAppDatabase: vi.fn(),
}));

vi.mock("@electron/db/sqlite", () => ({
  runInTransaction: vi.fn((_, work) => work()),
}));

vi.mock("@electron/db/repositories/activityRepositories", () => ({
  getActivityContentPrimaryRowByActivityContentId: vi.fn(),
  getActivityContentRowByUnitCycleActivityId: vi.fn(),
  getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId: vi.fn(),
  getUnitCycleActivityIdentityRowById: vi.fn(),
  insertActivityAttemptRow: vi.fn(),
  listActivityContentAssetRowsByActivityContentId: vi.fn(),
  updateActivityAttemptStatusRow: vi.fn(),
}));

vi.mock("@electron/db/repositories/activity.multichoicequizRepositories", () => ({
  getMultiChoiceQuizAnswerRowsByAttemptId: vi.fn(),
  getMultiChoiceQuizOptionRowByIdAndQuestionId: vi.fn(),
  getMultiChoiceQuizQuestionRowByIdAndUnitCycleActivityId: vi.fn(),
  getMultiChoiceQuizStateRowByAttemptId: vi.fn(),
  listMultiChoiceQuizOptionRowsByActivityContentId: vi.fn(),
  listMultiChoiceQuizQuestionRowsByActivityContentId: vi.fn(),
  resetMultiChoiceQuizAnswerRowsByAttemptId: vi.fn(),
  upsertMultiChoiceQuizAnswerRow: vi.fn(),
  upsertMultiChoiceQuizStateRow: vi.fn(),
}));

vi.mock("@electron/runtime/runtimePaths", () => ({
  getRuntimeDbPath: vi.fn(() => "/tmp/app.sqlite"),
}));

vi.mock("@electron/utilities/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("multi choice quiz services", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(createAppDatabase).mockReturnValue({
      db: {},
      close: vi.fn(),
    } as unknown as ReturnType<typeof createAppDatabase>);

    vi.mocked(getUnitCycleActivityIdentityRowById).mockReturnValue({
      unit_cycle_activity_id: "activity-1",
      unit_cycle_id: "cycle-1",
      activity_type_id: 12,
      activity_type: "multi-choice-quiz",
    });

    vi.mocked(getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId).mockReturnValue({
      id: "attempt-1",
      learner_id: "learner-1",
      unit_cycle_activity_id: "activity-1",
      activity_type_id: 12,
      attempt_number: 1,
      status: "in_progress",
      score: null,
      started_at: "2026-05-06T00:00:00.000Z",
      submitted_at: null,
      content_snapshot_json: null,
    });
    vi.mocked(getActivityContentRowByUnitCycleActivityId).mockReturnValue({
      id: "content-1",
      unit_cycle_activity_id: "activity-1",
      content_json: "{}",
    });
    vi.mocked(getActivityContentPrimaryRowByActivityContentId).mockReturnValue({
      id: "primary-1",
      activity_content_id: "content-1",
      instructions: "Pick one",
      advice: "Read carefully",
      title: "Quiz",
      asset_base: "english/unit_1/cycle_1",
    });
    vi.mocked(listActivityContentAssetRowsByActivityContentId).mockReturnValue([]);
    vi.mocked(listMultiChoiceQuizQuestionRowsByActivityContentId).mockReturnValue([]);
    vi.mocked(listMultiChoiceQuizOptionRowsByActivityContentId).mockReturnValue([]);
  });

  it("marks attempt completed when answers are checked", async () => {
    vi.mocked(getMultiChoiceQuizQuestionRowByIdAndUnitCycleActivityId).mockReturnValue({
      id: "question-1",
      activity_content_id: "content-1",
      question_text: "2 + 2 = ?",
    });
    vi.mocked(getMultiChoiceQuizOptionRowByIdAndQuestionId).mockReturnValue({
      id: "option-1",
      question_id: "question-1",
      option_key: "A",
      option_order: 1,
      answer_text: "4",
      is_correct: 1,
    });
    vi.mocked(getMultiChoiceQuizStateRowByAttemptId).mockReturnValue(undefined);
    vi.mocked(getMultiChoiceQuizAnswerRowsByAttemptId).mockReturnValue([]);

    await checkMultiChoiceQuizAnswers(
      {
        learnerId: "learner-1",
        unitCycleActivityId: "activity-1",
        answers: [{ questionId: "question-1", selectedOption: "option-1" }],
      },
      makeContext("ctx-1"),
    );

    expect(upsertMultiChoiceQuizAnswerRow).toHaveBeenCalledTimes(1);
    expect(upsertMultiChoiceQuizStateRow).toHaveBeenCalledTimes(1);
    expect(updateActivityAttemptStatusRow).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        id: "attempt-1",
        status: "completed",
      }),
    );
  });

  it("marks attempt in-progress when retry is requested", async () => {
    vi.mocked(getMultiChoiceQuizStateRowByAttemptId).mockReturnValue(undefined);
    vi.mocked(getMultiChoiceQuizAnswerRowsByAttemptId).mockReturnValue([]);

    await retryMultiChoiceQuiz(
      {
        learnerId: "learner-1",
        unitCycleActivityId: "activity-1",
      },
      makeContext("ctx-2"),
    );

    expect(resetMultiChoiceQuizAnswerRowsByAttemptId).toHaveBeenCalledTimes(1);
    expect(upsertMultiChoiceQuizStateRow).toHaveBeenCalledTimes(1);
    expect(updateActivityAttemptStatusRow).toHaveBeenCalledWith(
      expect.anything(),
      {
        id: "attempt-1",
        status: "in_progress",
        submitted_at: null,
      },
    );
  });

  it("syncs attempt status to completed when quiz state is already checked", async () => {
    vi.mocked(getMultiChoiceQuizStateRowByAttemptId).mockReturnValue({
      attempt_id: "attempt-1",
      learner_id: "learner-1",
      unit_cycle_activity_id: "activity-1",
      is_checked: 1,
      final_score: 1,
      checked_at: "2026-05-06T00:00:00.000Z",
      created_at: "2026-05-06T00:00:00.000Z",
      updated_at: "2026-05-06T00:00:00.000Z",
    });
    vi.mocked(getMultiChoiceQuizAnswerRowsByAttemptId).mockReturnValue([]);

    await getMultiChoiceQuizActivity(
      {
        learnerId: "learner-1",
        unitCycleActivityId: "activity-1",
      },
      makeContext("ctx-3"),
    );

    expect(updateActivityAttemptStatusRow).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        id: "attempt-1",
        status: "completed",
      }),
    );
  });
});
