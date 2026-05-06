import { activitiesAdapter } from "@/app/adapters/activities.adapters";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type {
  RetryVocabReviewWordRequest,
  RetryVocabReviewWordResponse,
} from "@/app/ports/activities/vocabreview.ports";

export async function retryVocabReviewWord(
  request: RetryVocabReviewWordRequest,
): Promise<RetryVocabReviewWordResponse> {
  const result = await activitiesAdapter.retryVocabReviewWord(request);

  if (!result.ok) {
    throw new FrontAppError(result.error);
  }

  return result.value;
}
