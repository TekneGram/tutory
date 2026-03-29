import "./CyclesCardDisplay.css";
import CycleCard from "./CycleCard";
import type { LearningUnitCycleCardDto } from "@/app/ports/cycles.ports";

type CyclesCardDisplayProps = {
  learnerId: string;
  cycles: LearningUnitCycleCardDto[];
  onSelectCycle: (unitCycleId: string) => void;
};

const CyclesCardDisplay = ({ learnerId, cycles, onSelectCycle }: CyclesCardDisplayProps) => {
  return (
    <section className="cycles-card-display" aria-label="Learning cycles">
      <div className="cycles-card-display-grid">
        {cycles.map((cycle) => (
          <CycleCard key={cycle.unitCycleId} learnerId={learnerId} cycle={cycle} onSelectCycle={onSelectCycle} />
        ))}
      </div>
    </section>
  );
};

export default CyclesCardDisplay;

