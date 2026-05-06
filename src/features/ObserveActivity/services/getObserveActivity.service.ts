import { activitiesAdapter } from "@/app/adapters/activities.adapters";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type {
  GetObserveActivityRequest,
  GetObserveActivityResponse,
} from "@/app/ports/activities/observe.ports";

export async function getObserveActivity(
  request: GetObserveActivityRequest,
): Promise<GetObserveActivityResponse> {
  const result = await activitiesAdapter.getObserveActivity(request);

  if (!result.ok) {
    throw new FrontAppError(result.error);
  }

  return result.value;
}
