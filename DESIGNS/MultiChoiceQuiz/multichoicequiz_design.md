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
