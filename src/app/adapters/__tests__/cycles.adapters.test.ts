import { describe, expect, it, vi } from "vitest";
import { cyclesAdapter } from "../cycles.adapters";
import { invokeRequest } from "../invokeRequest";

vi.mock("../invokeRequest", () => ({
  invokeRequest: vi.fn(),
}));

describe("cyclesAdapter", () => {
  it("invokes the canonical list channel with the request payload", async () => {
    vi.mocked(invokeRequest).mockResolvedValue({ ok: true, value: { unit: { unitId: "unit-1", title: "Basics", learningType: "english" }, cycles: [] } });

    await cyclesAdapter.listUnitCycles({ unitId: "unit-1" });

    expect(invokeRequest).toHaveBeenCalledWith("cycles:list-for-unit", {
      unitId: "unit-1",
    });
  });

  it("invokes the canonical progress channel with the request payload", async () => {
    vi.mocked(invokeRequest).mockResolvedValue({
      ok: true,
      value: {
        cycle: {
          unitCycleId: "cycle-1",
          unitId: "unit-1",
          title: "Cycle 1",
        },
        progress: {
          learnerId: "learner-1",
          unitCycleId: "cycle-1",
          completedActivities: 1,
          totalActivities: 4,
          completionPercent: 25,
          startedActivities: 1,
          notStartedActivities: 3,
        },
      },
    });

    await cyclesAdapter.getCycleProgress({
      learnerId: "learner-1",
      unitCycleId: "cycle-1",
    });

    expect(invokeRequest).toHaveBeenCalledWith("cycles:get-progress", {
      learnerId: "learner-1",
      unitCycleId: "cycle-1",
    });
  });
});

