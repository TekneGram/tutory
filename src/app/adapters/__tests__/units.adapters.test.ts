import { describe, expect, it, vi } from "vitest";
import { unitsAdapter } from "../units.adapters";
import { invokeRequest } from "../invokeRequest";

vi.mock("../invokeRequest", () => ({
  invokeRequest: vi.fn(),
}));

describe("unitsAdapter", () => {
  it("invokes the canonical list channel with the request payload", async () => {
    vi.mocked(invokeRequest).mockResolvedValue({ ok: true, value: { units: [] } });

    await unitsAdapter.listLearningUnits({ learningType: "english" });

    expect(invokeRequest).toHaveBeenCalledWith("units:list", {
      learningType: "english",
    });
  });

  it("invokes the canonical progress channel with the request payload", async () => {
    vi.mocked(invokeRequest).mockResolvedValue({
      ok: true,
      value: {
        unit: {
          unitId: "unit-1",
          title: "Basics",
        },
        progress: {
          learnerId: "learner-1",
          unitId: "unit-1",
          completedActivities: 0,
          totalActivities: 0,
          completionPercent: 0,
          startedActivities: 0,
          notStartedActivities: 0,
        },
      },
    });

    await unitsAdapter.getUnitProgress({
      learnerId: "learner-1",
      unitId: "unit-1",
    });

    expect(invokeRequest).toHaveBeenCalledWith("units:get-progress", {
      learnerId: "learner-1",
      unitId: "unit-1",
    });
  });
});
