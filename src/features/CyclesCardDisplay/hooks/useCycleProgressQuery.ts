import { useQuery } from "@tanstack/react-query";
import { getCycleProgress } from "../services/getCycleProgress.service";

export const cycleProgressQueryKey = (learnerId: string, unitCycleId: string) =>
  ["cycles", "progress", learnerId, unitCycleId] as const;

type UseCycleProgressQueryArgs = {
  learnerId: string;
  unitCycleId: string;
  enabled: boolean;
};

export function useCycleProgressQuery({ learnerId, unitCycleId, enabled }: UseCycleProgressQueryArgs) {
  return useQuery({
    queryKey: cycleProgressQueryKey(learnerId, unitCycleId),
    queryFn: () => getCycleProgress({ learnerId, unitCycleId }),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

