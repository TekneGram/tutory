# ActivityDisplay Frontend Spec

## Goal

Implement the frontend for the learner activity area shown from `src/layout/LearningMain.tsx`.

`ActivityDisplay` is the feature-level orchestrator for cycle activities:

- it loads the list of activities for the selected `unitCycleId`
- it owns selected-tab UI state
- it renders one tab per activity
- it passes the selected activity into `ActivityContainer`
- `ActivityContainer` resolves `activityType` to the correct `*Activity` component

This spec must stay aligned with `DESIGNS/ActivityDisplayBack.md`.

## Architecture Rules

Follow existing frontend patterns already used by `UnitFront` and `UnitCycles`:

- layout passes route context into the feature
- feature hook uses React Query
- feature service unwraps adapter `AppResult`
- adapter uses typed port and `invokeRequest`
- components do not call `window.api`

`ActivityDisplay` belongs in `src/features/ActivityDisplay/*`, not in `src/layout/*`.

## Shared DTO Contract

Frontend and backend must use this shared contract shape.

Add a new frontend port file for activities, for example:

- `src/app/ports/activities.ports.ts`

Use this DTO contract:

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

- `title` is backend-owned tab text read from `unit_cycle_activities.title`
- `activityType` drives component selection
- `unitCycleActivityId` is passed into the activity component so it can fetch its own content
- do not load all `activity_content` in `ActivityDisplay`

## Files To Add Or Update

- `src/layout/LearningMain.tsx`
- `src/features/ActivityDisplay/ActivityDisplay.tsx`
- `src/features/ActivityDisplay/ActivityTabs.tsx`
- `src/features/ActivityDisplay/ActivityTab.tsx`
- `src/features/ActivityDisplay/ActivityContainer.tsx`
- `src/features/ActivityDisplay/hooks/useUnitCycleActivitiesQuery.ts`
- `src/features/ActivityDisplay/services/listUnitCycleActivities.service.ts`
- `src/app/ports/activities.ports.ts`
- `src/app/adapters/activities.adapters.ts`
- adapter tests if added
- feature tests for query/service/component behavior

Add local CSS only if needed and keep it in the feature folder.

## Component Responsibilities

### `LearningMain`

Pass these props into `ActivityDisplay`:

- `learnerId`
- `learningType`
- `unitId`
- `unitCycleId`

Do not move data-fetching into layout.

### `ActivityDisplay`

Props:

```ts
type ActivityDisplayProps = {
  learnerId: string;
  learningType: LearningType;
  unitId: string;
  unitCycleId: string;
};
```

Responsibilities:

- call `useUnitCycleActivitiesQuery(unitCycleId)`
- derive `activities = query.data?.activities ?? []`
- own `selectedActivityId` in local state
- when query data first loads, default selection to the first activity in sort order
- if selected activity disappears after refetch, fall back to the first activity
- render loading, error, and empty states
- render `ActivityTabs`
- render `ActivityContainer` for the currently selected activity

Keep `selectedActivityId` local to this feature. This is UI coordination state, not app-wide state.

### `ActivityTabs`

Props:

```ts
type ActivityTabsProps = {
  activities: UnitCycleActivityListItemDto[];
  selectedActivityId: string | null;
  onSelectActivity: (unitCycleActivityId: string) => void;
};
```

Responsibilities:

- render one `ActivityTab` per activity
- preserve server sort order
- display `activity.title` on each tab exactly as returned by the backend
- use accessible tab semantics if practical:
  - tablist
  - tab
  - selected state

### `ActivityTab`

Props:

```ts
type ActivityTabProps = {
  activity: UnitCycleActivityListItemDto;
  isSelected: boolean;
  onSelect: (unitCycleActivityId: string) => void;
};
```

Responsibilities:

- show `activity.title` from the activity-list DTO
- notify selection with `activity.unitCycleActivityId`

### `ActivityContainer`

Props:

```ts
type ActivityContainerProps = {
  learnerId: string;
  learningType: LearningType;
  unitId: string;
  unitCycleId: string;
  activity: UnitCycleActivityListItemDto | null;
};
```

Responsibilities:

- if `activity` is null, render a small placeholder state
- resolve `activity.activityType` to the correct activity component
- render that component with shared route/activity props

`ActivityContainer` must stay thin. It is a resolver, not a data-fetching shell for all activity content.

## Typed Activity Registry

Use a typed registry/map, not a `switch` spread across multiple files.

Create a local registry in `ActivityContainer.tsx` or a nearby feature file. The registry must map every known `ActivityType` to the corresponding component.

Required mapping:

```ts
story -> StoryActivity
multi-choice-quiz -> MultiChoiceQuizActivity
vocab-review -> VocabReviewActivity
write-extra -> WriteExtraActivity
observe -> ObserveActivity
observe-describe -> ObserveDescribeActivity
read-model -> ReadModelActivity
free-writing -> FreeWritingActivity
topic-prediction -> TopicPredictionActivity
research -> ResearchActivity
text-question-answer -> TextQuestionAnswerActivity
writing-scaffold -> WritingScaffoldActivity
reflection-survey -> ReflectionSurveyActivity
```

Each mapped component should accept the same base props:

```ts
type ActivityComponentProps = {
  learnerId: string;
  learningType: LearningType;
  unitId: string;
  unitCycleId: string;
  unitCycleActivityId: string;
};
```

If the existing stubs do not yet accept these props, update the stubs so they do. They can ignore the props for now, but the interface must be consistent.

## Feature Query Pattern

Add:

- `useUnitCycleActivitiesQuery(unitCycleId)`
- stable query key, for example `["cycles", "activities", unitCycleId]`

Service behavior:

- call `activitiesAdapter.listUnitCycleActivities({ unitCycleId })`
- if `result.ok === false`, throw `FrontAppError`
- return activities sorted by `activityOrder`

## Error / Empty / Loading States

`ActivityDisplay` should mirror the existing app style:

- loading state while query is pending
- error state from thrown service errors
- empty state if zero activities are returned

Do not silently render nothing.

## Tests

Add targeted tests only:

- service test for result unwrapping and sort order
- hook test if needed for query key behavior
- component test for `ActivityDisplay`:
  - shows loading
  - shows error
  - renders one tab per activity
  - defaults to first activity
  - changes rendered activity when a different tab is selected
- resolver test for `ActivityContainer`:
  - each `activityType` maps to the correct component

Mock activity components in container tests. Do not test activity-internal behavior here.

## Non-Goals For This Task

Do not implement activity-content fetching in this task unless needed for wiring stubs.

Each individual `*Activity` feature can later load its own data from `activity_content` using the passed `unitCycleActivityId`.
