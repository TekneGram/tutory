import { useQuery } from "@tanstack/react-query";
import { listUnitCycles } from "../services/listUnitCycles.service";

export const unitCyclesQueryKey = (unitId: string) => ["units", "cycles", unitId] as const;

export function useUnitCyclesQuery(unitId: string) {
  return useQuery({
    queryKey: unitCyclesQueryKey(unitId),
    queryFn: () => listUnitCycles({ unitId }),
  });
}

