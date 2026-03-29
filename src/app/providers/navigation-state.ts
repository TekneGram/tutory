import type { LearningType } from "@/app/types/learning";

export type NavigationState =
  | { kind: "home" }
  | { kind: "settings" }
  | { kind: "profile"; mode: "create" }
  | { kind: "profile"; mode: "edit"; learnerId: string }
  | { kind: "learning-entry"; learnerId: string }
  | { kind: "unit-front"; learnerId: string; learningType: LearningType }
  | { kind: "unit-cycles"; learnerId: string; learningType: LearningType; unitId: string }
  | {
      kind: "learning-main";
      learnerId: string;
      learningType: LearningType;
      unitId: string;
      unitCycleId: string;
    };

export type NavigationAction =
  | { type: "go-home" }
  | { type: "go-settings" }
  | { type: "go-profile-create" }
  | { type: "go-profile-edit"; learnerId: string }
  | { type: "go-learning-entry"; learnerId: string }
  | { type: "go-unit-front"; learnerId: string; learningType: LearningType }
  | { type: "go-unit-cycles"; learnerId: string; learningType: LearningType; unitId: string }
  | {
      type: "go-learning-main";
      learnerId: string;
      learningType: LearningType;
      unitId: string;
      unitCycleId: string;
    };

export const initialNavigationState: NavigationState = { kind: "home" };

export function navigationReducer(
  state: NavigationState,
  action: NavigationAction,
): NavigationState {
  switch (action.type) {
    case "go-home":
      return { kind: "home" };
    case "go-settings":
      return { kind: "settings" };
    case "go-profile-create":
      return { kind: "profile", mode: "create" };
    case "go-profile-edit":
      return { kind: "profile", mode: "edit", learnerId: action.learnerId };
    case "go-learning-entry":
      return { kind: "learning-entry", learnerId: action.learnerId };
    case "go-unit-front":
      return {
        kind: "unit-front",
        learnerId: action.learnerId,
        learningType: action.learningType,
      };
    case "go-unit-cycles":
      return {
        kind: "unit-cycles",
        learnerId: action.learnerId,
        learningType: action.learningType,
        unitId: action.unitId,
      };
    case "go-learning-main":
      return {
        kind: "learning-main",
        learnerId: action.learnerId,
        learningType: action.learningType,
        unitId: action.unitId,
        unitCycleId: action.unitCycleId,
      };
    default:
      return state;
  }
}
