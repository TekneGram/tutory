import { activitiesAdapter } from "@/app/adapters/activities.adapters";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type {
  ResetObserveActivityRequest,
  ResetObserveActivityResponse,
} from "@/app/ports/activities/observe.ports";

export async function resetObserveActivity(
  request: ResetObserveActivityRequest,
): Promise<ResetObserveActivityResponse> {
  const result = await activitiesAdapter.resetObserveActivity(request);

  if (!result.ok) {
    throw new FrontAppError(result.error);
  }

  return result.value;
}
