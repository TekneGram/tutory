CREATE TABLE write_extra_prompts (
    id TEXT PRIMARY KEY,
    activity_content_id TEXT NOT NULL UNIQUE,
    instructions TEXT NOT NULL,
    advice TEXT NOT NULL,
    title TEXT NOT NULL,
    asset_base TEXT,
    story_text TEXT NOT NULL,
    image_refs_json TEXT NOT NULL CHECK (json_valid(image_refs_json)),
    audio_refs_json TEXT NOT NULL CHECK (json_valid(audio_refs_json)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_content_id) REFERENCES activity_content(id) ON DELETE CASCADE
);

CREATE TABLE write_extra_answers (
    attempt_id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL,
    unit_cycle_activity_id TEXT NOT NULL,
    learner_text TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_cycle_activity_id) REFERENCES unit_cycle_activities(id) ON DELETE CASCADE,
    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
    FOREIGN KEY (attempt_id) REFERENCES activity_attempts(id) ON DELETE CASCADE
);

CREATE TABLE write_extra_state (
    attempt_id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL,
    unit_cycle_activity_id TEXT NOT NULL,
    is_completed INTEGER NOT NULL DEFAULT 0 CHECK (is_completed IN (0, 1)),
    completed_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_cycle_activity_id) REFERENCES unit_cycle_activities(id) ON DELETE CASCADE,
    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
    FOREIGN KEY (attempt_id) REFERENCES activity_attempts(id) ON DELETE CASCADE
);

CREATE INDEX idx_write_extra_prompts_activity_content_id
    ON write_extra_prompts (activity_content_id);

CREATE INDEX idx_write_extra_answers_learner_id
    ON write_extra_answers (learner_id);

CREATE INDEX idx_write_extra_answers_unit_cycle_activity_id
    ON write_extra_answers (unit_cycle_activity_id);

CREATE INDEX idx_write_extra_state_learner_id
    ON write_extra_state (learner_id);

CREATE INDEX idx_write_extra_state_unit_cycle_activity_id
    ON write_extra_state (unit_cycle_activity_id);
