import { useEffect, useMemo, useState } from "react";
import "./TextDisplay.css";
import PagesDisplay from "./PagesDisplay";
import { buildVocabPages } from "./TextDisplay.utils";
import type { TextDisplayProps } from "./TextDisplay.types";

const TextDisplay = ({ passage, words }: TextDisplayProps) => {
  const pages = useMemo(
    () => buildVocabPages(passage.pages, words),
    [passage.pages, words],
  );
  const [activePage, setActivePage] = useState<number | null>(
    () => pages[0]?.page ?? null,
  );

  useEffect(() => {
    if (!pages.length) {
      setActivePage(null);
      return;
    }

    setActivePage((currentPage) => {
      if (currentPage !== null && pages.some((page) => page.page === currentPage)) {
        return currentPage;
      }

      return pages[0]?.page ?? null;
    });
  }, [pages]);

  if (!pages.length) {
    return (
      <section className="text-display" aria-label="Story passage">
        <p className="text-display__empty">No passage available.</p>
      </section>
    );
  }

  return (
    <section className="text-display" aria-label="Story passage">
      <div className="text-display__tabs" role="tablist" aria-label="Story pages">
        {pages.map((page) => {
          const tabId = `text-display-tab-${page.page}`;
          const panelId = `text-display-panel-${page.page}`;
          const isActive = activePage === page.page;

          return (
            <button
              key={page.page}
              id={tabId}
              type="button"
              role="tab"
              className={`text-display__tab${isActive ? " is-active" : ""}`}
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActivePage(page.page)}
            >
              Page {page.page}
            </button>
          );
        })}
      </div>

      <div className="text-display__pages">
        {pages.map((page) => (
          <PagesDisplay
            key={page.page}
            page={page}
            isActive={activePage === page.page}
          />
        ))}
      </div>
    </section>
  );
};

export default TextDisplay;
