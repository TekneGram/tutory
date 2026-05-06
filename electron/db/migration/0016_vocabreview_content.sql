INSERT INTO vocab_review_words (
    id,
    activity_content_id,
    word_order,
    word_text,
    japanese_text
)
SELECT
    lower(hex(randomblob(4))) || '-' ||
    lower(hex(randomblob(2))) || '-' ||
    '4' || substr(lower(hex(randomblob(2))), 2) || '-' ||
    substr('89ab', (abs(random()) % 4) + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' ||
    lower(hex(randomblob(6))) AS id,
    ac.id AS activity_content_id,
    CAST(j.key AS INTEGER) + 1 AS word_order,
    json_extract(j.value, '$.word') AS word_text,
    json_extract(j.value, '$.japanese') AS japanese_text
FROM activity_content ac
JOIN unit_cycle_activities uca
    ON uca.id = ac.unit_cycle_activity_id
JOIN cycle_type_activities cta
    ON cta.id = uca.cycle_type_activity_id
JOIN activity_types at
    ON at.id = cta.activity_type_id
JOIN json_each(ac.content_json, '$.words') j
WHERE at.name = 'vocab-review'
  AND json_extract(j.value, '$.word') IS NOT NULL
  AND json_extract(j.value, '$.japanese') IS NOT NULL;
