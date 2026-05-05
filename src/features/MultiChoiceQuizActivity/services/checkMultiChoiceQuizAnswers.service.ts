import { activitiesAdapter } from "@/app/adapters/activities.adapters";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type {
  CheckMultiChoiceQuizAnswersRequest,
  CheckMultiChoiceQuizAnswersResponse,
} from "@/app/ports/activities.ports";

export async function checkMultiChoiceQuizAnswers(
  request: CheckMultiChoiceQuizAnswersRequest,
): Promise<CheckMultiChoiceQuizAnswersResponse> {
  const result = await activitiesAdapter.checkMultiChoiceQuizAnswers(request);

  if (!result.ok) {
    throw new FrontAppError(result.error);
  }

  return result.value;
}
