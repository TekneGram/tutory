import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCycleProgressQuery, cycleProgressQueryKey } from "../useCycleProgressQuery";

const { useQueryMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

describe("useCycleProgressQuery", () => {
  it("uses the canonical query key and disabled-by-default hover fetch", () => {
    useQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    });

    renderHook(() =>
      useCycleProgressQuery({
        learnerId: "learner-1",
        unitCycleId: "cycle-1",
        enabled: false,
      }),
    );

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: cycleProgressQueryKey("learner-1", "cycle-1"),
        enabled: false,
        retry: 0,
      }),
    );
  });
});

