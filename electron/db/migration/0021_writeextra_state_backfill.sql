INSERT INTO write_extra_state (
    attempt_id,
    learner_id,
    unit_cycle_activity_id,
    is_completed,
    completed_at,
    created_at,
    updated_at
)
SELECT
    aa.id AS attempt_id,
    aa.learner_id AS learner_id,
    aa.unit_cycle_activity_id AS unit_cycle_activity_id,
    CASE WHEN aa.status = 'completed' THEN 1 ELSE 0 END AS is_completed,
    aa.submitted_at AS completed_at,
    CURRENT_TIMESTAMP AS created_at,
    CURRENT_TIMESTAMP AS updated_at
FROM activity_attempts aa
JOIN unit_cycle_activities uca
    ON uca.id = aa.unit_cycle_activity_id
JOIN cycle_type_activities cta
    ON cta.id = uca.cycle_type_activity_id
JOIN activity_types at
    ON at.id = cta.activity_type_id
WHERE at.name = 'write-extra'
  AND NOT EXISTS (
      SELECT 1
      FROM write_extra_state wes
      WHERE wes.attempt_id = aa.id
  );
