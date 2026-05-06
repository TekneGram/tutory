import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("0023_observe_content migration", () => {
  it("backfills observe prompt, words, categories, and answer keys from JSON content", () => {
    const migrationPath = path.join(
      process.cwd(),
      "electron",
      "db",
      "migration",
      "0023_observe_content.sql",
    );
    const sql = fs.readFileSync(migrationPath, "utf8");

    expect(sql).toContain("INSERT INTO observe_prompts");
    expect(sql).toContain("INSERT INTO observe_words");
    expect(sql).toContain("INSERT INTO observe_categories");
    expect(sql).toContain("INSERT INTO observe_answer_keys");
    expect(sql).toContain("WHERE at.name = 'observe'");
    expect(sql).toContain("json_extract(ac.content_json, '$.instructions')");
    expect(sql).toContain("json_extract(ac.content_json, '$.advice')");
    expect(sql).toContain("json_extract(ac.content_json, '$.title')");
    expect(sql).toContain("json_extract(ac.content_json, '$.assetBase')");
    expect(sql).toContain("json_extract(ac.content_json, '$.assets.imageRefs')");
    expect(sql).toContain("json_extract(j.value, '$.word')");
    expect(sql).toContain("json_extract(j.value, '$.category')");
  });
});
