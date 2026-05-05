Updated: 2026-05-05 16:15:48 JST

- Added `0011_multichoicequiz_tables.sql` with new normalized tables:
`activity_content_primary`, `activity_content_assets`, `multichoicequiz_questions`, and `motichoicequiz_options`.
- All new primary keys use UUID text values generated in SQL.
- Added `0012_multichoicequiz_content.sql` to backfill multi-choice quiz data from `activity_content.content_json` into the new tables.
- Questions and options now have stable row IDs, enabling question-level tracking without matching on question text.
