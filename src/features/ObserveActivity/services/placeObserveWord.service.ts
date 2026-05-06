import { activitiesAdapter } from "@/app/adapters/activities.adapters";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type {
  PlaceObserveWordRequest,
  PlaceObserveWordResponse,
} from "@/app/ports/activities/observe.ports";

export async function placeObserveWord(
  request: PlaceObserveWordRequest,
): Promise<PlaceObserveWordResponse> {
  const result = await activitiesAdapter.placeObserveWord(request);

  if (!result.ok) {
    throw new FrontAppError(result.error);
  }

  return result.value;
}
