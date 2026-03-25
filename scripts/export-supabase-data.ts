/**
 * Full export of all Supabase tables into local JSON files.
 * No filtering — everything in Supabase gets dumped locally.
 *
 * Usage:
 *   pnpm add -D @supabase/supabase-js   # install dependency first
 *   npx tsx scripts/export-supabase-data.ts
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */

import { createClient } from "@supabase/supabase-js"
import { writeFileSync, mkdirSync, readFileSync } from "fs"
import { join } from "path"

// Load .env.local manually (avoids dotenv dependency)
const envPath = join(process.cwd(), ".env.local")
const envContent = readFileSync(envPath, "utf-8")
for (const line of envContent.split("\n")) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith("#")) continue
  const eqIndex = trimmed.indexOf("=")
  if (eqIndex === -1) continue
  const key = trimmed.slice(0, eqIndex).trim()
  const value = trimmed.slice(eqIndex + 1).trim()
  process.env[key] = value
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Tables to export: name → output filename
const TABLES = [
  { table: "foods", file: "foods.json" },
  { table: "rda_values", file: "rda-values.json" },
  { table: "nutrient_metadata", file: "nutrient-metadata.json" },
]

async function exportTable(table: string): Promise<Record<string, unknown>[]> {
  console.log(`  Fetching ${table}...`)
  const { data, error } = await supabase.from(table).select("*")
  if (error) throw new Error(`Failed to fetch ${table}: ${error.message}`)
  return data || []
}

async function exportData() {
  const outDir = join(process.cwd(), "public", "data")
  mkdirSync(outDir, { recursive: true })

  console.log("Exporting all tables from Supabase (select *, no filters):\n")

  for (const { table, file } of TABLES) {
    const data = await exportTable(table)
    const outPath = join(outDir, file)
    writeFileSync(outPath, JSON.stringify(data, null, 2))
    console.log(`  ✓ ${table}: ${data.length} rows → public/data/${file}`)

    // Log column count for foods to verify completeness
    if (data.length > 0) {
      console.log(`    Columns: ${Object.keys(data[0]).length}`)
    }
    console.log()
  }

  // Generate foods-core.json: only code, name, and RDA nutrient columns
  // This is the lightweight file loaded by the main tracker page
  const rdaPath = join(outDir, "rda-values.json")
  const rda: { code: string }[] = JSON.parse(readFileSync(rdaPath, "utf-8"))
  const rdaCodes = new Set(rda.map((r) => r.code))
  const keepKeys = new Set(["code", "name", ...rdaCodes])

  const foodsFull: Record<string, unknown>[] = JSON.parse(
    readFileSync(join(outDir, "foods.json"), "utf-8")
  )
  const foodsCore = foodsFull.map((food) => {
    const slim: Record<string, unknown> = {}
    for (const key of Object.keys(food)) {
      if (keepKeys.has(key)) slim[key] = food[key]
    }
    return slim
  })

  const corePath = join(outDir, "foods-core.json")
  writeFileSync(corePath, JSON.stringify(foodsCore, null, 2))
  const coreSize = (Buffer.byteLength(JSON.stringify(foodsCore, null, 2)) / 1024).toFixed(0)
  const fullSize = (Buffer.byteLength(JSON.stringify(foodsFull, null, 2)) / 1024).toFixed(0)
  console.log(`  ✓ foods-core.json: ${foodsCore.length} rows, ${Object.keys(foodsCore[0]).length} columns (${coreSize}KB)`)
  console.log(`    vs foods.json: ${Object.keys(foodsFull[0]).length} columns (${fullSize}KB)`)
  console.log()

  console.log("Done. All Supabase data exported to public/data/")
  console.log("  foods.json       — complete data (explore page)")
  console.log("  foods-core.json  — RDA columns only (main tracker)")
}

exportData().catch((err) => {
  console.error("Export failed:", err)
  process.exit(1)
})
