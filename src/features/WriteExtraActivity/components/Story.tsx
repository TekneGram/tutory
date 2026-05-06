type StoryProps = {
  text: string;
};

const Story = ({ text }: StoryProps) => {
  return (
    <article className="write-extra__story" aria-label="Story summary text">
      <p>{text}</p>
    </article>
  );
};

export default Story;
