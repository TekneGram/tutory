# Tutory Architecture

Tutory is a desktop app with three main layers:

- `src/`: the React UI. `src/app` holds app-wide ports, adapters, providers, and shared types. `src/features` holds domain features. `src/layout` composes those features into the main screens.
- `electron/`: the desktop backend. `main.ts` boots Electron, creates the window, initializes runtime state, and registers IPC. `preload.ts` exposes the safe `window.api` bridge to the renderer.
- `native/`: the Python or C++ side of the app. This is not a TypeScript feature folder. It is the route to the native Python or C++ programs and supporting code used for local LLM and NLP work.

Within `electron/`, responsibilities are split as follows:

- `core/`: shared backend primitives such as errors, exceptions, and request context.
- `ipc/`: IPC contracts, validation schemas, and handler registration. This is the boundary between renderer requests and backend services.
- `services/`: application/backend logic grouped by domain (`assessment`, `documents`, `feedback`, `llm`, `workspace`).
- `db/`: SQLite setup, migrations, and repositories.
- `infrastructure/`: adapters and ports for external/process boundaries, including the Python worker boundary.
- `runtime/`: startup and environment coordination such as storage bootstrap and LLM runtime path reconciliation.
- `assets/` and `bin/`: packaged backend resources and helper binaries/scripts.

The main architectural rule is:

- Frontend code should talk to backend capabilities through `src/app/ports` and adapters, not by importing from `electron/`.
- Electron owns IPC, persistence, runtime setup, and process orchestration.
- `native/` owns the Python or C++ execution side that Electron reaches through the backend infrastructure layer.

Generated output:

- `dist-electron/`: compiled Electron backend output.
- `src/dist/`: compiled renderer output.
