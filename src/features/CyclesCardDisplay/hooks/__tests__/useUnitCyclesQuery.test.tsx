import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useUnitCyclesQuery, unitCyclesQueryKey } from "../useUnitCyclesQuery";

const { useQueryMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

describe("useUnitCyclesQuery", () => {
  it("uses the canonical query key", () => {
    useQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    });

    renderHook(() => useUnitCyclesQuery("unit-1"));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: unitCyclesQueryKey("unit-1"),
      }),
    );
  });
});

