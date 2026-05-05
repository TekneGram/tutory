import { activitiesAdapter } from "@/app/adapters/activities.adapters";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type {
  SubmitMultiChoiceQuizAnswerRequest,
  SubmitMultiChoiceQuizAnswerResponse,
} from "@/app/ports/activities.ports";

export async function submitMultiChoiceQuizAnswer(
  request: SubmitMultiChoiceQuizAnswerRequest,
): Promise<SubmitMultiChoiceQuizAnswerResponse> {
  const result = await activitiesAdapter.submitMultiChoiceQuizAnswer(request);

  if (!result.ok) {
    throw new FrontAppError(result.error);
  }

  return result.value;
}
