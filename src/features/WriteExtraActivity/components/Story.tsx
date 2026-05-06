import MarkdownText from "./MarkdownText";

type StoryProps = {
  text: string;
};

const Story = ({ text }: StoryProps) => {
  return (
    <article className="write-extra__story" aria-label="Story summary text">
      <MarkdownText text={text} />
    </article>
  );
};

export default Story;
