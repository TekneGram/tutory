INSERT INTO write_extra_prompts (
    id,
    activity_content_id,
    instructions,
    advice,
    title,
    asset_base,
    story_text,
    image_refs_json,
    audio_refs_json
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
    COALESCE(json_extract(ac.content_json, '$.text'), '') AS story_text,
    COALESCE(json_extract(ac.content_json, '$.assets.imageRefs'), json('[]')) AS image_refs_json,
    COALESCE(json_extract(ac.content_json, '$.assets.audioRefs'), json('[]')) AS audio_refs_json
FROM activity_content ac
JOIN unit_cycle_activities uca
    ON uca.id = ac.unit_cycle_activity_id
JOIN cycle_type_activities cta
    ON cta.id = uca.cycle_type_activity_id
JOIN activity_types at
    ON at.id = cta.activity_type_id
WHERE at.name = 'write-extra'
  AND NOT EXISTS (
      SELECT 1
      FROM write_extra_prompts wep
      WHERE wep.activity_content_id = ac.id
  );
