# UnitFront

This is a refactor of `LearningFront` to `UnitFront`.

Reason:
- this screen is specifically the place where units are listed
- the name `UnitFront` is clearer than `LearningFront`
- English and Mathematics should keep sharing the same screen structure
- the variation is the subject and the returned unit data, not the screen implementation

## Core Type

Use one shared subject type:

```ts
export type LearningType = "english" | "mathematics";
```

## Navigation

Replace `learning-front` with `unit-front`.

Recommended navigation state:

```ts
export type NavigationState =
  | { kind: "home" }
  | { kind: "settings" }
  | { kind: "profile"; mode: "create" }
  | { kind: "profile"; mode: "edit"; learnerId: string }
  | { kind: "learning-entry"; learnerId: string }
  | { kind: "unit-front"; learnerId: string; learningType: LearningType }
  | { kind: "learning-main"; learnerId: string; learningType: LearningType; unitId: string };
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
  | { type: "go-learning-main"; learnerId: string; learningType: LearningType; unitId: string };
```

Behavior:
- in `LearningEntry`, clicking English should dispatch `go-unit-front` with `learningType: "english"`
- in `LearningEntry`, clicking Mathematics should dispatch `go-unit-front` with `learningType: "mathematics"`
- `UnitFront` should render subject-specific copy based on `learningType`
- clicking a unit should still navigate to `learning-main`

## Layout

Replace:
- `LearningFront.tsx`

With:
- `UnitFront.tsx`

Recommended props:

```ts
type UnitFrontProps = {
  learnerId: string;
  learningType: LearningType;
  onEnterLearningMain: (learnerId: string, learningType: LearningType, unitId: string) => void;
  onBackToLearningEntry: (learnerId: string) => void;
};
```

`UnitFront` owns:
- heading/kicker/copy based on `learningType`
- loading/error/empty states
- rendering `UnitCardDisplay`

## Frontend feature contracts

The unit-loading layer should remain generic.

```ts
export type LearningUnitCardDto = {
  unitId: string;
  title: string;
  description: string | null;
  iconPath: string | null;
  sortOrder: number;
  learningType: LearningType;
};
```

```ts
export type ListLearningUnitsRequest = {
  learningType: LearningType;
};
```

```ts
export type ListLearningUnitsResponse = {
  units: LearningUnitCardDto[];
};
```

Hover progress remains unit-based and generic:

```ts
export type GetUnitProgressRequest = {
  learnerId: string;
  unitId: string;
};
```

```ts
export type GetUnitProgressResponse = UnitProgressHoverDto;
```

## Backend contract direction

The backend file naming is already correct:
- `electron/ipc/contracts/units.contracts.ts`
- `electron/ipc/validationSchemas/units.schemas.ts`
- `electron/ipc/registerHandlers/register.units.ts`
- `electron/services/units/*`

Keep that naming.

The frontend file naming is also correct:
- `src/app/ports/units.ports.ts`
- `src/app/adapters/units.adapters.ts`

Keep that naming too.

## Canonical IPC channel names

These names are the source of truth and must match exactly on frontend and backend:

```ts
"units:list"
"units:get-progress"
```

Do not use:

```ts
"english:units:list"
"english:units:get-progress"
```

## Backend behavior

### `units:list`

Request:

```ts
type ListLearningUnitsRequest = {
  learningType: LearningType;
};
```

Response:

```ts
type ListLearningUnitsResponse = {
  units: LearningUnitCardDto[];
};
```

Behavior:
- filter units by `learning_types.name = learningType`
- order by `units.sort_order ASC`
- return renderer-safe icon URLs, not raw DB filenames
- backend should build icon URLs from:
  - `units.asset_base`
  - `units.icon_path`
  - `buildContentAssetUrl(asset_base, icon_path)`

### `units:get-progress`

Request:

```ts
type GetUnitProgressRequest = {
  learnerId: string;
  unitId: string;
};
```

Behavior:
- keep progress generic and unit-based
- no English-specific handler/service naming

## Copy mapping

`UnitFront.tsx` should map screen copy from `learningType`.

Example:

```ts
const unitFrontCopy = {
  english: {
    kicker: "English",
    title: "Choose a unit",
    body: "Select a unit to open the English learning workspace.",
    loading: "Loading English units...",
    empty: "No English units are available yet.",
    error: "Unable to load English units.",
  },
  mathematics: {
    kicker: "Mathematics",
    title: "Choose a unit",
    body: "Select a unit to open the Mathematics learning workspace.",
    loading: "Loading Mathematics units...",
    empty: "No Mathematics units are available yet.",
    error: "Unable to load Mathematics units.",
  },
};
```

## Refactor scope

### Frontend
- rename `LearningFront.tsx` to `UnitFront.tsx`
- rename related tests/CSS where appropriate
- change navigation route/action names from `learning-front` to `unit-front`
- keep using `units.ports.ts` and `units.adapters.ts`
- ensure adapter channel names call:
  - `units:list`
  - `units:get-progress`

### Backend
- keep `units` naming in IPC/services/contracts
- verify frontend and backend use the same IPC channel names
- no more English-prefixed unit channel names

## What remains shared

These stay generic and shared across subjects:
- `UnitFront`
- `UnitCardDisplay`
- `UnitCard`
- `UnitIcon`
- `BriefProgressHoverDisplay`
- unit-loading hooks/services/adapters/contracts

## What varies by subject

Only:
- `learningType`
- copy text
- filtered data returned from the database
- any future subject-specific main-screen behavior

## Summary

The target model is:
- one `UnitFront` screen
- one generic units backend
- one generic units frontend boundary
- canonical IPC channel names:
  - `units:list`
  - `units:get-progress`
- subject variation driven by `learningType`
