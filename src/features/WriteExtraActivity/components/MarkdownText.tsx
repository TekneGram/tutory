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
  const lines = text.split("\n");
  const blocks: Array<{ kind: "h1" | "h2" | "p"; text: string }> = [];
  let paragraphBuffer: string[] = [];

  function flushParagraphBuffer() {
    if (paragraphBuffer.length === 0) {
      return;
    }
    blocks.push({
      kind: "p",
      text: paragraphBuffer.join("\n"),
    });
    paragraphBuffer = [];
  }

  for (const line of lines) {
    if (line.trim().length === 0) {
      flushParagraphBuffer();
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraphBuffer();
      blocks.push({
        kind: "h2",
        text: line.slice(3),
      });
      continue;
    }

    if (line.startsWith("# ")) {
      flushParagraphBuffer();
      blocks.push({
        kind: "h1",
        text: line.slice(2),
      });
      continue;
    }

    paragraphBuffer.push(line);
  }

  flushParagraphBuffer();

  if (blocks.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {blocks.map((block, blockIndex) => {
        if (block.kind === "h1") {
          return <h1 key={`h1-${blockIndex}`}>{parseInlineMarkdown(block.text)}</h1>;
        }

        if (block.kind === "h2") {
          return <h2 key={`h2-${blockIndex}`}>{parseInlineMarkdown(block.text)}</h2>;
        }

        const paragraphLines = block.text.split("\n");
        return (
          <p key={`p-${blockIndex}`}>
            {paragraphLines.map((line, lineIndex) => (
              <Fragment key={`l-${blockIndex}-${lineIndex}`}>
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
