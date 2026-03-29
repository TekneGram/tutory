ALTER TABLE units ADD COLUMN asset_base TEXT;

UPDATE units
SET
    asset_base = 'english/unit_1/icons',
    icon_path = 'unit_icon.webp'
WHERE id = 'unit_pets';
