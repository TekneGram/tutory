PRAGMA foreign_keys = OFF;

CREATE TABLE multi_choice_quiz_answers_new (
    attempt_id TEXT NOT NULL,
    learner_id TEXT NOT NULL,
    unit_cycle_activity_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    question TEXT NOT NULL,
    is_answered INTEGER NOT NULL DEFAULT 0 CHECK (is_answered IN (0, 1)),
    selected_option TEXT,
    is_correct INTEGER NOT NULL DEFAULT 1 CHECK (is_correct IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (attempt_id, question_id),
    FOREIGN KEY (unit_cycle_activity_id) REFERENCES unit_cycle_activities(id) ON DELETE CASCADE,
    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
    FOREIGN KEY (attempt_id) REFERENCES activity_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES multichoicequiz_questions(id) ON DELETE CASCADE
);

INSERT INTO multi_choice_quiz_answers_new (
    attempt_id,
    learner_id,
    unit_cycle_activity_id,
    question_id,
    question,
    is_answered,
    selected_option,
    is_correct,
    created_at,
    updated_at
)
SELECT
    mcqa.attempt_id,
    mcqa.learner_id,
    mcqa.unit_cycle_activity_id,
    mq.id AS question_id,
    mcqa.question,
    mcqa.is_answered,
    mcqa.selected_option,
    mcqa.is_correct,
    mcqa.created_at,
    mcqa.updated_at
FROM multi_choice_quiz_answers mcqa
JOIN activity_attempts aa
    ON aa.id = mcqa.attempt_id
JOIN activity_content ac
    ON ac.unit_cycle_activity_id = aa.unit_cycle_activity_id
JOIN multichoicequiz_questions mq
    ON mq.activity_content_id = ac.id
    AND mq.question_text = mcqa.question;

DROP TABLE multi_choice_quiz_answers;

ALTER TABLE multi_choice_quiz_answers_new RENAME TO multi_choice_quiz_answers;

CREATE INDEX idx_multi_choice_quiz_answers_attempt_id
    ON multi_choice_quiz_answers (attempt_id);

CREATE INDEX idx_multi_choice_quiz_answers_question_id
    ON multi_choice_quiz_answers (question_id);

PRAGMA foreign_keys = ON;
