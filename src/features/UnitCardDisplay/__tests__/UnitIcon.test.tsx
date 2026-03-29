import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import UnitIcon from "../UnitIcon";

const { useUnitProgressQueryMock } = vi.hoisted(() => ({
  useUnitProgressQueryMock: vi.fn(),
}));

vi.mock("../hooks/useUnitProgressQuery", () => ({
  useUnitProgressQuery: useUnitProgressQueryMock,
}));

describe("UnitIcon", () => {
  it("requests progress on hover and focus", () => {
    useUnitProgressQueryMock.mockImplementation((args: { enabled: boolean }) => {
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
        isLoading: false,
        isError: false,
        error: null,
      };
    });

    render(
      <UnitIcon
        learnerId="learner-1"
        unit={{
          unitId: "unit-1",
          title: "Basics",
          iconPath: null,
        }}
      />,
    );

    const trigger = screen.getByRole("button", { name: "View progress for Basics" });

    expect(screen.queryByText("Basics")).toBeNull();

    fireEvent.mouseEnter(trigger);

    expect(useUnitProgressQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        learnerId: "learner-1",
        unitId: "unit-1",
        enabled: true,
      }),
    );
    expect(screen.getByText("3 of 12 activities completed")).toBeTruthy();

    fireEvent.mouseLeave(trigger);

    expect(screen.queryByText("3 of 12 activities completed")).toBeNull();

    fireEvent.focus(trigger);

    expect(useUnitProgressQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
      }),
    );
  });
});
