Agent 1 Prompt: Feedback Frontend
  You are implementing only the frontend Feedback subcomponent for the Tutory repo.

  Read first:

  - AGENTS.md
  - src/AGENTS.md
  - src/features/AGENTS.md
  - DESIGNS/subcomponents/Feedback.md
  - DESIGNS/StoryContainer.md

  Task:

  - Build a reusable Feedback component only.
  - It must accept props shaped like:

  type StoryFeedbackDto = {
    question: string;
    answers: [string, string, string] | string[];
    comment: string;
  };

  type FeedbackSubmitValue = {
    selectedAnswer: string;
    comment: string;
  };

  type FeedbackProps = {
    feedback: StoryFeedbackDto;
    disabled?: boolean;
    onSubmit: (value: FeedbackSubmitValue) => void | Promise<void>;
  };

  - Render the question.
  - Render all answer choices at once and allow a single selection.
  - Render a small textbox for the comment.
  - On send, return { selectedAnswer, comment } to the parent.
  - Keep this component presentational and local-state-only. No backend calls, no React Query, no StoryContainer orchestration.
  - Add focused component tests for selection, comment editing, and submit payload.

  Constraints:

  - Do not edit StoryContainer orchestration logic beyond the minimum needed to type imports if absolutely necessary.
  - Do not create adapters, ports, or services.
  - Do not handle activity completion state here.

  At the end, report changed files and tests run.

  Agent 2 Prompt: ImageContainer Frontend
  You are implementing only the frontend ImageContainer subcomponent for the Tutory repo.

  Read first:

  - AGENTS.md
  - src/AGENTS.md
  - src/features/AGENTS.md
  - DESIGNS/subcomponents/ImageContainer.md
  - DESIGNS/StoryContainer.md

  Task:

  - Build a reusable ImageContainer component only.
  - It must accept props shaped like:

  type StoryImageRefDto = {
    order: number;
    imageRef: string;
  };

  type ImageContainerProps = {
    imageRefs: StoryImageRefDto[];
    assetBase: string;
    autoScroll?: boolean;
  };

  - Sort by order.
  - Render a carousel with left/right controls.
  - autoScroll defaults to false.
  - When autoScroll is true, images advance every 3 seconds.
  - Keep this component frontend-only and presentational. It should accept resolved image URLs or compose them from assetBase + imageRef only
    if that pattern already exists locally and can be done without backend changes.
  - Add focused tests for ordering, arrow navigation, and auto-scroll behavior.

  Constraints:

  - Do not implement StoryContainer orchestration.
  - Do not add new IPC or backend work.
  - Do not fetch story data here.

  At the end, report changed files and tests run.

  Agent 3 Prompt: TextDisplay Frontend
  You are implementing only the frontend TextDisplay subcomponent for the Tutory repo.

  Read first:

  - AGENTS.md
  - src/AGENTS.md
  - src/features/AGENTS.md
  - DESIGNS/subcomponents/TextDisplay.md
  - DESIGNS/StoryContainer.md

  Task:

  - Build TextDisplay and any local subcomponents it needs, such as PagesDisplay, TokenDisplay, and WordCard.
  - Use props shaped like:

  type StoryPassagePageDto = {
    order: number;
    text: string;
  };

  type StoryWordDto = {
    word: string;
    japanese: string;
    position: number;
  };

  type TextDisplayProps = {
    passage: {
      pages: StoryPassagePageDto[];
    };
    words: StoryWordDto[];
  };

  - Implement the token-position algorithm described in the spec.
  - Render the passage page by page.
  - Render token spans.
  - Where a token has matching vocab data, render an interactive WordCard that flips between the token and the Japanese meaning.
  - Keep this component frontend-only and self-contained. No backend calls and no StoryContainer orchestration.
  - Add focused tests for tokenization, position mapping, page rendering, and WordCard flipping.

  Constraints:

  - Do not edit StoryContainer except for minimal type import compatibility if needed.
  - Do not add adapters, ports, or services.
  - Do not handle completion logic.

  At the end, report changed files and tests run.

  Agent 4 Prompt: StoryContainer Frontend
  You are implementing only the frontend Story activity container flow for the Tutory repo. Your work must integrate the subcomponents but not
  own their detailed internal implementations beyond wiring.

  Read first:

  - AGENTS.md
  - src/AGENTS.md
  - src/features/AGENTS.md
  - src/app/AGENTS.md
  - DESIGNS/StoryContainer.md
  - DESIGNS/subcomponents/Feedback.md
  - DESIGNS/subcomponents/ImageContainer.md
  - DESIGNS/subcomponents/TextDisplay.md
  - DESIGNS/ActivityDisplayFront.md

  Scope:

  - Frontend only.
  - Own the Story activity feature boundary and communication with backend.
  - Do not implement Electron backend code.

  Shared frontend/backend contract:
  Use these exact channels:

  - activities:story:get
  - activities:story:submit-feedback

  Use these exact DTO shapes on the frontend port side:

  export type StoryFeedbackDto = {
    question: string;
    answers: [string, string, string] | string[];
    comment: string;
  };

  export type StoryImageRefDto = {
    order: number;
    imageRef: string;
  };

  export type StoryAudioRefDto = {
    order: number;
    audioRef: string;
  };

  export type StoryVideoRefDto = {
    order: number;
    videoRef: string;
  };

  export type StoryPassagePageDto = {
    order: number;
    text: string;
  };

  export type StoryWordDto = {
    word: string;
    japanese: string;
    position: number;
  };

  export type GetStoryActivityRequest = {
    learnerId: string;
    unitCycleActivityId: string;
  };

  export type GetStoryActivityResponse = {
    story: {
      instructions: string;
      advice: string;
      title: string;
      assetBase: string | null;
      passage: {
        pages: StoryPassagePageDto[];
      };
      assets: {
        imageRefs: StoryImageRefDto[];
        audioRefs: StoryAudioRefDto[];
        videoRefs: StoryVideoRefDto[];
      };
      words: StoryWordDto[];
      feedback: StoryFeedbackDto;
      completion: {
        isCompleted: boolean;
      };
    };
  };

  export type SubmitStoryFeedbackRequest = {
    learnerId: string;
    unitCycleActivityId: string;
    selectedAnswer: string;
    comment: string;
  };

  export type SubmitStoryFeedbackResponse = {
    completion: {
      isCompleted: true;
    };
  };

  Task:

  - Implement the frontend Story activity flow used by StoryActivity, which is one of the components rendered by ActivityDisplay.
  - StoryActivity should accept the standard activity props from the ActivityDisplay registry, at minimum:

  type ActivityComponentProps = {
    learnerId: string;
    learningType: "english" | "mathematics";
    unitId: string;
    unitCycleId: string;
    unitCycleActivityId: string;
  };

  - On render, fetch story data through a frontend port/adapter/service/query flow using activities:story:get.
  - Render a StoryContainer that:
      - displays title
      - displays instructions
      - shows a hint button that reveals advice on hover
      - passes passage and words to TextDisplay
      - passes assets.imageRefs and assetBase to ImageContainer
      - passes feedback to Feedback
  - On feedback submit, call activities:story:submit-feedback.
  - For MVP, reveal a “well done!” state when submit succeeds or when fetched completion.isCompleted is already true.
  - Add focused tests for:
      - loading/error/success rendering
      - hint hover
      - subcomponent wiring
      - submit flow
      - completed state

  Constraints:

  - Keep all backend access in frontend adapters/services/hooks.
  - Do not implement subcomponent internals unless needed only for wiring.
  - Do not change the IPC channel names or DTO shapes above.
  - Keep your work scoped to the Story activity frontend and its contract.

  At the end, report changed files, tests run, and any assumptions.

  Agent 5 Prompt: StoryContainer Backend
  You are implementing only the backend support for the Story activity in the Tutory repo. Your work must match the frontend contract exactly.

  Read first:

  - AGENTS.md
  - electron/AGENTS.md
  - electron/ipc/AGENTS.md
  - electron/services/AGENTS.md
  - electron/db/AGENTS.md
  - DESIGNS/StoryContainer.md
  - DESIGNS/ActivityDisplayBack.md
  - electron/db/migration/0003_app_main_tables.sql
  - electron/db/migration/0005_unit1_seeds.sql

  Scope:

  - Backend only.
  - Own the Story activity IPC/service/repository path.
  - Do not implement React/frontend code.

  Shared frontend/backend contract:
  Use these exact channels:

  - activities:story:get
  - activities:story:submit-feedback

  Use these exact IPC contract shapes:

  export type StoryFeedbackDto = {
    question: string;
    answers: [string, string, string] | string[];
    comment: string;
  };

  export type StoryImageRefDto = {
    order: number;
    imageRef: string;
  };

  export type StoryAudioRefDto = {
    order: number;
    audioRef: string;
  };

  export type StoryVideoRefDto = {
    order: number;
    videoRef: string;
  };

  export type StoryPassagePageDto = {
    order: number;
    text: string;
  };

  export type StoryWordDto = {
    word: string;
    japanese: string;
    position: number;
  };

  export type GetStoryActivityRequest = {
    learnerId: string;
    unitCycleActivityId: string;
  };

  export type GetStoryActivityResponse = {
    story: {
      instructions: string;
      advice: string;
      title: string;
      assetBase: string | null;
      passage: {
        pages: StoryPassagePageDto[];
      };
      assets: {
        imageRefs: StoryImageRefDto[];
        audioRefs: StoryAudioRefDto[];
        videoRefs: StoryVideoRefDto[];
      };
      words: StoryWordDto[];
      feedback: StoryFeedbackDto;
      completion: {
        isCompleted: boolean;
      };
    };
  };

  export type SubmitStoryFeedbackRequest = {
    learnerId: string;
    unitCycleActivityId: string;
    selectedAnswer: string;
    comment: string;
  };

  export type SubmitStoryFeedbackResponse = {
    completion: {
      isCompleted: true;
    };
  };

  Task:

  - Implement backend support for Story activity only.
  - Add IPC contracts, validation schemas, handlers, service(s), repository logic, and tests.
  - activities:story:get must:
      - validate input
      - verify the unitCycleActivityId belongs to a Story activity
      - fetch and parse the activity_content JSON for that activity
      - return the story DTO shape above
      - mark the activity as started in activity_attempts if it has not started yet
      - include completion.isCompleted
  - activities:story:submit-feedback must:
      - validate input
      - mark the relevant activity attempt as completed
      - persist the feedback to activity_story_answers
      - return { completion: { isCompleted: true } }

  Implementation notes:

  - Use the actual existing table activity_story_answers.
  - If activity_story_answers.feedback must store the selected emoji and comment stores free text, use that mapping.
  - If an attempt row does not exist yet during submit, create or reconcile it safely in service logic.
  - Keep repositories SQL-focused and services orchestration-focused.
  - Keep handlers thin.
  - Raise structured backend errors for not-found or wrong-activity-type cases.

  Constraints:

  - Do not change the channels or DTO shapes above.
  - Do not implement other activity types.
  - Do not add unrelated migrations unless strictly necessary.
  - Keep this scoped to Story activity read/start/complete flow.

  At the end, report changed files, tests run, and any assumptions.