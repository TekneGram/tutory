import { useQuery } from "@tanstack/react-query";
import { listLearners } from "../services/listLearners.service";

export const learnersQueryKey = ["learners"] as const;

export function useLearnersQuery() {
  return useQuery({
    queryKey: learnersQueryKey,
    queryFn: listLearners,
  });
}
