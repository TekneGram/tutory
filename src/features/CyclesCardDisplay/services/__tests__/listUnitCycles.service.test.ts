import { describe, expect, it, vi } from "vitest";
import { cyclesAdapter } from "@/app/adapters/cycles.adapters";
import { listUnitCycles } from "../listUnitCycles.service";

vi.mock("@/app/adapters/cycles.adapters", () => ({
  cyclesAdapter: {
    listUnitCycles: vi.fn(),
  },
}));

describe("listUnitCycles", () => {
  it("returns cycles sorted by sortOrder and preserves the unit payload", async () => {
    vi.mocked(cyclesAdapter.listUnitCycles).mockResolvedValue({
      ok: true,
      value: {
        unit: {
          unitId: "unit-1",
          title: "Basics",
          learningType: "english",
        },
        cycles: [
          {
            unitCycleId: "cycle-2",
            unitId: "unit-1",
            cycleTypeId: 2,
            title: "Cycle 2",
            description: null,
            iconPath: null,
            sortOrder: 2,
            totalActivities: 8,
          },
          {
            unitCycleId: "cycle-1",
            unitId: "unit-1",
            cycleTypeId: 1,
            title: "Cycle 1",
            description: "First cycle",
            iconPath: null,
            sortOrder: 1,
            totalActivities: 4,
          },
        ],
      },
    });

    await expect(listUnitCycles({ unitId: "unit-1" })).resolves.toEqual({
      unit: {
        unitId: "unit-1",
        title: "Basics",
        learningType: "english",
      },
      cycles: [
        {
          unitCycleId: "cycle-1",
          unitId: "unit-1",
          cycleTypeId: 1,
          title: "Cycle 1",
          description: "First cycle",
          iconPath: null,
          sortOrder: 1,
          totalActivities: 4,
        },
        {
          unitCycleId: "cycle-2",
          unitId: "unit-1",
          cycleTypeId: 2,
          title: "Cycle 2",
          description: null,
          iconPath: null,
          sortOrder: 2,
          totalActivities: 8,
        },
      ],
    });
  });

  it("throws the backend error message when loading fails", async () => {
    vi.mocked(cyclesAdapter.listUnitCycles).mockResolvedValue({
      ok: false,
      error: {
        kind: "processing",
        userMessage: "Unable to load cycles",
      },
    });

    await expect(listUnitCycles({ unitId: "unit-1" })).rejects.toThrow("Unable to load cycles");
  });
});

