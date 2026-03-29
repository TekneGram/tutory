import "./UnitCardDisplay.css";
import type { UnitProgressHoverDto } from "@/app/ports/units.ports";

type BriefProgressHoverDisplayProps = {
  progress: UnitProgressHoverDto;
};

const BriefProgressHoverDisplay = ({ progress }: BriefProgressHoverDisplayProps) => {
  const { unit, progress: summary } = progress;

  return (
    <div className="brief-progress-hover-display">
      <header className="brief-progress-hover-display-header">
        <p className="brief-progress-hover-display-unit-title">{unit.title}</p>
        <p className="brief-progress-hover-display-summary">
          {summary.completedActivities} of {summary.totalActivities} activities completed
        </p>
      </header>

      <p className="brief-progress-hover-display-percent">{summary.completionPercent}% complete</p>

      <div className="brief-progress-hover-display-bar-shell" aria-hidden="true">
        <div
          className="brief-progress-hover-display-bar-fill"
          style={{ width: `${summary.completionPercent}%` }}
        />
      </div>
    </div>
  );
};

export default BriefProgressHoverDisplay;
