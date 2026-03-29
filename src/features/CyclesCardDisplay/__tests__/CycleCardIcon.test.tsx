import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CycleCardIcon from "../CycleCardIcon";

const { useCycleProgressQueryMock } = vi.hoisted(() => ({
  useCycleProgressQueryMock: vi.fn(),
}));

vi.mock("../hooks/useCycleProgressQuery", () => ({
  useCycleProgressQuery: useCycleProgressQueryMock,
}));

describe("CycleCardIcon", () => {
  it("requests progress on hover and focus", () => {
    useCycleProgressQueryMock.mockImplementation((args: { enabled: boolean }) => {
      if (!args.enabled) {
        return {
          data: undefined,
          isLoading: false,
          isError: false,
          error: null,
        };
      }

      return {
        data: {
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
        isLoading: false,
        isError: false,
        error: null,
      };
    });

    render(
      <CycleCardIcon
        learnerId="learner-1"
        cycle={{
          unitCycleId: "cycle-1",
          title: "Cycle Basics",
          iconPath: null,
        }}
      />,
    );

    const trigger = screen.getByRole("button", { name: "View progress for Cycle Basics" });

    expect(screen.queryByText("3 of 12 activities completed")).toBeNull();

    fireEvent.mouseEnter(trigger);

    expect(useCycleProgressQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        learnerId: "learner-1",
        unitCycleId: "cycle-1",
        enabled: true,
      }),
    );
    expect(screen.getByText("3 of 12 activities completed")).toBeTruthy();

    fireEvent.mouseLeave(trigger);

    expect(screen.queryByText("3 of 12 activities completed")).toBeNull();

    fireEvent.focus(trigger);

    expect(useCycleProgressQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
      }),
    );
  });
});

