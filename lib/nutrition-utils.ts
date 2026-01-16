import type { Nutrient } from "./supabase"

type FoodWithQuantity = {
  quantity: number
  [key: string]: number | string | null | undefined
}

/**
 * Calculate total nutrient values from selected foods
 * Applies unit conversion if conversionMap is provided
 *
 * @param selectedFoods - Array of foods with quantities
 * @param nutrients - Array of nutrient definitions from rda_values
 * @param conversionMap - Optional map of nutrient code to conversion factor
 */
export function calculateNutrientTotals(
  selectedFoods: FoodWithQuantity[],
  nutrients: Nutrient[],
  conversionMap: Record<string, number> = {}
): Record<string, number> {
  const totals: Record<string, number> = {}

  // Initialize all nutrients to 0
  nutrients.forEach((nutrient) => {
    totals[nutrient.code] = 0
  })

  // Sum up contributions from each food
  selectedFoods.forEach((food) => {
    nutrients.forEach((nutrient) => {
      const code = nutrient.code
      const value = food[code]
      if (value !== undefined && value !== null && typeof value === "number") {
        // Calculate proportional value (per 100g basis)
        let proportionalValue = (value * food.quantity) / 100

        // Apply unit conversion if available
        const conversionFactor = conversionMap[code] ?? 1
        proportionalValue *= conversionFactor

        totals[code] = (totals[code] || 0) + proportionalValue
      }
    })
  })

  return totals
}

/**
 * Calculate effective RDA target based on value_type
 * For per_kg nutrients, multiplies by user weight
 */
export function getEffectiveRda(nutrient: Nutrient, userWeightKg: number): number {
  if (nutrient.value_type === "per_kg") {
    return (nutrient.rda_value || 0) * userWeightKg
  }
  return nutrient.rda_value || 0
}
