import type { ComponentType } from "react";
import type { ActivityType } from "../types/activityTypes";
import type { ActivityDataMap } from "../types/activityTypes";

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



type RegistryEntry<T extends ActivityType> = {
    component: ComponentType< data: ActivityDataMap[T] >
};

export const activityRegistry: {
    [Key in ActivityType]: RegistryEntry<Key>
} = {
    storyActivity: {
        component: StoryActivity,
    },
    multiChoiceQuizActivity: {
        component: MultiChoiceQuizActivity,
    },
    vocabReviewActivity: {
        component: VocabReviewActivity,
    },
    writeExtraActivity: {
        component: WriteExtraActivity,
    },
    oberveActivity: {
        component: ObserveActivity,
    },
    observeDescribeActivity: {
        component: ObserveDescribeActivity,
    },
    readModelActivity: {
        component: ReadModelActivity,
    },
    freeWritingActivity: {
        component: FreeWritingActivity,
    },
    topicPredictionActivity: {
        component: TopicPredictionActivity,
    },
    researchActivity: {
        component: ResearchActivity,
    },
    textQuestionAnswerActivity: {
        component: TextQuestionAnswerActivity,
    },
    writingScaffoldActivity: {
        component: WritingScaffoldActivity,
    },
    reflectionSurveyActivity: {
        component: ReflectionSurveyActivity,
    }
}