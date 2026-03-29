# ActivityDisplay

`ActivityDisplay` is the screen body for `LearningMain`. It renders the ordered activities for the selected learning cycle and swaps the active activity component when the learner chooses a different tab.

## Navigation context

By the time the app reaches `LearningMain`, navigation must already carry:

- `learnerId`
- `learningType`
- `unitId`
- `unitCycleId`

`LearningMain.tsx` should pass `unitCycleId` into `ActivityDisplay` because that is the key needed to fetch the correct activity list from the database.

The navigation path is:

- `LearningEntry`
- `UnitFront`
- `UnitCycles`
- `LearningMain`
- `ActivityDisplay`

`LearningMain` does not need to know individual activity details. It only needs to hand `unitCycleId` to `ActivityDisplay` and render the result.

## What data `ActivityDisplay` needs

`ActivityDisplay` should load the ordered activities for the selected cycle from the backend. The backend response should include enough information to build the tab list and render the active component.

At minimum, the frontend needs:

- an activity identifier for selection and persistence
- the activity type so the registry can choose the right component
- the activity order so tabs render in the correct sequence
- display metadata for the tab label and any supporting UI
- the activity payload/content needed by the selected activity component

The underlying database path is conceptually:

- `unit_cycles.id = unitCycleId`
- `unit_cycle_activities.unit_cycle_id = unitCycleId`
- join through `cycle_type_activities` to get the activity type
- join to `activity_content` when the activity needs stored content

The number of activities is not fixed. The UI must render whatever the backend returns, whether that is 1 activity or 4+ activities.

## Frontend flow

`ActivityDisplay` should be built as a small coordinator with three responsibilities:

1. Fetch the activity list for `unitCycleId`
2. Keep track of which activity is currently selected
3. Render the selected activity component from a registry

Recommended component flow:

- `ActivityDisplay`
  - owns the query and the selected activity state
  - renders loading, empty, and error states
  - passes the activity list into `ActivityTabs`
  - passes the active activity into `ActivityContainer`
- `ActivityTabs`
  - renders one `ActivityTab` per activity returned from the backend
  - receives the active activity key and an `onSelectActivity` callback
- `ActivityTab`
  - renders the tab label and any small metadata needed for the tab strip
  - calls `onSelectActivity` when clicked
- `ActivityContainer`
  - receives the selected activity
  - looks up the matching component in the registry
  - renders that component with the selected activity payload

## Initial active activity

When the activity list loads, the first activity in `activity_order` should become the default active tab.

If the learner switches tabs, `ActivityDisplay` should update the selected activity locally without reloading the whole screen.

If the selected activity disappears because the query result changes, `ActivityDisplay` should fall back to the first available activity.

## Registry-driven rendering

`ActivityContainer` should use a registry instead of a switch statement.

The registry should be the single mapping from activity type to rendered component. That keeps the screen extensible when new activity types are added.

Recommended registry behavior:

- key the registry by the canonical activity type string
- store the React component for that activity type
- optionally store a display label or icon if the tab strip needs it
- make the registry exhaustive so a missing activity type is a compile-time failure

Important:

- the registry should not decide which activity is active
- the registry should not query the database
- the registry should only map activity type to component

`ActivityContainer` should receive the currently selected activity and render:

- `activityRegistry[selectedActivity.activityType].component`

This is why `ActivityTab` and `ActivityContainer` need the same selected activity object shape.

## Canonical activity tab data

The tab strip should be rendered from the backend response, not from a hardcoded list.

Each tab should have, at minimum:

- `unitCycleActivityId`
- `activityType`
- `activityOrder`
- `title` or other short label
- optional completion/status metadata if the backend provides it later

The tab label should be derived from the returned metadata, not inferred from the registry key alone.

## Recommended frontend contract

The frontend should code against a cycle-activity list response that looks roughly like this:

```ts
type ActivityInstanceDto = {
  unitCycleActivityId: string;
  unitCycleId: string;
  activityType: ActivityType;
  activityOrder: number;
  title: string;
  description: string | null;
  content: unknown;
};

type ListUnitCycleActivitiesRequest = {
  unitCycleId: string;
};

type ListUnitCycleActivitiesResponse = {
  unitCycle: {
    unitCycleId: string;
    title: string;
    unitId: string;
  };
  activities: ActivityInstanceDto[];
};
```

The exact `content` shape can vary by activity type, but it must be available to the selected activity component through props.

## `ActivityDisplay` implementation shape

Recommended props:

```ts
type ActivityDisplayProps = {
  learnerId: string;
  learningType: LearningType;
  unitId: string;
  unitCycleId: string;
};
```

Recommended behavior:

- call a feature hook or query for the cycle activity list
- derive `activeActivity` from local state
- render a tab strip from the returned activities
- render the selected activity in the container
- keep the tab state local to `ActivityDisplay`

`ActivityDisplay` should not require the parent layout to pass in the activity list manually. The layout only passes navigation context.

## Loading, empty, and error states

`ActivityDisplay` should handle the data fetch explicitly:

- loading: show a skeleton or spinner while the activity list loads
- empty: show a friendly message if the cycle has no activities
- error: show the backend error message if available, otherwise a generic fallback

If the backend returns an empty list, `ActivityTabs` and `ActivityContainer` should not render any activity content.

## How the current shell code should be treated

The files already created in `src/features/ActivityDisplay` should be treated as a shell, not as a finished implementation.

The current placeholder code needs to be reshaped so that:

- `ActivityDisplay` accepts the selected cycle context and owns the activity list query
- `ActivityTabs` renders one tab per activity, not a single hardcoded component
- `ActivityTab` is a presentational tab item with click handling
- `ActivityContainer` receives the active activity and renders the registry component for that activity type
- the registry is exhaustive and keyed by the canonical activity type names

The present code should not be copied literally into the final solution because it does not yet pass activity data through the render tree.

## Suggested file responsibilities

Recommended structure:

```text
src/features/ActivityDisplay/
  ActivityDisplay.tsx
  ActivityTabs.tsx
  ActivityTab.tsx
  ActivityContainer.tsx
  registry/activityRegistry.ts
  types/activityTypes.ts
```

Responsibilities:

- `types/activityTypes.ts`
  - define the canonical activity type union
  - define the activity list item shape used by the screen
- `registry/activityRegistry.ts`
  - map each activity type to its React component
- `ActivityDisplay.tsx`
  - fetch activities and own selected activity state
- `ActivityTabs.tsx`
  - render the selectable tab strip
- `ActivityTab.tsx`
  - render one tab button and its metadata
- `ActivityContainer.tsx`
  - render the selected activity component

## Behavior contract

The intended user experience is:

- the learner enters `LearningMain` with a specific cycle already selected
- the app loads the activities for that cycle
- the tab strip shows every activity in the cycle in order
- selecting a tab swaps the visible activity
- the visible activity is chosen through the registry, so the right component always renders for the selected activity type

## Testing expectations

Test the following behavior:

- activity list loading for a given `unitCycleId`
- default selection of the first activity
- switching tabs updates the active activity
- empty and error states render correctly
- registry lookup renders the correct activity component for the selected type

Keep feature tests near the feature code, consistent with the repo conventions.
