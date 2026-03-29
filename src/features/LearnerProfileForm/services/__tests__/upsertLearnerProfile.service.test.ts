import { describe, expect, it, vi } from "vitest";
import { createLearnerProfile } from "../createLearnerProfile.service";
import { updateLearnerProfile } from "../updateLearnerProfile.service";
import { upsertLearnerProfile } from "../upsertLearnerProfile.service";

vi.mock("../createLearnerProfile.service", () => ({
  createLearnerProfile: vi.fn(),
}));

vi.mock("../updateLearnerProfile.service", () => ({
  updateLearnerProfile: vi.fn(),
}));

describe("upsertLearnerProfile", () => {
  it("creates a learner profile when learnerId is absent", async () => {
    vi.mocked(createLearnerProfile).mockResolvedValue({
      learnerId: "learner-new",
      name: "New Learner",
      avatarId: null,
      currentStatus: "ready",
    });

    await expect(
      upsertLearnerProfile({
        name: "New Learner",
        avatarId: null,
        statusText: "ready",
      })
    ).resolves.toEqual({
      learnerId: "learner-new",
      name: "New Learner",
      avatarId: null,
      currentStatus: "ready",
    });

    expect(createLearnerProfile).toHaveBeenCalledWith({
      name: "New Learner",
      avatarId: null,
      statusText: "ready",
    });
    expect(updateLearnerProfile).not.toHaveBeenCalled();
  });

  it("updates a learner profile when learnerId is present", async () => {
    vi.mocked(updateLearnerProfile).mockResolvedValue({
      learnerId: "learner-1",
      name: "Existing Learner",
      avatarId: "girl_2.webp",
      currentStatus: "focused",
    });

    await expect(
      upsertLearnerProfile({
        learnerId: "learner-1",
        name: "Existing Learner",
        avatarId: "girl_2.webp",
        statusText: "focused",
      })
    ).resolves.toEqual({
      learnerId: "learner-1",
      name: "Existing Learner",
      avatarId: "girl_2.webp",
      currentStatus: "focused",
    });

    expect(updateLearnerProfile).toHaveBeenCalledWith({
      learnerId: "learner-1",
      name: "Existing Learner",
      avatarId: "girl_2.webp",
      statusText: "focused",
    });
  });
});
