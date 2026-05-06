import { activitiesAdapter } from "@/app/adapters/activities.adapters";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type {
  GetVocabReviewActivityRequest,
  GetVocabReviewActivityResponse,
} from "@/app/ports/activities/vocabreview.ports";

export async function getVocabReviewActivity(
  request: GetVocabReviewActivityRequest,
): Promise<GetVocabReviewActivityResponse> {
  const result = await activitiesAdapter.getVocabReviewActivity(request);

  if (!result.ok) {
    throw new FrontAppError(result.error);
  }

  return result.value;
}
