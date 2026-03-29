# UnitCycles Backend Spec

This document is the backend implementation spec for the `UnitCycles` flow.
It assumes the Tutory backend architecture already in the repo:

- `electron/ipc/*` owns transport contracts, validation, and handler registration
- `electron/services/*` owns orchestration
- `electron/db/*` owns SQL and repositories
- `electron/runtime/*` owns path policy
- `electron/infrastructure/*` owns platform boundaries

The goal is to support an intermediate cycle-selection screen between `UnitFront` and `learning-main`.

## Scope

Backend owns:

- IPC contracts and validation for cycle list and cycle progress
- handler registration
- service orchestration
- repository queries for cycle cards and cycle progress counts
- DTO mapping into renderer-safe responses
- asset URL construction for cycle icons
- backend tests

Backend does not own:

- React Query hooks
- layout composition
- CSS or component interactions

## Shared Contracts

These contracts should be treated as canonical on the backend side and must match frontend contracts exactly.

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

`iconPath` must be built by the backend from cycle-type asset metadata, not returned as a raw database-relative filename.

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

## Backend File Direction

Recommended backend files:

- `electron/ipc/contracts/cycles.contracts.ts`
- `electron/ipc/validationSchemas/cycles.schemas.ts`
- `electron/ipc/registerHandlers/register.cycles.ts`
- `electron/services/cycles/listUnitCycles.ts`
- `electron/services/cycles/getCycleProgress.ts`
- `electron/services/cycles/cyclesDtos.ts`
- `electron/db/repositories/cycleRepositories.ts`

Do not place cycle SQL in services.
Do not place cycle orchestration in IPC handlers.

## IPC Responsibilities

### `electron/ipc/contracts/cycles.contracts.ts`

Owns:

- cycle request DTOs
- cycle response DTOs
- shared `LearningType` reference if needed by this contract

### `electron/ipc/validationSchemas/cycles.schemas.ts`

Owns:

- validation for `unitId`
- validation for `learnerId`
- validation for `unitCycleId`

### `electron/ipc/registerHandlers/register.cycles.ts`

Owns:

- registration of `cycles:list-for-unit`
- registration of `cycles:get-progress`

Handlers should stay thin:

- validate raw payload
- delegate to service
- return result through the existing safe handler pattern

## Service Responsibilities

Recommended services:

- `listUnitCycles(request, ctx)`
- `getCycleProgress(request, ctx)`

Services should:

- accept typed request data
- open the app database using the existing runtime DB path helper
- validate resource existence where needed
- call repositories
- map rows into DTOs
- log meaningful events using the existing logger
- return typed DTO responses

Services should not:

- contain raw SQL unless there is a strong reason
- hardcode runtime paths
- directly implement platform-specific Electron APIs

## Repository Direction

Recommended repository file:

- `electron/db/repositories/cycleRepositories.ts`

Recommended repository responsibilities:

- `listUnitCycleRowsByUnitId(db, unitId)`
- `getUnitCycleIdentityRowById(db, unitCycleId)`
- `getCycleProgressCountsRow(db, learnerId, unitCycleId)`

Repository rules:

- return row-shaped data only
- do not map DTOs
- do not orchestrate workflows
- do not perform validation beyond query semantics
- do not compute renderer asset URLs

## Data Model Direction

The relevant schema path is:

- `units -> unit_cycles -> unit_cycle_activities`

Card metadata likely also requires:

- `unit_cycles -> cycle_types`

The design note that says to fetch from `unit_cycles` and `unit_cycle_activities` is directionally correct, but card display metadata should also use `cycle_types`, including the icon asset fields needed by `CycleCardIcon`.

Migration direction:

- add `cycle_types.asset_base`
- add `cycle_types.icon_path`
- seed the current cycle types with icon values so cycle cards can render images immediately

## `cycles:list-for-unit`

Request:

```ts
type ListUnitCyclesRequest = {
  unitId: string;
};
```

Behavior:

- validate that the unit exists
- return the selected unit identity needed by the frontend screen
- return all cycles that belong to that unit
- order by `unit_cycles.sort_order ASC`
- include activity count for each cycle
- return renderer-safe icon URLs, not raw DB filenames

The list query must retrieve the cycle-type asset fields required to build those icon URLs:

- `cycle_types.asset_base`
- `cycle_types.icon_path`

Recommended query shape:

- start from `unit_cycles`
- join `cycle_types` for title, description, and icon metadata
- left join or subquery `unit_cycle_activities` to derive `totalActivities`
- join `units` and `learning_types` when building the response-level unit identity

Recommended row mapping:

- `unit_cycles.id -> unitCycleId`
- `unit_cycles.unit_id -> unitId`
- `unit_cycles.cycle_type_id -> cycleTypeId`
- `unit_cycles.sort_order -> sortOrder`
- `cycle_types.title -> title`
- `cycle_types.description -> description`
- `cycle_types.asset_base -> asset_base`
- `cycle_types.icon_path -> iconPath`
- activity count -> `totalActivities`

The response should include:

```ts
{
  unit: {
    unitId,
    title,
    learningType,
  },
  cycles: [...]
}
```

## `cycles:get-progress`

Request:

```ts
type GetCycleProgressRequest = {
  learnerId: string;
  unitCycleId: string;
};
```

Behavior:

- validate that the learner exists
- validate that the unit cycle exists
- aggregate learner progress for activities in that unit cycle only
- return cycle identity plus progress summary

Required progress semantics for a given `learnerId` and `unitCycleId`:

- `totalActivities`
  - count of all `unit_cycle_activities.id` linked to the selected cycle
- `startedActivities`
  - count of distinct `unit_cycle_activity_id` with any attempt for that learner
- `completedActivities`
  - count of distinct `unit_cycle_activity_id` with at least one `status = 'completed'` attempt for that learner
- `notStartedActivities`
  - `totalActivities - startedActivities`
- `completionPercent`
  - `Math.floor((completedActivities / totalActivities) * 100)`
  - if `totalActivities === 0`, return `0`

## Row Types

Recommended repository row shapes:

```ts
export type LearningUnitCycleRow = {
  unit_cycle_id: string;
  unit_id: string;
  cycle_type_id: number;
  title: string;
  description: string | null;
  asset_base: string | null;
  icon_path: string | null;
  sort_order: number;
  total_activities: number;
};
```

```ts
export type UnitCycleIdentityRow = {
  unit_cycle_id: string;
  unit_id: string;
  title: string;
};
```

```ts
export type CycleProgressCountsRow = {
  total_activities: number;
  started_activities: number;
  completed_activities: number;
};
```

```ts
export type UnitIdentityForCyclesRow = {
  unit_id: string;
  title: string;
  learning_type: LearningType;
};
```

These are recommendations, not mandatory exact names, but the separation of concerns should remain the same.

## DTO Mapping

Recommended service-side mapper file:

- `electron/services/cycles/cyclesDtos.ts`

It should own:

- mapping row-shaped repository data to `LearningUnitCycleCardDto`
- mapping count rows into `CycleProgressSummaryDto`
- mapping cycle identity and summary into `CycleProgressHoverDto`

The mapper should compute:

- `completionPercent`
- `notStartedActivities`

following the same pattern already used in `electron/services/units/unitsDtos.ts`.

## Asset URL Handling

Cycle cards need renderer-safe icon URLs.

Backend should follow the same pattern already used for units:

- repositories return raw DB filename fields such as `icon_path`
- repositories also return `asset_base`
- services or DTO mappers convert them into renderer-safe URLs
- renderer receives `iconPath` as a resolved URL or `null`

For this feature, cycle icons do depend on cycle-type asset metadata. The cycle list implementation should retrieve `cycle_types.asset_base` and `cycle_types.icon_path` and combine them through the same asset URL helper pattern used by units.

## Error Handling

Known validation failures should raise structured backend errors.

Expected cases:

- learner not found
- unit not found for `cycles:list-for-unit`
- unit cycle not found for `cycles:get-progress`

Use the existing backend error vocabulary and centralized result handling pattern.

## Logging

Services should log:

- when cycle listing begins
- when cycle listing succeeds with count metadata
- when cycle progress loading begins
- when cycle progress loading succeeds with progress metadata

When available, include:

- `correlationId`
- `learnerId`
- `unitId`
- `unitCycleId`

## Testing

Recommended backend tests:

- IPC validation tests for both cycle endpoints
- service tests for missing learner, missing unit, and missing cycle paths
- repository tests for row-shape correctness
- integration-style SQL tests for progress aggregation correctness
- DTO mapper tests for percent and not-started calculations if non-trivial

Testing focus:

- correct ordering by cycle sort order
- correct total activity counts per cycle
- correct started/completed distinct counting semantics
- zero-activity cycle handling returns `completionPercent = 0`
- icon path mapping returns safe URLs, not raw DB-relative strings

## Implementation Sequence

Recommended order:

1. add cycle contracts
2. add cycle validation schemas
3. add repository queries and row types
4. add service DTO mappers
5. add cycle services
6. register IPC handlers
7. add backend tests

## Assumptions

This spec assumes:

- each `unit_cycle` belongs to exactly one `unit`
- each `unit_cycle` points to a `cycle_type` that contains display metadata
- `learning-main` will eventually need `unitCycleId` from navigation, even though that is handled on the frontend side

If the product decision changes and cycle selection should happen inside `learning-main`, the list endpoint can still remain valid, but the navigation contract would change.

## Summary

Backend should implement:

- cycle-specific IPC contracts, schemas, and handlers
- cycle list and cycle progress services
- repository queries over `unit_cycles`, `unit_cycle_activities`, `cycle_types`, and related tables
- DTO mapping into renderer-safe responses
- tests for validation, SQL behavior, and progress aggregation
