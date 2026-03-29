import welcomeBanner from "@/assets/app/welcome_banner.webp";
import LearnerCardDisplay from "@/features/LearnerCardDisplay/LearnerCardDisplay";

type HomeViewProps = {
  onCreateProfile: () => void;
  onOpenSettings: () => void;
  onEnterLearner: (learnerId: string) => void;
  onEditLearner: (learnerId: string) => void;
};

const HomeView = ({
  onCreateProfile,
  onOpenSettings,
  onEnterLearner,
  onEditLearner,
}: HomeViewProps) => {
  return (
    <section className="home-view" aria-labelledby="home-view-title">
      <header className="home-view-banner-shell">
        <img className="home-view-banner-image" src={welcomeBanner} alt="Tutory welcome banner" />
        <div className="home-view-banner-copy">
          <p className="home-view-banner-kicker">Welcome to</p>
          <h1 className="home-view-title" id="home-view-title">
            TUTORY
          </h1>
        </div>
      </header>

      <section className="home-view-create-profile-shell" aria-labelledby="home-view-create-profile-title">
        <button className="home-view-create-profile-card" type="button" onClick={onCreateProfile}>
          <span className="home-view-create-profile-card-label" id="home-view-create-profile-title">
            Create a new profile
          </span>
          <span className="home-view-create-profile-card-copy">
            Set up a fresh learner profile and start from there.
          </span>
        </button>
      </section>

      <section className="home-view-learner-list-shell" aria-labelledby="home-view-learner-list-title">
        <div className="home-view-learner-list-header">
          <h2 className="home-view-learner-list-title" id="home-view-learner-list-title">
            Existing learners
          </h2>
        </div>
        <LearnerCardDisplay onEnterLearner={onEnterLearner} onEditLearner={onEditLearner} />
      </section>

      <footer className="home-view-footer">
        <button className="home-view-settings-link" type="button" onClick={onOpenSettings}>
          Settings
        </button>
      </footer>
    </section>
  );
};

export default HomeView;
