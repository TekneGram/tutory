May 6, 2026

- Repaired stale completion reporting when activity UI shows complete but unit/cycle counters do not update.
- Root cause: counters read `activity_attempts.status`, while some pre-existing attempts had completion state in activity-specific tables but stale `activity_attempts.status`.
- Updated `getVocabReviewActivity` to reconcile `activity_attempts.status` from computed vocab progress on load.
- Updated `getMultiChoiceQuizActivity` to reconcile `activity_attempts.status` from quiz checked state on load.
- Added regression tests for both services to verify this reconciliation path.

May 6, 2026

- Updated `WordWheel` so the active associated wheel item switches from English to Japanese when `WordCard` enters `selected` state.
- Updated `WordCard` input behavior so entering `selected` state auto-focuses the spelling input; users can type immediately without an extra click.
- Added/updated `VocabReviewActivity` component tests to validate:
  - selected-state wheel label switches to Japanese for the active word
  - selected-state input autofocuses

May 6, 2026

- Identified completion reporting source: unit/cycle completion counts are computed from `activity_attempts` where `status = 'completed'`.
- Updated `multi-choice-quiz` activity services so:
  - checking answers marks the attempt `completed`
  - retry marks the attempt back to `in_progress` (submitted timestamp cleared)
- Updated `vocab-review` activity services so:
  - when all words are correct, the attempt is marked `completed`
  - word retry and full activity reset mark the attempt back to `in_progress` (submitted timestamp cleared)
- Added backend service tests to validate these status transitions for both activities.
