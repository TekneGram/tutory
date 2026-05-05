import { activitiesAdapter } from "@/app/adapters/activities.adapters";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type {
  RetryMultiChoiceQuizRequest,
  RetryMultiChoiceQuizResponse,
} from "@/app/ports/activities.ports";

export async function retryMultiChoiceQuiz(
  request: RetryMultiChoiceQuizRequest,
): Promise<RetryMultiChoiceQuizResponse> {
  const result = await activitiesAdapter.retryMultiChoiceQuiz(request);

  if (!result.ok) {
    throw new FrontAppError(result.error);
  }

  return result.value;
}
