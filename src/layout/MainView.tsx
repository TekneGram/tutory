import "@/styles/layout.css";

import { useNavigation } from "@/app/providers/useNavigation";
import HomeView from "./HomeView";
import SettingsView from "./SettingsView";
import Profile from "./Profile";
import LearningEntry from "./LearningEntry";
import UnitFront from "./UnitFront";
import LearningMain from "./LearningMain";
import type { LearningType } from "@/app/types/learning";

const MainView = () => {
  const { navigationState, dispatch } = useNavigation();

  function goHome() {
    dispatch({ type: "go-home" });
  }

  function goSettings() {
    dispatch({ type: "go-settings" });
  }

  function goProfileCreate() {
    dispatch({ type: "go-profile-create" });
  }

  function goProfileEdit(learnerId: string) {
    dispatch({ type: "go-profile-edit", learnerId });
  }

  function goLearningEntry(learnerId: string) {
    dispatch({ type: "go-learning-entry", learnerId });
  }

  function goUnitFront(learnerId: string, learningType: LearningType) {
    dispatch({ type: "go-unit-front", learnerId, learningType });
  }

  function goLearningMain(learnerId: string, learningType: LearningType, unitId: string) {
    dispatch({ type: "go-learning-main", learnerId, learningType, unitId });
  }

  function renderContent() {
    switch (navigationState.kind) {
      case "home":
        return (
          <HomeView
            onCreateProfile={goProfileCreate}
            onOpenSettings={goSettings}
            onEnterLearner={goLearningEntry}
            onEditLearner={goProfileEdit}
          />
        );
      case "settings":
        return <SettingsView onBackHome={goHome} />;
      case "profile":
        return (
          <Profile
            mode={navigationState.mode}
            learnerId={navigationState.mode === "edit" ? navigationState.learnerId : undefined}
            onSubmitted={goLearningEntry}
            onCancel={goHome}
          />
        );
      case "learning-entry":
        return (
          <LearningEntry
            learnerId={navigationState.learnerId}
            onEnterUnitFront={goUnitFront}
            onGoHome={goHome}
          />
        );
      case "unit-front":
        return (
          <UnitFront
            learnerId={navigationState.learnerId}
            learningType={navigationState.learningType}
            onEnterLearningMain={goLearningMain}
            onBackToLearningEntry={goLearningEntry}
          />
        );
      case "learning-main":
        return (
          <LearningMain
            learnerId={navigationState.learnerId}
            learningType={navigationState.learningType}
            unitId={navigationState.unitId}
            onBackToUnitFront={goUnitFront}
          />
        );
      default:
        return null;
    }
  }

  return <main className="main-view">{renderContent()}</main>;
};

export default MainView;
