import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CheckVocabReviewWordRequest,
  GetVocabReviewActivityResponse,
} from "@/app/ports/activities/vocabreview.ports";
import { checkVocabReviewWord } from "../services/checkVocabReviewWord.service";
import { vocabReviewActivityQueryKey } from "./useVocabReviewActivityQuery";

export function useCheckVocabReviewWordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkVocabReviewWord,
    onMutate: async (variables: CheckVocabReviewWordRequest) => {
      const queryKey = vocabReviewActivityQueryKey(variables.learnerId, variables.unitCycleActivityId);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<GetVocabReviewActivityResponse>(queryKey);
      return { previous, queryKey };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },
    onSettled: async (_value, _error, variables) => {
      await queryClient.invalidateQueries({
        queryKey: vocabReviewActivityQueryKey(variables.learnerId, variables.unitCycleActivityId),
      });
    },
  });
}
