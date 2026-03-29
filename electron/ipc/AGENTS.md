Use `electron/ipc/*` for the transport boundary between the renderer and the Electron main process.

  Purpose

  - Receive renderer requests.
  - validate raw IPC payloads.
  - normalize handler success/failure into backend `Result<T>`.
  - define shared request/response/event DTOs.

  Files

  - `registerHandlers.ts`
    - top-level composition entrypoint for handler registration
  - `registerHandlers/*`
    - register handlers by domain/concern
  - `contracts/*`
    - request, response, and event shapes
  - `validationSchemas/*`
    - Zod schemas for incoming raw payloads
  - `validate.ts`
    - boundary validation helper
  - `safeHandle.ts`
    - request-scoped error normalization and correlation context

  Rules

  - Keep `registerHandlers.ts` thin.
  - Register handlers by domain/concern in `registerHandlers/*`.
  - For a new backend domain, add a new registration module such as `registerHandlers/register.<domain>.ts` and compose it from `registerHandlers.ts`.
  - Prefer consistent domain naming across IPC files when they map to a backend service domain.
    - Example:
      - `services/settings/*`
      - `registerHandlers/register.settings.ts`
      - `validationSchemas/settings.schemas.ts`
      - `contracts/settings.contracts.ts`
  - Use that naming convention for readability and navigation when the IPC file is domain-specific.
  - Shared transport-level files that are not tied to one service domain may use a more descriptive non-domain filename, such as `progress.event.contracts.ts`.
  - Keep handlers thin: validate input, call a service, return the result.
  - Validate raw payloads at the IPC boundary.
  - Use contracts as the shared source of truth for IPC shapes.
  - Do not put business orchestration here.
  - Do not put raw SQL here.
  - Do not put Electron platform capability logic here.

  Pattern

  - renderer calls IPC
  - IPC validates request
  - IPC delegates to service
  - `safeHandle` returns `Result<T>`

  Testing

  - Write unit tests here for validation helpers, request/result normalization, and other IPC-boundary behavior.
  - Mock services in IPC tests; do not duplicate service orchestration tests here.
  - Test boundary validation and `Result<T>` wrapping precisely.
