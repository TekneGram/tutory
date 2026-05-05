CREATE TABLE multi_choice_quiz_state (
    attempt_id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL,
    unit_cycle_activity_id TEXT NOT NULL,
    is_checked INTEGER NOT NULL DEFAULT 0 CHECK (is_checked IN (0, 1)),
    final_score INTEGER NOT NULL DEFAULT 0,
    checked_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_cycle_activity_id) REFERENCES unit_cycle_activities(id) ON DELETE CASCADE,
    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
    FOREIGN KEY (attempt_id) REFERENCES activity_attempts(id) ON DELETE CASCADE
);

CREATE INDEX idx_multi_choice_quiz_state_unit_cycle_activity_id
    ON multi_choice_quiz_state (unit_cycle_activity_id);

CREATE INDEX idx_multi_choice_quiz_state_learner_id
    ON multi_choice_quiz_state (learner_id);
