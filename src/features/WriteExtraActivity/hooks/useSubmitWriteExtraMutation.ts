import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  GetWriteExtraActivityResponse,
  SubmitWriteExtraRequest,
} from "@/app/ports/activities/writeextra.ports";
import type { LearningType } from "@/app/types/learning";
import { cycleProgressQueryKey } from "@/features/CyclesCardDisplay/hooks/useCycleProgressQuery";
import { unitCyclesQueryKey } from "@/features/CyclesCardDisplay/hooks/useUnitCyclesQuery";
import { learningUnitsQueryKey } from "@/features/UnitCardDisplay/hooks/useLearningUnitsQuery";
import { unitProgressQueryKey } from "@/features/UnitCardDisplay/hooks/useUnitProgressQuery";
import { submitWriteExtra } from "../services/submitWriteExtra.service";
import { writeExtraActivityQueryKey } from "./useWriteExtraActivityQuery";

type WriteExtraProgressContext = {
  learningType: LearningType;
  unitId: string;
  unitCycleId: string;
};

export function useSubmitWriteExtraMutation(context: WriteExtraProgressContext) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitWriteExtra,
    onMutate: async (variables: SubmitWriteExtraRequest) => {
      const queryKey = writeExtraActivityQueryKey(variables.learnerId, variables.unitCycleActivityId);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<GetWriteExtraActivityResponse>(queryKey);
      return { previous, queryKey };
    },
    onError: (_error, _variables, mutationContext) => {
      if (mutationContext?.previous && mutationContext.queryKey) {
        queryClient.setQueryData(mutationContext.queryKey, mutationContext.previous);
      }
    },
    onSettled: async (_value, _error, variables) => {
      await queryClient.invalidateQueries({
        queryKey: writeExtraActivityQueryKey(variables.learnerId, variables.unitCycleActivityId),
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
