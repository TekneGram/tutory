import { useQuery } from "@tanstack/react-query";
import { getUnitProgress } from "../services/getUnitProgress.service";

export const unitProgressQueryKey = (learnerId: string, unitId: string) =>
  ["units", "unit-progress", learnerId, unitId] as const;

type UseUnitProgressQueryArgs = {
  learnerId: string;
  unitId: string;
  enabled: boolean;
};

export function useUnitProgressQuery({ learnerId, unitId, enabled }: UseUnitProgressQueryArgs) {
  return useQuery({
    queryKey: unitProgressQueryKey(learnerId, unitId),
    queryFn: () => getUnitProgress({ learnerId, unitId }),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
