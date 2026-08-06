export interface NutritionMacros {
  protein?: string | number;
  carbs?: string | number;
  fat?: string | number;
  fiber?: string | number;
}

export function getMacroSummary(macros?: NutritionMacros | null): string {
  if (!macros) return "";

  const parts = [
    macros.protein != null ? `P ${String(macros.protein)}` : null,
    macros.carbs != null ? `C ${String(macros.carbs)}` : null,
    macros.fat != null ? `F ${String(macros.fat)}` : null,
  ].filter(Boolean) as string[];

  return parts.join(" • ");
}

export function getMacroDeltaSummary(macros?: NutritionMacros | null): string {
  if (!macros) return "";

  const parts = [
    macros.protein != null ? `P ${String(macros.protein)}` : null,
    macros.carbs != null ? `C ${String(macros.carbs)}` : null,
    macros.fat != null ? `F ${String(macros.fat)}` : null,
  ].filter(Boolean) as string[];

  return parts.join(" • ");
}
