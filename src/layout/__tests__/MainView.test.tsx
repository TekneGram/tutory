import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MainView from "../MainView";
import { NavigationContext } from "@/app/providers/navigation-context";
import type { NavigationState } from "@/app/providers/navigation-state";

const homeViewSpy = vi.fn();
const settingsViewSpy = vi.fn();
const profileViewSpy = vi.fn();
const learningEntrySpy = vi.fn();
const unitFrontSpy = vi.fn();
const learningMainSpy = vi.fn();

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
  default: (props: {
    learnerId: string;
    onEnterUnitFront: (learnerId: string, learningType: "english" | "mathematics") => void;
    onGoHome: () => void;
  }) => {
    learningEntrySpy(props);

    return (
      <div className="mock-learning-entry-view">
        <span className="mock-learning-entry-view-learner-id">{props.learnerId}</span>
        <button
          className="mock-learning-entry-view-open-english"
          type="button"
          onClick={() => props.onEnterUnitFront(props.learnerId, "english")}
        >
          open-english
        </button>
        <button
          className="mock-learning-entry-view-open-math"
          type="button"
          onClick={() => props.onEnterUnitFront(props.learnerId, "mathematics")}
        >
          open-math
        </button>
        <button className="mock-learning-entry-view-home" type="button" onClick={props.onGoHome}>
          home
        </button>
      </div>
    );
  },
}));

vi.mock("../UnitFront", () => ({
  default: (props: {
    learnerId: string;
    learningType: "english" | "mathematics";
    onEnterLearningMain: (learnerId: string, learningType: "english" | "mathematics", unitId: string) => void;
    onBackToLearningEntry: (learnerId: string) => void;
  }) => {
    unitFrontSpy(props);

    return (
      <div className="mock-unit-front-view">
        <span className="mock-unit-front-view-learner-id">{props.learnerId}</span>
        <span className="mock-unit-front-view-type">{props.learningType}</span>
        <button
          className="mock-unit-front-view-open-unit"
          type="button"
          onClick={() => props.onEnterLearningMain(props.learnerId, props.learningType, "unit-1")}
        >
          open-unit
        </button>
        <button
          className="mock-unit-front-view-back"
          type="button"
          onClick={() => props.onBackToLearningEntry(props.learnerId)}
        >
          back-learning
        </button>
      </div>
    );
  },
}));

vi.mock("../LearningMain", () => ({
  default: (props: {
    learnerId: string;
    learningType: "english" | "mathematics";
    unitId: string;
    onBackToUnitFront: (learnerId: string, learningType: "english" | "mathematics") => void;
  }) => {
    learningMainSpy(props);

    return (
      <div className="mock-learning-main-view">
        <span className="mock-learning-main-view-learner-id">{props.learnerId}</span>
        <span className="mock-learning-main-view-type">{props.learningType}</span>
        <span className="mock-learning-main-view-unit-id">{props.unitId}</span>
        <button
          className="mock-learning-main-view-back"
          type="button"
          onClick={() => props.onBackToUnitFront(props.learnerId, props.learningType)}
        >
          back-front
        </button>
      </div>
    );
  },
}));

function renderMainView(state: NavigationState) {
  const dispatch = vi.fn();

  render(
    <NavigationContext.Provider value={{ navigationState: state, dispatch }}>
      <MainView />
    </NavigationContext.Provider>,
  );

  return { dispatch };
}

describe("MainView", () => {
  beforeEach(() => {
    homeViewSpy.mockReset();
    settingsViewSpy.mockReset();
    profileViewSpy.mockReset();
    learningEntrySpy.mockReset();
    unitFrontSpy.mockReset();
    learningMainSpy.mockReset();
  });

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

  it("passes payloads through profile, entry, and learning front branches", () => {
    renderMainView({ kind: "profile", mode: "edit", learnerId: "learner-7" });
    expect(profileViewSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "edit",
        learnerId: "learner-7",
      }),
    );

    const { dispatch } = renderMainView({ kind: "learning-entry", learnerId: "learner-8" });
    expect(learningEntrySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        learnerId: "learner-8",
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "open-english" }));
    expect(dispatch).toHaveBeenCalledWith({
      type: "go-unit-front",
      learnerId: "learner-8",
      learningType: "english",
    });

    fireEvent.click(screen.getByRole("button", { name: "open-math" }));
    expect(dispatch).toHaveBeenCalledWith({
      type: "go-unit-front",
      learnerId: "learner-8",
      learningType: "mathematics",
    });
  });

  it("wires learning front into the next navigation step", () => {
    const { dispatch } = renderMainView({
      kind: "unit-front",
      learnerId: "learner-9",
      learningType: "english",
    });
    expect(unitFrontSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        learnerId: "learner-9",
        learningType: "english",
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "open-unit" }));
    expect(dispatch).toHaveBeenCalledWith({
      type: "go-learning-main",
      learnerId: "learner-9",
      learningType: "english",
      unitId: "unit-1",
    });

    fireEvent.click(screen.getByRole("button", { name: "back-learning" }));
    expect(dispatch).toHaveBeenCalledWith({
      type: "go-learning-entry",
      learnerId: "learner-9",
    });
  });

  it("passes the unit id and learning type through the learning main branch", () => {
    renderMainView({
      kind: "learning-main",
      learnerId: "learner-10",
      learningType: "mathematics",
      unitId: "unit-9",
    });
    expect(learningMainSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        learnerId: "learner-10",
        learningType: "mathematics",
        unitId: "unit-9",
      }),
    );
  });
});
