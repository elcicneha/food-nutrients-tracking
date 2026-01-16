// Unit conversion constants and utilities

/**
 * Normalize unit string for consistent lookup
 * - Converts to lowercase
 * - Trims whitespace
 * - Converts μg to mcg (equivalent units)
 */
function normalizeUnit(unit: string): string {
  return unit.toLowerCase().trim().replace("μg", "mcg")
}

// Conversion factor to multiply source value to get target value
// Key format: "sourceUnit_targetUnit"
const UNIT_CONVERSION_FACTORS: Record<string, number> = {
  // Mass conversions (larger to smaller)
  g_mg: 1000,
  mg_mcg: 1000,
  g_mcg: 1000000,

  // Mass conversions (smaller to larger)
  mg_g: 0.001,
  mcg_mg: 0.001,
  mcg_g: 0.000001,

  // Energy conversion
  kj_kcal: 0.239006, // 1 KJ = 0.239006 KCal
  kcal_kj: 4.184, // 1 KCal = 4.184 KJ
}

export type NutrientUnitInfo = {
  code: string
  unit: string
}

/**
 * Get conversion factor to convert from source unit to target unit
 * Returns 1 if same unit or if conversion not found (with warning)
 */
export function getConversionFactor(
  sourceUnit: string,
  targetUnit: string
): number {
  const source = normalizeUnit(sourceUnit)
  const target = normalizeUnit(targetUnit)

  // Same unit - no conversion needed
  if (source === target) {
    return 1
  }

  const key = `${source}_${target}`
  const factor = UNIT_CONVERSION_FACTORS[key]

  if (factor === undefined) {
    console.warn(
      `No conversion factor found for ${sourceUnit} -> ${targetUnit}, defaulting to 1`
    )
    return 1
  }

  return factor
}

/**
 * Build a lookup map of conversion factors for all nutrients
 * This is computed once and reused for efficiency
 *
 * @param nutrientMetadata - From nutrient_metadata table (source units from foods table)
 * @param rdaValues - From rda_values table (target units for display)
 * @returns Record mapping nutrient code to conversion factor
 */
export function buildConversionMap(
  nutrientMetadata: NutrientUnitInfo[],
  rdaValues: { code: string; unit: string | null }[]
): Record<string, number> {
  const conversionMap: Record<string, number> = {}

  // Create lookup for source units from metadata
  const sourceUnitMap: Record<string, string> = {}
  nutrientMetadata.forEach((meta) => {
    if (meta.code && meta.unit) {
      sourceUnitMap[meta.code] = meta.unit
    }
  })

  // Build conversion factor for each nutrient
  rdaValues.forEach((rda) => {
    const code = rda.code
    const sourceUnit = sourceUnitMap[code]
    const targetUnit = rda.unit

    if (sourceUnit && targetUnit) {
      conversionMap[code] = getConversionFactor(sourceUnit, targetUnit)
    } else {
      conversionMap[code] = 1 // Default to no conversion
    }
  })

  return conversionMap
}
