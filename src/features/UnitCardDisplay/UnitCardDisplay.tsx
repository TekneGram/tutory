import "./UnitCardDisplay.css";
import UnitCard from "./UnitCard";
import type { LearningUnitCardDto } from "@/app/ports/units.ports";

type UnitCardDisplayProps = {
  learnerId: string;
  units: LearningUnitCardDto[];
  onSelectUnit: (unitId: string) => void;
};

const UnitCardDisplay = ({ learnerId, units, onSelectUnit }: UnitCardDisplayProps) => {
  return (
    <section className="unit-card-display" aria-label="Learning units">
      <div className="unit-card-display-grid">
        {units.map((unit) => (
          <UnitCard key={unit.unitId} learnerId={learnerId} unit={unit} onSelectUnit={onSelectUnit} />
        ))}
      </div>
    </section>
  );
};

export default UnitCardDisplay;
