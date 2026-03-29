import "./UnitCardDisplay.css";
import type { KeyboardEvent } from "react";
import UnitIcon from "./UnitIcon";
import type { LearningUnitCardDto } from "@/app/ports/units.ports";

type UnitCardProps = {
  learnerId: string;
  unit: LearningUnitCardDto;
  onSelectUnit: (unitId: string) => void;
};

const UnitCard = ({ learnerId, unit, onSelectUnit }: UnitCardProps) => {
  function handleActivate() {
    onSelectUnit(unit.unitId);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleActivate();
    }
  }

  return (
    <article
      className="unit-card"
      role="button"
      tabIndex={0}
      aria-label={`Open ${unit.title}`}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
    >
      <div className="unit-card-copy">
        <h2 className="unit-card-title">{unit.title}</h2>
      </div>

      <div className="unit-card-icon-shell">
        <UnitIcon learnerId={learnerId} unit={unit} />
      </div>

      <div className="unit-card-footer">
        {unit.description ? (
          <p className="unit-card-description">{unit.description}</p>
        ) : (
          <p className="unit-card-description is-empty">No description available.</p>
        )}
      </div>
    </article>
  );
};

export default UnitCard;
