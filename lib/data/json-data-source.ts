// How to swap backends later
// Create a new file like lib/data/api-data-source.ts implementing the DataSource interface, 
// then change one line in lib/data/index.ts:
// export { apiDataSource as dataSource } from "./api-data-source"

import type { Food, Nutrient, NutrientMetadata } from "@/lib/types"
import type { DataSource, NutritionData } from "./data-source"

class JsonDataSource implements DataSource {
  private cache: NutritionData | null = null

  async fetchNutritionData(): Promise<NutritionData> {
    if (this.cache) return this.cache

    const [foods, nutrients, nutrientMetadata] = await Promise.all([
      fetch("/data/foods-core.json").then((r) => r.json()) as Promise<Food[]>,
      fetch("/data/rda-values.json").then((r) => r.json()) as Promise<Nutrient[]>,
      fetch("/data/nutrient-metadata.json").then((r) => r.json()) as Promise<NutrientMetadata[]>,
    ])

    this.cache = { foods, nutrients, nutrientMetadata }
    return this.cache
  }
}

export const jsonDataSource = new JsonDataSource()
