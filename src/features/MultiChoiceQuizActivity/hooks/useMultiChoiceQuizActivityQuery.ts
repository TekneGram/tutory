import { useQuery } from "@tanstack/react-query";
import { getMultiChoiceQuizActivity } from "../services/getMultiChoiceQuizActivity.service";

export const multiChoiceQuizActivityKey = (learnerId: string, unitCycleActivityId: string) =>
    ["activities", "multi-choice-quiz", learnerId, unitCycleActivityId] as const;

export function useMultiChoiceQuizActivityQuery(learnerId: string, unitCycleActivityId: string) {
    return useQuery({
        queryKey: multiChoiceQuizActivityKey(learnerId, unitCycleActivityId),
        queryFn: () => getMultiChoiceQuizActivity({ learnerId, unitCycleActivityId }),
    })
}