import { activitiesAdapter } from "@/app/adapters/activities.adapters";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type {
  ListUnitCycleActivitiesRequest,
  ListUnitCycleActivitiesResponse,
} from "@/app/ports/activities.ports";

export async function listUnitCycleActivities(
  request: ListUnitCycleActivitiesRequest,
): Promise<ListUnitCycleActivitiesResponse> {
  const result = await activitiesAdapter.listUnitCycleActivities(request);

  if (!result.ok) {
    throw new FrontAppError(result.error);
  }

  return {
    cycle: result.value.cycle,
    activities: [...result.value.activities].sort(
      (left, right) => left.activityOrder - right.activityOrder,
    ),
  };
}
