export type NavigationState =
  | { kind: "home" }
  | { kind: "settings" }
  | { kind: "profile"; mode: "create" }
  | { kind: "profile"; mode: "edit"; learnerId: string }
  | { kind: "learning-entry"; learnerId: string }
  | { kind: "english-main"; learnerId: string }
  | { kind: "mathematics-main"; learnerId: string };

export type NavigationAction =
  | { type: "go-home" }
  | { type: "go-settings" }
  | { type: "go-profile-create" }
  | { type: "go-profile-edit"; learnerId: string }
  | { type: "go-learning-entry"; learnerId: string }
  | { type: "go-english-main"; learnerId: string }
  | { type: "go-mathematics-main"; learnerId: string };

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
        case "go-english-main":
            return { kind: "english-main", learnerId: action.learnerId };
        case "go-mathematics-main":
            return { kind: "mathematics-main", learnerId: action.learnerId };
        default:
            return state;
    }
}
