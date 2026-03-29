import "@/styles/layout.css";

import { useNavigation } from "@/app/providers/useNavigation";
import HomeView from "./HomeView";
import SettingsView from "./SettingsView";
import Profile from "./Profile";
import LearningEntry from "./LearningEntry";
import EnglishMain from "./EnglishMain";
import MathematicsMain from "./MathematicsMain";

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

  function goEnglishMain(learnerId: string) {
    dispatch({ type: "go-english-main", learnerId });
  }

  function goMathematicsMain(learnerId: string) {
    dispatch({ type: "go-mathematics-main", learnerId });
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
            onEnterEnglish={goEnglishMain}
            onEnterMathematics={goMathematicsMain}
            onGoHome={goHome}
          />
        );
      case "english-main":
        return (
          <EnglishMain
            learnerId={navigationState.learnerId}
            onBackToLearningEntry={goLearningEntry}
          />
        );
      case "mathematics-main":
        return (
          <MathematicsMain
            learnerId={navigationState.learnerId}
            onBackToLearningEntry={goLearningEntry}
          />
        );
      default:
        return null;
    }
  }

  return <main className="main-view">{renderContent()}</main>;
};

export default MainView;
