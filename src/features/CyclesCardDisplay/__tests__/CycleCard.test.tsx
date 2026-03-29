import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CycleCard from "../CycleCard";

const { useCycleProgressQueryMock } = vi.hoisted(() => ({
  useCycleProgressQueryMock: vi.fn(),
}));

vi.mock("../hooks/useCycleProgressQuery", () => ({
  useCycleProgressQuery: useCycleProgressQueryMock,
}));

describe("CycleCard", () => {
  it("activates on click and keyboard input while keeping icon clicks local", () => {
    useCycleProgressQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    });

    const onSelectCycle = vi.fn();

    render(
      <CycleCard
        learnerId="learner-1"
        cycle={{
          unitCycleId: "cycle-1",
          unitId: "unit-1",
          cycleTypeId: 1,
          title: "Cycle Basics",
          description: "Start here",
          iconPath: null,
          sortOrder: 1,
          totalActivities: 4,
        }}
        onSelectCycle={onSelectCycle}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open Cycle Basics" }));
    expect(onSelectCycle).toHaveBeenCalledWith("cycle-1");

    fireEvent.keyDown(screen.getByRole("button", { name: "Open Cycle Basics" }), { key: "Enter" });
    fireEvent.keyDown(screen.getByRole("button", { name: "Open Cycle Basics" }), { key: " " });

    expect(onSelectCycle).toHaveBeenCalledTimes(3);

    fireEvent.click(screen.getByRole("button", { name: "View progress for Cycle Basics" }));

    expect(onSelectCycle).toHaveBeenCalledTimes(3);
  });
});

