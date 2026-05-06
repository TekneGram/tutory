import { useQuery } from "@tanstack/react-query";
import { getObserveActivity } from "../services/getObserveActivity.service";

export const observeActivityQueryKey = (learnerId: string, unitCycleActivityId: string) =>
  ["activities", "observe", learnerId, unitCycleActivityId] as const;

export function useObserveActivityQuery(learnerId: string, unitCycleActivityId: string) {
  return useQuery({
    queryKey: observeActivityQueryKey(learnerId, unitCycleActivityId),
    queryFn: () => getObserveActivity({ learnerId, unitCycleActivityId }),
  });
}
