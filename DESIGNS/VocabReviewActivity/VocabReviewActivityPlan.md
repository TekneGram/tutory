 ## Vocab Review Activity (End-to-End) Phased Implementation Plan

  ### Summary

  Build vocab-review as a full-stack activity with persisted learner state, matching existing activity
  architecture:

  - Renderer feature in src/features/VocabReviewActivity with WordWheel, WordCard, and ScoreDisplay.
  - Frontend boundary additions in src/app/ports + src/app/adapters.
  - IPC contract/schema/handler wiring in electron/ipc.
  - Service orchestration + repository CRUD + DB migrations in electron/services and electron/db.
  - Data source from activity content_json.words (same seed source used by other activities), with persisted per-
    word check results and overall activity state.

  ### Key Changes

  1. Phase 1: Data model + backend persistence

  - Add migrations for vocab-review content extraction + learner answer/state tables (UUID PKs, attempt-linked,
    learner/activity constrained).
  - Create repository module for vocab-review read/write operations:
      - load vocab words for unitCycleActivityId
      - load/upsert per-word learner attempts (status + latest input)
      - load/upsert activity-level check state
  - Implement vocab-review services:
      - getVocabReviewActivity (loads content + current learner state, creates attempt if missing)
      - checkVocabReviewWord (validate word belongs to activity, evaluate spelling, persist result)
      - retryVocabReviewWord (clear checked state for that word)
      - resetVocabReviewActivity (clear/reinitialize all word states for current attempt)

  2. Phase 2: IPC + frontend boundary contracts

  - Extend shared DTOs in electron/ipc/contracts/activities.contracts.ts and frontend parity types in src/app/
    ports/activities/vocabreview.ports.ts.
  - Add Zod schemas in electron/ipc/validationSchemas/activities.schemas.ts.
  - Register new channels in electron/ipc/registerHandlers/register.activities.ts:
      - activities:vocab-review:get
      - activities:vocab-review:check-word
      - activities:vocab-review:retry-word
      - activities:vocab-review:reset
  - Extend ActivitiesPort and activitiesAdapter with typed request methods.
  - Extend contract parity tests in src/app/ports/__tests__/activities.contract.test.ts.

  3. Phase 3: Feature services/hooks/UI

  - Add feature services that call adapter methods, unwrap AppResult, and throw FrontAppError.
  - Add hooks:
      - query hook for initial/persisted load
      - mutation hooks for check/retry/reset with query invalidation
      - optional workflow hook to expose UI-ready derived state
  - Implement VocabReviewActivity.tsx as orchestration/composition layer:
      - loading/error/empty branches
      - active word selection
      - state transitions (initial, selected, correct, incorrect)
      - wheel color mapping (neutral, correct, incorrect)
      - reset button visibility when all words are correct
  - Implement presentational subcomponents:
      - WordWheel clickable circumference layout + status color
      - WordCard interaction flow (glow → input/check/cancel → feedback/retry)
      - ScoreDisplay counters + congratulations state
  - Add feature-local CSS for activity/components (keep shared primitives in src/styles/* only if reused beyond
    this feature).

  4. Phase 4: Integration + validation

  - Confirm activity renders through existing registry mapping for "vocab-review".
  - Verify DB migration ordering and startup migration execution.
  - Run targeted tests and fix contract or state-transition regressions.

  ### Public Interface / DTO Additions

  - Add vocab-review DTOs to frontend and IPC boundary:
      - GetVocabReviewActivityRequest/Response
      - CheckVocabReviewWordRequest/Response
      - RetryVocabReviewWordRequest/Response
      - ResetVocabReviewActivityRequest/Response
  - Response shape includes:
      - static activity metadata (instructions, advice, title, optional assetBase)
      - canonical words[] (wordId, word, japanese, order)
      - learner state per word (status, lastAttempt, isChecked, isCorrect)
      - aggregate progress (checkedCount, correctCount, totalCount, isFinished)

  ### Test Plan

  - Backend repository tests:
      - vocab words/content retrieval
      - upsert and reset behavior for learner word state
  - Backend service tests:
      - happy path and invalid-state checks (wrong activity type, unknown word, missing content)
      - check/retry/reset scoring and completion transitions
  - IPC tests:
      - schema validation and handler wiring for all new channels
  - Frontend tests in src/features/VocabReviewActivity/__tests__:
      - component rendering branches (loading/error/ready)
      - card state transitions and button behavior
      - score updates on check/retry/reset
      - finished state + reset flow
  - Contract parity tests for new vocab-review DTOs.

  ### Assumptions and Locked Defaults

  - Scope is end-to-end in this implementation.
  - Spelling validation rule is case-insensitive + trimmed exact match.
  - Retry behavior is uncheck on retry (checked count decrements; wheel reverts to neutral for that word).
  - Word identity should be stable via persisted wordId (not raw text comparison only).
  - Notifications remain service/workflow-level; UI components stay presentational.