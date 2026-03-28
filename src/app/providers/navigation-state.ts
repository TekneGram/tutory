export type NavigationState =
 | { kind: "home" }
 | { kind: "settings" }
 | { kind: "profile"}
 | { kind: "learning-entry"}
 | { kind: "english-main"}
 | { kind: "mathematics-main"}

 export type NavigationAction =
 | { type: "go-home" }
 | { type: "go-settings" }
 | { type: "go-profile" }
 | { type: "go-learning-entry" }
 | { type: "go-english-main" }
 | { type: "go-mathematics-main" }

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
        case "go-profile":
            return { kind: "profile" };
        case "go-learning-entry":
            return { kind: "learning-entry" };
        case "go-english-main":
            return { kind: "english-main" };
        case "go-mathematics-main":
            return { kind: "mathematics-main" };
        default:
            return state;
    }
}
