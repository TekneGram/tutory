import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CheckMultiChoiceQuizAnswersRequest,
  GetMultiChoiceQuizActivityResponse,
} from "@/app/ports/activities/multichoicequiz.ports";
import { multiChoiceQuizActivityKey } from "./useMultiChoiceQuizActivityQuery";
import { checkMultiChoiceQuizAnswers } from "../services/checkMultiChoiceQuizAnswers.service";

export function useCheckMultiChoiceQuizAnswersMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkMultiChoiceQuizAnswers,
    onMutate: async (variables: CheckMultiChoiceQuizAnswersRequest) => {
      const queryKey = multiChoiceQuizActivityKey(variables.learnerId, variables.unitCycleActivityId);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<GetMultiChoiceQuizActivityResponse>(queryKey);
      return { previous, queryKey };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },
    onSettled: async (_value, _error, variables) => {
      await queryClient.invalidateQueries({
        queryKey: multiChoiceQuizActivityKey(variables.learnerId, variables.unitCycleActivityId),
      });
    },
  });
}
