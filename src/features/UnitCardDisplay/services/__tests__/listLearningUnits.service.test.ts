import { describe, expect, it, vi } from "vitest";
import { unitsAdapter } from "@/app/adapters/units.adapters";
import { listLearningUnits } from "../listLearningUnits.service";

vi.mock("@/app/adapters/units.adapters", () => ({
  unitsAdapter: {
    listLearningUnits: vi.fn(),
  },
}));

describe("listLearningUnits", () => {
  it("returns units sorted by sortOrder", async () => {
    vi.mocked(unitsAdapter.listLearningUnits).mockResolvedValue({
      ok: true,
      value: {
        units: [
          {
            unitId: "unit-2",
            title: "Unit 2",
            description: null,
            iconPath: null,
            sortOrder: 2,
            learningType: "english",
          },
          {
            unitId: "unit-1",
            title: "Unit 1",
            description: "First unit",
            iconPath: null,
            sortOrder: 1,
            learningType: "english",
          },
        ],
      },
    });

    await expect(listLearningUnits({ learningType: "english" })).resolves.toEqual([
      {
        unitId: "unit-1",
        title: "Unit 1",
        description: "First unit",
        iconPath: null,
        sortOrder: 1,
        learningType: "english",
      },
      {
        unitId: "unit-2",
        title: "Unit 2",
        description: null,
        iconPath: null,
        sortOrder: 2,
        learningType: "english",
      },
    ]);
  });

  it("throws the backend error message when loading fails", async () => {
    vi.mocked(unitsAdapter.listLearningUnits).mockResolvedValue({
      ok: false,
      error: {
        kind: "processing",
        userMessage: "Unable to load units",
      },
    });

    await expect(listLearningUnits({ learningType: "mathematics" })).rejects.toThrow("Unable to load units");
  });
});
