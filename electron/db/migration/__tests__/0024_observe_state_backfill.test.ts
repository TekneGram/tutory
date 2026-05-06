import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("0024_observe_state_backfill migration", () => {
  it("backfills observe state rows for missing attempts", () => {
    const migrationPath = path.join(
      process.cwd(),
      "electron",
      "db",
      "migration",
      "0024_observe_state_backfill.sql",
    );
    const sql = fs.readFileSync(migrationPath, "utf8");

    expect(sql).toContain("INSERT INTO observe_state");
    expect(sql).toContain("SELECT COUNT(*)");
    expect(sql).toContain("WHERE at.name = 'observe'");
    expect(sql).toContain("NOT EXISTS");
    expect(sql).toContain("FROM observe_state os");
  });
});
