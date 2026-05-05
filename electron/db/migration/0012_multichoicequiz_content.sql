INSERT INTO activity_content_primary (
    id,
    activity_content_id,
    instructions,
    advice,
    title,
    asset_base
)
SELECT
    lower(hex(randomblob(4))) || '-' ||
    lower(hex(randomblob(2))) || '-' ||
    '4' || substr(lower(hex(randomblob(2))), 2) || '-' ||
    substr('89ab', (abs(random()) % 4) + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' ||
    lower(hex(randomblob(6))) AS id,
    ac.id AS activity_content_id,
    json_extract(ac.content_json, '$.instructions') AS instructions,
    json_extract(ac.content_json, '$.advice') AS advice,
    json_extract(ac.content_json, '$.title') AS title,
    json_extract(ac.content_json, '$.assetBase') AS asset_base
FROM activity_content ac
JOIN unit_cycle_activities uca
    ON uca.id = ac.unit_cycle_activity_id
JOIN cycle_type_activities cta
    ON cta.id = uca.cycle_type_activity_id
JOIN activity_types at
    ON at.id = cta.activity_type_id
WHERE at.name = 'multi-choice-quiz';

INSERT INTO activity_content_assets (
    id,
    activity_content_id,
    asset_kind,
    asset_order,
    asset_ref
)
SELECT
    lower(hex(randomblob(4))) || '-' ||
    lower(hex(randomblob(2))) || '-' ||
    '4' || substr(lower(hex(randomblob(2))), 2) || '-' ||
    substr('89ab', (abs(random()) % 4) + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' ||
    lower(hex(randomblob(6))) AS id,
    ac.id AS activity_content_id,
    'image' AS asset_kind,
    CAST(json_extract(j.value, '$.order') AS INTEGER) AS asset_order,
    json_extract(j.value, '$.imageRef') AS asset_ref
FROM activity_content ac
JOIN unit_cycle_activities uca
    ON uca.id = ac.unit_cycle_activity_id
JOIN cycle_type_activities cta
    ON cta.id = uca.cycle_type_activity_id
JOIN activity_types at
    ON at.id = cta.activity_type_id
JOIN json_each(ac.content_json, '$.assets.imageRefs') j
WHERE at.name = 'multi-choice-quiz'

UNION ALL

SELECT
    lower(hex(randomblob(4))) || '-' ||
    lower(hex(randomblob(2))) || '-' ||
    '4' || substr(lower(hex(randomblob(2))), 2) || '-' ||
    substr('89ab', (abs(random()) % 4) + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' ||
    lower(hex(randomblob(6))) AS id,
    ac.id AS activity_content_id,
    'audio' AS asset_kind,
    CAST(json_extract(j.value, '$.order') AS INTEGER) AS asset_order,
    json_extract(j.value, '$.audioRef') AS asset_ref
FROM activity_content ac
JOIN unit_cycle_activities uca
    ON uca.id = ac.unit_cycle_activity_id
JOIN cycle_type_activities cta
    ON cta.id = uca.cycle_type_activity_id
JOIN activity_types at
    ON at.id = cta.activity_type_id
JOIN json_each(ac.content_json, '$.assets.audioRefs') j
WHERE at.name = 'multi-choice-quiz'

UNION ALL

SELECT
    lower(hex(randomblob(4))) || '-' ||
    lower(hex(randomblob(2))) || '-' ||
    '4' || substr(lower(hex(randomblob(2))), 2) || '-' ||
    substr('89ab', (abs(random()) % 4) + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' ||
    lower(hex(randomblob(6))) AS id,
    ac.id AS activity_content_id,
    'video' AS asset_kind,
    CAST(json_extract(j.value, '$.order') AS INTEGER) AS asset_order,
    json_extract(j.value, '$.videoRef') AS asset_ref
FROM activity_content ac
JOIN unit_cycle_activities uca
    ON uca.id = ac.unit_cycle_activity_id
JOIN cycle_type_activities cta
    ON cta.id = uca.cycle_type_activity_id
JOIN activity_types at
    ON at.id = cta.activity_type_id
JOIN json_each(ac.content_json, '$.assets.videoRefs') j
WHERE at.name = 'multi-choice-quiz';

INSERT INTO multichoicequiz_questions (
    id,
    activity_content_id,
    question_order,
    question_text
)
SELECT
    lower(hex(randomblob(4))) || '-' ||
    lower(hex(randomblob(2))) || '-' ||
    '4' || substr(lower(hex(randomblob(2))), 2) || '-' ||
    substr('89ab', (abs(random()) % 4) + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' ||
    lower(hex(randomblob(6))) AS id,
    ac.id AS activity_content_id,
    CAST(j.key AS INTEGER) + 1 AS question_order,
    json_extract(j.value, '$.question') AS question_text
FROM activity_content ac
JOIN unit_cycle_activities uca
    ON uca.id = ac.unit_cycle_activity_id
JOIN cycle_type_activities cta
    ON cta.id = uca.cycle_type_activity_id
JOIN activity_types at
    ON at.id = cta.activity_type_id
JOIN json_each(ac.content_json, '$.questions') j
WHERE at.name = 'multi-choice-quiz';

INSERT INTO motichoicequiz_options (
    id,
    question_id,
    option_key,
    option_order,
    answer_text,
    is_correct
)
SELECT
    lower(hex(randomblob(4))) || '-' ||
    lower(hex(randomblob(2))) || '-' ||
    '4' || substr(lower(hex(randomblob(2))), 2) || '-' ||
    substr('89ab', (abs(random()) % 4) + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' ||
    lower(hex(randomblob(6))) AS id,
    q.id AS question_id,
    json_extract(a.value, '$.option') AS option_key,
    CAST(a.key AS INTEGER) + 1 AS option_order,
    json_extract(a.value, '$.answer') AS answer_text,
    CASE lower(CAST(json_extract(a.value, '$.is_correct') AS TEXT))
        WHEN 'true' THEN 1
        ELSE 0
    END AS is_correct
FROM activity_content ac
JOIN unit_cycle_activities uca
    ON uca.id = ac.unit_cycle_activity_id
JOIN cycle_type_activities cta
    ON cta.id = uca.cycle_type_activity_id
JOIN activity_types at
    ON at.id = cta.activity_type_id
JOIN json_each(ac.content_json, '$.questions') j
JOIN multichoicequiz_questions q
    ON q.activity_content_id = ac.id
    AND q.question_order = CAST(j.key AS INTEGER) + 1
JOIN json_each(j.value, '$.answers') a
WHERE at.name = 'multi-choice-quiz';
