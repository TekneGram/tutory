import { describe, expect, it, vi } from "vitest";
import { cyclesAdapter } from "@/app/adapters/cycles.adapters";
import { getCycleProgress } from "../getCycleProgress.service";

vi.mock("@/app/adapters/cycles.adapters", () => ({
  cyclesAdapter: {
    getCycleProgress: vi.fn(),
  },
}));

describe("getCycleProgress", () => {
  it("returns the hover progress DTO from the backend response", async () => {
    vi.mocked(cyclesAdapter.getCycleProgress).mockResolvedValue({
      ok: true,
      value: {
        cycle: {
          unitCycleId: "cycle-1",
          unitId: "unit-1",
          title: "Cycle Basics",
        },
        progress: {
          learnerId: "learner-1",
          unitCycleId: "cycle-1",
          completedActivities: 3,
          totalActivities: 12,
          completionPercent: 25,
          startedActivities: 4,
          notStartedActivities: 8,
        },
      },
    });

    await expect(
      getCycleProgress({
        learnerId: "learner-1",
        unitCycleId: "cycle-1",
      }),
    ).resolves.toEqual({
      cycle: {
        unitCycleId: "cycle-1",
        unitId: "unit-1",
        title: "Cycle Basics",
      },
      progress: {
        learnerId: "learner-1",
        unitCycleId: "cycle-1",
        completedActivities: 3,
        totalActivities: 12,
        completionPercent: 25,
        startedActivities: 4,
        notStartedActivities: 8,
      },
    });
  });

  it("throws the backend error message when the request fails", async () => {
    vi.mocked(cyclesAdapter.getCycleProgress).mockResolvedValue({
      ok: false,
      error: {
        kind: "validation",
        userMessage: "Cycle progress unavailable",
      },
    });

    await expect(
      getCycleProgress({
        learnerId: "learner-1",
        unitCycleId: "cycle-1",
      }),
    ).rejects.toThrow("Cycle progress unavailable");
  });
});

