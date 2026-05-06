import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("0018_vocabreview_primary_backfill migration", () => {
  it("backfills activity_content_primary for vocab-review only when missing", () => {
    const migrationPath = path.join(
      process.cwd(),
      "electron",
      "db",
      "migration",
      "0018_vocabreview_primary_backfill.sql",
    );
    const sql = fs.readFileSync(migrationPath, "utf8");

    expect(sql).toContain("INSERT INTO activity_content_primary");
    expect(sql).toContain("WHERE at.name = 'vocab-review'");
    expect(sql).toContain("NOT EXISTS");
    expect(sql).toContain("acp.activity_content_id = ac.id");
    expect(sql).toContain("json_extract(ac.content_json, '$.instructions')");
    expect(sql).toContain("json_extract(ac.content_json, '$.advice')");
    expect(sql).toContain("json_extract(ac.content_json, '$.title')");
    expect(sql).toContain("json_extract(ac.content_json, '$.assetBase')");
  });
});
