Updated: 2026-05-05 16:39:22 JST

- Added `0011_multichoicequiz_tables.sql` with new normalized tables:
`activity_content_primary`, `activity_content_assets`, `multichoicequiz_questions`, and `multichoicequiz_options`.
- All new primary keys use UUID text values generated in SQL.
- Added `0012_multichoicequiz_content.sql` to backfill multi-choice quiz data from `activity_content.content_json` into the new tables.
- Questions and options now have stable row IDs, enabling question-level tracking without matching on question text.
- Added `0013_multichoicequiz_answers_question_ids.sql` to migrate `multi_choice_quiz_answers` to ID-based tracking with `question_id` and composite key `(attempt_id, question_id)`.
- Updated multi-choice quiz retrieval to read from normalized tables instead of parsing `activity_content.content_json`.
- Updated multi-choice quiz contracts/ports to include `questionId` and `optionId` in the response model.
- Disabled activity attempt content snapshot writes in story and multi-choice services (they now persist `content_snapshot_json = null`).
- DB column removal for `content_snapshot_json` is intentionally deferred.
