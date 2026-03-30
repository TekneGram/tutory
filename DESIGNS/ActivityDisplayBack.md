# ActivityDisplay Backend Spec

## Goal

Implement the backend contract that supplies `ActivityDisplay` with the list of activities for a selected `unitCycleId`.

This backend work is only for the activity-list metadata needed by tabs and component resolution. It is not the full activity-content loading flow.

This spec must stay aligned with `DESIGNS/ActivityDisplayFront.md`.

## Architecture Rules

Follow existing Electron layering:

- IPC validates and delegates
- services orchestrate
- repositories stay SQL-focused
- renderer receives typed DTOs through ports/adapters

Do not expose raw SQL row shapes to the renderer.

## Shared DTO Contract

Add a new IPC contract file for activities, for example:

- `electron/ipc/contracts/activities.contracts.ts`

Use this contract exactly:

```ts
export type ActivityType =
  | "story"
  | "multi-choice-quiz"
  | "vocab-review"
  | "write-extra"
  | "observe"
  | "observe-describe"
  | "read-model"
  | "free-writing"
  | "topic-prediction"
  | "research"
  | "text-question-answer"
  | "writing-scaffold"
  | "reflection-survey";

export type UnitCycleActivityListItemDto = {
  unitCycleActivityId: string;
  unitCycleId: string;
  activityType: ActivityType;
  title: string;
  activityOrder: number;
  isRequired: boolean;
};

export type ListUnitCycleActivitiesRequest = {
  unitCycleId: string;
};

export type ListUnitCycleActivitiesResponse = {
  cycle: {
    unitCycleId: string;
    unitId: string;
    title: string;
  };
  activities: UnitCycleActivityListItemDto[];
};
```

Notes:

- `title` is for tab display and must be read from `unit_cycle_activities.title`
- `activityType` is the frontend resolver key
- `unitCycleActivityId` is what later activity components will use to fetch `activity_content`

## Required Database Change

The tab title belongs on `unit_cycle_activities`.

Add a new migration that:

1. adds `title TEXT`
2. backfills titles for the currently seeded 13 activities
3. makes future reads safe

Recommended target schema after migration:

- `unit_cycle_activities.title TEXT NOT NULL`

Initial backfill titles for the currently seeded rows:

- `unit_pets_cycle_1_activity_1` -> `Story`
- `unit_pets_cycle_1_activity_2` -> `Quiz`
- `unit_pets_cycle_1_activity_3` -> `Spell`
- `unit_pets_cycle_1_activity_4` -> `Write`
- `unit_pets_cycle_2_activity_1` -> `Animals`
- `unit_pets_cycle_2_activity_2` -> `Steps`
- `unit_pets_cycle_2_activity_3` -> `Read`
- `unit_pets_cycle_2_activity_4` -> `Write`
- `unit_pets_cycle_3_activity_1` -> `Guess`
- `unit_pets_cycle_3_activity_2` -> `Share`
- `unit_pets_cycle_3_activity_3` -> `Questions`
- `unit_pets_cycle_3_activity_4` -> `Report`
- `unit_pets_cycle_3_activity_5` -> `Summary`

If SQLite migration constraints make `NOT NULL` awkward, a two-step pattern is acceptable:

1. add nullable column
2. backfill all current rows
3. update repository/service assumptions so DTO `title` is always non-empty

But the final behavior exposed to the frontend must guarantee a non-empty `title`.

## Files To Add Or Update

- migration file in `electron/db/migration/*`
- `electron/ipc/contracts/activities.contracts.ts`
- `electron/ipc/validationSchemas/activities.schemas.ts`
- `electron/ipc/registerHandlers/register.activities.ts`
- `electron/services/activities/listUnitCycleActivities.ts`
- `electron/services/activities/activitiesDtos.ts`
- `electron/db/repositories/activityRepositories.ts`
- `electron/ipc/registerHandlers.ts` if composition needs update
- tests for repository, service, and validation as appropriate

## IPC Channel

Use a domain-specific channel consistent with existing naming, for example:

- `"activities:list-for-cycle"`

Keep naming aligned across:

- contracts
- schema
- handler registration
- frontend adapter/port

## Validation

Add request validation schema:

```ts
{
  unitCycleId: z.string().trim().min(1)
}
```

Keep handlers thin:

- validate request
- call service
- return typed result through `safeHandle`

## Repository Design

Create a repository focused on activity-list reads.

Suggested row shape:

```ts
type UnitCycleActivityRow = {
  unit_cycle_activity_id: string;
  unit_cycle_id: string;
  activity_type: ActivityType;
  title: string;
  activity_order: number;
  is_required: number;
};
```

Add:

- query to fetch cycle identity:
  - `unit_cycle_id`
  - `unit_id`
  - `title`
- query to fetch activities for a `unitCycleId`

Repository query should join:

- `unit_cycle_activities`
- `cycle_type_activities`
- `activity_types`

so the service gets:

- activity id
- cycle id
- activity type name
- title from `unit_cycle_activities.title`
- order
- required flag

Sort in SQL by `activity_order ASC`.

Repositories must not map to DTOs.

## Service Design

Create `electron/services/activities/listUnitCycleActivities.ts`.

Responsibilities:

- log request with `correlationId`
- open app DB using existing runtime helpers
- verify the cycle exists
- if missing, raise `RESOURCE_NOT_FOUND`
- fetch activity rows for the cycle
- map repository rows into DTOs
- return:
  - cycle identity
  - ordered activities

The service must not read `activity_content` payloads for this endpoint.

## DTO Mapping

Create `activitiesDtos.ts` to map repository rows into:

- `UnitCycleActivityListItemDto`

Map `is_required` to boolean.

Guarantee `title` is non-empty in the DTO. If the DB can still contain empty/null title during migration rollout, normalize defensively in the mapper and consider fallback text like `Activity ${activity_order}` only as a temporary safeguard.

## Expected Frontend Dependency

The frontend will:

- call this endpoint once per `ActivityDisplay`
- render one tab per returned activity
- keep selected tab state locally
- pass `unitCycleActivityId` and `activityType` into `ActivityContainer`

Because of that, this endpoint must be small and fast.

## Tests

Add focused tests:

- repository test:
  - query shape/order
  - joins activity type correctly
- service test:
  - returns cycle identity plus ordered activities
  - raises not found for bad `unitCycleId`
  - maps `is_required` to boolean
- validation schema test:
  - accepts valid `unitCycleId`
  - rejects blank `unitCycleId`

Do not implement activity-content retrieval in this task unless it is required for migration backfill logic.

## Non-Goals For This Task

Do not build the endpoint for loading `activity_content` yet unless another task asks for it.

That will likely be a separate backend flow keyed by `unitCycleActivityId`, consumed by each individual `*Activity` component later.
