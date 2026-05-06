import { useQuery } from "@tanstack/react-query";
import { getWriteExtraActivity } from "../services/getWriteExtraActivity.service";

export const writeExtraActivityQueryKey = (learnerId: string, unitCycleActivityId: string) =>
  ["activities", "write-extra", learnerId, unitCycleActivityId] as const;

export function useWriteExtraActivityQuery(learnerId: string, unitCycleActivityId: string) {
  return useQuery({
    queryKey: writeExtraActivityQueryKey(learnerId, unitCycleActivityId),
    queryFn: () => getWriteExtraActivity({ learnerId, unitCycleActivityId }),
  });
}
