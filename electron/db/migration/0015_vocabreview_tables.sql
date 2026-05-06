CREATE TABLE vocab_review_words (
    id TEXT PRIMARY KEY,
    activity_content_id TEXT NOT NULL,
    word_order INTEGER NOT NULL,
    word_text TEXT NOT NULL,
    japanese_text TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_content_id) REFERENCES activity_content(id) ON DELETE CASCADE,
    UNIQUE (activity_content_id, word_order)
);

CREATE TABLE vocab_review_answers (
    attempt_id TEXT NOT NULL,
    learner_id TEXT NOT NULL,
    unit_cycle_activity_id TEXT NOT NULL,
    word_id TEXT NOT NULL,
    learner_input TEXT,
    is_checked INTEGER NOT NULL DEFAULT 0 CHECK (is_checked IN (0, 1)),
    is_correct INTEGER NOT NULL DEFAULT 0 CHECK (is_correct IN (0, 1)),
    checked_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (attempt_id, word_id),
    FOREIGN KEY (unit_cycle_activity_id) REFERENCES unit_cycle_activities(id) ON DELETE CASCADE,
    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
    FOREIGN KEY (attempt_id) REFERENCES activity_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (word_id) REFERENCES vocab_review_words(id) ON DELETE CASCADE
);

CREATE TABLE vocab_review_state (
    attempt_id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL,
    unit_cycle_activity_id TEXT NOT NULL,
    checked_count INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    total_count INTEGER NOT NULL DEFAULT 0,
    is_finished INTEGER NOT NULL DEFAULT 0 CHECK (is_finished IN (0, 1)),
    completed_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_cycle_activity_id) REFERENCES unit_cycle_activities(id) ON DELETE CASCADE,
    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
    FOREIGN KEY (attempt_id) REFERENCES activity_attempts(id) ON DELETE CASCADE
);

CREATE INDEX idx_vocab_review_words_activity_content_id
    ON vocab_review_words (activity_content_id);

CREATE INDEX idx_vocab_review_answers_attempt_id
    ON vocab_review_answers (attempt_id);

CREATE INDEX idx_vocab_review_answers_word_id
    ON vocab_review_answers (word_id);

CREATE INDEX idx_vocab_review_state_unit_cycle_activity_id
    ON vocab_review_state (unit_cycle_activity_id);

CREATE INDEX idx_vocab_review_state_learner_id
    ON vocab_review_state (learner_id);
