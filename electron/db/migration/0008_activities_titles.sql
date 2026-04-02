ALTER TABLE unit_cycle_activities ADD COLUMN title TEXT;

UPDATE unit_cycle_activities
SET title = 'Story'
WHERE id = 'unit_pets_cycle_1_activity_1';

UPDATE unit_cycle_activities
SET title = 'Quiz'
WHERE id = 'unit_pets_cycle_1_activity_2';

UPDATE unit_cycle_activities
SET title = 'Spell'
WHERE id = 'unit_pets_cycle_1_activity_3';

UPDATE unit_cycle_activities
SET title = 'Write'
WHERE id = 'unit_pets_cycle_1_activity_4';

UPDATE unit_cycle_activities
SET title = 'Animals'
WHERE id = 'unit_pets_cycle_2_activity_1';

UPDATE unit_cycle_activities
SET title = 'Steps'
WHERE id = 'unit_pets_cycle_2_activity_2';

UPDATE unit_cycle_activities
SET title = 'Read'
WHERE id = 'unit_pets_cycle_2_activity_3';

UPDATE unit_cycle_activities
SET title = 'Write'
WHERE id = 'unit_pets_cycle_2_activity_4';

UPDATE unit_cycle_activities
SET title = 'Guess'
WHERE id = 'unit_pets_cycle_3_activity_1';

UPDATE unit_cycle_activities
SET title = 'Share'
WHERE id = 'unit_pets_cycle_3_activity_2';

UPDATE unit_cycle_activities
SET title = 'Questions'
WHERE id = 'unit_pets_cycle_3_activity_3';

UPDATE unit_cycle_activities
SET title = 'Report'
WHERE id = 'unit_pets_cycle_3_activity_4';

UPDATE unit_cycle_activities
SET title = 'Summary'
WHERE id = 'unit_pets_cycle_3_activity_5';
