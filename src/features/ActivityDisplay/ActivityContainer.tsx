import type { UnitCycleActivityListItemDto } from "@/app/ports/activities.ports";
import type { LearningType } from "@/app/types/learning";
import { activityComponentRegistry } from "./registry/activityComponentRegistry";

type ActivityContainerProps = {
  learnerId: string;
  learningType: LearningType;
  unitId: string;
  unitCycleId: string;
  activity: UnitCycleActivityListItemDto | null;
};

const ActivityContainer = ({
  learnerId,
  learningType,
  unitId,
  unitCycleId,
  activity,
}: ActivityContainerProps) => {
  if (activity === null) {
    return (
      <section aria-live="polite" className="activity-display-container activity-display-container-empty">
        Select an activity to begin.
      </section>
    );
  }

  const ActivityComponent = activityComponentRegistry[activity.activityType];

  return (
    <section className="activity-display-container">
      <ActivityComponent
        learnerId={learnerId}
        learningType={learningType}
        unitId={unitId}
        unitCycleId={unitCycleId}
        unitCycleActivityId={activity.unitCycleActivityId}
      />
    </section>
  );
};

export default ActivityContainer;
