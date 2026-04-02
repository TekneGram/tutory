import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ActivityTabs from "../ActivityTabs";

describe("ActivityTabs", () => {
  it("renders one tab per activity using the backend title and reports selection", () => {
    const onSelectActivity = vi.fn();

    render(
      <ActivityTabs
        activities={[
          {
            unitCycleActivityId: "activity-1",
            unitCycleId: "cycle-1",
            activityType: "story",
            title: "Story time",
            activityOrder: 1,
            isRequired: true,
          },
          {
            unitCycleActivityId: "activity-2",
            unitCycleId: "cycle-1",
            activityType: "observe",
            title: "Look closely",
            activityOrder: 2,
            isRequired: false,
          },
        ]}
        selectedActivityId="activity-1"
        onSelectActivity={onSelectActivity}
      />,
    );

    const tabs = screen.getAllByRole("tab");

    expect(tabs).toHaveLength(2);
    expect(screen.getByRole("tab", { name: "Story time" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tab", { name: "Look closely" }).getAttribute("aria-selected")).toBe(
      "false",
    );

    fireEvent.click(screen.getByRole("tab", { name: "Look closely" }));

    expect(onSelectActivity).toHaveBeenCalledWith("activity-2");
  });
});
