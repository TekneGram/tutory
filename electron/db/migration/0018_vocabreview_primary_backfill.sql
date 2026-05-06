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
WHERE at.name = 'vocab-review'
  AND NOT EXISTS (
      SELECT 1
      FROM activity_content_primary acp
      WHERE acp.activity_content_id = ac.id
  );
