import { cleanup, render, screen, fireEvent, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import UnitCycles from "../UnitCycles";

const { useUnitCyclesQueryMock } = vi.hoisted(() => ({
  useUnitCyclesQueryMock: vi.fn(),
}));
const cyclesCardDisplaySpy = vi.fn();

vi.mock("@/features/CyclesCardDisplay/hooks/useUnitCyclesQuery", () => ({
  useUnitCyclesQuery: useUnitCyclesQueryMock,
}));

vi.mock("@/features/CyclesCardDisplay/CyclesCardDisplay", () => ({
  default: (props: {
    learnerId: string;
    cycles: Array<{ unitCycleId: string; title: string }>;
    onSelectCycle: (unitCycleId: string) => void;
  }) => {
    cyclesCardDisplaySpy(props);

    return (
      <div className="mock-cycles-card-display">
        <span className="mock-cycles-card-display-learner-id">{props.learnerId}</span>
        <span className="mock-cycles-card-display-cycle-count">{props.cycles.length}</span>
        <button
          className="mock-cycles-card-display-select"
          type="button"
          onClick={() => props.onSelectCycle("cycle-1")}
        >
          select-cycle
        </button>
      </div>
    );
  },
}));

describe("UnitCycles", () => {
  afterEach(() => {
    cleanup();
    cyclesCardDisplaySpy.mockReset();
  });

  it("renders loading, empty, and error states for a given learning type", () => {
    useUnitCyclesQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });

    const { rerender } = render(
      <UnitCycles
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        onEnterLearningMain={vi.fn()}
        onBackToUnitFront={vi.fn()}
      />,
    );

    expect(screen.getByText("Loading cycles...")).toBeTruthy();

    useUnitCyclesQueryMock.mockReturnValue({
      data: {
        unit: {
          unitId: "unit-1",
          title: "Basics",
          learningType: "mathematics",
        },
        cycles: [],
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    rerender(
      <UnitCycles
        learnerId="learner-1"
        learningType="mathematics"
        unitId="unit-1"
        onEnterLearningMain={vi.fn()}
        onBackToUnitFront={vi.fn()}
      />,
    );

    expect(screen.getByText("No cycles are available for this unit yet.")).toBeTruthy();
    expect(screen.getByText("Unit: Basics")).toBeTruthy();

    useUnitCyclesQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Unable to load cycles for this unit."),
    });

    rerender(
      <UnitCycles
        learnerId="learner-1"
        learningType="mathematics"
        unitId="unit-1"
        onEnterLearningMain={vi.fn()}
        onBackToUnitFront={vi.fn()}
      />,
    );

    expect(screen.getByText("Unable to load cycles for this unit.")).toBeTruthy();
  });

  it("renders cycle cards and forwards the selected cycle id with the unit metadata", () => {
    const onEnterLearningMain = vi.fn();
    const onBackToUnitFront = vi.fn();

    useUnitCyclesQueryMock.mockReturnValue({
      data: {
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
            description: "Start here",
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
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    const { container } = render(
      <UnitCycles
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        onEnterLearningMain={onEnterLearningMain}
        onBackToUnitFront={onBackToUnitFront}
      />,
    );

    expect(cyclesCardDisplaySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        learnerId: "learner-1",
        cycles: expect.arrayContaining([
          expect.objectContaining({ unitCycleId: "cycle-1" }),
          expect.objectContaining({ unitCycleId: "cycle-2" }),
        ]),
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "select-cycle" }));

    expect(onEnterLearningMain).toHaveBeenCalledWith("learner-1", "english", "unit-1", "cycle-1");

    fireEvent.click(within(container).getByRole("button", { name: "Back to unit selection" }));

    expect(onBackToUnitFront).toHaveBeenCalledWith("learner-1", "english");
  });
});
