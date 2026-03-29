import LearnerProfileForm from "@/features/LearnerProfileForm/LearnerProfileForm";

type ProfileProps = {
  mode: "create" | "edit";
  learnerId?: string;
  onSubmitted: (learnerId: string) => void;
  onCancel: () => void;
};

const Profile = ({ mode, learnerId, onSubmitted, onCancel }: ProfileProps) => {
  return (
    <section className="profile-view" aria-labelledby="profile-view-title">
      <header className="profile-view-header">
        <p className="profile-view-kicker">{mode === "create" ? "Create profile" : "Edit profile"}</p>
        <h1 className="profile-view-title" id="profile-view-title">
          {mode === "create" ? "Create a learner profile" : "Edit an existing learner profile"}
        </h1>
      </header>

      <LearnerProfileForm
        mode={mode}
        learnerId={learnerId}
        onSubmitted={onSubmitted}
        onCancel={onCancel}
      />
    </section>
  );
};

export default Profile;
