import { useState } from "react";

type StoryHintProps = {
  advice: string;
};

const StoryHint = ({ advice }: StoryHintProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="story-activity-hint">
      <button
        type="button"
        aria-describedby={isVisible ? "story-activity-advice" : undefined}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        Hint
      </button>
      {isVisible ? (
        <p id="story-activity-advice" role="tooltip">
          {advice}
        </p>
      ) : null}
    </div>
  );
};

export default StoryHint;
