# App Overview
Gives an overview of navigation and workflows through the app.
Highlights some DTOs needed at the boundary between renderer and electron.

## App starts
App.tsx -> MainView.tsx

## MainView.tsx
This is where we orchestrate between different views that can have different layouts.
views currently planned are:
- HomeView.tsx: a welcome screen showing src/assets/app/welcome_banner.webp across the top of the app
- Profile.tsx: learner can create or edit their profile here. This means selecting their avatar, writing/editing their name and updating their status.

## HomeView.tsx

In the HomeView, the learner can click on a card to create a new profile. This navigates them to the Profile view.
LearnerCards are displayed in the LearnerCardDisplay. The LearnerCardDisplay shows the LearnerCard items, each populated with the learner avatar and learnerId data.

## Profile.tsx
Can have two modes - create and edit.
If creating, we do not need data: the user creates a profile name and selects an avatar.
If editing, the user changes their profile name and 

## DTOs for app entry and learner selection

These DTOs are needed to support:
- HomeView listing learners
- navigating from HomeView to Profile in create or edit mode
- navigating from HomeView/Profile to LearningEntry with the selected learner
- creating and editing learner profiles

`avatarId` should be the filename or stable asset id for an avatar in `src/assets/avatars`.

### Frontend navigation state DTOs

Navigation needs payloads, not just screen kinds.

```ts
export type NavigationState =
  | { kind: "home" }
  | { kind: "settings" }
  | {
      kind: "profile";
      mode: "create";
    }
  | {
      kind: "profile";
      mode: "edit";
      learnerId: string;
    }
  | {
      kind: "learning-entry";
      learnerId: string;
    }
  | {
      kind: "english-main";
      learnerId: string;
    }
  | {
      kind: "mathematics-main";
      learnerId: string;
    };
```

Suggested matching actions:

```ts
export type NavigationAction =
  | { type: "go-home" }
  | { type: "go-settings" }
  | { type: "go-profile-create" }
  | { type: "go-profile-edit"; learnerId: string }
  | { type: "go-learning-entry"; learnerId: string }
  | { type: "go-english-main"; learnerId: string }
  | { type: "go-mathematics-main"; learnerId: string };
```

### Frontend feature-facing DTOs

The HomeView and LearnerCardDisplay need a compact learner summary for selection.

```ts
export type LearnerCardDto = {
  learnerId: string;
  name: string;
  avatarId: string | null;
  currentStatus: string;
};
```

The Profile screen in edit mode needs the learner data required to prefill the form.

```ts
export type LearnerProfileDto = {
  learnerId: string;
  name: string;
  avatarId: string | null;
  currentStatus: string;
};
```

The profile form needs a submission payload that works for both create and edit.

```ts
export type UpsertLearnerProfileInput = {
  learnerId?: string;
  name: string;
  avatarId: string | null;
  statusText: string;
};
```

Notes:
- `learnerId` is absent on create and required on edit.
- `statusText` is free text only.
- `currentStatus` should reflect the current value from `learners_status.status`.

### Electron IPC contract DTOs

These are the boundary DTOs needed in `electron/ipc/contracts/*`.

#### List learners for HomeView

```ts
export type ListLearnersRequest = {};

export type ListLearnersResponse = {
  learners: LearnerCardDto[];
};
```

This should join learner identity data with current learner status so HomeView can render each LearnerCard with:
- avatar
- learner name
- learner id
- current status

#### Get learner profile for Profile edit mode

```ts
export type GetLearnerProfileRequest = {
  learnerId: string;
};

export type GetLearnerProfileResponse = {
  learner: LearnerProfileDto;
};
```

This is only needed for edit mode. Create mode should not call it.

#### Create learner profile

```ts
export type CreateLearnerProfileRequest = {
  name: string;
  avatarId: string | null;
  statusText: string;
};

export type CreateLearnerProfileResponse = {
  learner: LearnerProfileDto;
};
```

Behavior:
- insert learner row into `learners`
- insert current status row into `learners_status`
- return the created learner profile data
- frontend then navigates to `LearningEntry` with the returned `learnerId`

#### Update learner profile

```ts
export type UpdateLearnerProfileRequest = {
  learnerId: string;
  name: string;
  avatarId: string | null;
  statusText: string;
};

export type UpdateLearnerProfileResponse = {
  learner: LearnerProfileDto;
};
```

Behavior:
- update learner row in `learners`
- update current status in `learners_status`
- rely on the DB trigger to append to `learners_status_history` when status changes
- return the updated learner profile data
- frontend then navigates to `LearningEntry` with that `learnerId`

### Backend data mapping notes

The current schema suggests the following source mapping:

- `learners.id` -> `learnerId`
- `learners.name` -> `name`
- `learners.avatar_id` -> `avatarId`
- `learners_status.status` -> `currentStatus`

### Minimum flow summary

- HomeView loads `ListLearnersResponse`
- clicking "create new profile" dispatches `go-profile-create`
- clicking "edit profile" on a LearnerCard dispatches `go-profile-edit` with `learnerId`
- clicking "enter" on a LearnerCard dispatches `go-learning-entry` with `learnerId`
- Profile create submits `CreateLearnerProfileRequest`
- Profile edit submits `UpdateLearnerProfileRequest`
- successful create or update navigates to `learning-entry` with the selected `learnerId`
