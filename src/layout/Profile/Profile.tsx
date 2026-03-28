import LearnerProfileForm from "@/features/LearnerProfileForm/LearnerProfileForm";

const Profile = () => {

    return(
        <>

        </>
    );
};

export default Profile;
// Learners can create a new profile or edit their old profile here.
// It will have two states: create vs edit
// Learners write their name, select their avatar, and update their "status"
// The status is a dropdown menu of options, including "super happy", "a bit tired", "bored stiff",
// or they can just fill in the status themselves in a status update.
// In edit mode, their most recent status is also displayed.
// Once they click create (create mode) or finished (edit mode) and the backend updates,
// they navigate to LearningEntry