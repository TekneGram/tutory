
import { useEffect, useMemo, useState } from "react";
import ActivityContainer from "./ActivityContainer";
import ActivityTabs from "./ActivityTabs";
import { useUnitCycleActivitiesQuery } from "./hooks/useUnitCycleActivitiesQuery";
import type { LearningType } from "@/app/types/learning";

type ActivityDisplayProps = {
  learnerId: string;
  learningType: LearningType;
  unitId: string;
  unitCycleId: string;
};

const ActivityDisplay = ({
  learnerId,
  learningType,
  unitId,
  unitCycleId,
}: ActivityDisplayProps) => {
  const query = useUnitCycleActivitiesQuery(unitCycleId);
  const activities = query.data?.activities ?? [];
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  useEffect(() => {
    if (activities.length === 0) {
      setSelectedActivityId(null);
      return;
    }

    setSelectedActivityId((currentSelectedActivityId) => {
      if (
        currentSelectedActivityId !== null &&
        activities.some((activity) => activity.unitCycleActivityId === currentSelectedActivityId)
      ) {
        return currentSelectedActivityId;
      }

      return activities[0].unitCycleActivityId;
    });
  }, [activities]);

  const selectedActivity = useMemo(
    () =>
      activities.find((activity) => activity.unitCycleActivityId === selectedActivityId) ?? null,
    [activities, selectedActivityId],
  );

  if (query.isLoading) {
    return (
      <section className="activity-display activity-display-loading" aria-live="polite">
        <div className="activity-display-state activity-display-state-loading">
          Loading activities...
        </div>
      </section>
    );
  }

  if (query.isError) {
    const message = query.error instanceof Error ? query.error.message : "Unable to load activities.";

    return (
      <section className="activity-display activity-display-error" aria-live="polite">
        <div className="activity-display-state activity-display-state-error">{message}</div>
      </section>
    );
  }

  if (activities.length === 0) {
    return (
      <section className="activity-display activity-display-empty" aria-live="polite">
        <div className="activity-display-state activity-display-state-empty">
          No activities are available for this cycle yet.
        </div>
      </section>
    );
  }

  return (
    <section className="activity-display" aria-label="Activity display">
      <ActivityTabs
        activities={activities}
        selectedActivityId={selectedActivityId}
        onSelectActivity={setSelectedActivityId}
      />
      <ActivityContainer
        learnerId={learnerId}
        learningType={learningType}
        unitId={unitId}
        unitCycleId={unitCycleId}
        activity={selectedActivity}
      />
    </section>
  );
};

export default ActivityDisplay;
