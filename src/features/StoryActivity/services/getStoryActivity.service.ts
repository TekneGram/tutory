import { activitiesAdapter } from "@/app/adapters/activities.adapters";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type {
  GetStoryActivityRequest,
  GetStoryActivityResponse,
} from "@/app/ports/activities/story.ports";

export async function getStoryActivity(
  request: GetStoryActivityRequest,
): Promise<GetStoryActivityResponse> {
  const result = await activitiesAdapter.getStoryActivity(request);

  if (!result.ok) {
    throw new FrontAppError(result.error);
  }

  return result.value;
}
