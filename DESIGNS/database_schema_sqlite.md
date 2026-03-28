# SQLite Database Schema

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE unit_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
)

CREATE TABLE cycle_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE activity_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
);

CREATE TABLE cycle_type_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_type_id INTEGER NOT NULL,
    cycle_type_id INTEGER NOT NULL,
    activity_type_id INTEGER NOT NULL,
    activity_order INTEGER NOT NULL,
    is_required INTEGER NOT NULL DEFAULT 1 CHECK (is_required IN (0, 1)),
    UNIQUE (cycle_type_id, activity_order),
    UNIQUE (cycle_type_id, activity_type_id),
    FOREIGN KEY (unit_type_id) REFERENCES unit_types(id) ON DELETE CASCADE,
    FOREIGN KEY (cycle_type_id) REFERENCES cycle_types(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_type_id) REFERENCES activity_types(id) ON DELETE CASCADE
);

CREATE TABLE unit (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    unit_type_id INTEGER NOT NULL,
    description TEXT,
    icon_path TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    UNIQUE (unit_type_id, sort_order),
    FOREIGN KEY (unit_type_id) REFERENCES unit_types(id) ON DELETE RESTRICT
)

CREATE TABLE unit_cycles (
    id TEXT PRIMARY KEY,
    unit_id TEXT NOT NULL
    cycle_type_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    UNIQUE (unit_id, sort_order),
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE),
    FOREIGN KEY (cycle_type_id) REFERENCES cycle_types(id) ON DELETE RESTRICT
);

CREATE TABLE unit_cycle_activities (
    id TEXT PRIMARY KEY,
    unit_cycle_id TEXT NOT NULL,
    activity_type_id INTEGER NOT NULL,
    activity_order INTEGER NOT NULL,
    UNIQUE (unit_cycle_id, activity_order),
    FOREIGN KEY (unit_cycle_id) REFERENCES unit_cycles(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_type_id) REFERENCES activity_types(id) ON DELETE RESTRICT
);

CREATE TABLE activity_content (
    id TEXT PRIMARY KEY,
    unit_cycle_activity_id TEXT NOT NULL UNIQUE,
    content_json TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_cycle_activity_id) REFERENCES unit_cycle_activities(id) ON DELETE CASCADE
);

CREATE TABLE learners (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    edited_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE learners_status (
    id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE activity_attempts (
    id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL,
    unit_cycle_activity_id INTEGER NOT NULL,
    attempt_number INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress',
    score REAL,
    started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    submitted_at TEXT,
    content_snapshot_json TEXT,
    UNIQUE (user_id, unit_cycle_activity_id, attempt_number),
    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_cycle_activity_id) REFERENCES unit_cycle_activities(id) ON DELETE CASCADE
);

CREATE TABLE activity_story_answers (
    id TEXT PRIMARY KEY,
    attempt_id TEXT NOT NULL,
    learner_id TEXT NOT NULL,
    unit_cycle_activity_id TEXT NOT NULL
    feedback TEXT NOT NULL,
    comment TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activity_attempt_items (
    id TEXT PRIMARY KEY,
    activity_attempt_id INTEGER NOT NULL,
    content_item_key TEXT,
    activity_item_type TEXT,
    prompt_text TEXT,
    user_answer_text TEXT,
    user_answer_json TEXT,
    is_correct INTEGER CHECK (is_correct IN (0, 1) OR is_correct IS NULL),
    score REAL,
    feedback TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_attempt_id) REFERENCES activity_attempts(id) ON DELETE CASCADE
);

CREATE INDEX idx_cycle_type_activities_cycle_type_id
    ON cycle_type_activities (cycle_type_id);

CREATE INDEX idx_unit_cycles_unit_type_id
    ON unit_cycles (unit_type_id);

CREATE INDEX idx_unit_cycle_activities_unit_cycle_id
    ON unit_cycle_activities (unit_cycle_id);

CREATE INDEX idx_activity_attempts_user_id
    ON activity_attempts (user_id);

CREATE INDEX idx_activity_attempts_unit_cycle_activity_id
    ON activity_attempts (unit_cycle_activity_id);

CREATE INDEX idx_activity_attempt_items_attempt_id
    ON activity_attempt_items (activity_attempt_id);
```

The following data needs inserting into the database to get started
unit_types
- english
- mathematics

cycle_types:
- story-vocab-write
- observe-compare-write
- predict-research-report

activity_types
- story
- multi-choice-quiz
- vocab-review
- write-extra
- observe
- observe-describe
- read-model
- free-writing
- listen-sound-effect
- reflection-survey
- research
- writing-scaffold
- topic-prediction
- text-question-answer


cycle_type_activities
- story-vocab-write has story, multi-choice-quiz, vocab-review, write-extra
- observe-compare-write has observe, observe-describe, read-model, free-writing
- predict-research-report has topic-prediction, research, text-question-answer, writing-scaffold, reflection-survey
The above are all for unit_types.name = english

units

unit
