import { activitiesAdapter } from "@/app/adapters/activities.adapters";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type {
  GetWriteExtraActivityRequest,
  GetWriteExtraActivityResponse,
} from "@/app/ports/activities/writeextra.ports";

export async function getWriteExtraActivity(
  request: GetWriteExtraActivityRequest,
): Promise<GetWriteExtraActivityResponse> {
  const result = await activitiesAdapter.getWriteExtraActivity(request);

  if (!result.ok) {
    throw new FrontAppError(result.error);
  }

  return result.value;
}
