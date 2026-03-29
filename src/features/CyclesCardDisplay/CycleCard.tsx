import "./CyclesCardDisplay.css";
import type { KeyboardEvent } from "react";
import CycleCardIcon from "./CycleCardIcon";
import type { LearningUnitCycleCardDto } from "@/app/ports/cycles.ports";

type CycleCardProps = {
  learnerId: string;
  cycle: LearningUnitCycleCardDto;
  onSelectCycle: (unitCycleId: string) => void;
};

const CycleCard = ({ learnerId, cycle, onSelectCycle }: CycleCardProps) => {
  function handleActivate() {
    onSelectCycle(cycle.unitCycleId);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleActivate();
    }
  }

  return (
    <article
      className="cycle-card"
      role="button"
      tabIndex={0}
      aria-label={`Open ${cycle.title}`}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
    >
      <div className="cycle-card-copy">
        <h2 className="cycle-card-title">{cycle.title}</h2>
      </div>

      <div className="cycle-card-icon-shell">
        <CycleCardIcon learnerId={learnerId} cycle={cycle} />
      </div>

      <div className="cycle-card-footer">
        {cycle.description ? (
          <p className="cycle-card-description">{cycle.description}</p>
        ) : (
          <p className="cycle-card-description is-empty">No description available.</p>
        )}
      </div>
    </article>
  );
};

export default CycleCard;

