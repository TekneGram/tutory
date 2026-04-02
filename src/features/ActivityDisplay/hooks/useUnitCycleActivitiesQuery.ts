import { useQuery } from "@tanstack/react-query";
import { listUnitCycleActivities } from "../services/listUnitCycleActivities.service";

export const unitCycleActivitiesQueryKey = (unitCycleId: string) =>
  ["cycles", "activities", unitCycleId] as const;

export function useUnitCycleActivitiesQuery(unitCycleId: string) {
  return useQuery({
    queryKey: unitCycleActivitiesQueryKey(unitCycleId),
    queryFn: () => listUnitCycleActivities({ unitCycleId }),
  });
}
