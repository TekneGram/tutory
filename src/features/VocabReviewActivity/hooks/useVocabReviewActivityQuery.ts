import { useQuery } from "@tanstack/react-query";
import { getVocabReviewActivity } from "../services/getVocabReviewActivity.service";

export const vocabReviewActivityQueryKey = (learnerId: string, unitCycleActivityId: string) =>
  ["activities", "vocab-review", learnerId, unitCycleActivityId] as const;

export function useVocabReviewActivityQuery(learnerId: string, unitCycleActivityId: string) {
  return useQuery({
    queryKey: vocabReviewActivityQueryKey(learnerId, unitCycleActivityId),
    queryFn: () => getVocabReviewActivity({ learnerId, unitCycleActivityId }),
  });
}
