import "./TextDisplay.css";
import TokenDisplay from "./TokenDisplay";
import type { VocabPageDto } from "./TextDisplay.types";

type PagesDisplayProps = {
  page: VocabPageDto;
  isActive: boolean;
};

const PagesDisplay = ({ page, isActive }: PagesDisplayProps) => {
  const tabId = `text-display-tab-${page.page}`;
  const panelId = `text-display-panel-${page.page}`;

  return (
    <section
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
      className={`text-display__page${isActive ? " is-active" : ""}`}
      hidden={!isActive}
    >
      <p className="text-display__page-text">
        {page.words.map((token) => (
          <TokenDisplay
            key={`${token.position}-${token.token}`}
            token={token.token}
            position={token.position}
            wordData={token.wordData}
          />
        ))}
      </p>
    </section>
  );
};

export default PagesDisplay;
