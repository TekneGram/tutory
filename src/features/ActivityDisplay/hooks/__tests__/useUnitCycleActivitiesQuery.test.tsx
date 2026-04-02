import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  useUnitCycleActivitiesQuery,
  unitCycleActivitiesQueryKey,
} from "../useUnitCycleActivitiesQuery";

const { useQueryMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

describe("useUnitCycleActivitiesQuery", () => {
  it("uses the canonical query key", () => {
    useQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    });

    renderHook(() => useUnitCycleActivitiesQuery("cycle-1"));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: unitCycleActivitiesQueryKey("cycle-1"),
      }),
    );
  });
});
