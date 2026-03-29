import { describe, expect, it, vi } from "vitest";
import { learnersAdapter } from "@/app/adapters/learners.adapters";
import { listLearners } from "../listLearners.service";

vi.mock("@/app/adapters/learners.adapters", () => ({
  learnersAdapter: {
    listLearners: vi.fn(),
  },
}));

describe("listLearners", () => {
  it("returns learner card DTOs from the backend response", async () => {
    vi.mocked(learnersAdapter.listLearners).mockResolvedValue({
      ok: true,
      value: {
        learners: [
          {
            learnerId: "learner-1",
            name: "Avery",
            avatarId: "girl_1.webp",
            currentStatus: "super happy",
          },
        ],
      },
    });

    await expect(listLearners()).resolves.toEqual([
      {
        learnerId: "learner-1",
        name: "Avery",
        avatarId: "girl_1.webp",
        currentStatus: "super happy",
      },
    ]);
  });

  it("throws when the backend returns an error result", async () => {
    vi.mocked(learnersAdapter.listLearners).mockResolvedValue({
      ok: false,
      error: {
        kind: "validation",
        userMessage: "No learners found",
      },
    });

    await expect(listLearners()).rejects.toThrow("No learners found");
  });
});
