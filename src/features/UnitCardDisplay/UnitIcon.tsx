import "./UnitCardDisplay.css";
import { useState } from "react";
import { useUnitProgressQuery } from "./hooks/useUnitProgressQuery";
import BriefProgressHoverDisplay from "./BriefProgressHoverDisplay";
import type { LearningUnitCardDto } from "@/app/ports/units.ports";

type UnitIconProps = {
  learnerId: string;
  unit: Pick<LearningUnitCardDto, "unitId" | "title" | "iconPath">;
};

function getFallbackLabel(title: string) {
  const words = title.trim().split(/\s+/);
  const letters = words.slice(0, 2).map((word) => word[0] ?? "");
  return letters.join("").toUpperCase() || "U";
}

const UnitIcon = ({ learnerId, unit }: UnitIconProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const progressQuery = useUnitProgressQuery({
    learnerId,
    unitId: unit.unitId,
    enabled: isOpen,
  });

  function openPanel() {
    setIsOpen(true);
  }

  function closePanel() {
    setIsOpen(false);
  }

  return (
    <div className="unit-icon-tooltip-anchor tooltip-anchor">
      <button
        className="unit-icon-trigger tooltip-trigger"
        type="button"
        aria-label={`View progress for ${unit.title}`}
        onClick={(event) => event.stopPropagation()}
        onFocus={openPanel}
        onBlur={closePanel}
        onMouseEnter={openPanel}
        onMouseLeave={closePanel}
      >
        {unit.iconPath ? (
          <img className="unit-icon-image" src={unit.iconPath} alt="" aria-hidden="true" />
        ) : (
          <span className="unit-icon-fallback" aria-hidden="true">
            {getFallbackLabel(unit.title)}
          </span>
        )}
      </button>

      {isOpen ? (
        <div className="unit-icon-tooltip-panel tooltip-panel tooltip-panel-right-center tooltip-panel-compact">
          {progressQuery.isLoading ? (
            <div className="unit-icon-tooltip-loading" aria-live="polite">
              <span className="loading-spinner loading-spinner-sm" aria-hidden="true" />
              <p className="unit-icon-tooltip-loading-text">Loading progress...</p>
            </div>
          ) : null}

          {progressQuery.isError ? (
            <div className="unit-icon-tooltip-error" aria-live="polite">
              <p className="unit-icon-tooltip-error-text">
                {progressQuery.error instanceof Error ? progressQuery.error.message : "Unable to load progress."}
              </p>
            </div>
          ) : null}

          {progressQuery.data ? <BriefProgressHoverDisplay progress={progressQuery.data} /> : null}
        </div>
      ) : null}
    </div>
  );
};

export default UnitIcon;
