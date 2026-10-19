import test from "node:test";
import assert from "node:assert/strict";
import { formatInstructionDurations } from "./durationFormatting";

test("formats minute-long durations in recipe instructions as minutes", () => {
  assert.equal(
    formatInstructionDurations("Cook for 600 seconds."),
    "Cook for 10 minutes.",
  );
});

test("formats non-whole-minute durations without displaying seconds", () => {
  assert.equal(
    formatInstructionDurations("Rest for 90 sec."),
    "Rest for 1.5 minutes.",
  );
});

test("keeps durations under one minute in seconds", () => {
  assert.equal(
    formatInstructionDurations("Cook for 45 seconds."),
    "Cook for 45 seconds.",
  );
});
