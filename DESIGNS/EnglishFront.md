# English front

When the learner is in LearningEntry, they can click onEnterEnglish.
This *should* take them to EnglishFront.
EnglishFront displays the units in the english part of the app.
For each unit, it should render a UnitCardDisplay.
Inside UnitCardDisplay we should render multiple UnitCards in a grid, one for each unit.
The unit data is retrieved from the database in the units table.

Each UnitCard should contain:
- unit title (larger font)
- unit description (small font)
- unit icon
Each unit should also
- keep track of its unit id
- be in the position according to its sort order
All those details can be retrieved from the database in the table "units" and we should only retrieve those associated with english.

Inside each UnitCard is a UnitIcon component. The UnitIcon listens for hover events.
When the learner hovers over the UnitIcon, this triggers a call to the backend.
The learnerId and unitId are sent to the backend and data is returned whic tells the user a progress report for that unit.

The progress report is rendered in BriefProgressHoverDisplay component, which disappears when the user stops hovering over UnitIcon.

## Canonical SQL shape
  The backend agent does not need to copy this literally, but should implement this logic:

  1. Find all activities in the unit:

  - units -> unit_cycles -> unit_cycle_activities

  2. For that learner, aggregate attempts by unit_cycle_activity_id
  3. Count:

  - total activities in the unit
  - started activities: any attempt exists
  - completed activities: any attempt with status = 'completed'

Shared Scope
  This work covers the EnglishFront screen only:

  - enter from LearningEntry
  - show all English units
  - on hover over a unit icon, fetch and show learner progress for that unit

  Navigation Contract
  Use the existing navigation pattern, but introduce english-front distinctly from english-main.

  export type NavigationState =
    | { kind: "home" }
    | { kind: "settings" }
    | { kind: "profile"; mode: "create" }
    | { kind: "profile"; mode: "edit"; learnerId: string }
    | { kind: "learning-entry"; learnerId: string }
    | { kind: "english-front"; learnerId: string }
    | { kind: "english-main"; learnerId: string; unitId: string }
    | { kind: "mathematics-main"; learnerId: string };

  export type NavigationAction =
    | { type: "go-home" }
    | { type: "go-settings" }
    | { type: "go-profile-create" }
    | { type: "go-profile-edit"; learnerId: string }
    | { type: "go-learning-entry"; learnerId: string }
    | { type: "go-english-front"; learnerId: string }
    | { type: "go-english-main"; learnerId: string; unitId: string }
    | { type: "go-mathematics-main"; learnerId: string };

  Frontend Feature DTOs
  These are the shapes the frontend should code against in src/app/ports/*.

  export type EnglishUnitCardDto = {
    unitId: string;
    title: string;
    description: string | null;
    iconPath: string | null;
    sortOrder: number;
  };

  export type UnitProgressSummaryDto = {
    learnerId: string;
    unitId: string;
    completedActivities: number;
    totalActivities: number;
    completionPercent: number;
    startedActivities: number;
    notStartedActivities: number;
  };

  export type UnitProgressHoverDto = {
    unit: {
      unitId: string;
      title: string;
    };
    progress: UnitProgressSummaryDto;
  };

  IPC Contracts
  These should be the shared source of truth between renderer and Electron, likely in a new contracts file such as electron/ipc/contracts/
  units.contracts.ts or english.contracts.ts.

  1. List English units

  export type ListEnglishUnitsRequest = Record<string, never>;

  export type ListEnglishUnitsResponse = {
    units: EnglishUnitCardDto[];
  };

  Behavior:

  - return units where learning_types.name = "english"
  - ordered by units.sort_order ASC

  2. Get unit hover progress

  export type GetUnitProgressRequest = {
    learnerId: string;
    unitId: string;
  };

  export type GetUnitProgressResponse = UnitProgressHoverDto;

  Behavior:

  - return unit identity plus computed learner progress for that unit

  Backend Data Mapping
  The schema supports this directly:

  From electron/db/migration/0003_app_main_tables.sql:

  - units.id -> unitId
  - units.title -> title
  - units.description -> description
  - units.icon_path -> iconPath
  - units.sort_order -> sortOrder

  English filtering:

  - units.learning_type_id -> learning_types.id
  - filter learning_types.name = 'english'

  Progress Report Schema
  This is the contract both agents should build against.

  Definition
  For a given learnerId and unitId:

  - totalActivities
      - count of all unit_cycle_activities.id linked to cycles in that unit
  - completedActivities
      - count of distinct unit_cycle_activity_id for which the learner has at least one activity_attempts row with status = 'completed'
  - startedActivities
      - count of distinct unit_cycle_activity_id for which the learner has any activity_attempts row, regardless of status
  - notStartedActivities
      - totalActivities - startedActivities
  - completionPercent
      - Math.floor((completedActivities / totalActivities) * 100)
      - if totalActivities === 0, return 0

# Progress Status Semantics
  For the hover UI, the frontend should rely on the numeric fields above. If a label is useful, this derived rule is safe:

  export type UnitProgressLabel = "not-started" | "in-progress" | "completed";

  Derived as:

  - completed if completedActivities === totalActivities && totalActivities > 0
  - in-progress if completedActivities < totalActivities && startedActivities > 0
  - not-started if startedActivities === 0

  This label can be frontend-derived; it does not need to be returned unless the backend agent prefers to include it.

  Frontend Behavior Contract
  Frontend agent should implement:

  - EnglishFront
      - fetch ListEnglishUnitsResponse
      - render UnitCardDisplay
      - render UnitCard for each unit in order
  - UnitIcon
      - on hover or focus, trigger GetUnitProgressRequest
      - on hover end / blur, hide the hover display
  - BriefProgressHoverDisplay
      - show:
          - unit title
          - completedActivities / totalActivities
          - progress bar
          - completionPercent
 Suggested minimal UI copy:

  - "3 of 12 activities completed"
  - "25% complete" (shown as a progress bar)

## One important implementation note
  The design text says hover over UnitIcon should call the backend. That is feasible, but the frontend agent should debounce or cache per
  learnerId + unitId so repeated hover does not spam IPC unnecessarily. React Query is a good fit.