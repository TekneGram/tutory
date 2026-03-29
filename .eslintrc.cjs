module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'no-window-api-outside-adapters': 'error',
    'no-electron-imports-in-src': 'error',
    'no-ipc-imports-in-services': 'error',
    'no-react-toastify-outside-notifications': 'error',
    'no-safehandle-outside-ipc': 'error',
    'require-frontapperror-on-appresult-unwrap': 'error',
    'no-window-api-invoke-outside-invokerequest': 'error',
    'no-invokerequest-import-in-features': 'error',
    'no-backend-dto-imports-outside-app': 'error',
    'no-toast-outside-notifications': 'error',
  },
}
