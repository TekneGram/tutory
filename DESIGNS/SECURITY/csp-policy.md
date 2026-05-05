Set an explicit strict CSP and remove unsafe-eval from renderer execution paths.

Practical fix path:

Define CSP for production
In renderer HTML (or response headers), set a policy like:
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'
Keep nodeIntegration: false and contextIsolation: true
In BrowserWindow webPreferences.
Continue using your preload bridge only.
Handle development separately
Dev HMR/sourcemaps may require eval-like behavior.
Use a dev-only CSP that is as tight as possible, then enforce strict CSP in production.
Best outcome: configure bundler devtool/sourcemap mode to avoid eval so you can remove unsafe-eval even in dev.
Verify no runtime eval usage
Remove/avoid eval, new Function, and libraries that depend on them in renderer code.
Confirm with Electron checklist
Test again and ensure warning disappears in dev (or is only dev-only by policy choice) and is fully gone in packaged build.

****************

Cause is confirmed: your renderer has no CSP defined.


index.html has no <meta http-equiv="Content-Security-Policy" ...>.

electron/main.ts does not set CSP headers via webRequest.onHeadersReceived.

So Electron sees “no CSP or unsafe-eval CSP” and shows the warning.


Secondary factor in dev:


You use Vite + React + vite-plugin-electron in vite.config.ts, and dev tooling can rely on eval-like behavior depending on mode/plugin internals. Without an explicit CSP, Electron still warns.


What to do (without changing behavior yet):

Add an explicit CSP (meta tag or response header) so renderer is never “no CSP”.
Keep script-src free of 'unsafe-eval' for production.
If dev tooling needs looser rules, make that dev-only and keep production strict.
Also explicitly set contextIsolation: true and nodeIntegration: false in BrowserWindow webPreferences (defense-in-depth), even if defaults currently match.