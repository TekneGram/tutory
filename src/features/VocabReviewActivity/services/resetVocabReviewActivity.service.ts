import { activitiesAdapter } from "@/app/adapters/activities.adapters";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type {
  ResetVocabReviewActivityRequest,
  ResetVocabReviewActivityResponse,
} from "@/app/ports/activities/vocabreview.ports";

export async function resetVocabReviewActivity(
  request: ResetVocabReviewActivityRequest,
): Promise<ResetVocabReviewActivityResponse> {
  const result = await activitiesAdapter.resetVocabReviewActivity(request);

  if (!result.ok) {
    throw new FrontAppError(result.error);
  }

  return result.value;
}
