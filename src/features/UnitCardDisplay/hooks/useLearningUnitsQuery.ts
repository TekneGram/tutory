import { useQuery } from "@tanstack/react-query";
import type { LearningType } from "@/app/types/learning";
import { listLearningUnits } from "../services/listLearningUnits.service";

export const learningUnitsQueryKey = (learningType: LearningType) => ["learning", "units", learningType] as const;

export function useLearningUnitsQuery(learningType: LearningType) {
  return useQuery({
    queryKey: learningUnitsQueryKey(learningType),
    queryFn: () => listLearningUnits({ learningType }),
  });
}
