import LearnerCardDisplay from "@/features/LearnerCardDisplay/LearnerCard";

const HomeView = () => {

    const bannerContent = () => {
        // This is the design of the welcome page banner
    }

    const createNewProfileContent = () => {
        return (
            <section className="create-profile-card">
                {/* This is a card that the learner clicks to create a new profile. */}
            </section>
        )
    }

    const thinFooterContent = () => {
        return (
            <section className="thin-footer">
                {/* Contains a link to navigate to the SettingsView */}
            </section>
        )
    }

    return(
        <>
            {bannerContent}
            {createNewProfileContent}
            {/* LearnerCardDisplay displays multiple LearnerCards for different profiles.
                Clicking on a LearnerCard navigates the learner to the LearningEntry screen 
                with the correct learner data (avatar and learnerId)
            */}
            {thinFooterContent}
        </>
    );
};

export default HomeView;
// This is a welcome screen.
// It displays the following
// A card to "create a new learner profile"
// LearnerCardDisplay
// When the learner clicks on "create a new learner profile", they navigate to the Profile screen.
// When the learner clicks on a LearnerCard's Enter button inside LearnerCardDisplay, they are navigated to the LearningEntry screen