Use `electron/infrastructure/*` for Electron/platform capability boundaries used by backend services.

Purpose
  - `ports/*` defines small interfaces for platform capabilities.
  - `adapters/*` implements those interfaces using Electron APIs or other platform libraries.
  - `protocols/*` registers custom Electron protocols for renderer-accessible runtime resources such as packaged content assets.

Use this layer when
  - a service needs direct Electron/platform capabilities such as:
    - dialogs
    - BrowserWindow-aware behavior
    - shell/openExternal
    - clipboard
    - native notifications
  - the renderer needs a URL-based path to read packaged or runtime-managed assets through a custom protocol instead of request/response IPC

Rules
  - Services should depend on infrastructure ports when the capability belongs to this boundary.
  - Adapters are the place where direct Electron/platform API calls should live.
  - Protocol registration belongs here when Electron main must expose renderer-consumable asset URLs such as `app-asset://...`.
  - This layer is optional; do not add a port/adapter unless the platform capability is reusable, likely to grow, or would otherwise spread across services.
  - Keep ports small and capability-focused.
  - Keep adapters thin and implementation-focused.
  - Keep protocol handlers thin and boundary-focused.
  - Protocol handlers should validate and safely resolve asset paths, then return a `Response`; they should not contain business orchestration.
  - Prefer one general read-only asset protocol for packaged content roots over many media-type-specific protocols.
  - Use IPC to fetch structured metadata/DTOs, and use custom protocols to serve binary/static asset bytes to the renderer.
  - When protocol helpers detect known failures such as invalid paths or missing files, raise structured backend errors internally and translate them into protocol `Response` status codes at the protocol boundary.
  - Do not put business logic here.
  - Do not register IPC handlers here.
  - Do not put DB logic here.
  - Do not put runtime path policy here.

Goal
  - Keep Electron/platform API usage from spreading across services while avoiding unnecessary architecture
  elsewhere.
  - Keep URL-based asset serving separate from IPC request/response flows while still using the same backend error vocabulary internally.

Testing
  - Write adapter tests here when Electron/platform wrapper behavior is non-trivial.
  - Write protocol tests here when custom protocol path resolution, status mapping, or security checks are non-trivial.
  - Mock Electron APIs directly in this layer's tests.
  - Do not retest service orchestration here.
