import { describe, expect, it, vi } from "vitest";
import { activitiesAdapter } from "../activities.adapters";
import { invokeRequest } from "../invokeRequest";

vi.mock("../invokeRequest", () => ({
  invokeRequest: vi.fn(),
}));

describe("activitiesAdapter", () => {
  it("invokes the canonical list channel with the request payload", async () => {
    vi.mocked(invokeRequest).mockResolvedValue({
      ok: true,
      value: {
        cycle: {
          unitCycleId: "cycle-1",
          unitId: "unit-1",
          title: "Cycle 1",
        },
        activities: [],
      },
    });

    await activitiesAdapter.listUnitCycleActivities({ unitCycleId: "cycle-1" });

    expect(invokeRequest).toHaveBeenCalledWith("activities:list-for-cycle", {
      unitCycleId: "cycle-1",
    });
  });

  it("invokes the story get channel with the request payload", async () => {
    vi.mocked(invokeRequest).mockResolvedValue({
      ok: true,
      value: {
        story: {
          instructions: "Read",
          advice: "Look closely",
          title: "A story",
          assetBase: null,
          passage: { pages: [] },
          assets: { imageRefs: [], audioRefs: [], videoRefs: [] },
          words: [],
          feedback: {
            question: "Was it easy or tough?",
            answers: ["🥰", "👌", "😓"],
            comment: "",
          },
          completion: { isCompleted: false },
        },
      },
    });

    await activitiesAdapter.getStoryActivity({
      learnerId: "learner-1",
      unitCycleActivityId: "activity-1",
    });

    expect(invokeRequest).toHaveBeenCalledWith("activities:story:get", {
      learnerId: "learner-1",
      unitCycleActivityId: "activity-1",
    });
  });

  it("invokes the story submit-feedback channel with the request payload", async () => {
    vi.mocked(invokeRequest).mockResolvedValue({
      ok: true,
      value: {
        completion: {
          isCompleted: true,
        },
      },
    });

    await activitiesAdapter.submitStoryFeedback({
      learnerId: "learner-1",
      unitCycleActivityId: "activity-1",
      selectedAnswer: "👌",
      comment: "Good pacing.",
    });

    expect(invokeRequest).toHaveBeenCalledWith("activities:story:submit-feedback", {
      learnerId: "learner-1",
      unitCycleActivityId: "activity-1",
      selectedAnswer: "👌",
      comment: "Good pacing.",
    });
  });
});
