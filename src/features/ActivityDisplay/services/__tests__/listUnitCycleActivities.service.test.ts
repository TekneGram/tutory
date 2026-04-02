import { describe, expect, it, vi } from "vitest";
import { activitiesAdapter } from "@/app/adapters/activities.adapters";
import { listUnitCycleActivities } from "../listUnitCycleActivities.service";

vi.mock("@/app/adapters/activities.adapters", () => ({
  activitiesAdapter: {
    listUnitCycleActivities: vi.fn(),
  },
}));

describe("listUnitCycleActivities", () => {
  it("returns activities sorted by activityOrder", async () => {
    vi.mocked(activitiesAdapter.listUnitCycleActivities).mockResolvedValue({
      ok: true,
      value: {
        cycle: {
          unitCycleId: "cycle-1",
          unitId: "unit-1",
          title: "Cycle 1",
        },
        activities: [
          {
            unitCycleActivityId: "activity-2",
            unitCycleId: "cycle-1",
            activityType: "story",
            title: "Second",
            activityOrder: 2,
            isRequired: true,
          },
          {
            unitCycleActivityId: "activity-1",
            unitCycleId: "cycle-1",
            activityType: "observe",
            title: "First",
            activityOrder: 1,
            isRequired: false,
          },
        ],
      },
    });

    await expect(listUnitCycleActivities({ unitCycleId: "cycle-1" })).resolves.toEqual({
      cycle: {
        unitCycleId: "cycle-1",
        unitId: "unit-1",
        title: "Cycle 1",
      },
      activities: [
        {
          unitCycleActivityId: "activity-1",
          unitCycleId: "cycle-1",
          activityType: "observe",
          title: "First",
          activityOrder: 1,
          isRequired: false,
        },
        {
          unitCycleActivityId: "activity-2",
          unitCycleId: "cycle-1",
          activityType: "story",
          title: "Second",
          activityOrder: 2,
          isRequired: true,
        },
      ],
    });
  });

  it("throws the backend error message when loading fails", async () => {
    vi.mocked(activitiesAdapter.listUnitCycleActivities).mockResolvedValue({
      ok: false,
      error: {
        kind: "processing",
        userMessage: "Unable to load activities",
      },
    });

    await expect(listUnitCycleActivities({ unitCycleId: "cycle-1" })).rejects.toThrow(
      "Unable to load activities",
    );
  });
});
