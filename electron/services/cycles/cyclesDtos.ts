import type {
    CycleProgressHoverDto,
    CycleProgressSummaryDto,
    LearningUnitCycleCardDto,
} from "@electron/ipc/contracts/cycles.contracts";
import type {
    CycleProgressCountsRow,
    LearningUnitCycleRow,
    UnitCycleIdentityRow,
} from "@electron/db/repositories/cycleRepositories";
import { buildContentAssetUrl } from "@electron/services/media/assetUrl";

export function toLearningUnitCycleCardDto(row: LearningUnitCycleRow): LearningUnitCycleCardDto {
    return {
        unitCycleId: row.unit_cycle_id,
        unitId: row.unit_id,
        cycleTypeId: row.cycle_type_id,
        title: row.title,
        description: row.description,
        iconPath: row.asset_base && row.icon_path
            ? buildContentAssetUrl(row.asset_base, row.icon_path)
            : null,
        sortOrder: row.sort_order,
        totalActivities: row.total_activities,
    };
}

export function toCycleProgressSummaryDto(
    learnerId: string,
    unitCycleId: string,
    counts: CycleProgressCountsRow
): CycleProgressSummaryDto {
    const totalActivities = counts.total_activities;
    const completedActivities = counts.completed_activities;
    const startedActivities = counts.started_activities;
    const notStartedActivities = totalActivities - startedActivities;
    const completionPercent = totalActivities === 0
        ? 0
        : Math.floor((completedActivities / totalActivities) * 100);

    return {
        learnerId,
        unitCycleId,
        completedActivities,
        totalActivities,
        completionPercent,
        startedActivities,
        notStartedActivities,
    };
}

export function toCycleProgressHoverDto(
    cycle: UnitCycleIdentityRow,
    summary: CycleProgressSummaryDto
): CycleProgressHoverDto {
    return {
        cycle: {
            unitCycleId: cycle.unit_cycle_id,
            unitId: cycle.unit_id,
            title: cycle.title,
        },
        progress: summary,
    };
}
