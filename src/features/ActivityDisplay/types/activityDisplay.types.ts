import type { LearningType } from "@/app/types/learning";

export type ActivityComponentProps = {
  learnerId: string;
  learningType: LearningType;
  unitId: string;
  unitCycleId: string;
  unitCycleActivityId: string;
};
