import { activitiesAdapter } from "@/app/adapters/activities.adapters";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type {
  ResumeWriteExtraRequest,
  ResumeWriteExtraResponse,
} from "@/app/ports/activities/writeextra.ports";

export async function resumeWriteExtra(
  request: ResumeWriteExtraRequest,
): Promise<ResumeWriteExtraResponse> {
  const result = await activitiesAdapter.resumeWriteExtra(request);

  if (!result.ok) {
    throw new FrontAppError(result.error);
  }

  return result.value;
}
