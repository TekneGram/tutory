import "./LearnerProfileForm.css";
import { learnerAvatarOptions } from "@/app/constants/learner-avatars";
import { useLearnerProfileForm } from "./hooks/useLearnerProfileForm";

const statusPresets = ["super happy", "a bit tired", "bored stiff"] as const;

type LearnerProfileFormProps = {
  mode: "create" | "edit";
  learnerId?: string;
  onSubmitted: (learnerId: string) => void;
  onCancel: () => void;
};

const LearnerProfileForm = ({ mode, learnerId, onSubmitted, onCancel }: LearnerProfileFormProps) => {
  const form = useLearnerProfileForm({ mode, learnerId, onSubmitted });

  if (form.isLoading) {
    return (
      <section className="learner-profile-form learner-profile-form-loading" aria-live="polite">
        <div className="learner-profile-form-state learner-profile-form-state-loading">
          Loading learner profile...
        </div>
      </section>
    );
  }

  if (form.isError) {
    return (
      <section className="learner-profile-form learner-profile-form-error" aria-live="polite">
        <div className="learner-profile-form-state learner-profile-form-state-error">
          {form.errorMessage}
        </div>
        <div className="learner-profile-form-actions">
          <button className="learner-profile-form-action learner-profile-form-action-back" type="button" onClick={onCancel}>
            Back
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="learner-profile-form" aria-labelledby="learner-profile-form-title">
      <header className="learner-profile-form-header">
        <p className="learner-profile-form-kicker">{mode === "create" ? "Create profile" : "Edit profile"}</p>
        <h2 className="learner-profile-form-title" id="learner-profile-form-title">
          {mode === "create" ? "Build a new learner profile" : "Update this learner profile"}
        </h2>
      </header>

      {mode === "edit" && form.currentStatusText ? (
        <div className="learner-profile-form-current">
          <p className="learner-profile-form-current-label">Current status</p>
          <p className="learner-profile-form-current-value">{form.currentStatusText}</p>
        </div>
      ) : null}

      {form.submitError ? (
        <div className="learner-profile-form-submit-error" role="alert">
          {form.submitError}
        </div>
      ) : null}

      <form className="learner-profile-form-form" onSubmit={(event) => void form.handleSubmit(event)}>
        <div className="learner-profile-form-fields">
          <label className="learner-profile-form-field">
            <span className="learner-profile-form-field-label">Name</span>
            <input
              className="learner-profile-form-field-input"
              type="text"
              value={form.name}
              onChange={(event) => form.setName(event.target.value)}
              placeholder="Enter learner name"
              autoComplete="name"
            />
          </label>

          <fieldset className="learner-profile-form-avatar-fieldset">
            <legend className="learner-profile-form-field-label">Avatar</legend>
            <div className="learner-profile-form-avatar-grid" role="radiogroup" aria-label="Choose an avatar">
              {learnerAvatarOptions.map((option) => {
                const isSelected = form.avatarId === option.avatarId;
                return (
                  <button
                    key={option.avatarId}
                    className={`learner-profile-form-avatar-option${isSelected ? " is-selected" : ""}`}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={option.label}
                    onClick={() => form.setAvatarId(option.avatarId)}
                  >
                    <img
                      className="learner-profile-form-avatar-image"
                      src={option.src}
                      alt={option.label}
                    />
              {isSelected ? (
                <span className="learner-profile-form-avatar-check" aria-hidden="true">&#10003;</span>
              ) : null}
                </button>
              );
            })}
            </div>
            {form.avatarId ? (
              <button
                className="learner-profile-form-avatar-clear"
                type="button"
                onClick={() => form.setAvatarId(null)}
              >
                Clear avatar
              </button>
            ) : null}
          </fieldset>

          <label className="learner-profile-form-field">
            <span className="learner-profile-form-field-label">Status</span>
            <input
              className="learner-profile-form-field-input"
              type="text"
              list="learner-status-presets"
              value={form.statusText}
              onChange={(event) => form.setStatusText(event.target.value)}
              placeholder="Add a status update"
            />
            <datalist className="learner-profile-form-status-presets" id="learner-status-presets">
              {statusPresets.map((preset) => (
                <option className="learner-profile-form-status-option" key={preset} value={preset} />
              ))}
            </datalist>
          </label>
        </div>

        <div className="learner-profile-form-actions">
          <button
            className="learner-profile-form-action learner-profile-form-action-submit"
            type="submit"
            disabled={!form.canSubmit}
          >
            {form.isSubmitting ? "Saving..." : form.submitLabel}
          </button>
          <button
            className="learner-profile-form-action learner-profile-form-action-cancel"
            type="button"
            onClick={onCancel}
            disabled={form.isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
};

export default LearnerProfileForm;
