## Observe Activity Implementation Plan (4 Phases)

  ### Summary

  Deliver ObserveActivity end-to-end in four implementation phases: data model + backend, frontend contracts +
  services/hooks, UI/UX implementation, and test/validation hardening.

  ### Phase 1: Data Model + Backend Core

  - Add DB migrations for observe activity:
      - normalized content tables (words, categories, answer key)
      - learner placement/state tables
      - content backfill from existing observe JSON in 0005_unit1_seeds.sql
  - Add observe repositories in electron/db/repositories/activity.observeRepositories.ts.
  - Add observe services in electron/services/activities/observe/:
      - getObserveActivity
      - placeObserveWord
      - resetObserveActivity
  - Ensure service logic updates activity_attempts.status to completed on full completion and back to in_progress
    on reset.

  ### Phase 2: IPC + Frontend Contracts/Adapters

  - Add observe request/response types in:
      - electron/ipc/contracts/activities.contracts.ts
      - src/app/ports/activities/observe.ports.ts
  - Add validation schemas in electron/ipc/validationSchemas/activities.schemas.ts.
  - Register observe handlers/channels in electron/ipc/registerHandlers/register.activities.ts:
      - activities:observe:get
      - activities:observe:place-word
      - activities:observe:reset
  - Extend ActivitiesPort and activitiesAdapter with observe methods.
  - Add/extend shared media DTOs in src/app/types/media.ts for reusable image refs.

  ### Phase 3: Feature UI + Reusable Image Display

  - Implement reusable src/features/AppWide/MultipleImageDisplay.tsx:
      - ordered image rendering
      - next/prev navigation
      - empty/error handling
      - asset URL resolution with assetBase
  - Implement src/features/ObserveActivity:
      - ObserveActivity.tsx orchestration
      - WordsPanel, WordCard, CategoriesPanel, CategoryCard
      - drag-and-drop interactions
      - state behavior:
          - initial: all words in tray
          - started: correct sticks/green, incorrect returns/red
          - complete: congratulation message + reset control
  - Add feature hooks/services for query + place + reset mutations with progress-key invalidation.

  ### Phase 4: Tests + Verification

  - Frontend tests:
      - loading/error/success rendering
      - drop behavior (correct/incorrect)
      - completion + reset flow
      - MultipleImageDisplay behavior
  - Backend tests:
      - observe repository CRUD/reset behavior
      - service correctness/state transitions
      - completion/reset status updates on activity_attempts
  - Migration tests:
      - backfill integrity
      - answer-key and relational constraints
  - Run typecheck and targeted vitest suites for touched areas.

  ### Public API / Interface Changes

  - New observe port DTOs and methods:
      - getObserveActivity
      - placeObserveWord
      - resetObserveActivity
  - New IPC contracts/schemas/channels for observe operations.
  - Shared media image type(s) for app-wide image component reuse.

  ### Assumptions and Defaults

  - Native HTML5 drag-and-drop (no new dependency).
  - Incorrect placements are persisted and visually shown as red before returning to tray.
  - Completion means all words are correctly placed.
  - Reset toggles learner attempt back to non-complete state.