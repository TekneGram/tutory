# MultiChoice Quiz Read/Display Flow

## Current status
- Read/display flow is implemented end-to-end.
- Data is normalized and ID-based for quiz content and learner-answer mapping.
- Write/submit flow for quiz answers is still a separate next step.

## Backend data source
- Quiz content is read from normalized tables:
  - `activity_content` (link to `unit_cycle_activity_id`, plus content row id)
  - `activity_content_primary` (`instructions`, `advice`, `title`, `asset_base`)
  - `activity_content_assets` (`image`/`audio`/`video` refs with order)
  - `multichoicequiz_questions` (`id`, `question_order`, `question_text`)
  - `multichoicequiz_options` (`id`, `question_id`, option key/text/order/correctness)
- Learner attempt answer rows are read from `multi_choice_quiz_answers` using `question_id`.

## Service/API flow
1. Renderer calls `activities:multi-choice-quiz:get-quiz`.
2. IPC handler validates request and calls `getMultiChoiceQuizActivity`.
3. Service validates activity type, ensures/loads attempt, reads normalized quiz tables, reads learner answers.
4. Service maps DB rows to `GetMultiChoiceQuizActivityResponse`.

## Response shape (important IDs)
- `multiChoiceQuiz.questions[]` contains:
  - `questionId`
  - `question`
  - `answers[]` with `optionId`, `option`, `answer`, `is_correct`
- `multiChoiceQuiz.learnerAnswers[]` contains:
  - `questionId`
  - status fields (`isAnswered`, `selectedOption`, `isCorrect`, etc.)

## Frontend consumption
- Frontend contracts/ports mirror backend IDs.
- UI should match learner answers to questions by `questionId` (not question text).

# Multi Choice Quiz Design
## Display
- Display the title from the read data.
- Display the instructions from the read data.
- Allow the user to hover over a "hint" - reveal it when hovered
- <QuestionCard /> component should accept the read data.
- <Question /> component should display a question.
- <Answer /> should display answer options associated with a question.
- <ScoreDisplay /> should display the score and the number of questions that the user has selected options for.

## Data
We need to create an object that looks something like this:
```typescript
const questionsStatus = questions.map((question) => {
  const matchedLearnerAnswer = learnerAnswers.find(
    (learnerAnswer) => learnerAnswer.question_id === question.question_id
  );

  return {
    question_id: question.question_id
    question: question.question,
    answers: question.answers,
    is_answered: matchedLearnerAnswer?.isAnswered ?? false,
    is_correct: matchedLearnerAnswer?.isCorrect ?? false,
    selected_option: matchedLearnerAnswer?.selectedOption ?? null,
  };
});
```
That data object should be used when managing the Question and Answer and ScoreDisplay components. If there is an alternative way to do this, you may suggest it.

## Interaction
- One question should be shown at a time.
- Left-right toggles allow the user to move through the questions
- User can select only *one* option from the answer options per question.
- There should be a "check answers" button. When clicked, this will update the user's score and "grade" the options. If the option chosen was is_correct === false then the option turns red; if is_correct === true then the option turns green.
- Update is_answered only after "check answers" button is clicked.
- "check answers" button is only clickable once all the questions have been answered.
- A "retry" button can appear once "check answers" button has been clicked. Clicking "retry" resets all the questions to their original state of being unanswered.

## Design
- css should be written in src/features/MultiChoiceQuizActivity folder in multiChoiceQuizActivity.css file
- Follow styles of other components to ensure consistency.

## State management
- Manage state in hooks in hooks folder where possible.
- Do not mix database state and UI state; ensure to separate concerns.
- Add a dedicated submit mutation for MultiChoiceQuiz (same pattern as Story)
    - Service: submitMultiChoiceQuizAnswer.service.ts
    - Hook: useSubmitMultiChoiceQuizAnswerMutation
    - Use activitiesAdapter via ports, same boundary discipline already followed.
- Update frontend immediately from React Query cache (optimistic UI)
    - In mutation onMutate, use queryClient.setQueryData for multiChoiceQuizActivityKey(...) and patch only the matching learnerAnswers row:
        - isAnswered = true
        - selectedOption = chosen option
        - isCorrect = computed/returned value
    - This makes UI feel instant.
- Keep DB as source of truth
    - On mutation success, optionally keep optimistic value if backend response matches.
    - On mutation error, rollback cache using snapshot from onMutate.
    - On onSettled, call invalidateQueries for multiChoiceQuizActivityKey(...) to re-sync from backend.

## Communicating with electron through IPC
- Ensure necessary DTOs are defined in app/ports/activities.ports.ts and app/adapters/activities.adapters.ts (do not create new file)
- Ensure the channel defined in activities.adapters.ts is used in electron/ipc/registerHandlers/register.activities.ts
- Define relevant contracts in ipc/contracts/activities.contracts.ts (do not create new files) and validation is handled in validationSchemas/activities.schemas.ts (do not create new files)
- For electron services necessary to update the database, create a new file in services/activities/updateMultiChoiceQuiz.ts
- Just like multiChoiceQuizSchema.ts in services/activities/getMultiChoiceQuiz, create a new folder called updateMultiChoiceQuiz with a file called updateMultiChoiceQuizSchema.ts if it is necessary to do so
- Any database updates should be handled in db/repositories/activityRepositories.ts