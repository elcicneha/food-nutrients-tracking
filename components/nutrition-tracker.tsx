"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { NutrientCard } from "./nutrient-card"
import { FoodSearch } from "./food-search"
import { supabase } from "@/lib/supabase"

import type { Food, Nutrient } from "@/lib/supabase"

type SelectedFood = Food & { quantity: number }

// Default user weight for per_kg RDA calculations (will be user-configurable later)
const USER_WEIGHT_KG = 50

export function NutritionTracker() {
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([])
  const [foods, setFoods] = useState<Food[]>([])
  const [nutrients, setNutrients] = useState<Nutrient[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch foods and nutrients from Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        // First, fetch all nutrients from rda_values
        const { data: nutrientsData, error: nutrientsError } = await supabase
          .from('rda_values')
          .select('code, nutrient_name, value_type, rda_value, unit')
          .order('nutrient_name')

        if (nutrientsError) throw nutrientsError

        // Build column list: code, name, plus all nutrient codes
        const nutrientColumns = nutrientsData?.map(n => n.code).join(', ') || ''
        const selectColumns = `code, name${nutrientColumns ? ', ' + nutrientColumns : ''}`

        // Fetch foods with only the columns we need
        const { data: foodsData, error: foodsError } = await supabase
          .from('foods')
          .select(selectColumns)

        if (foodsError) throw foodsError

        setFoods((foodsData as unknown as Food[]) || [])
        setNutrients(nutrientsData || [])
      } catch (error: unknown) {
        const supabaseError = error as { message?: string; code?: string; details?: string }
        console.error('Error fetching data:', supabaseError.message || supabaseError.code || JSON.stringify(error))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const addFood = (food: Food) => {
    setSelectedFoods([...selectedFoods, { ...food, quantity: 100 }])
  }

  const removeFood = (code: string) => {
    setSelectedFoods(selectedFoods.filter((f) => f.code !== code))
  }

  const updateQuantity = (code: string, quantity: number) => {
    setSelectedFoods(selectedFoods.map((f) => (f.code === code ? { ...f, quantity: Math.max(0, quantity) } : f)))
  }

  const totalNutrients: Record<string, number> = {}
  nutrients.forEach((nutrient) => {
    totalNutrients[nutrient.code] = 0
  })

  // Calculate totals from selected foods
  selectedFoods.forEach((food) => {
    nutrients.forEach((nutrient) => {
      const code = nutrient.code
      // Access the nutrient value from the food's column
      if (food[code] !== undefined && food[code] !== null) {
        const valuePerHundred = food[code]
        const proportionalValue = (valuePerHundred * food.quantity) / 100
        totalNutrients[code] = (totalNutrients[code] || 0) + proportionalValue
      }
    })
  })

  // Filter nutrients to only show those with valid RDA values
  const validNutrients = nutrients.filter(n => n.rda_value !== null && n.rda_value > 0)

  // Calculate effective RDA target based on value_type
  const getEffectiveRda = (nutrient: Nutrient): number => {
    if (nutrient.value_type === 'per_kg') {
      return (nutrient.rda_value || 0) * USER_WEIGHT_KG
    }
    return nutrient.rda_value || 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Loading nutrition data...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Desktop/Tablet Layout (Search left, Cards right) */}
        <div className="hidden sm:grid sm:grid-cols-1 md:grid-cols-[minmax(320px,1fr)_1fr] lg:grid-cols-[minmax(320px,1fr)_2fr] gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Search Bar */}
            <FoodSearch
              foods={foods}
              selectedFoodCodes={selectedFoods.map((f) => f.code)}
              onSelectFood={addFood}
            />

            {/* Selected Foods List */}
            <div>
              <label className="text-sm font-semibold text-foreground/70 mb-3 block">
                Selected Foods ({selectedFoods.length})
              </label>
              <Card className="bg-card border-border min-h-80">
              <CardContent className="space-y-3">
                {selectedFoods.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">No foods selected yet</p>
                ) : (
                  selectedFoods.map((food) => (
                    <div
                      key={food.code}
                      className="flex items-center justify-between gap-2 bg-background rounded-md p-3 hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-foreground text-sm font-medium flex-1 min-w-0">{food.name}</span>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={food.quantity}
                          onChange={(e) => updateQuantity(food.code, Number.parseInt(e.target.value) || 0)}
                          className="w-14 h-8 px-2 py-1 text-sm text-right bg-muted border-border"
                          min="0"
                        />
                        <span className="text-muted-foreground text-sm whitespace-nowrap">g</span>
                      </div>
                      <button
                        onClick={() => removeFood(food.code)}
                        className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                        aria-label={`Remove ${food.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* RIGHT COLUMN - Responsive Card Grid */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-foreground/70">Daily Nutrients</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "1rem",
              }}
            >
              {validNutrients.map((nutrient) => (
                <NutrientCard
                  key={nutrient.code}
                  name={nutrient.nutrient_name || nutrient.code}
                  current={totalNutrients[nutrient.code] || 0}
                  target={getEffectiveRda(nutrient)}
                  unit={nutrient.unit || ''}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Portrait Layout (Search top, Cards bottom) */}
        <div className="sm:hidden space-y-6">
          {/* Search Bar */}
          <FoodSearch
            foods={foods}
            selectedFoodCodes={selectedFoods.map((f) => f.code)}
            onSelectFood={addFood}
          />

          {/* Selected Foods List */}
          <div>
            <label className="text-sm font-semibold text-foreground/70 mb-3 block">
              Selected Foods ({selectedFoods.length})
            </label>
            <Card className="p-4 bg-card border-border min-h-80 space-y-2">
              {selectedFoods.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No foods selected yet</p>
              ) : (
                selectedFoods.map((food) => (
                  <div
                    key={food.code}
                    className="flex items-center justify-between gap-2 bg-background rounded-md p-3 hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-foreground text-sm font-medium flex-1 min-w-0">{food.name}</span>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={food.quantity}
                        onChange={(e) => updateQuantity(food.code, Number.parseInt(e.target.value) || 0)}
                        className="w-14 h-8 px-2 py-1 text-sm text-right bg-muted border-border"
                        min="0"
                      />
                      <span className="text-muted-foreground text-sm whitespace-nowrap">g</span>
                    </div>
                    <button
                      onClick={() => removeFood(food.code)}
                      className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                      aria-label={`Remove ${food.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </Card>
          </div>

          {/* Nutrients Grid - Mobile */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-foreground/70">Daily Nutrients</h2>
            <div className="grid grid-cols-1 gap-4">
              {validNutrients.map((nutrient) => (
                <NutrientCard
                  key={nutrient.code}
                  name={nutrient.nutrient_name || nutrient.code}
                  current={totalNutrients[nutrient.code] || 0}
                  target={getEffectiveRda(nutrient)}
                  unit={nutrient.unit || ''}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
