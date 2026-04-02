import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ActivityDisplay from "../ActivityDisplay";

const { useUnitCycleActivitiesQueryMock } = vi.hoisted(() => ({
  useUnitCycleActivitiesQueryMock: vi.fn(),
}));
const activityContainerSpy = vi.fn();

vi.mock("../hooks/useUnitCycleActivitiesQuery", () => ({
  useUnitCycleActivitiesQuery: useUnitCycleActivitiesQueryMock,
}));

vi.mock("../ActivityContainer", () => ({
  default: (props: { activity: { unitCycleActivityId: string } | null }) => {
    activityContainerSpy(props);

    return (
      <div data-testid="activity-container">
        {props.activity === null ? "none" : props.activity.unitCycleActivityId}
      </div>
    );
  },
}));

describe("ActivityDisplay", () => {
  afterEach(() => {
    cleanup();
    activityContainerSpy.mockReset();
  });

  it("renders loading, error, and empty states", () => {
    useUnitCycleActivitiesQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });

    const { rerender } = render(
      <ActivityDisplay
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
      />,
    );

    expect(screen.getByText("Loading activities...")).toBeTruthy();

    useUnitCycleActivitiesQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Unable to load activities."),
    });

    rerender(
      <ActivityDisplay
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
      />,
    );

    expect(screen.getByText("Unable to load activities.")).toBeTruthy();

    useUnitCycleActivitiesQueryMock.mockReturnValue({
      data: {
        cycle: {
          unitCycleId: "cycle-1",
          unitId: "unit-1",
          title: "Cycle 1",
        },
        activities: [],
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    rerender(
      <ActivityDisplay
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
      />,
    );

    expect(screen.getByText("No activities are available for this cycle yet.")).toBeTruthy();
  });

  it("defaults to the first activity, allows tab selection, and falls back when selection disappears", () => {
    useUnitCycleActivitiesQueryMock.mockReturnValue({
      data: {
        cycle: {
          unitCycleId: "cycle-1",
          unitId: "unit-1",
          title: "Cycle 1",
        },
        activities: [
          {
            unitCycleActivityId: "activity-1",
            unitCycleId: "cycle-1",
            activityType: "story",
            title: "Story",
            activityOrder: 1,
            isRequired: true,
          },
          {
            unitCycleActivityId: "activity-2",
            unitCycleId: "cycle-1",
            activityType: "observe",
            title: "Observe",
            activityOrder: 2,
            isRequired: false,
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    const { rerender } = render(
      <ActivityDisplay
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
      />,
    );

    expect(screen.getByTestId("activity-container").textContent).toBe("activity-1");
    expect(screen.getByRole("tab", { name: "Story" }).getAttribute("aria-selected")).toBe("true");

    fireEvent.click(screen.getByRole("tab", { name: "Observe" }));

    expect(screen.getByTestId("activity-container").textContent).toBe("activity-2");
    expect(screen.getByRole("tab", { name: "Observe" }).getAttribute("aria-selected")).toBe(
      "true",
    );

    useUnitCycleActivitiesQueryMock.mockReturnValue({
      data: {
        cycle: {
          unitCycleId: "cycle-1",
          unitId: "unit-1",
          title: "Cycle 1",
        },
        activities: [
          {
            unitCycleActivityId: "activity-3",
            unitCycleId: "cycle-1",
            activityType: "read-model",
            title: "Read model",
            activityOrder: 1,
            isRequired: true,
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    rerender(
      <ActivityDisplay
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
      />,
    );

    expect(screen.getByTestId("activity-container").textContent).toBe("activity-3");
    expect(screen.getByRole("tab", { name: "Read model" }).getAttribute("aria-selected")).toBe(
      "true",
    );
  });
});
