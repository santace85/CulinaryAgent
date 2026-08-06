import test from "node:test";
import assert from "node:assert/strict";
import { getMacroSummary, getMacroDeltaSummary } from "./nutrition";

test("formats nutrition summary for recipe cards", () => {
  assert.equal(
    getMacroSummary({ protein: "24g", carbs: "40g", fat: "12g" }),
    "P 24g • C 40g • F 12g",
  );
});

test("formats substitution macro deltas with gains and losses", () => {
  assert.equal(
    getMacroDeltaSummary({ protein: "+4g", carbs: "-6g", fat: "+1g" }),
    "P +4g • C -6g • F +1g",
  );
});
