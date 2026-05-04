CREATE TABLE multi_choice_quiz_answers (
    attempt_id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL,
    unit_cycle_activity_id TEXT NOT NULL,
    question TEXT NOT NULL,
    is_answered INTEGER NOT NULL DEFAULT 0 CHECK (is_answered IN (0, 1)),
    selected_option TEXT,
    is_correct INTEGER NOT NULL DEFAULT 1 CHECK (is_correct IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_cycle_activity_id) REFERENCES unit_cycle_activities(id) ON DELETE CASCADE,
    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
    FOREIGN KEY (attempt_id) REFERENCES activity_attempts(id) ON DELETE CASCADE
);