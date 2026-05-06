import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  GetObserveActivityResponse,
  ResetObserveActivityRequest,
} from "@/app/ports/activities/observe.ports";
import type { LearningType } from "@/app/types/learning";
import { cycleProgressQueryKey } from "@/features/CyclesCardDisplay/hooks/useCycleProgressQuery";
import { unitCyclesQueryKey } from "@/features/CyclesCardDisplay/hooks/useUnitCyclesQuery";
import { learningUnitsQueryKey } from "@/features/UnitCardDisplay/hooks/useLearningUnitsQuery";
import { unitProgressQueryKey } from "@/features/UnitCardDisplay/hooks/useUnitProgressQuery";
import { resetObserveActivity } from "../services/resetObserveActivity.service";
import { observeActivityQueryKey } from "./useObserveActivityQuery";

type ObserveProgressContext = {
  learningType: LearningType;
  unitId: string;
  unitCycleId: string;
};

export function useResetObserveActivityMutation(context: ObserveProgressContext) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetObserveActivity,
    onMutate: async (variables: ResetObserveActivityRequest) => {
      const queryKey = observeActivityQueryKey(variables.learnerId, variables.unitCycleActivityId);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<GetObserveActivityResponse>(queryKey);
      return { previous, queryKey };
    },
    onError: (_error, _variables, localContext) => {
      if (localContext?.previous && localContext.queryKey) {
        queryClient.setQueryData(localContext.queryKey, localContext.previous);
      }
    },
    onSettled: async (_value, _error, variables) => {
      await queryClient.invalidateQueries({
        queryKey: observeActivityQueryKey(variables.learnerId, variables.unitCycleActivityId),
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
