import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MainView from "../MainView";
import { NavigationContext } from "@/app/providers/navigation-context";
import type { NavigationState } from "@/app/providers/navigation-state";

const homeViewSpy = vi.fn();
const settingsViewSpy = vi.fn();
const profileViewSpy = vi.fn();
const learningEntrySpy = vi.fn();
const englishMainSpy = vi.fn();
const mathematicsMainSpy = vi.fn();

vi.mock("../HomeView", () => ({
  default: (props: {
    onCreateProfile: () => void;
    onOpenSettings: () => void;
    onEnterLearner: (learnerId: string) => void;
    onEditLearner: (learnerId: string) => void;
  }) => {
    homeViewSpy(props);

    return (
      <div className="mock-home-view">
        <button className="mock-home-view-create" type="button" onClick={props.onCreateProfile}>
          create
        </button>
        <button className="mock-home-view-settings" type="button" onClick={props.onOpenSettings}>
          settings
        </button>
        <button className="mock-home-view-enter" type="button" onClick={() => props.onEnterLearner("learner-1")}>
          enter
        </button>
        <button className="mock-home-view-edit" type="button" onClick={() => props.onEditLearner("learner-1")}>
          edit
        </button>
      </div>
    );
  },
}));

vi.mock("../SettingsView", () => ({
  default: (props: { onBackHome: () => void }) => {
    settingsViewSpy(props);

    return (
      <div className="mock-settings-view">
        <button className="mock-settings-view-back" type="button" onClick={props.onBackHome}>
          back-home
        </button>
      </div>
    );
  },
}));

vi.mock("../Profile", () => ({
  default: (props: { mode: "create" | "edit"; learnerId?: string }) => {
    profileViewSpy(props);

    return (
      <div className="mock-profile-view">
        <span className="mock-profile-view-mode">{props.mode}</span>
        <span className="mock-profile-view-learner-id">{props.learnerId ?? "none"}</span>
      </div>
    );
  },
}));

vi.mock("../LearningEntry", () => ({
  default: (props: { learnerId: string }) => {
    learningEntrySpy(props);

    return (
      <div className="mock-learning-entry-view">
        <span className="mock-learning-entry-view-learner-id">{props.learnerId}</span>
      </div>
    );
  },
}));

vi.mock("../EnglishMain", () => ({
  default: (props: { learnerId: string }) => {
    englishMainSpy(props);

    return (
      <div className="mock-english-main-view">
        <span className="mock-english-main-view-learner-id">{props.learnerId}</span>
      </div>
    );
  },
}));

vi.mock("../MathematicsMain", () => ({
  default: (props: { learnerId: string }) => {
    mathematicsMainSpy(props);

    return (
      <div className="mock-mathematics-main-view">
        <span className="mock-mathematics-main-view-learner-id">{props.learnerId}</span>
      </div>
    );
  },
}));

function renderMainView(state: NavigationState) {
  const dispatch = vi.fn();

  render(
    <NavigationContext.Provider value={{ navigationState: state, dispatch }}>
      <MainView />
    </NavigationContext.Provider>
  );

  return { dispatch };
}

describe("MainView", () => {
  it("wires home actions into navigation dispatches", () => {
    const { dispatch } = renderMainView({ kind: "home" });

    fireEvent.click(screen.getByRole("button", { name: "create" }));
    fireEvent.click(screen.getByRole("button", { name: "settings" }));
    fireEvent.click(screen.getByRole("button", { name: "enter" }));
    fireEvent.click(screen.getByRole("button", { name: "edit" }));

    expect(dispatch).toHaveBeenCalledWith({ type: "go-profile-create" });
    expect(dispatch).toHaveBeenCalledWith({ type: "go-settings" });
    expect(dispatch).toHaveBeenCalledWith({ type: "go-learning-entry", learnerId: "learner-1" });
    expect(dispatch).toHaveBeenCalledWith({ type: "go-profile-edit", learnerId: "learner-1" });
  });

  it("passes payloads through profile and entry branches", () => {
    renderMainView({ kind: "profile", mode: "edit", learnerId: "learner-7" });
    expect(profileViewSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "edit",
        learnerId: "learner-7",
      })
    );

    renderMainView({ kind: "learning-entry", learnerId: "learner-8" });
    expect(learningEntrySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        learnerId: "learner-8",
      })
    );

    renderMainView({ kind: "english-main", learnerId: "learner-9" });
    expect(englishMainSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        learnerId: "learner-9",
      })
    );
  });
});
