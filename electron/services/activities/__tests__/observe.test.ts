import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RequestContext } from "@electron/core/requestContext";
import { createAppDatabase } from "@electron/db/appDatabase";
import {
  getActivityContentRowByUnitCycleActivityId,
  getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId,
  getUnitCycleActivityIdentityRowById,
  insertActivityAttemptRow,
  updateActivityAttemptStatusRow,
} from "@electron/db/repositories/activityRepositories";
import {
  getObserveAnswerKeyRowByWordId,
  getObserveAnswerRowsByAttemptId,
  getObservePromptRowByActivityContentId,
  getObserveStateRowByAttemptId,
  getObserveWordRowByIdAndUnitCycleActivityId,
  getObserveCategoryRowByIdAndUnitCycleActivityId,
  listObserveCategoryRowsByActivityContentId,
  listObserveWordRowsByActivityContentId,
  resetObserveAnswerRowsByAttemptId,
  upsertObserveAnswerRow,
  upsertObserveStateRow,
} from "@electron/db/repositories/activity.observeRepositories";
import { getObserveActivity } from "../observe/getObserveActivity";
import { placeObserveWord } from "../observe/placeObserveWord";
import { resetObserveActivity } from "../observe/resetObserveActivity";

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
  getActivityContentRowByUnitCycleActivityId: vi.fn(),
  getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId: vi.fn(),
  getUnitCycleActivityIdentityRowById: vi.fn(),
  insertActivityAttemptRow: vi.fn(),
  updateActivityAttemptStatusRow: vi.fn(),
}));

vi.mock("@electron/db/repositories/activity.observeRepositories", () => ({
  getObserveAnswerKeyRowByWordId: vi.fn(),
  getObserveAnswerRowsByAttemptId: vi.fn(),
  getObserveCategoryRowByIdAndUnitCycleActivityId: vi.fn(),
  getObservePromptRowByActivityContentId: vi.fn(),
  getObserveStateRowByAttemptId: vi.fn(),
  getObserveWordRowByIdAndUnitCycleActivityId: vi.fn(),
  listObserveCategoryRowsByActivityContentId: vi.fn(),
  listObserveWordRowsByActivityContentId: vi.fn(),
  resetObserveAnswerRowsByAttemptId: vi.fn(),
  upsertObserveAnswerRow: vi.fn(),
  upsertObserveStateRow: vi.fn(),
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

describe("observe services", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(createAppDatabase).mockReturnValue({
      db: {},
      close: vi.fn(),
    } as unknown as ReturnType<typeof createAppDatabase>);

    vi.mocked(getUnitCycleActivityIdentityRowById).mockReturnValue({
      unit_cycle_activity_id: "activity-1",
      unit_cycle_id: "cycle-1",
      activity_type_id: 31,
      activity_type: "observe",
    });

    vi.mocked(getActivityContentRowByUnitCycleActivityId).mockReturnValue({
      id: "content-1",
      unit_cycle_activity_id: "activity-1",
      content_json: "{}",
    });

    vi.mocked(getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId).mockReturnValue({
      id: "attempt-1",
      learner_id: "learner-1",
      unit_cycle_activity_id: "activity-1",
      activity_type_id: 31,
      attempt_number: 1,
      status: "in_progress",
      score: null,
      started_at: "2026-05-06T00:00:00.000Z",
      submitted_at: null,
      content_snapshot_json: null,
    });

    vi.mocked(getObservePromptRowByActivityContentId).mockReturnValue({
      id: "prompt-1",
      activity_content_id: "content-1",
      instructions: "Drag words into categories.",
      advice: "Try to match by meaning.",
      title: "Observe Activity",
      asset_base: "english/unit_1/cycle_2",
      image_refs_json: JSON.stringify([{ order: 1, imageRef: "a.webp" }]),
    });

    vi.mocked(listObserveWordRowsByActivityContentId).mockReturnValue([
      {
        id: "word-1",
        activity_content_id: "content-1",
        word_order: 1,
        word_text: "lion",
      },
    ]);

    vi.mocked(listObserveCategoryRowsByActivityContentId).mockReturnValue([
      {
        id: "category-animals",
        activity_content_id: "content-1",
        category_order: 1,
        category_text: "animals",
      },
    ]);

    vi.mocked(getObserveAnswerRowsByAttemptId).mockReturnValue([
      {
        attempt_id: "attempt-1",
        learner_id: "learner-1",
        unit_cycle_activity_id: "activity-1",
        word_id: "word-1",
        selected_category_id: "category-animals",
        is_placed: 1,
        is_correct: 1,
        checked_at: "2026-05-06T00:00:00.000Z",
        created_at: "2026-05-06T00:00:00.000Z",
        updated_at: "2026-05-06T00:00:00.000Z",
      },
    ]);
  });

  it("loads observe content and progress", async () => {
    vi.mocked(getObserveStateRowByAttemptId).mockReturnValue(undefined);

    await expect(
      getObserveActivity(
        { learnerId: "learner-1", unitCycleActivityId: "activity-1" },
        makeContext("ctx-1"),
      ),
    ).resolves.toEqual({
      observe: {
        instructions: "Drag words into categories.",
        advice: "Try to match by meaning.",
        title: "Observe Activity",
        assetBase: "english/unit_1/cycle_2",
        assets: {
          imageRefs: [{ order: 1, imageRef: "a.webp" }],
        },
        words: [{ wordId: "word-1", word: "lion", order: 1 }],
        categories: [{ categoryId: "category-animals", category: "animals", order: 1 }],
        learnerWordStates: [
          {
            wordId: "word-1",
            selectedCategoryId: "category-animals",
            isPlaced: true,
            isCorrect: true,
            checkedAt: "2026-05-06T00:00:00.000Z",
          },
        ],
        progress: {
          placedCount: 1,
          correctCount: 1,
          totalCount: 1,
          isFinished: true,
          completedAt: expect.any(String),
        },
      },
    });

    expect(upsertObserveStateRow).toHaveBeenCalledTimes(1);
    expect(updateActivityAttemptStatusRow).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        id: "attempt-1",
        status: "completed",
      }),
    );
  });

  it("places a word and stores checked state", async () => {
    vi.mocked(getObserveStateRowByAttemptId).mockReturnValue(undefined);
    vi.mocked(getObserveWordRowByIdAndUnitCycleActivityId).mockReturnValue({
      id: "word-1",
      activity_content_id: "content-1",
      word_order: 1,
      word_text: "lion",
    });
    vi.mocked(getObserveCategoryRowByIdAndUnitCycleActivityId).mockReturnValue({
      id: "category-animals",
      activity_content_id: "content-1",
      category_order: 1,
      category_text: "animals",
    });
    vi.mocked(getObserveAnswerKeyRowByWordId).mockReturnValue({
      word_id: "word-1",
      category_id: "category-animals",
    });

    await expect(
      placeObserveWord(
        {
          learnerId: "learner-1",
          unitCycleActivityId: "activity-1",
          wordId: "word-1",
          categoryId: "category-animals",
        },
        makeContext("ctx-2"),
      ),
    ).resolves.toMatchObject({
      learnerWordState: {
        wordId: "word-1",
        selectedCategoryId: "category-animals",
        isPlaced: true,
        isCorrect: true,
      },
      progress: {
        placedCount: 1,
        correctCount: 1,
        totalCount: 1,
      },
    });

    expect(upsertObserveAnswerRow).toHaveBeenCalledTimes(1);
    expect(upsertObserveStateRow).toHaveBeenCalledTimes(1);
    expect(updateActivityAttemptStatusRow).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        id: "attempt-1",
        status: "completed",
      }),
    );
  });

  it("resets the activity and clears all learner word states", async () => {
    vi.mocked(getObserveStateRowByAttemptId).mockReturnValue(undefined);
    vi.mocked(getObserveAnswerRowsByAttemptId).mockReturnValue([
      {
        attempt_id: "attempt-1",
        learner_id: "learner-1",
        unit_cycle_activity_id: "activity-1",
        word_id: "word-1",
        selected_category_id: null,
        is_placed: 0,
        is_correct: 0,
        checked_at: null,
        created_at: "2026-05-06T00:00:00.000Z",
        updated_at: "2026-05-06T00:00:00.000Z",
      },
    ]);

    await expect(
      resetObserveActivity(
        { learnerId: "learner-1", unitCycleActivityId: "activity-1" },
        makeContext("ctx-3"),
      ),
    ).resolves.toEqual({
      learnerWordStates: [
        {
          wordId: "word-1",
          selectedCategoryId: null,
          isPlaced: false,
          isCorrect: false,
          checkedAt: null,
        },
      ],
      progress: {
        placedCount: 0,
        correctCount: 0,
        totalCount: 1,
        isFinished: false,
        completedAt: null,
      },
    });

    expect(resetObserveAnswerRowsByAttemptId).toHaveBeenCalledTimes(1);
    expect(upsertObserveStateRow).toHaveBeenCalledTimes(1);
    expect(updateActivityAttemptStatusRow).toHaveBeenCalledWith(
      expect.anything(),
      {
        id: "attempt-1",
        status: "in_progress",
        submitted_at: null,
      },
    );
  });

  it("throws when requested activity is not observe", async () => {
    vi.mocked(getUnitCycleActivityIdentityRowById).mockReturnValue({
      unit_cycle_activity_id: "activity-1",
      unit_cycle_id: "cycle-1",
      activity_type_id: 21,
      activity_type: "story",
    });

    await expect(
      getObserveActivity(
        { learnerId: "learner-1", unitCycleActivityId: "activity-1" },
        makeContext("ctx-4"),
      ),
    ).rejects.toMatchObject({
      code: "VALIDATION_INVALID_STATE",
    });
  });

  it("creates a new attempt when none exists", async () => {
    vi.mocked(getObserveStateRowByAttemptId).mockReturnValue(undefined);
    vi.mocked(getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId)
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce({
        id: "attempt-2",
        learner_id: "learner-1",
        unit_cycle_activity_id: "activity-1",
        activity_type_id: 31,
        attempt_number: 1,
        status: "in_progress",
        score: null,
        started_at: "2026-05-06T00:00:00.000Z",
        submitted_at: null,
        content_snapshot_json: null,
      });

    await getObserveActivity(
      { learnerId: "learner-1", unitCycleActivityId: "activity-1" },
      makeContext("ctx-5"),
    );

    expect(insertActivityAttemptRow).toHaveBeenCalledTimes(1);
  });
});
