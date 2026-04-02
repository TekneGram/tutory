import type { ComponentType } from "react";
import type { ActivityType } from "@/app/ports/activities.ports";
import StoryActivity from "@/features/StoryActivity/StoryActivity";
import MultiChoiceQuizActivity from "@/features/MultiChoiceQuizActivity/MultiChoiceQuizActivity";
import VocabReviewActivity from "@/features/VocabReviewActivity/VocabReviewActivity";
import WriteExtraActivity from "@/features/WriteExtraActivity/WriteExtraActivity";
import ObserveActivity from "@/features/ObserveActivity/ObserveActivity";
import ObserveDescribeActivity from "@/features/ObserveDescribeActivity/ObserveDescribeActivity";
import ReadModelActivity from "@/features/ReadModelActivity/ReadModelActivity";
import FreeWritingActivity from "@/features/FreeWritingActivity/FreeWritingActivity";
import TopicPredictionActivity from "@/features/TopicPredictionActivity/TopicPredictionActivity";
import ResearchActivity from "@/features/ResearchActivity/ResearchActivity";
import TextQuestionAnswerActivity from "@/features/TextQuestionAnswerActivity/TextQuestionAnswerActivity";
import WritingScaffoldActivity from "@/features/WritingScaffoldActivity/WritingScaffoldActivity";
import ReflectionSurveyActivity from "@/features/ReflectionSurveyActivity/ReflectionSurveyActivity";
import type { ActivityComponentProps } from "../types/activityDisplay.types";

type ActivityComponent = ComponentType<ActivityComponentProps>;

export const activityComponentRegistry: Record<ActivityType, ActivityComponent> = {
  story: StoryActivity,
  "multi-choice-quiz": MultiChoiceQuizActivity,
  "vocab-review": VocabReviewActivity,
  "write-extra": WriteExtraActivity,
  observe: ObserveActivity,
  "observe-describe": ObserveDescribeActivity,
  "read-model": ReadModelActivity,
  "free-writing": FreeWritingActivity,
  "topic-prediction": TopicPredictionActivity,
  research: ResearchActivity,
  "text-question-answer": TextQuestionAnswerActivity,
  "writing-scaffold": WritingScaffoldActivity,
  "reflection-survey": ReflectionSurveyActivity,
};
