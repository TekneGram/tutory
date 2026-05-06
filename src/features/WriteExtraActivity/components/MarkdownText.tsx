import { Fragment } from "react";

type MarkdownTextProps = {
  text: string;
  className?: string;
};

function parseInlineMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|<u>[^<]+<\/u>)/g;
  let cursor = 0;
  let match: RegExpExecArray | null = pattern.exec(text);

  while (match) {
    const token = match[0];
    const start = match.index;

    if (start > cursor) {
      nodes.push(text.slice(cursor, start));
    }

    if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(<strong key={`b-${start}`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*") && token.endsWith("*")) {
      nodes.push(<em key={`i-${start}`}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith("<u>") && token.endsWith("</u>")) {
      nodes.push(<u key={`u-${start}`}>{token.slice(3, -4)}</u>);
    } else {
      nodes.push(token);
    }

    cursor = start + token.length;
    match = pattern.exec(text);
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes;
}

const MarkdownText = ({ text, className }: MarkdownTextProps) => {
  const paragraphs = text.split(/\n{2,}/).filter((paragraph) => paragraph.length > 0);

  if (paragraphs.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {paragraphs.map((paragraph, paragraphIndex) => {
        const lines = paragraph.split("\n");

        return (
          <p key={`p-${paragraphIndex}`}>
            {lines.map((line, lineIndex) => (
              <Fragment key={`l-${paragraphIndex}-${lineIndex}`}>
                {lineIndex > 0 ? <br /> : null}
                {parseInlineMarkdown(line)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
};

export default MarkdownText;
