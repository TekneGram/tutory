import type {
    LearningUnitCardDto,
    UnitProgressHoverDto,
    UnitProgressSummaryDto,
} from "@electron/ipc/contracts/units.contracts";
import type {
    LearningUnitRow,
    UnitIdentityRow,
    UnitProgressCountsRow,
} from "@electron/db/repositories/unitRepositories";
import { buildContentAssetUrl } from "@electron/services/media/assetUrl";

export function toLearningUnitCardDto(row: LearningUnitRow): LearningUnitCardDto {
    return {
        unitId: row.unit_id,
        title: row.title,
        description: row.description,
        iconPath: row.asset_base && row.icon_path
            ? buildContentAssetUrl(row.asset_base, row.icon_path)
            : null,
        sortOrder: row.sort_order,
        learningType: row.learning_type,
    };
}

export function toUnitProgressSummaryDto(
    learnerId: string,
    unitId: string,
    counts: UnitProgressCountsRow
): UnitProgressSummaryDto {
    const totalActivities = counts.total_activities;
    const completedActivities = counts.completed_activities;
    const startedActivities = counts.started_activities;
    const notStartedActivities = totalActivities - startedActivities;
    const completionPercent = totalActivities === 0
        ? 0
        : Math.floor((completedActivities / totalActivities) * 100);

    return {
        learnerId,
        unitId,
        completedActivities,
        totalActivities,
        completionPercent,
        startedActivities,
        notStartedActivities,
    };
}

export function toUnitProgressHoverDto(
    unit: UnitIdentityRow,
    summary: UnitProgressSummaryDto
): UnitProgressHoverDto {
    return {
        unit: {
            unitId: unit.unit_id,
            title: unit.title,
        },
        progress: summary,
    };
}
