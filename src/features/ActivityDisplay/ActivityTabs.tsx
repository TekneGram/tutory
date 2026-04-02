import ActivityTab from "./ActivityTab";
import type { UnitCycleActivityListItemDto } from "@/app/ports/activities.ports";

type ActivityTabsProps = {
  activities: UnitCycleActivityListItemDto[];
  selectedActivityId: string | null;
  onSelectActivity: (unitCycleActivityId: string) => void;
};

const ActivityTabs = ({
  activities,
  selectedActivityId,
  onSelectActivity,
}: ActivityTabsProps) => {
  return (
    <div aria-label="Cycle activities" className="activity-display-tabs" role="tablist">
      {activities.map((activity) => (
        <ActivityTab
          key={activity.unitCycleActivityId}
          activity={activity}
          isSelected={activity.unitCycleActivityId === selectedActivityId}
          onSelect={onSelectActivity}
        />
      ))}
    </div>
  );
};

export default ActivityTabs;
