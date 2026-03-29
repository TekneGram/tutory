import { describe, expect, it, vi } from "vitest";
import { unitsAdapter } from "@/app/adapters/units.adapters";
import { getUnitProgress } from "../getUnitProgress.service";

vi.mock("@/app/adapters/units.adapters", () => ({
  unitsAdapter: {
    getUnitProgress: vi.fn(),
  },
}));

describe("getUnitProgress", () => {
  it("returns the hover progress DTO from the backend response", async () => {
    vi.mocked(unitsAdapter.getUnitProgress).mockResolvedValue({
      ok: true,
      value: {
        unit: {
          unitId: "unit-1",
          title: "Basics",
        },
        progress: {
          learnerId: "learner-1",
          unitId: "unit-1",
          completedActivities: 3,
          totalActivities: 12,
          completionPercent: 25,
          startedActivities: 4,
          notStartedActivities: 8,
        },
      },
    });

    await expect(
      getUnitProgress({
        learnerId: "learner-1",
        unitId: "unit-1",
      }),
    ).resolves.toEqual({
      unit: {
        unitId: "unit-1",
        title: "Basics",
      },
      progress: {
        learnerId: "learner-1",
        unitId: "unit-1",
        completedActivities: 3,
        totalActivities: 12,
        completionPercent: 25,
        startedActivities: 4,
        notStartedActivities: 8,
      },
    });
  });

  it("throws the backend error message when the request fails", async () => {
    vi.mocked(unitsAdapter.getUnitProgress).mockResolvedValue({
      ok: false,
      error: {
        kind: "validation",
        userMessage: "Unit progress unavailable",
      },
    });

    await expect(
      getUnitProgress({
        learnerId: "learner-1",
        unitId: "unit-1",
      }),
    ).rejects.toThrow("Unit progress unavailable");
  });
});
