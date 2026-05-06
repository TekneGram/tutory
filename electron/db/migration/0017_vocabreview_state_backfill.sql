INSERT INTO vocab_review_state (
    attempt_id,
    learner_id,
    unit_cycle_activity_id,
    checked_count,
    correct_count,
    total_count,
    is_finished,
    completed_at,
    created_at,
    updated_at
)
SELECT
    aa.id AS attempt_id,
    aa.learner_id AS learner_id,
    aa.unit_cycle_activity_id AS unit_cycle_activity_id,
    0 AS checked_count,
    0 AS correct_count,
    (
        SELECT COUNT(*)
        FROM vocab_review_words vrw
        JOIN activity_content ac
            ON ac.id = vrw.activity_content_id
        WHERE ac.unit_cycle_activity_id = aa.unit_cycle_activity_id
    ) AS total_count,
    0 AS is_finished,
    NULL AS completed_at,
    CURRENT_TIMESTAMP AS created_at,
    CURRENT_TIMESTAMP AS updated_at
FROM activity_attempts aa
JOIN unit_cycle_activities uca
    ON uca.id = aa.unit_cycle_activity_id
JOIN cycle_type_activities cta
    ON cta.id = uca.cycle_type_activity_id
JOIN activity_types at
    ON at.id = cta.activity_type_id
WHERE at.name = 'vocab-review'
  AND NOT EXISTS (
      SELECT 1
      FROM vocab_review_state vrs
      WHERE vrs.attempt_id = aa.id
  );
