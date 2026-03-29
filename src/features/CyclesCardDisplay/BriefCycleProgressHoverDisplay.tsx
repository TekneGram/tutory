import "./CyclesCardDisplay.css";
import type { CycleProgressHoverDto } from "@/app/ports/cycles.ports";

type BriefCycleProgressHoverDisplayProps = {
  progress: CycleProgressHoverDto;
};

const BriefCycleProgressHoverDisplay = ({ progress }: BriefCycleProgressHoverDisplayProps) => {
  const { cycle, progress: summary } = progress;

  return (
    <div className="brief-cycle-progress-hover-display">
      <header className="brief-cycle-progress-hover-display-header">
        <p className="brief-cycle-progress-hover-display-cycle-title">{cycle.title}</p>
        <p className="brief-cycle-progress-hover-display-summary">
          {summary.completedActivities} of {summary.totalActivities} activities completed
        </p>
      </header>

      <p className="brief-cycle-progress-hover-display-percent">{summary.completionPercent}% complete</p>

      <div className="brief-cycle-progress-hover-display-bar-shell" aria-hidden="true">
        <div
          className="brief-cycle-progress-hover-display-bar-fill"
          style={{ width: `${summary.completionPercent}%` }}
        />
      </div>
    </div>
  );
};

export default BriefCycleProgressHoverDisplay;

