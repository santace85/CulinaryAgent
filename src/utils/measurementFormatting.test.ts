import test from "node:test";
import assert from "node:assert/strict";
import {
  formatMeasurement,
  formatMeasurementText,
} from "./measurementFormatting";

test("converts ingredient quantities to imperial units", () => {
  assert.equal(formatMeasurement(200, "g", "imperial"), "7.1 oz");
  assert.equal(formatMeasurement(500, "g", "imperial"), "1.1 lb");
  assert.equal(formatMeasurement(200, "ml", "imperial"), "0.8 cup");
  assert.equal(formatMeasurement(5, "ml", "imperial"), "1 tsp");
  assert.equal(formatMeasurement(15, "ml", "imperial"), "1 tbsp");
  assert.equal(formatMeasurement(30, "ml", "imperial"), "2 tbsp");
  assert.equal(formatMeasurement(60, "ml", "imperial"), "1/4 cup");
});

test("converts ingredient quantities to metric units", () => {
  assert.equal(formatMeasurement(1, "cup", "metric"), "236.6 ml");
  assert.equal(formatMeasurement(1, "lb", "metric"), "453.6 g");
});

test("converts inline quantities and temperatures without reinterpreting Celsius", () => {
  assert.equal(
    formatMeasurementText("Roast at 425°F and add 200 ml water.", "metric"),
    "Roast at 218.3°C and add 200 ml water.",
  );
  assert.equal(
    formatMeasurementText("Add 200 ml water.", "imperial"),
    "Add 0.8 cup water.",
  );
  assert.equal(
    formatMeasurementText("Add 5 ml vanilla and 15 ml oil.", "imperial"),
    "Add 1 tsp vanilla and 1 tbsp oil.",
  );
  assert.equal(
    formatMeasurementText("Bake at 200°C and add 1 cup flour.", "imperial"),
    "Bake at 392°F and add 1 cup flour.",
  );
});
