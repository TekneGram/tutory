import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LearningMain from "../LearningMain";

const activityDisplaySpy = vi.fn();

vi.mock("@/features/ActivityDisplay/ActivityDisplay", () => ({
  default: (props: {
    learnerId: string;
    learningType: string;
    unitId: string;
    unitCycleId: string;
  }) => {
    activityDisplaySpy(props);
    return <div>mock-activity-display</div>;
  },
}));

describe("LearningMain", () => {
  it("passes the learning route props into ActivityDisplay", () => {
    render(
      <LearningMain
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
        onBackToUnitCycles={vi.fn()}
      />,
    );

    expect(activityDisplaySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        learnerId: "learner-1",
        learningType: "english",
        unitId: "unit-1",
        unitCycleId: "cycle-1",
      }),
    );
  });
});
