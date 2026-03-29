import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import UnitFront from "../UnitFront";

const { useLearningUnitsQueryMock } = vi.hoisted(() => ({
  useLearningUnitsQueryMock: vi.fn(),
}));
const { useUnitProgressQueryMock } = vi.hoisted(() => ({
  useUnitProgressQueryMock: vi.fn(),
}));

vi.mock("@/features/UnitCardDisplay/hooks/useLearningUnitsQuery", () => ({
  useLearningUnitsQuery: useLearningUnitsQueryMock,
}));

vi.mock("@/features/UnitCardDisplay/hooks/useUnitProgressQuery", () => ({
  useUnitProgressQuery: useUnitProgressQueryMock,
}));

describe("UnitFront", () => {
  useUnitProgressQueryMock.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
  });

  it("renders loading, empty, and error states for a given learning type", () => {
    useLearningUnitsQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });

    const { rerender } = render(
      <UnitFront
        learnerId="learner-1"
        learningType="english"
        onEnterLearningMain={vi.fn()}
        onBackToLearningEntry={vi.fn()}
      />,
    );

    expect(screen.getByText("Loading English units...")).toBeTruthy();

    useLearningUnitsQueryMock.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });

    rerender(
      <UnitFront
        learnerId="learner-1"
        learningType="mathematics"
        onEnterLearningMain={vi.fn()}
        onBackToLearningEntry={vi.fn()}
      />,
    );

    expect(screen.getByText("No Mathematics units are available yet.")).toBeTruthy();

    useLearningUnitsQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Unable to load Mathematics units."),
    });

    rerender(
      <UnitFront
        learnerId="learner-1"
        learningType="mathematics"
        onEnterLearningMain={vi.fn()}
        onBackToLearningEntry={vi.fn()}
      />,
    );

    expect(screen.getByText("Unable to load Mathematics units.")).toBeTruthy();
  });

  it("renders unit cards and forwards the selected unit id with the learning type", () => {
    const onEnterLearningMain = vi.fn();

    useLearningUnitsQueryMock.mockReturnValue({
      data: [
        {
          unitId: "unit-1",
          title: "Basics",
          description: "Start here",
          iconPath: null,
          sortOrder: 1,
          learningType: "english",
        },
        {
          unitId: "unit-2",
          title: "Stories",
          description: null,
          iconPath: null,
          sortOrder: 2,
          learningType: "english",
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    });

    render(
      <UnitFront
        learnerId="learner-1"
        learningType="english"
        onEnterLearningMain={onEnterLearningMain}
        onBackToLearningEntry={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open Basics" }));

    expect(onEnterLearningMain).toHaveBeenCalledWith("learner-1", "english", "unit-1");
    expect(screen.getByText("Start here")).toBeTruthy();
  });
});
