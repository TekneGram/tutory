ALTER TABLE cycle_types ADD COLUMN asset_base TEXT;

ALTER TABLE cycle_types ADD COLUMN icon_path TEXT;

UPDATE cycle_types
SET
    asset_base = 'english/unit_1/icons',
    icon_path = 'cycle_1_icon.webp'
WHERE name = 'story-vocab-write';

UPDATE cycle_types
SET
    asset_base = 'english/unit_1/icons',
    icon_path = 'cycle_2_icon.webp'
WHERE name = 'observe-compare-write';

UPDATE cycle_types
SET
    asset_base = 'english/unit_1/icons',
    icon_path = 'cycle_3_icon.webp'
WHERE name = 'predict-research-report';
