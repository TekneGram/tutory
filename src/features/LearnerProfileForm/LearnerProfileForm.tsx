
import { useEffect, useState, type FormEvent } from "react";
import type { UpsertLearnerProfileInput } from "@/app/ports/learners.ports";
import { learnerAvatarOptions } from "@/app/constants/learner-avatars";
import { useLearnerProfileQuery } from "./hooks/useLearnerProfileQuery";
import { useUpsertLearnerProfileMutation } from "./hooks/useUpsertLearnerProfileMutation";

const statusPresets = ["super happy", "a bit tired", "bored stiff"] as const;

type LearnerProfileFormProps = {
  mode: "create" | "edit";
  learnerId?: string;
  onSubmitted: (learnerId: string) => void;
  onCancel: () => void;
};

const LearnerProfileForm = ({ mode, learnerId, onSubmitted, onCancel }: LearnerProfileFormProps) => {
  const profileQuery = useLearnerProfileQuery(mode === "edit" ? learnerId : undefined);
  const upsertMutation = useUpsertLearnerProfileMutation();

  const [name, setName] = useState("");
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("");

  useEffect(() => {
    setName("");
    setAvatarId(null);
    setStatusText("");
  }, [mode, learnerId]);

  useEffect(() => {
    if (mode !== "edit" || !profileQuery.data) {
      return;
    }

    setName(profileQuery.data.name);
    setAvatarId(profileQuery.data.avatarId);
    setStatusText(profileQuery.data.currentStatus);
  }, [mode, profileQuery.data]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: UpsertLearnerProfileInput = {
      learnerId: mode === "edit" ? learnerId : undefined,
      name,
      avatarId,
      statusText,
    };

    try {
      const learner = await upsertMutation.mutateAsync(payload);
      onSubmitted(learner.learnerId);
    } catch {
      return;
    }
  }

  if (mode === "edit" && profileQuery.isLoading) {
    return (
      <section className="learner-profile-form learner-profile-form-loading" aria-live="polite">
        <div className="learner-profile-form-state learner-profile-form-state-loading">
          Loading learner profile...
        </div>
      </section>
    );
  }

  if (mode === "edit" && profileQuery.isError) {
    const message = profileQuery.error instanceof Error ? profileQuery.error.message : "Unable to load learner profile.";

    return (
      <section className="learner-profile-form learner-profile-form-error" aria-live="polite">
        <div className="learner-profile-form-state learner-profile-form-state-error">
          {message}
        </div>
        <div className="learner-profile-form-actions">
          <button className="learner-profile-form-action learner-profile-form-action-back" type="button" onClick={onCancel}>
            Back
          </button>
        </div>
      </section>
    );
  }

  const isSubmitting = upsertMutation.isPending;
  const submitLabel = mode === "create" ? "Create profile" : "Save profile";
  const submitError = upsertMutation.isError
    ? upsertMutation.error instanceof Error
      ? upsertMutation.error.message
      : "Unable to save learner profile."
    : null;

  return (
    <section className="learner-profile-form" aria-labelledby="learner-profile-form-title">
      <header className="learner-profile-form-header">
        <p className="learner-profile-form-kicker">{mode === "create" ? "Create profile" : "Edit profile"}</p>
        <h2 className="learner-profile-form-title" id="learner-profile-form-title">
          {mode === "create" ? "Build a new learner profile" : "Update this learner profile"}
        </h2>
      </header>

      {mode === "edit" && profileQuery.data ? (
        <div className="learner-profile-form-current">
          <p className="learner-profile-form-current-label">Current status</p>
          <p className="learner-profile-form-current-value">{profileQuery.data.currentStatus}</p>
        </div>
      ) : null}

      {submitError ? (
        <div className="learner-profile-form-submit-error" role="alert">
          {submitError}
        </div>
      ) : null}

      <form className="learner-profile-form-form" onSubmit={(event) => void handleSubmit(event)}>
        <div className="learner-profile-form-fields">
          <label className="learner-profile-form-field">
            <span className="learner-profile-form-field-label">Name</span>
            <input
              className="learner-profile-form-field-input"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter learner name"
              autoComplete="name"
            />
          </label>

          <label className="learner-profile-form-field">
            <span className="learner-profile-form-field-label">Avatar</span>
            <select
              className="learner-profile-form-field-select"
              value={avatarId ?? ""}
              onChange={(event) => setAvatarId(event.target.value === "" ? null : event.target.value)}
            >
              <option className="learner-profile-form-field-option" value="">
                No avatar selected
              </option>
              {learnerAvatarOptions.map((option) => (
                <option
                  key={option.avatarId}
                  className="learner-profile-form-field-option"
                  value={option.avatarId}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="learner-profile-form-field">
            <span className="learner-profile-form-field-label">Status</span>
            <input
              className="learner-profile-form-field-input"
              type="text"
              list="learner-status-presets"
              value={statusText}
              onChange={(event) => setStatusText(event.target.value)}
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
            disabled={isSubmitting || name.trim().length === 0}
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </button>
          <button
            className="learner-profile-form-action learner-profile-form-action-cancel"
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
};

export default LearnerProfileForm;
