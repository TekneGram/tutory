import { activitiesAdapter } from "@/app/adapters/activities.adapters";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type {
  SubmitWriteExtraRequest,
  SubmitWriteExtraResponse,
} from "@/app/ports/activities/writeextra.ports";

export async function submitWriteExtra(
  request: SubmitWriteExtraRequest,
): Promise<SubmitWriteExtraResponse> {
  const result = await activitiesAdapter.submitWriteExtra(request);

  if (!result.ok) {
    throw new FrontAppError(result.error);
  }

  return result.value;
}
