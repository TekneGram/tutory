# Observe Activity Agent Update

## 2026-05-06
- Randomized `WordsPanel` order in `ObserveActivity` for the initial state, with session-scoped ordering and a reshuffle on reset.
- Added observe wrapper and migration coverage for `MultipleImageDisplay` and observe backfill SQL.
- Repaired the `ObserveActivity.tsx` word-order implementation by simplifying the derived available-word list and moving the shuffle helper to a pure top-level function.
