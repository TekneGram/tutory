 ## Write Extra Activity Implementation Plan (4 Phases)

  ### Summary

  Deliver write-extra as a full vertical slice with persisted learner draft/completion state, protocol-based ass
  et rendering (app-asset://content/...), and the required 4-state UI flow in src/features/WriteExtraActivity.

  ### Phase 1: Data and Backend Foundations

  1. Add migrations in electron/db/migration for:
  2. write_extra_prompts (normalized prompt/content keyed by activity_content_id).
  3. write_extra_answers (learner text by attempt).
  4. write_extra_state (is_completed, timestamps, optional stored word count).
  5. Backfill prompt/content rows for seeded write-extra activities from existing activity_content JSON.
  6. Ensure completion/reset semantics update activity_attempts.status for progress counting.
  7. Add repository module electron/db/repositories/activity.writeExtraRepositories.ts with SQL-only CRUD and
     tests.

  ### Phase 2: Service + IPC + Frontend Boundary

  1. Add electron/services/activities/writeExtra/:
  2. getWriteExtraActivity.ts
  3. submitWriteExtra.ts (enforce 25-word minimum server-side)
  4. resumeWriteExtra.ts
  5. DTO parse/transform helpers.
  6. Extend IPC:
  7. electron/ipc/contracts/activities.contracts.ts
  8. electron/ipc/validationSchemas/activities.schemas.ts
  9. electron/ipc/registerHandlers/register.activities.ts
  10. Extend frontend app boundary:
  11. src/app/ports/activities/writeextra.ports.ts
  12. src/app/ports/activities.ports.ts
  13. src/app/adapters/activities.adapters.ts
  14. Add adapter/contract parity tests for new channels and DTO shapes.

  ### Phase 3: WriteExtraActivity UI Implementation

  1. Implement feature hooks/services in src/features/WriteExtraActivity/hooks and services for get/submit/resume
     with React Query invalidation aligned to existing activity patterns.
  2. Build UI components and compose WriteExtraActivity.tsx in required order:
  3. Title → instructions
  4. ImageSummary
  5. Story text
  6. Hint/advice
  7. ListenToSummary audio controls
  8. WriteExtra editor area
  9. Implement WriteExtra state machine:
  10. initial (empty draft, count 0)
  11. started (<25 words)
  12. ready-to-submit (>=25 words, submit visible)
  13. completed (read-only text, completion message, continue-writing button)
  14. Editor choice: textarea + simple formatting buttons (bold/italic/etc marker insertion).
  15. Word count: regex token counting.
  16. Asset handling: resolve image/audio refs via assetBase to app-asset://content/... (no direct filesystem ac
     cess).

  ### Phase 4: Validation and End-to-End Confidence

  1. Backend tests:
  2. Repository CRUD/state transition tests.
  3. Service tests for get/submit/resume, including min-word rejection and completion toggling.
  4. IPC tests for payload validation and handler wiring.
  5. Frontend tests:
  6. Component tests for 4-state transitions and submit gating.
  7. Hook/mutation tests for optimistic/error behavior as needed.
  8. Asset URL rendering tests for image/audio refs with/without assetBase.
  9. Run targeted test suites and fix regressions until green.

  ### Assumptions and Defaults

  1. Persistence uses dedicated write-extra tables.
  2. Completion is represented both in write-extra state and activity_attempts.status.
  3. Stored learner content remains plain text (with optional markdown-style markers from formatting buttons).
  4. Existing app-asset protocol remains the only asset-delivery path for packaged content.