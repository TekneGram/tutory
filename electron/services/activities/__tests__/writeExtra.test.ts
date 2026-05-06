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
  getWriteExtraAnswerRowByAttemptId,
  getWriteExtraPromptRowByActivityContentId,
  getWriteExtraStateRowByAttemptId,
  upsertWriteExtraAnswerRow,
  upsertWriteExtraStateRow,
} from "@electron/db/repositories/activity.writeExtraRepositories";
import { getWriteExtraActivity } from "../writeExtra/getWriteExtraActivity";
import { resumeWriteExtra } from "../writeExtra/resumeWriteExtra";
import { submitWriteExtra } from "../writeExtra/submitWriteExtra";

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

vi.mock("@electron/db/repositories/activity.writeExtraRepositories", () => ({
  getWriteExtraAnswerRowByAttemptId: vi.fn(),
  getWriteExtraPromptRowByActivityContentId: vi.fn(),
  getWriteExtraStateRowByAttemptId: vi.fn(),
  upsertWriteExtraAnswerRow: vi.fn(),
  upsertWriteExtraStateRow: vi.fn(),
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

describe("write extra services", () => {
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
      activity_type: "write-extra",
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
  });

  it("loads write extra activity with prompt and learner state", async () => {
    vi.mocked(getWriteExtraPromptRowByActivityContentId).mockReturnValue({
      id: "prompt-1",
      activity_content_id: "content-1",
      instructions: "Read and write.",
      advice: "Use your own words.",
      title: "Write extra",
      asset_base: "english/unit_1/cycle_1",
      story_text: "This is the story.",
      image_refs_json: JSON.stringify([{ order: 1, imageRef: "image.webp" }]),
      audio_refs_json: JSON.stringify([{ order: 1, audioRef: "summary.ogg" }]),
      created_at: "2026-05-06T00:00:00.000Z",
      updated_at: "2026-05-06T00:00:00.000Z",
    });
    vi.mocked(getWriteExtraAnswerRowByAttemptId).mockReturnValue(undefined);
    vi.mocked(getWriteExtraStateRowByAttemptId).mockReturnValue(undefined);

    await expect(
      getWriteExtraActivity(
        { learnerId: "learner-1", unitCycleActivityId: "activity-1" },
        makeContext("ctx-1"),
      ),
    ).resolves.toEqual({
      writeExtra: {
        instructions: "Read and write.",
        advice: "Use your own words.",
        title: "Write extra",
        assetBase: "english/unit_1/cycle_1",
        assets: {
          imageRefs: [{ order: 1, imageRef: "image.webp" }],
          audioRefs: [{ order: 1, audioRef: "summary.ogg" }],
        },
        storyText: "This is the story.",
        learnerText: "",
        completion: {
          isCompleted: false,
        },
      },
    });

    expect(upsertWriteExtraStateRow).toHaveBeenCalledTimes(1);
  });

  it("submits write extra and marks completion", async () => {
    vi.mocked(getWriteExtraStateRowByAttemptId).mockReturnValue(undefined);

    await expect(
      submitWriteExtra(
        {
          learnerId: "learner-1",
          unitCycleActivityId: "activity-1",
          learnerText:
            "One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twentyone twentytwo twentythree twentyfour twentyfive.",
        },
        makeContext("ctx-2"),
      ),
    ).resolves.toEqual({
      completion: {
        isCompleted: true,
      },
    });

    expect(upsertWriteExtraAnswerRow).toHaveBeenCalledTimes(1);
    expect(upsertWriteExtraStateRow).toHaveBeenCalledTimes(1);
    expect(updateActivityAttemptStatusRow).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        id: "attempt-1",
        status: "completed",
      }),
    );
  });

  it("rejects submission with fewer than 25 words", async () => {
    await expect(
      submitWriteExtra(
        {
          learnerId: "learner-1",
          unitCycleActivityId: "activity-1",
          learnerText: "too short",
        },
        makeContext("ctx-3"),
      ),
    ).rejects.toMatchObject({
      code: "VALIDATION_INVALID_STATE",
    });

    expect(upsertWriteExtraAnswerRow).not.toHaveBeenCalled();
    expect(updateActivityAttemptStatusRow).not.toHaveBeenCalled();
  });

  it("resumes write extra and resets completion", async () => {
    vi.mocked(getWriteExtraStateRowByAttemptId).mockReturnValue(undefined);

    await expect(
      resumeWriteExtra(
        {
          learnerId: "learner-1",
          unitCycleActivityId: "activity-1",
        },
        makeContext("ctx-4"),
      ),
    ).resolves.toEqual({
      completion: {
        isCompleted: false,
      },
    });

    expect(upsertWriteExtraStateRow).toHaveBeenCalledTimes(1);
    expect(updateActivityAttemptStatusRow).toHaveBeenCalledWith(expect.anything(), {
      id: "attempt-1",
      status: "in_progress",
      submitted_at: null,
    });
  });

  it("creates a new attempt when none exists", async () => {
    vi.mocked(getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId).mockReturnValueOnce(undefined);
    vi.mocked(getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId).mockReturnValueOnce({
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
    vi.mocked(getWriteExtraPromptRowByActivityContentId).mockReturnValue({
      id: "prompt-1",
      activity_content_id: "content-1",
      instructions: "Read and write.",
      advice: "Use your own words.",
      title: "Write extra",
      asset_base: "english/unit_1/cycle_1",
      story_text: "This is the story.",
      image_refs_json: JSON.stringify([]),
      audio_refs_json: JSON.stringify([]),
      created_at: "2026-05-06T00:00:00.000Z",
      updated_at: "2026-05-06T00:00:00.000Z",
    });
    vi.mocked(getWriteExtraAnswerRowByAttemptId).mockReturnValue(undefined);
    vi.mocked(getWriteExtraStateRowByAttemptId).mockReturnValue(undefined);

    await getWriteExtraActivity(
      { learnerId: "learner-1", unitCycleActivityId: "activity-1" },
      makeContext("ctx-5"),
    );

    expect(insertActivityAttemptRow).toHaveBeenCalledTimes(1);
  });
});
