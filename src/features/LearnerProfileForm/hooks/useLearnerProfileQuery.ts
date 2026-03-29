import { useQuery } from "@tanstack/react-query";
import { getLearnerProfile } from "../services/getLearnerProfile.service";

export const learnerProfileQueryKey = (learnerId: string) => ["learners", "profile", learnerId] as const;

export function useLearnerProfileQuery(learnerId: string | undefined) {
  return useQuery({
    queryKey: learnerId ? learnerProfileQueryKey(learnerId) : ["learners", "profile", "create"] as const,
    queryFn: async () => {
      if (!learnerId) {
        throw new Error("learnerId is required to load a learner profile.");
      }

      return getLearnerProfile(learnerId);
    },
    enabled: Boolean(learnerId),
  });
}
