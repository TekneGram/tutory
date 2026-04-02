import type { UnitCycleActivityListItemDto } from "@/app/ports/activities.ports";

type ActivityTabProps = {
  activity: UnitCycleActivityListItemDto;
  isSelected: boolean;
  onSelect: (unitCycleActivityId: string) => void;
};

const ActivityTab = ({ activity, isSelected, onSelect }: ActivityTabProps) => {
  return (
    <button
      aria-selected={isSelected}
      className="activity-display-tab"
      role="tab"
      type="button"
      onClick={() => onSelect(activity.unitCycleActivityId)}
    >
      {activity.title}
    </button>
  );
};

export default ActivityTab;
