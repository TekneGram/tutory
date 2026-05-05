CREATE TABLE activity_content_primary (
    id TEXT PRIMARY KEY,
    activity_content_id TEXT NOT NULL UNIQUE,
    instructions TEXT NOT NULL,
    advice TEXT NOT NULL,
    title TEXT NOT NULL,
    asset_base TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_content_id) REFERENCES activity_content(id) ON DELETE CASCADE
);

CREATE TABLE activity_content_assets (
    id TEXT PRIMARY KEY,
    activity_content_id TEXT NOT NULL,
    asset_kind TEXT NOT NULL CHECK (asset_kind IN ('image', 'audio', 'video')),
    asset_order INTEGER NOT NULL,
    asset_ref TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_content_id) REFERENCES activity_content(id) ON DELETE CASCADE,
    UNIQUE (activity_content_id, asset_kind, asset_order)
);

CREATE TABLE multichoicequiz_questions (
    id TEXT PRIMARY KEY,
    activity_content_id TEXT NOT NULL,
    question_order INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_content_id) REFERENCES activity_content(id) ON DELETE CASCADE,
    UNIQUE (activity_content_id, question_order)
);

CREATE TABLE multichoicequiz_options (
    id TEXT PRIMARY KEY,
    question_id TEXT NOT NULL,
    option_key TEXT NOT NULL,
    option_order INTEGER NOT NULL,
    answer_text TEXT NOT NULL,
    is_correct INTEGER NOT NULL CHECK (is_correct IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES multichoicequiz_questions(id) ON DELETE CASCADE,
    UNIQUE (question_id, option_key),
    UNIQUE (question_id, option_order)
);

CREATE INDEX idx_activity_content_primary_activity_content_id
    ON activity_content_primary (activity_content_id);

CREATE INDEX idx_activity_content_assets_activity_content_id
    ON activity_content_assets (activity_content_id);

CREATE INDEX idx_activity_content_assets_kind_order
    ON activity_content_assets (asset_kind, asset_order);

CREATE INDEX idx_multichoicequiz_questions_activity_content_id
    ON multichoicequiz_questions (activity_content_id);

CREATE INDEX idx_multichoicequiz_questions_activity_content_order
    ON multichoicequiz_questions (activity_content_id, question_order);

CREATE INDEX idx_multichoicequiz_options_question_id
    ON multichoicequiz_options (question_id);
