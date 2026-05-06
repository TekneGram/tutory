import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RequestContext } from "@electron/core/requestContext";
import { createAppDatabase } from "@electron/db/appDatabase";
import {
  getActivityContentPrimaryRowByActivityContentId,
  getActivityContentRowByUnitCycleActivityId,
  getUnitCycleActivityIdentityRowById,
} from "@electron/db/repositories/activityRepositories";
import {
  getVocabReviewAnswerRowByAttemptIdAndWordId,
  getVocabReviewAnswerRowsByAttemptId,
  getVocabReviewStateRowByAttemptId,
  getVocabReviewWordRowByIdAndUnitCycleActivityId,
  listVocabReviewWordRowsByActivityContentId,
  resetVocabReviewAnswerRowByAttemptIdAndWordId,
  resetVocabReviewAnswerRowsByAttemptId,
  upsertVocabReviewAnswerRow,
  upsertVocabReviewStateRow,
} from "@electron/db/repositories/activity.vocabreviewRepositories";
import { getVocabReviewActivity } from "../vocabReview/getVocabReviewActivity";
import { checkVocabReviewWord } from "../vocabReview/checkVocabReviewWord";
import { resetVocabReviewActivity } from "../vocabReview/resetVocabReviewActivity";
import { retryVocabReviewWord } from "../vocabReview/retryVocabReviewWord";

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
  getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId: vi
    .fn()
    .mockReturnValue({
      id: "attempt-1",
      learner_id: "learner-1",
      unit_cycle_activity_id: "activity-1",
      activity_type_id: 21,
      attempt_number: 1,
      status: "in_progress",
      score: null,
      started_at: "2026-05-06T00:00:00.000Z",
      submitted_at: null,
      content_snapshot_json: null,
    }),
  getUnitCycleActivityIdentityRowById: vi.fn(),
  insertActivityAttemptRow: vi.fn(),
}));

vi.mock("@electron/db/repositories/activity.vocabreviewRepositories", () => ({
  getVocabReviewAnswerRowByAttemptIdAndWordId: vi.fn(),
  getVocabReviewAnswerRowsByAttemptId: vi.fn(),
  getVocabReviewStateRowByAttemptId: vi.fn(),
  getVocabReviewWordRowByIdAndUnitCycleActivityId: vi.fn(),
  listVocabReviewWordRowsByActivityContentId: vi.fn(),
  resetVocabReviewAnswerRowsByAttemptId: vi.fn(),
  resetVocabReviewAnswerRowByAttemptIdAndWordId: vi.fn(),
  upsertVocabReviewAnswerRow: vi.fn(),
  upsertVocabReviewStateRow: vi.fn(),
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

describe("vocab review services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createAppDatabase).mockReturnValue({
      db: {},
      close: vi.fn(),
    } as unknown as ReturnType<typeof createAppDatabase>);

    vi.mocked(getUnitCycleActivityIdentityRowById).mockReturnValue({
      unit_cycle_activity_id: "activity-1",
      unit_cycle_id: "cycle-1",
      activity_type_id: 21,
      activity_type: "vocab-review",
    });

    vi.mocked(getActivityContentRowByUnitCycleActivityId).mockReturnValue({
      id: "content-1",
      unit_cycle_activity_id: "activity-1",
      content_json: "{}",
    });

    vi.mocked(listVocabReviewWordRowsByActivityContentId).mockReturnValue([
      {
        id: "word-1",
        activity_content_id: "content-1",
        word_order: 1,
        word_text: "would",
        japanese_text: "〜だろう",
      },
    ]);

    vi.mocked(getVocabReviewAnswerRowsByAttemptId).mockReturnValue([
      {
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
      },
    ]);
  });

  it("loads vocab review content and progress", async () => {
    vi.mocked(getActivityContentPrimaryRowByActivityContentId).mockReturnValue({
      id: "primary-1",
      activity_content_id: "content-1",
      instructions: "Practice",
      advice: "Spell carefully",
      title: "Vocab review",
      asset_base: "english/unit_1/cycle_1",
    });
    vi.mocked(getVocabReviewStateRowByAttemptId).mockReturnValue(undefined);

    await expect(
      getVocabReviewActivity(
        { learnerId: "learner-1", unitCycleActivityId: "activity-1" },
        makeContext("ctx-1"),
      ),
    ).resolves.toEqual({
      vocabReview: {
        instructions: "Practice",
        advice: "Spell carefully",
        title: "Vocab review",
        assetBase: "english/unit_1/cycle_1",
        words: [
          {
            wordId: "word-1",
            word: "would",
            japanese: "〜だろう",
            order: 1,
          },
        ],
        learnerWordStates: [
          {
            wordId: "word-1",
            learnerInput: "would",
            isChecked: true,
            isCorrect: true,
            checkedAt: "2026-05-06T00:00:00.000Z",
          },
        ],
        progress: {
          checkedCount: 1,
          correctCount: 1,
          totalCount: 1,
          isFinished: true,
          completedAt: expect.any(String),
        },
      },
    });

    expect(upsertVocabReviewStateRow).toHaveBeenCalledTimes(1);
  });

  it("checks a word and stores checked state", async () => {
    vi.mocked(getVocabReviewWordRowByIdAndUnitCycleActivityId).mockReturnValue({
      id: "word-1",
      activity_content_id: "content-1",
      word_text: "would",
      japanese_text: "〜だろう",
    });
    vi.mocked(getVocabReviewStateRowByAttemptId).mockReturnValue(undefined);

    await expect(
      checkVocabReviewWord(
        {
          learnerId: "learner-1",
          unitCycleActivityId: "activity-1",
          wordId: "word-1",
          learnerInput: "  WOULD ",
        },
        makeContext("ctx-2"),
      ),
    ).resolves.toMatchObject({
      learnerWordState: {
        wordId: "word-1",
        isChecked: true,
        isCorrect: true,
      },
      progress: {
        checkedCount: 1,
        correctCount: 1,
        totalCount: 1,
      },
    });

    expect(upsertVocabReviewAnswerRow).toHaveBeenCalledTimes(1);
    expect(upsertVocabReviewStateRow).toHaveBeenCalledTimes(1);
  });

  it("resets the activity and clears all learner word states", async () => {
    vi.mocked(getVocabReviewStateRowByAttemptId).mockReturnValue(undefined);
    vi.mocked(getVocabReviewAnswerRowsByAttemptId).mockReturnValue([
      {
        attempt_id: "attempt-1",
        learner_id: "learner-1",
        unit_cycle_activity_id: "activity-1",
        word_id: "word-1",
        learner_input: null,
        is_checked: 0,
        is_correct: 0,
        checked_at: null,
        created_at: "2026-05-06T00:00:00.000Z",
        updated_at: "2026-05-06T00:00:00.000Z",
      },
    ]);

    await expect(
      resetVocabReviewActivity(
        { learnerId: "learner-1", unitCycleActivityId: "activity-1" },
        makeContext("ctx-3"),
      ),
    ).resolves.toEqual({
      learnerWordStates: [
        {
          wordId: "word-1",
          learnerInput: null,
          isChecked: false,
          isCorrect: false,
          checkedAt: null,
        },
      ],
      progress: {
        checkedCount: 0,
        correctCount: 0,
        totalCount: 1,
        isFinished: false,
        completedAt: null,
      },
    });

    expect(resetVocabReviewAnswerRowsByAttemptId).toHaveBeenCalledTimes(1);
    expect(upsertVocabReviewStateRow).toHaveBeenCalledTimes(1);
  });

  it("throws when requested activity is not vocab-review", async () => {
    vi.mocked(getUnitCycleActivityIdentityRowById).mockReturnValue({
      unit_cycle_activity_id: "activity-1",
      unit_cycle_id: "cycle-1",
      activity_type_id: 22,
      activity_type: "story",
    });

    await expect(
      getVocabReviewActivity(
        { learnerId: "learner-1", unitCycleActivityId: "activity-1" },
        makeContext("ctx-4"),
      ),
    ).rejects.toMatchObject({
      code: "VALIDATION_INVALID_STATE",
    });
  });

  it("supports retry workflow by returning cleared word state", async () => {
    vi.mocked(getVocabReviewAnswerRowByAttemptIdAndWordId).mockReturnValue({
      attempt_id: "attempt-1",
      learner_id: "learner-1",
      unit_cycle_activity_id: "activity-1",
      word_id: "word-1",
      learner_input: null,
      is_checked: 0,
      is_correct: 0,
      checked_at: null,
      created_at: "2026-05-06T00:00:00.000Z",
      updated_at: "2026-05-06T00:00:00.000Z",
    });
    vi.mocked(getVocabReviewWordRowByIdAndUnitCycleActivityId).mockReturnValue({
      id: "word-1",
      activity_content_id: "content-1",
      word_text: "would",
      japanese_text: "〜だろう",
    });
    vi.mocked(getVocabReviewStateRowByAttemptId).mockReturnValue(undefined);
    vi.mocked(getVocabReviewAnswerRowsByAttemptId).mockReturnValue([
      {
        attempt_id: "attempt-1",
        learner_id: "learner-1",
        unit_cycle_activity_id: "activity-1",
        word_id: "word-1",
        learner_input: null,
        is_checked: 0,
        is_correct: 0,
        checked_at: null,
        created_at: "2026-05-06T00:00:00.000Z",
        updated_at: "2026-05-06T00:00:00.000Z",
      },
    ]);

    await expect(
      retryVocabReviewWord(
        { learnerId: "learner-1", unitCycleActivityId: "activity-1", wordId: "word-1" },
        makeContext("ctx-5"),
      ),
    ).resolves.toEqual({
      learnerWordState: {
        wordId: "word-1",
        learnerInput: null,
        isChecked: false,
        isCorrect: false,
        checkedAt: null,
      },
      progress: {
        checkedCount: 0,
        correctCount: 0,
        totalCount: 1,
        isFinished: false,
        completedAt: null,
      },
    });

    expect(resetVocabReviewAnswerRowByAttemptIdAndWordId).toHaveBeenCalledTimes(1);
  });
});
