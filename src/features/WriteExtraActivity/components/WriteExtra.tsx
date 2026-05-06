import { useMemo, useRef } from "react";
import MarkdownText from "./MarkdownText";

type WriteExtraProps = {
  value: string;
  isCompleted: boolean;
  isSubmitting: boolean;
  isResuming: boolean;
  submitError: string | null;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onResume: () => void;
};

const MIN_WORDS = 25;

function countWords(value: string): number {
  const tokens = value.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g);
  return tokens?.length ?? 0;
}

const WriteExtra = ({
  value,
  isCompleted,
  isSubmitting,
  isResuming,
  submitError,
  onChange,
  onSubmit,
  onResume,
}: WriteExtraProps) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const wordCount = useMemo(() => countWords(value), [value]);
  const canSubmit = wordCount >= MIN_WORDS;

  function wrapSelection(prefix: string, suffix: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const next = `${value.slice(0, start)}${prefix}${selected}${suffix}${value.slice(end)}`;
    onChange(next);

    window.requestAnimationFrame(() => {
      textarea.focus();
      const selectionStart = start + prefix.length;
      const selectionEnd = selectionStart + selected.length;
      textarea.setSelectionRange(selectionStart, selectionEnd);
    });
  }

  if (isCompleted) {
    return (
      <section className="write-extra__editor" aria-label="Write extra completed">
        <p className="write-extra__completion">Congratulations, you have completed this task.</p>
        <div className="write-extra__submitted" role="status" aria-live="polite">
          <MarkdownText text={value} />
        </div>
        <button type="button" onClick={onResume} disabled={isResuming}>
          Continue writing
        </button>
      </section>
    );
  }

  return (
    <section className="write-extra__editor" aria-label="Write extra editor">
      <div className="write-extra__toolbar" role="toolbar" aria-label="Formatting tools">
        <button type="button" onClick={() => wrapSelection("**", "**")}>Bold</button>
        <button type="button" onClick={() => wrapSelection("*", "*")}>Italic</button>
        <button type="button" onClick={() => wrapSelection("<u>", "</u>")}>Underline</button>
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Write what happens next..."
        rows={10}
      />

      <p className="write-extra__word-count" aria-live="polite">
        Word count: {wordCount}
      </p>

      {canSubmit ? (
        <button type="button" onClick={onSubmit} disabled={isSubmitting}>
          Submit
        </button>
      ) : null}

      {submitError ? <p className="write-extra__error">{submitError}</p> : null}
    </section>
  );
};

export default WriteExtra;
