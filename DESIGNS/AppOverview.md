# App Overview
Gives an overview of navigation and workflows through the app.
Highlights some DTOs needed at the boundary between renderer and electron.

## App starts
App.tsx -> MainView.tsx

## MainView.tsx
This is where we orchestrate between different views that can have different layouts.
views currently planned are:
- HomeView.tsx: a welcome screen
- SettingsView.tsx: user can configure the app such as llm api.
- 