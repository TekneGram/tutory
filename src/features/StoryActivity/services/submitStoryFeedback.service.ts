import { activitiesAdapter } from "@/app/adapters/activities.adapters";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type {
  SubmitStoryFeedbackRequest,
  SubmitStoryFeedbackResponse,
} from "@/app/ports/activities.ports";

export async function submitStoryFeedback(
  request: SubmitStoryFeedbackRequest,
): Promise<SubmitStoryFeedbackResponse> {
  const result = await activitiesAdapter.submitStoryFeedback(request);

  if (!result.ok) {
    throw new FrontAppError(result.error);
  }

  return result.value;
}
