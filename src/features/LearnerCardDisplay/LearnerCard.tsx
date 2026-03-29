import "./LearnerCard.css";
import type { LearnerCardDto } from "@/app/ports/learners.ports";
import { getLearnerAvatarSrc } from "@/app/constants/learner-avatars";

type LearnerCardProps = {
  learner: LearnerCardDto;
  onEnter: (learnerId: string) => void;
  onEditProfile: (learnerId: string) => void;
};

const LearnerCard = ({ learner, onEnter, onEditProfile }: LearnerCardProps) => {
  const avatarSrc = getLearnerAvatarSrc(learner.avatarId);

  return (
    <article className="learner-card">
      <div className="learner-card-avatar-shell">
        {avatarSrc ? (
          <img
            className="learner-card-avatar-image"
            src={avatarSrc}
            alt={`${learner.name} avatar`}
          />
        ) : (
          <div className="learner-card-avatar-fallback" aria-hidden="true">
            <span className="learner-card-avatar-fallback-label">No avatar</span>
          </div>
        )}
      </div>

      <div className="learner-card-content">
        <header className="learner-card-header">
          <h3 className="learner-card-name">{learner.name}</h3>
          <p className="learner-card-id">ID: {learner.learnerId}</p>
        </header>

        <p className="learner-card-status">
          <span className="learner-card-status-label">Status:</span>
          <span className="learner-card-status-value">{learner.currentStatus}</span>
        </p>

        <div className="learner-card-actions">
          <button
            className="learner-card-action learner-card-action-enter"
            type="button"
            onClick={() => onEnter(learner.learnerId)}
          >
            Enter
          </button>
          <button
            className="learner-card-action learner-card-action-edit"
            type="button"
            onClick={() => onEditProfile(learner.learnerId)}
          >
            Edit Profile
          </button>
        </div>
      </div>
    </article>
  );
};

export default LearnerCard;
