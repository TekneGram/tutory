INSERT INTO observe_prompts (
    id,
    activity_content_id,
    instructions,
    advice,
    title,
    asset_base,
    image_refs_json
)
SELECT
    lower(hex(randomblob(4))) || '-' ||
    lower(hex(randomblob(2))) || '-' ||
    '4' || substr(lower(hex(randomblob(2))), 2) || '-' ||
    substr('89ab', (abs(random()) % 4) + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' ||
    lower(hex(randomblob(6))) AS id,
    ac.id AS activity_content_id,
    COALESCE(json_extract(ac.content_json, '$.instructions'), '') AS instructions,
    COALESCE(json_extract(ac.content_json, '$.advice'), '') AS advice,
    COALESCE(json_extract(ac.content_json, '$.title'), '') AS title,
    json_extract(ac.content_json, '$.assetBase') AS asset_base,
    COALESCE(json_extract(ac.content_json, '$.assets.imageRefs'), json('[]')) AS image_refs_json
FROM activity_content ac
JOIN unit_cycle_activities uca
    ON uca.id = ac.unit_cycle_activity_id
JOIN cycle_type_activities cta
    ON cta.id = uca.cycle_type_activity_id
JOIN activity_types at
    ON at.id = cta.activity_type_id
WHERE at.name = 'observe'
  AND NOT EXISTS (
      SELECT 1
      FROM observe_prompts op
      WHERE op.activity_content_id = ac.id
  );

INSERT INTO observe_words (
    id,
    activity_content_id,
    word_order,
    word_text
)
SELECT
    lower(hex(randomblob(4))) || '-' ||
    lower(hex(randomblob(2))) || '-' ||
    '4' || substr(lower(hex(randomblob(2))), 2) || '-' ||
    substr('89ab', (abs(random()) % 4) + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' ||
    lower(hex(randomblob(6))) AS id,
    ac.id AS activity_content_id,
    CAST(j.key AS INTEGER) + 1 AS word_order,
    json_extract(j.value, '$.word') AS word_text
FROM activity_content ac
JOIN unit_cycle_activities uca
    ON uca.id = ac.unit_cycle_activity_id
JOIN cycle_type_activities cta
    ON cta.id = uca.cycle_type_activity_id
JOIN activity_types at
    ON at.id = cta.activity_type_id
JOIN json_each(ac.content_json, '$.words') j
WHERE at.name = 'observe'
  AND json_extract(j.value, '$.word') IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM observe_words ow
      WHERE ow.activity_content_id = ac.id
        AND ow.word_order = CAST(j.key AS INTEGER) + 1
  );

INSERT INTO observe_categories (
    id,
    activity_content_id,
    category_order,
    category_text
)
SELECT
    lower(hex(randomblob(4))) || '-' ||
    lower(hex(randomblob(2))) || '-' ||
    '4' || substr(lower(hex(randomblob(2))), 2) || '-' ||
    substr('89ab', (abs(random()) % 4) + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' ||
    lower(hex(randomblob(6))) AS id,
    ac.id AS activity_content_id,
    CAST(j.key AS INTEGER) + 1 AS category_order,
    json_extract(j.value, '$.category') AS category_text
FROM activity_content ac
JOIN unit_cycle_activities uca
    ON uca.id = ac.unit_cycle_activity_id
JOIN cycle_type_activities cta
    ON cta.id = uca.cycle_type_activity_id
JOIN activity_types at
    ON at.id = cta.activity_type_id
JOIN json_each(ac.content_json, '$.categories') j
WHERE at.name = 'observe'
  AND json_extract(j.value, '$.category') IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM observe_categories oc
      WHERE oc.activity_content_id = ac.id
        AND oc.category_order = CAST(j.key AS INTEGER) + 1
  );

INSERT INTO observe_answer_keys (
    word_id,
    category_id,
    created_at,
    updated_at
)
SELECT
    ow.id AS word_id,
    oc.id AS category_id,
    CURRENT_TIMESTAMP AS created_at,
    CURRENT_TIMESTAMP AS updated_at
FROM observe_words ow
JOIN observe_categories oc
    ON oc.activity_content_id = ow.activity_content_id
WHERE lower(trim(oc.category_text)) = (
    CASE
        WHEN lower(trim(ow.word_text)) IN ('lion', 'giraffe', 'monkey', 'elephant') THEN 'animals'
        WHEN lower(trim(ow.word_text)) IN ('scared', 'happy', 'excited', 'ridiculous') THEN 'feelings'
        WHEN lower(trim(ow.word_text)) IN ('training', 'beg', 'sit', 'jump', 'run away', 'run') THEN 'actions'
        ELSE ''
    END
)
AND NOT EXISTS (
    SELECT 1
    FROM observe_answer_keys oak
    WHERE oak.word_id = ow.id
);
