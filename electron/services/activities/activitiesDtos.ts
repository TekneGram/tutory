import type {
    UnitCycleActivityListItemDto,
} from "@electron/ipc/contracts/activities.contracts";
import type { UnitCycleActivityRow } from "@electron/db/repositories/activityRepositories";

export function toUnitCycleActivityListItemDto(
    row: UnitCycleActivityRow
): UnitCycleActivityListItemDto {
    const fallbackTitle = `Activity ${row.activity_order}`;
    const title = row.title?.trim() || fallbackTitle;

    return {
        unitCycleActivityId: row.unit_cycle_activity_id,
        unitCycleId: row.unit_cycle_id,
        activityType: row.activity_type,
        title,
        activityOrder: row.activity_order,
        isRequired: row.is_required === 1,
    };
}
