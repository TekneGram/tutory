INSERT INTO learning_types (name, description) VALUES
    ('english', 'Learn English through various themes and activities'),
    ('mathematics', 'Learn mathematics through various themes and activities');

INSERT INTO cycle_types (name, description) VALUES
    ('story-vocab-write', 'Read a story, practice vocabulary and write your own story.'),
    ('observe-compare-write', 'Read, listen or watch, compare the writing and improve your own writing.'),
    ('predict-research-report', 'Watch and predict the theme, study and research the theme and write your own report about it');

INSERT INTO activity_types (name, description) VALUES
    ('story', 'Read a story and study vocabulary'),
    ('multi-choice-quiz', 'Answers multiple choice questions'),
    ('vocab-review', 'Practice vocabulary and spelling'),
    ('write-extra', 'Add more to a story or report'),
    ('observe', 'Look at a picture and categorize words'),
    ('observe-describe', 'Describe what you see'),
    ('read-model', 'Read example sentences that describe the image, sound or movie'),
    ('free-writing', 'Write what you want, with hints to guide you'),
    ('topic-prediction', 'Predict the topic based on what you see, hear or watch'),
    ('research', 'Study a topic and write your thoughts and some notes about it'),
    ('text-question-answer', 'Answer detailed questions about what you have studied'),
    ('writing-scaffold', 'Write using sentence frames to help you write longer'),
    ('reflection-survey', 'Share your impressions and thoughts on your learning');

INSERT INTO cycle_type_activities (
    cycle_type_id,
    activity_type_id,
    activity_order,
    is_required
) VALUES
    (
        (SELECT id FROM cycle_types WHERE name = 'story-vocab-write'),
        (SELECT id FROM activity_types WHERE name = 'story'),
        1,
        1
    ),
    (
        (SELECT id FROM cycle_types WHERE name = 'story-vocab-write'),
        (SELECT id FROM activity_types WHERE name = 'multi-choice-quiz'),
        2,
        1
    ),
    (
        (SELECT id FROM cycle_types WHERE name = 'story-vocab-write'),
        (SELECT id FROM activity_types WHERE name = 'vocab-review'),
        3,
        1
    ),
    (
        (SELECT id FROM cycle_types WHERE name = 'story-vocab-write'),
        (SELECT id FROM activity_types WHERE name = 'write-extra'),
        4,
        1
    ),
    (
        (SELECT id FROM cycle_types WHERE name = 'observe-compare-write'),
        (SELECT id FROM activity_types WHERE name = 'observe'),
        1,
        1
    ),
    (
        (SELECT id FROM cycle_types WHERE name = 'observe-compare-write'),
        (SELECT id FROM activity_types WHERE name = 'observe-describe'),
        2,
        1
    ),
    (
        (SELECT id FROM cycle_types WHERE name = 'observe-compare-write'),
        (SELECT id FROM activity_types WHERE name = 'read-model'),
        3,
        1
    ),
    (
        (SELECT id FROM cycle_types WHERE name = 'observe-compare-write'),
        (SELECT id FROM activity_types WHERE name = 'free-writing'),
        4,
        1
    ),
    (
        (SELECT id FROM cycle_types WHERE name = 'predict-research-report'),
        (SELECT id FROM activity_types WHERE name = 'topic-prediction'),
        1,
        1
    ),
    (
        (SELECT id FROM cycle_types WHERE name = 'predict-research-report'),
        (SELECT id FROM activity_types WHERE name = 'research'),
        2,
        1
    ),
    (
        (SELECT id FROM cycle_types WHERE name = 'predict-research-report'),
        (SELECT id FROM activity_types WHERE name = 'text-question-answer'),
        3,
        1
    ),
    (
        (SELECT id FROM cycle_types WHERE name = 'predict-research-report'),
        (SELECT id FROM activity_types WHERE name = 'writing-scaffold'),
        4,
        1
    ),
    (
        (SELECT id FROM cycle_types WHERE name = 'predict-research-report'),
        (SELECT id FROM activity_types WHERE name = 'reflection-survey'),
        5,
        1
    );
