# Upgrade Notes

## TypeScript 7 Migration Task

- Current status: `tsconfig.json` uses `"ignoreDeprecations": "6.0"` to temporarily suppress the TypeScript 6 `baseUrl` deprecation warning.
- Before upgrading to TypeScript 7:
  - Remove reliance on `compilerOptions.baseUrl`.
  - Keep path aliases working via explicit `paths` and matching Vite/Vitest/ESLint alias config.
  - Remove `"ignoreDeprecations": "6.0"` after migration is complete.
