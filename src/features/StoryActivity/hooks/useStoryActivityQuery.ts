import { useQuery } from "@tanstack/react-query";
import { getStoryActivity } from "../services/getStoryActivity.service";

export const storyActivityQueryKey = (learnerId: string, unitCycleActivityId: string) =>
  ["activities", "story", learnerId, unitCycleActivityId] as const;

export function useStoryActivityQuery(learnerId: string, unitCycleActivityId: string) {
  return useQuery({
    queryKey: storyActivityQueryKey(learnerId, unitCycleActivityId),
    queryFn: () => getStoryActivity({ learnerId, unitCycleActivityId }),
  });
}
