import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ActivityContainer from "../ActivityContainer";
import { activityComponentRegistry } from "../registry/activityComponentRegistry";

vi.mock("@/features/StoryActivity/StoryActivity", () => ({
  default: (props: { unitCycleActivityId: string }) => (
    <div data-testid="story-activity">story:{props.unitCycleActivityId}</div>
  ),
}));

describe("ActivityContainer", () => {
  it("contains the full known activity registry", () => {
    expect(Object.keys(activityComponentRegistry)).toEqual([
      "story",
      "multi-choice-quiz",
      "vocab-review",
      "write-extra",
      "observe",
      "observe-describe",
      "read-model",
      "free-writing",
      "topic-prediction",
      "research",
      "text-question-answer",
      "writing-scaffold",
      "reflection-survey",
    ]);
  });

  it("renders a placeholder when no activity is selected", () => {
    render(
      <ActivityContainer
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
        activity={null}
      />,
    );

    expect(screen.getByText("Select an activity to begin.")).toBeTruthy();
  });

  it("resolves activityType to the registered component and passes shared props", () => {
    render(
      <ActivityContainer
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
        activity={{
          unitCycleActivityId: "activity-1",
          unitCycleId: "cycle-1",
          activityType: "story",
          title: "Story",
          activityOrder: 1,
          isRequired: true,
        }}
      />,
    );

    expect(screen.getByTestId("story-activity").textContent).toBe("story:activity-1");
  });
});
