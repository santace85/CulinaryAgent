import { MeasurementSystem } from "../types";

type UnitDefinition = {
  dimension: "mass" | "volume";
  factor: number;
};

const UNIT_DEFINITIONS: Record<string, UnitDefinition> = {
  g: { dimension: "mass", factor: 1 },
  gram: { dimension: "mass", factor: 1 },
  grams: { dimension: "mass", factor: 1 },
  kg: { dimension: "mass", factor: 1000 },
  kilogram: { dimension: "mass", factor: 1000 },
  kilograms: { dimension: "mass", factor: 1000 },
  mg: { dimension: "mass", factor: 0.001 },
  oz: { dimension: "mass", factor: 28.3495 },
  ounce: { dimension: "mass", factor: 28.3495 },
  ounces: { dimension: "mass", factor: 28.3495 },
  lb: { dimension: "mass", factor: 453.592 },
  lbs: { dimension: "mass", factor: 453.592 },
  pound: { dimension: "mass", factor: 453.592 },
  pounds: { dimension: "mass", factor: 453.592 },
  ml: { dimension: "volume", factor: 1 },
  milliliter: { dimension: "volume", factor: 1 },
  milliliters: { dimension: "volume", factor: 1 },
  millilitre: { dimension: "volume", factor: 1 },
  millilitres: { dimension: "volume", factor: 1 },
  l: { dimension: "volume", factor: 1000 },
  liter: { dimension: "volume", factor: 1000 },
  liters: { dimension: "volume", factor: 1000 },
  litre: { dimension: "volume", factor: 1000 },
  litres: { dimension: "volume", factor: 1000 },
  cup: { dimension: "volume", factor: 236.588 },
  cups: { dimension: "volume", factor: 236.588 },
  "fl oz": { dimension: "volume", factor: 29.5735 },
  tablespoon: { dimension: "volume", factor: 14.7868 },
  tablespoons: { dimension: "volume", factor: 14.7868 },
  tbsp: { dimension: "volume", factor: 14.7868 },
  teaspoon: { dimension: "volume", factor: 4.92892 },
  teaspoons: { dimension: "volume", factor: 4.92892 },
  tsp: { dimension: "volume", factor: 4.92892 },
  pint: { dimension: "volume", factor: 473.176 },
  pints: { dimension: "volume", factor: 473.176 },
  pt: { dimension: "volume", factor: 473.176 },
  quart: { dimension: "volume", factor: 946.353 },
  quarts: { dimension: "volume", factor: 946.353 },
  qt: { dimension: "volume", factor: 946.353 },
};

const UNIT_PATTERN = Object.keys(UNIT_DEFINITIONS)
  .sort((left, right) => right.length - left.length)
  .map((unit) => unit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  .join("|");

function parseAmount(amount: string | number): number | null {
  if (typeof amount === "number") return amount;
  const mixed = amount.trim().match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const fraction = amount.trim().match(/^(\d+)\/(\d+)$/);
  if (fraction) return Number(fraction[1]) / Number(fraction[2]);
  const parsed = Number(amount);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatNumber(value: number): string {
  return Number(value.toFixed(1)).toString();
}

function formatCookingAmount(value: number): string {
  const whole = Math.floor(value);
  const fractions = [
    { numerator: 1, denominator: 8 },
    { numerator: 1, denominator: 4 },
    { numerator: 1, denominator: 3 },
    { numerator: 3, denominator: 8 },
    { numerator: 1, denominator: 2 },
    { numerator: 5, denominator: 8 },
    { numerator: 2, denominator: 3 },
    { numerator: 3, denominator: 4 },
    { numerator: 7, denominator: 8 },
  ];
  let closest = { numerator: 0, denominator: 1, difference: Infinity };

  for (const fraction of fractions) {
    const difference = Math.abs(
      value - whole - fraction.numerator / fraction.denominator,
    );
    if (difference < closest.difference) {
      closest = { ...fraction, difference };
    }
  }

  if (closest.difference > 0.02) return formatNumber(value);
  const numerator = whole * closest.denominator + closest.numerator;
  const gcd = (left: number, right: number): number =>
    right === 0 ? left : gcd(right, left % right);
  const divisor = gcd(numerator, closest.denominator);
  const simplifiedNumerator = numerator / divisor;
  const simplifiedDenominator = closest.denominator / divisor;

  if (simplifiedNumerator === simplifiedDenominator) return "1";
  if (simplifiedNumerator > simplifiedDenominator) {
    const remainder = simplifiedNumerator % simplifiedDenominator;
    const integer = Math.floor(simplifiedNumerator / simplifiedDenominator);
    return remainder === 0
      ? String(integer)
      : `${integer} ${remainder}/${simplifiedDenominator}`;
  }
  return `${simplifiedNumerator}/${simplifiedDenominator}`;
}

function formatConvertedAmount(amount: number, unit: string): string {
  return ["tsp", "tbsp", "cup"].includes(unit)
    ? formatCookingAmount(amount)
    : formatNumber(amount);
}

function normalizeUnit(unit: string): string {
  const normalized = unit.trim().toLowerCase().replace(/\.$/, "");
  if (normalized === "fluid ounce" || normalized === "fluid ounces")
    return "fl oz";
  return normalized;
}

function convertedAmount(
  amount: number,
  unit: string,
  system: MeasurementSystem,
): { amount: number; unit: string } | null {
  const definition = UNIT_DEFINITIONS[normalizeUnit(unit)];
  if (!definition) return null;

  const baseAmount = amount * definition.factor;
  if (definition.dimension === "mass") {
    if (system === "metric") {
      return baseAmount >= 1000
        ? { amount: baseAmount / 1000, unit: "kg" }
        : { amount: baseAmount, unit: "g" };
    }
    return baseAmount >= 453.592
      ? { amount: baseAmount / 453.592, unit: "lb" }
      : { amount: baseAmount / 28.3495, unit: "oz" };
  }

  if (system === "metric") {
    return baseAmount >= 1000
      ? { amount: baseAmount / 1000, unit: "l" }
      : { amount: baseAmount, unit: "ml" };
  }
  if (baseAmount >= 59.147) {
    return { amount: baseAmount / 236.588, unit: "cup" };
  }
  if (baseAmount >= 14.7868) {
    return { amount: baseAmount / 14.7868, unit: "tbsp" };
  }
  return { amount: baseAmount / 4.92892, unit: "tsp" };
}

export function formatMeasurement(
  amount: string | number,
  unit: string,
  system: MeasurementSystem,
): string {
  const parsed = parseAmount(amount);
  if (parsed === null || !unit.trim())
    return `${amount}${unit ? ` ${unit}` : ""}`;

  const converted = convertedAmount(parsed, unit, system);
  return converted
    ? `${formatConvertedAmount(converted.amount, converted.unit)} ${converted.unit}`
    : `${formatNumber(parsed)} ${unit}`;
}

export function formatMeasurementText(
  text: string,
  system: MeasurementSystem,
): string {
  const targetTemperature = system === "metric" ? "C" : "F";
  let formatted = text.replace(
    /(-?\d+(?:\.\d+)?)\s*°?\s*([CF])\b/gi,
    (match, rawValue: string, rawUnit: string) => {
      const value = Number(rawValue);
      const source = rawUnit.toUpperCase();
      if (source === targetTemperature)
        return `${formatNumber(value)}°${targetTemperature}`;
      const converted =
        source === "F" ? ((value - 32) * 5) / 9 : (value * 9) / 5 + 32;
      return `${formatNumber(converted)}°${targetTemperature}`;
    },
  );

  const amountPattern = new RegExp(
    `(\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d+(?:\\.\\d+)?)(\\s*)\\b(${UNIT_PATTERN})\\b`,
    "gi",
  );
  formatted = formatted.replace(
    amountPattern,
    (match, rawAmount: string, spacing: string, rawUnit: string) => {
      const converted = convertedAmount(
        Number(parseAmount(rawAmount)),
        rawUnit,
        system,
      );
      if (!converted) return match;
      return `${formatConvertedAmount(converted.amount, converted.unit)}${spacing || " "}${converted.unit}`;
    },
  );

  return formatted;
}
