CREATE TABLE observe_prompts (
    id TEXT PRIMARY KEY,
    activity_content_id TEXT NOT NULL UNIQUE,
    instructions TEXT NOT NULL,
    advice TEXT NOT NULL,
    title TEXT NOT NULL,
    asset_base TEXT,
    image_refs_json TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_content_id) REFERENCES activity_content(id) ON DELETE CASCADE
);

CREATE TABLE observe_words (
    id TEXT PRIMARY KEY,
    activity_content_id TEXT NOT NULL,
    word_order INTEGER NOT NULL,
    word_text TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_content_id) REFERENCES activity_content(id) ON DELETE CASCADE,
    UNIQUE (activity_content_id, word_order)
);

CREATE TABLE observe_categories (
    id TEXT PRIMARY KEY,
    activity_content_id TEXT NOT NULL,
    category_order INTEGER NOT NULL,
    category_text TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_content_id) REFERENCES activity_content(id) ON DELETE CASCADE,
    UNIQUE (activity_content_id, category_order)
);

CREATE TABLE observe_answer_keys (
    word_id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (word_id) REFERENCES observe_words(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES observe_categories(id) ON DELETE CASCADE
);

CREATE TABLE observe_answers (
    attempt_id TEXT NOT NULL,
    learner_id TEXT NOT NULL,
    unit_cycle_activity_id TEXT NOT NULL,
    word_id TEXT NOT NULL,
    selected_category_id TEXT,
    is_placed INTEGER NOT NULL DEFAULT 0 CHECK (is_placed IN (0, 1)),
    is_correct INTEGER NOT NULL DEFAULT 0 CHECK (is_correct IN (0, 1)),
    checked_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (attempt_id, word_id),
    FOREIGN KEY (attempt_id) REFERENCES activity_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_cycle_activity_id) REFERENCES unit_cycle_activities(id) ON DELETE CASCADE,
    FOREIGN KEY (word_id) REFERENCES observe_words(id) ON DELETE CASCADE,
    FOREIGN KEY (selected_category_id) REFERENCES observe_categories(id) ON DELETE CASCADE
);

CREATE TABLE observe_state (
    attempt_id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL,
    unit_cycle_activity_id TEXT NOT NULL,
    placed_count INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    total_count INTEGER NOT NULL DEFAULT 0,
    is_finished INTEGER NOT NULL DEFAULT 0 CHECK (is_finished IN (0, 1)),
    completed_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attempt_id) REFERENCES activity_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_cycle_activity_id) REFERENCES unit_cycle_activities(id) ON DELETE CASCADE
);

CREATE INDEX idx_observe_words_activity_content_id
    ON observe_words (activity_content_id);

CREATE INDEX idx_observe_categories_activity_content_id
    ON observe_categories (activity_content_id);

CREATE INDEX idx_observe_answer_keys_category_id
    ON observe_answer_keys (category_id);

CREATE INDEX idx_observe_answers_attempt_id
    ON observe_answers (attempt_id);

CREATE INDEX idx_observe_answers_word_id
    ON observe_answers (word_id);

CREATE INDEX idx_observe_answers_selected_category_id
    ON observe_answers (selected_category_id);

CREATE INDEX idx_observe_state_unit_cycle_activity_id
    ON observe_state (unit_cycle_activity_id);

CREATE INDEX idx_observe_state_learner_id
    ON observe_state (learner_id);
