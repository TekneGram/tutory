# SQLite Database Schema

The following tables are templates and a conjunction table.

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE learning_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE cycle_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE activity_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE cycle_type_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cycle_type_id INTEGER NOT NULL,
    activity_type_id INTEGER NOT NULL,
    activity_order INTEGER NOT NULL,
    is_required INTEGER NOT NULL DEFAULT 1 CHECK (is_required IN (0, 1)),
    UNIQUE (cycle_type_id, activity_order),
    UNIQUE (cycle_type_id, activity_type_id),
    FOREIGN KEY (cycle_type_id) REFERENCES cycle_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (activity_type_id) REFERENCES activity_types(id) ON DELETE RESTRICT
);
```

The following table are instances of units, cycles and activities,
```sql
CREATE TABLE units (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    learning_type_id INTEGER NOT NULL,
    description TEXT,
    icon_path TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    UNIQUE (learning_type_id, sort_order),
    FOREIGN KEY (learning_type_id) REFERENCES learning_types(id) ON DELETE RESTRICT
);

CREATE TABLE unit_cycles (
    id TEXT PRIMARY KEY,
    unit_id TEXT NOT NULL,
    cycle_type_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    UNIQUE (unit_id, sort_order),
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
    FOREIGN KEY (cycle_type_id) REFERENCES cycle_types(id) ON DELETE RESTRICT
);

CREATE TABLE unit_cycle_activities (
    id TEXT PRIMARY KEY,
    unit_cycle_id TEXT NOT NULL,
    cycle_type_activity_id INTEGER NOT NULL,
    activity_order INTEGER NOT NULL,
    is_required INTEGER NOT NULL CHECK (is_required IN (0, 1)),
    UNIQUE (unit_cycle_id, activity_order),
    UNIQUE (unit_cycle_id, cycle_type_activity_id),
    FOREIGN KEY (unit_cycle_id) REFERENCES unit_cycles(id) ON DELETE CASCADE,
    FOREIGN KEY (cycle_type_activity_id) REFERENCES cycle_type_activities(id) ON DELETE RESTRICT
);

CREATE TABLE activity_content (
    id TEXT PRIMARY KEY,
    unit_cycle_activity_id TEXT NOT NULL UNIQUE,
    content_json TEXT NOT NULL CHECK (json_valid(content_json)),
    version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_cycle_activity_id) REFERENCES unit_cycle_activities(id) ON DELETE CASCADE
);
```

The following tables track learner data and progress with activities
The learner_status ensures one status per learner and the learner_status_history is updated
automatically once the status is updated.
activity_attempts keeps track of each activity. This is a denormalized table for ease of reading.
However, we use triggers to ensure that the activity_type_id is consistent and reject if not.
```sql
CREATE TABLE learners (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE learners_status_history (
    id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL,
    old_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    changed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE
);

CREATE TABLE learners_status (
    learner_id TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE
);

CREATE TRIGGER trg_learners_status_history
AFTER UPDATE OF status ON learners_status
FOR EACH ROW
WHEN OLD.status IS NOT NEW.status
BEGIN
    INSERT INTO learners_status_history (
        id,
        learner_id,
        old_status,
        new_status,
        changed_at
    ) VALUES (
        lower(hex(randomblob(16))),
        OLD.learner_id,
        OLD.status,
        NEW.status,
        CURRENT_TIMESTAMP
    );
END;

CREATE TABLE activity_attempts (
    id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL,
    unit_cycle_activity_id TEXT NOT NULL,
    activity_type_id INTEGER NOT NULL,
    attempt_number INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress',
    score REAL,
    started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    submitted_at TEXT,
    content_snapshot_json TEXT,
    UNIQUE (learner_id, unit_cycle_activity_id, attempt_number),
    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_cycle_activity_id) REFERENCES unit_cycle_activities(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_type_id) REFERENCES activity_types(id) ON DELETE RESTRICT
);

CREATE TRIGGER trg_activity_attempts_validate_activity_type_insert
  BEFORE INSERT ON activity_attempts
  FOR EACH ROW
  BEGIN
      SELECT
          CASE
              WHEN NOT EXISTS (
                  SELECT 1
                  FROM unit_cycle_activities uca
                  JOIN cycle_type_activities cta
                    ON cta.id = uca.cycle_type_activity_id
                  WHERE uca.id = NEW.unit_cycle_activity_id
                    AND cta.activity_type_id = NEW.activity_type_id
              )
              THEN RAISE(ABORT, 'activity_attempts.activity_type_id does not match unit_cycle_activity_id')
          END;
  END;


  CREATE TRIGGER trg_activity_attempts_validate_activity_type_update
  BEFORE UPDATE OF unit_cycle_activity_id, activity_type_id ON activity_attempts
  FOR EACH ROW
  BEGIN
      SELECT
          CASE
              WHEN NOT EXISTS (
                  SELECT 1
                  FROM unit_cycle_activities uca
                  JOIN cycle_type_activities cta
                    ON cta.id = uca.cycle_type_activity_id
                  WHERE uca.id = NEW.unit_cycle_activity_id
                    AND cta.activity_type_id = NEW.activity_type_id
              )
              THEN RAISE(ABORT, 'activity_attempts.activity_type_id does not match unit_cycle_activity_id')
          END;
  END;

CREATE TABLE activity_story_answers (
    attempt_id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL,
    unit_cycle_activity_id TEXT NOT NULL,
    feedback TEXT NOT NULL,
    comment TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_cycle_activity_id) REFERENCES unit_cycle_activities(id) ON DELETE CASCADE,
    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
    FOREIGN KEY (attempt_id) REFERENCES activity_attempts(id) ON DELETE CASCADE
);
```

-- CREATE TABLE activity_attempt_items (
--     id TEXT PRIMARY KEY,
--     activity_attempt_id TEXT NOT NULL,
--     content_item_key TEXT,
--     activity_item_type TEXT,
--     prompt_text TEXT,
--     user_answer_text TEXT,
--     user_answer_json TEXT,
--     is_correct INTEGER CHECK (is_correct IN (0, 1) OR is_correct IS NULL),
--     score REAL,
--     feedback TEXT,
--     sort_order INTEGER NOT NULL DEFAULT 0,
--     created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (activity_attempt_id) REFERENCES activity_attempts(id) ON DELETE CASCADE
-- );

These are indexes
```sql
CREATE INDEX idx_cycle_type_activities_cycle_type_id
    ON cycle_type_activities (cycle_type_id);

CREATE INDEX idx_units_learning_type_id
    ON units (learning_type_id);

CREATE INDEX idx_unit_cycles_unit_id
    ON unit_cycles (unit_id);

CREATE INDEX idx_unit_cycle_activities_unit_cycle_id
    ON unit_cycle_activities (unit_cycle_id);

CREATE INDEX idx_activity_attempts_learner_id
    ON activity_attempts (learner_id);

CREATE INDEX idx_activity_attempts_unit_cycle_activity_id
    ON activity_attempts (unit_cycle_activity_id);

CREATE INDEX idx_activity_attempts_activity_type_id
    ON activity_attempts (activity_type_id)
```

The following data needs inserting into the database to get started
learning_types
- (english, Learn English through various themes and activities)
- (mathematics, Learn mathematics through various themes and activities)

cycle_types:
- (story-vocab-write, Read a story, practice vocabulary and write your own story.)
- (observe-compare-write, Read, listen or watch, compare the writing and improve your own writing.)
- (predict-research-report, Watch and predict the theme, study and research the theme and write your own report about it)

activity_types
- (story, Read a story and study vocabulary)
- (multi-choice-quiz, Answers multiple choice questions)
- (vocab-review, Practice vocabulary and spelling)
- (write-extra, Add more to a story or report)
- (observe, Look at a picture and categorize words)
- (observe-describe, Describe what you see)
- (read-model, Read example sentences that describe the image, sound or movie)
- (free-writing, Write what you want, with hints to guide you)
- (topic-prediction, Predict the topic based on what you see, hear or watch)
- (research, Study a topic and write your thoughts and some notes about it)
- (text-question-answer, Answer detailed questions about what you have studied)
- (writing-scaffold, Write using sentence frames to help you write longer)
- (reflection-survey, Share your impressions and thoughts on your learning)


cycle_type_activities
- story-vocab-write has story, multi-choice-quiz, vocab-review, write-extra
- observe-compare-write has observe, observe-describe, read-model, free-writing
- predict-research-report has topic-prediction, research, text-question-answer, writing-scaffold, reflection-survey

unit
