import "./CyclesCardDisplay.css";
import { useState } from "react";
import { useCycleProgressQuery } from "./hooks/useCycleProgressQuery";
import BriefCycleProgressHoverDisplay from "./BriefCycleProgressHoverDisplay";
import type { LearningUnitCycleCardDto } from "@/app/ports/cycles.ports";

type CycleCardIconProps = {
  learnerId: string;
  cycle: Pick<LearningUnitCycleCardDto, "unitCycleId" | "title" | "iconPath">;
};

function getFallbackLabel(title: string) {
  const words = title.trim().split(/\s+/);
  const letters = words.slice(0, 2).map((word) => word[0] ?? "");
  return letters.join("").toUpperCase() || "C";
}

const CycleCardIcon = ({ learnerId, cycle }: CycleCardIconProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const progressQuery = useCycleProgressQuery({
    learnerId,
    unitCycleId: cycle.unitCycleId,
    enabled: isOpen,
  });

  function openPanel() {
    setIsOpen(true);
  }

  function closePanel() {
    setIsOpen(false);
  }

  return (
    <div className="cycle-icon-tooltip-anchor tooltip-anchor">
      <button
        className="cycle-icon-trigger tooltip-trigger"
        type="button"
        aria-label={`View progress for ${cycle.title}`}
        onClick={(event) => event.stopPropagation()}
        onFocus={openPanel}
        onBlur={closePanel}
        onMouseEnter={openPanel}
        onMouseLeave={closePanel}
      >
        {cycle.iconPath ? (
          <img className="cycle-icon-image" src={cycle.iconPath} alt="" aria-hidden="true" />
        ) : (
          <span className="cycle-icon-fallback" aria-hidden="true">
            {getFallbackLabel(cycle.title)}
          </span>
        )}
      </button>

      {isOpen ? (
        <div className="cycle-icon-tooltip-panel tooltip-panel tooltip-panel-right-center tooltip-panel-compact">
          {progressQuery.isLoading ? (
            <div className="cycle-icon-tooltip-loading" aria-live="polite">
              <span className="loading-spinner loading-spinner-sm" aria-hidden="true" />
              <p className="cycle-icon-tooltip-loading-text">Loading progress...</p>
            </div>
          ) : null}

          {progressQuery.isError ? (
            <div className="cycle-icon-tooltip-error" aria-live="polite">
              <p className="cycle-icon-tooltip-error-text">
                {progressQuery.error instanceof Error ? progressQuery.error.message : "Unable to load progress."}
              </p>
            </div>
          ) : null}

          {progressQuery.data ? <BriefCycleProgressHoverDisplay progress={progressQuery.data} /> : null}
        </div>
      ) : null}
    </div>
  );
};

export default CycleCardIcon;

