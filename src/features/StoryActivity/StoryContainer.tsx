import type {
  GetStoryActivityResponse,
  StoryFeedbackDto,
  StoryPassagePageDto,
  StoryWordDto,
} from "@/app/ports/activities/story.ports";
import Feedback, {
  type FeedbackSubmitValue,
} from "@/features/ActivitySubComponents/Feedback/Feedback";
import ImageContainer from "@/features/ActivitySubComponents/ImageContainer/ImageContainer";
import TextDisplay from "@/features/ActivitySubComponents/TextDisplay/TextDisplay";
import StoryHint from "./StoryHint";

type StoryContainerProps = {
  story: GetStoryActivityResponse["story"];
  isCompleted: boolean;
  isSubmitting?: boolean;
  onSubmitFeedback: (value: FeedbackSubmitValue) => Promise<void> | void;
};

export type StoryContentProps = {
  title: string;
  instructions: string;
  advice: string;
  assetBase: string | null;
  passage: {
    pages: StoryPassagePageDto[];
  };
  words: StoryWordDto[];
  feedback: StoryFeedbackDto;
};

const StoryContainer = ({
  story,
  isCompleted,
  isSubmitting = false,
  onSubmitFeedback,
}: StoryContainerProps) => {
  return (
    <section aria-labelledby="story-activity-title">
      <header>
        <p>Story activity</p>
        <h2 id="story-activity-title">{story.title}</h2>
        <p>{story.instructions}</p>
      </header>

      <StoryHint advice={story.advice} />

      <ImageContainer imageRefs={story.assets.imageRefs} assetBase={story.assetBase} />

      <TextDisplay passage={story.passage} words={story.words} />

      {isCompleted ? <p>well done!</p> : null}

      <Feedback
        feedback={story.feedback}
        disabled={isCompleted || isSubmitting}
        onSubmit={onSubmitFeedback}
      />
    </section>
  );
};

export default StoryContainer;
