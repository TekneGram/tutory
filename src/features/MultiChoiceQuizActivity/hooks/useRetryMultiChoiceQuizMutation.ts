import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  GetMultiChoiceQuizActivityResponse,
  RetryMultiChoiceQuizRequest,
} from "@/app/ports/activities/multichoicequiz.ports";
import type { LearningType } from "@/app/types/learning";
import { cycleProgressQueryKey } from "@/features/CyclesCardDisplay/hooks/useCycleProgressQuery";
import { unitCyclesQueryKey } from "@/features/CyclesCardDisplay/hooks/useUnitCyclesQuery";
import { learningUnitsQueryKey } from "@/features/UnitCardDisplay/hooks/useLearningUnitsQuery";
import { unitProgressQueryKey } from "@/features/UnitCardDisplay/hooks/useUnitProgressQuery";
import { multiChoiceQuizActivityKey } from "./useMultiChoiceQuizActivityQuery";
import { retryMultiChoiceQuiz } from "../services/retryMultiChoiceQuiz.service";

type MultiChoiceQuizProgressContext = {
  learningType: LearningType;
  unitId: string;
  unitCycleId: string;
};

export function useRetryMultiChoiceQuizMutation(context: MultiChoiceQuizProgressContext) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: retryMultiChoiceQuiz,
    onMutate: async (variables: RetryMultiChoiceQuizRequest) => {
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
      await queryClient.invalidateQueries({
        queryKey: learningUnitsQueryKey(context.learningType),
      });
      await queryClient.invalidateQueries({
        queryKey: unitCyclesQueryKey(context.unitId),
      });
      await queryClient.invalidateQueries({
        queryKey: unitProgressQueryKey(variables.learnerId, context.unitId),
      });
      await queryClient.invalidateQueries({
        queryKey: cycleProgressQueryKey(variables.learnerId, context.unitCycleId),
      });
    },
  });
}
