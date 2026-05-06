import { activitiesAdapter } from "@/app/adapters/activities.adapters";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type {
  CheckVocabReviewWordRequest,
  CheckVocabReviewWordResponse,
} from "@/app/ports/activities/vocabreview.ports";

export async function checkVocabReviewWord(
  request: CheckVocabReviewWordRequest,
): Promise<CheckVocabReviewWordResponse> {
  const result = await activitiesAdapter.checkVocabReviewWord(request);

  if (!result.ok) {
    throw new FrontAppError(result.error);
  }

  return result.value;
}
