# UnitCycles Frontend Spec

This document is the frontend implementation spec for the `UnitCycles` flow.
It assumes the Tutory frontend architecture already in the repo:

- `src/layout/*` owns screen composition and navigation wiring
- `src/features/*` owns feature UI, hooks, services, and local CSS
- `src/app/*` owns ports, adapters, and result/error boundaries

The goal is to add an intermediate screen between `UnitFront` and `learning-main`.

Flow:

`LearningEntry -> UnitFront -> UnitCycles -> learning-main`

## Scope

Frontend owns:

- navigation changes needed to enter and exit the `UnitCycles` screen
- `src/layout/UnitCycles.tsx`
- the cycle-card feature in `src/features/*`
- React Query hooks and feature services
- use of `src/app/ports/*` and adapters for backend access
- loading, empty, and error states
- accessibility and styling
- frontend tests

Frontend does not own:

- raw SQL
- Electron IPC handler registration
- backend progress aggregation logic

## Navigation

Recommended navigation state:

```ts
export type NavigationState =
  | { kind: "home" }
  | { kind: "settings" }
  | { kind: "profile"; mode: "create" }
  | { kind: "profile"; mode: "edit"; learnerId: string }
  | { kind: "learning-entry"; learnerId: string }
  | { kind: "unit-front"; learnerId: string; learningType: LearningType }
  | { kind: "unit-cycles"; learnerId: string; learningType: LearningType; unitId: string }
  | {
      kind: "learning-main";
      learnerId: string;
      learningType: LearningType;
      unitId: string;
      unitCycleId: string;
    };
```

Recommended navigation actions:

```ts
export type NavigationAction =
  | { type: "go-home" }
  | { type: "go-settings" }
  | { type: "go-profile-create" }
  | { type: "go-profile-edit"; learnerId: string }
  | { type: "go-learning-entry"; learnerId: string }
  | { type: "go-unit-front"; learnerId: string; learningType: LearningType }
  | { type: "go-unit-cycles"; learnerId: string; learningType: LearningType; unitId: string }
  | {
      type: "go-learning-main";
      learnerId: string;
      learningType: LearningType;
      unitId: string;
      unitCycleId: string;
    };
```

Behavior:

- selecting a unit in `UnitFront` should navigate to `unit-cycles`
- selecting a cycle in `UnitCycles` should navigate to `learning-main`
- back from `UnitCycles` should return to `unit-front`

## Shared Contracts

These contracts should be treated as canonical on the frontend side and must match backend contracts exactly.

```ts
export type LearningUnitCycleCardDto = {
  unitCycleId: string;
  unitId: string;
  cycleTypeId: number;
  title: string;
  description: string | null;
  iconPath: string | null;
  sortOrder: number;
  totalActivities: number;
};
```

`iconPath` must come from cycle-type asset metadata resolved by the backend, not from a hardcoded frontend path.
The backend should retrieve `cycle_types.asset_base` and `cycle_types.icon_path`, then return a renderer-safe URL for `CycleCardIcon`.

```ts
export type CycleProgressSummaryDto = {
  learnerId: string;
  unitCycleId: string;
  completedActivities: number;
  totalActivities: number;
  completionPercent: number;
  startedActivities: number;
  notStartedActivities: number;
};
```

```ts
export type CycleProgressHoverDto = {
  cycle: {
    unitCycleId: string;
    unitId: string;
    title: string;
  };
  progress: CycleProgressSummaryDto;
};
```

```ts
export type ListUnitCyclesRequest = {
  unitId: string;
};
```

```ts
export type ListUnitCyclesResponse = {
  unit: {
    unitId: string;
    title: string;
    learningType: LearningType;
  };
  cycles: LearningUnitCycleCardDto[];
};
```

```ts
export type GetCycleProgressRequest = {
  learnerId: string;
  unitCycleId: string;
};
```

```ts
export type GetCycleProgressResponse = CycleProgressHoverDto;
```

Canonical IPC channel names:

```ts
"cycles:list-for-unit"
"cycles:get-progress"
```

## Frontend Port Direction

Recommended new frontend file:

- `src/app/ports/cycles.ports.ts`

Recommended interface:

```ts
export interface CyclesPort {
  listUnitCycles(request: ListUnitCyclesRequest): Promise<AppResult<ListUnitCyclesResponse>>;
  getCycleProgress(request: GetCycleProgressRequest): Promise<AppResult<GetCycleProgressResponse>>;
}
```

Recommended adapter file:

- `src/app/adapters/cycles.adapters.ts`

Rules:

- do not call `window.api` outside adapters
- request adapters should use the same centralized invocation pattern as the existing units adapter
- feature services should unwrap `AppResult` and throw `FrontAppError` on failure

## Layout Contract

Recommended layout component:

```ts
type UnitCyclesProps = {
  learnerId: string;
  learningType: LearningType;
  unitId: string;
  onEnterLearningMain: (
    learnerId: string,
    learningType: LearningType,
    unitId: string,
    unitCycleId: string,
  ) => void;
  onBackToUnitFront: (learnerId: string, learningType: LearningType) => void;
};
```

`src/layout/UnitCycles.tsx` should:

- fetch cycles for `unitId`
- render subject-specific page copy from `learningType`
- render loading, empty, and error states
- render `CyclesCardDisplay`
- pass the selected `unitCycleId` into `onEnterLearningMain`

The cycle list response must include icon data so `CycleCardIcon` can render each cycle image without additional list-time lookups.

`UnitCycles` is layout composition only. It should not own backend call details.

## Copy Mapping

Use the same pattern already present in `UnitFront`.

Recommended copy:

```ts
const unitCyclesCopy = {
  english: {
    kicker: "English",
    title: "Choose a cycle",
    body: "Select a cycle to continue working through this unit.",
    loading: "Loading cycles...",
    empty: "No cycles are available for this unit yet.",
    error: "Unable to load cycles for this unit.",
  },
  mathematics: {
    kicker: "Mathematics",
    title: "Choose a cycle",
    body: "Select a cycle to continue working through this unit.",
    loading: "Loading cycles...",
    empty: "No cycles are available for this unit yet.",
    error: "Unable to load cycles for this unit.",
  },
};
```

The selected unit title should be shown on the page if the backend response provides it.

## Feature Structure

Recommended feature root:

`src/features/CyclesCardDisplay/`

Recommended files:

```text
src/features/CyclesCardDisplay/
  CyclesCardDisplay.tsx
  CycleCard.tsx
  CycleCardIcon.tsx
  BriefCycleProgressHoverDisplay.tsx
  CyclesCardDisplay.css
  hooks/
    useUnitCyclesQuery.ts
    useCycleProgressQuery.ts
  services/
    listUnitCycles.service.ts
    getCycleProgress.service.ts
  __tests__/
    ...
```

Do not split the same concern across both:

- `src/features/CycleCard/*`
- `src/features/CyclesCardDisplay/*`

Use one feature root.

## Feature Behavior

### `CyclesCardDisplay`

Recommended props:

```ts
type CyclesCardDisplayProps = {
  learnerId: string;
  cycles: LearningUnitCycleCardDto[];
  onSelectCycle: (unitCycleId: string) => void;
};
```

Responsibilities:

- render a grid/list of cycle cards
- remain presentational

### `CycleCard`

Responsibilities:

- render cycle title
- render description or fallback copy
- render icon trigger through `CycleCardIcon`
- support click and keyboard activation

`CycleCard` should assume `iconPath` is already a renderer-safe URL provided in the cycle-list DTO.

Accessibility behavior should mirror `UnitCard`:

- `role="button"`
- `tabIndex={0}`
- Enter and Space activate the card

### `CycleCardIcon`

Responsibilities:

- show cycle icon image or fallback initials
- open progress panel on hover and focus
- stop click propagation so the icon itself does not trigger navigation
- lazy-load cycle progress while open

Behavior should mirror `UnitIcon`.

Data requirement:

- `CycleCardIcon` uses the `iconPath` returned in `LearningUnitCycleCardDto`
- that `iconPath` is derived from backend retrieval of `cycle_types.asset_base` and `cycle_types.icon_path`
- the frontend should not construct the asset URL itself

### `BriefCycleProgressHoverDisplay`

Responsibilities:

- render cycle title
- render `"X of Y activities completed"`
- render `"Z% complete"`
- render a simple progress bar

## Query Behavior

Use React Query.

Recommended query keys:

```ts
["units", "cycles", unitId]
["cycles", "progress", learnerId, unitCycleId]
```

Behavior:

- cycle list query fetches on mount
- progress query only runs when the hover/focus panel is open
- progress query should cache by `learnerId + unitCycleId`
- use a non-zero stale time for progress queries
- `retry: 0` is acceptable for the hover query, matching the existing unit progress pattern

## Service Direction

Recommended feature service files:

- `src/features/CyclesCardDisplay/services/listUnitCycles.service.ts`
- `src/features/CyclesCardDisplay/services/getCycleProgress.service.ts`

Behavior:

- call the adapter
- unwrap `AppResult`
- throw `FrontAppError` on failure
- return UI-ready DTOs

If the list result must be ordered, sort by `sortOrder ASC` in the service layer, matching the existing unit-list pattern.

## Loading, Empty, and Error States

`UnitCycles.tsx` should mirror the conditional rendering structure already used by `UnitFront`.

Required page-level states:

- loading while list query is in flight
- error when list query fails
- empty when no cycles exist for the unit
- content when cycles are available

Required hover states:

- loading spinner while progress is loading
- inline error when progress loading fails
- summary panel when progress data is available

## Accessibility

Minimum accessibility rules:

- cycle cards are keyboard activatable
- icon trigger is focusable
- tooltip panel appears on focus and hover
- icon image should use empty `alt=""` when the card already names the cycle
- fallback initials should use `aria-hidden="true"`
- loading and error content should use `aria-live="polite"` where appropriate

## Styling

Use `UnitCardDisplay` as the visual reference, but keep cycle-specific CSS local.

Rules:

- cycle feature styles belong in `src/features/CyclesCardDisplay/CyclesCardDisplay.css`
- layout-specific shell styles belong with the layout if needed
- shared primitives may be imported from `@/styles/*`

Visual direction:

- grid of cards similar to unit cards
- circular icon treatment
- compact hover panel anchored to the icon
- clear title/description hierarchy
- progress bar treatment consistent with the unit progress hover display

## Frontend Tests

Recommended tests near the feature:

- service tests for list and hover-progress services
- hook tests for query enablement and query keys when useful
- component tests for `CycleCard`, `CycleCardIcon`, `CyclesCardDisplay`, and hover display

Recommended layout tests:

- `UnitCycles` loading branch
- `UnitCycles` error branch
- `UnitCycles` empty branch
- `UnitCycles` content branch
- callback wiring for back navigation and cycle selection

Good behavioral coverage:

- cycles render in sort order
- clicking a card selects the cycle
- Enter and Space activate a card
- hover/focus opens the progress panel
- icon-trigger click does not bubble into card navigation
- fallback description and fallback initials render correctly

## Assumptions

This frontend spec assumes `learning-main` now needs `unitCycleId`.
If the intended navigation model is still unit-level at that stage, the navigation contract should be revised before implementation.

## Summary

Frontend should implement:

- navigation into and out of `UnitCycles`
- a new `UnitCycles` layout screen
- a dedicated `CyclesCardDisplay` feature with cards, icon hover progress, services, hooks, and local CSS
- typed adapter/port usage through `src/app/*`
- tests for layout and feature behavior
