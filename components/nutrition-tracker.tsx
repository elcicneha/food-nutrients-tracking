"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { NutrientCard } from "./nutrient-card"

const mockFoods = [
  { id: 1, name: "Banana", nutrients: { "Vitamin C": 8.7, Potassium: 358, "Vitamin B6": 0.4 } },
  { id: 2, name: "Orange", nutrients: { "Vitamin C": 53.2, Fiber: 2.4, Folate: 30 } },
  { id: 3, name: "Chicken Breast", nutrients: { Protein: 31, "Vitamin B12": 0.3, Niacin: 10.3 } },
  { id: 4, name: "Spinach", nutrients: { Iron: 2.7, "Vitamin K": 483, Folate: 194 } },
  { id: 5, name: "Salmon", nutrients: { "Omega-3": 2.3, "Vitamin D": 570, Selenium: 36.5 } },
  { id: 6, name: "Almonds", nutrients: { "Vitamin E": 25.6, Magnesium: 270, Calcium: 264 } },
]

const nutrients = [
  { id: "vitamin-c", name: "Vitamin C", unit: "mg", rda: 90, icon: "🍊" },
  { id: "protein", name: "Protein", unit: "g", rda: 50, icon: "🍗" },
  { id: "calcium", name: "Calcium", unit: "mg", rda: 1000, icon: "🥛" },
  { id: "iron", name: "Iron", unit: "mg", rda: 18, icon: "🥬" },
  { id: "vitamin-d", name: "Vitamin D", unit: "IU", rda: 600, icon: "☀️" },
  { id: "potassium", name: "Potassium", unit: "mg", rda: 3500, icon: "🍌" },
  { id: "fiber", name: "Fiber", unit: "g", rda: 25, icon: "🌾" },
  { id: "vitamin-b12", name: "Vitamin B12", unit: "mcg", rda: 2.4, icon: "🐟" },
  { id: "magnesium", name: "Magnesium", unit: "mg", rda: 400, icon: "🥜" },
]

const nutrientValues: Record<string, Record<string, number>> = {
  "Vitamin C": { Banana: 8.7, Orange: 53.2, Spinach: 8.4, Kiwi: 92.7 },
  Protein: { "Chicken Breast": 31, Salmon: 25, Almonds: 21, Egg: 6 },
  Calcium: { Milk: 300, Yogurt: 200, Almonds: 264, Spinach: 99 },
  Iron: { Spinach: 2.7, Salmon: 0.8, Almonds: 3.7, Lentils: 6.5 },
  "Vitamin D": { Salmon: 570, Egg: 87, Mushrooms: 114, Milk: 65 },
  Potassium: { Banana: 358, Spinach: 558, Salmon: 363, Avocado: 485 },
  Fiber: { Orange: 2.4, Almonds: 3.5, Lentils: 7.9, Banana: 2.6 },
  "Vitamin B12": { "Chicken Breast": 0.3, Salmon: 3.2, Milk: 0.5, Egg: 0.6 },
  Magnesium: { Almonds: 270, Spinach: 79, "Pumpkin Seeds": 262, Salmon: 27 },
}

type SelectedFood = (typeof mockFoods)[0] & { quantity: number }

export function NutritionTracker() {
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFoods = mockFoods.filter(
    (food) =>
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) && !selectedFoods.find((f) => f.id === food.id),
  )

  const addFood = (food: (typeof mockFoods)[0]) => {
    setSelectedFoods([...selectedFoods, { ...food, quantity: 100 }])
    setSearchQuery("")
  }

  const removeFood = (id: number) => {
    setSelectedFoods(selectedFoods.filter((f) => f.id !== id))
  }

  const updateQuantity = (id: number, quantity: number) => {
    setSelectedFoods(selectedFoods.map((f) => (f.id === id ? { ...f, quantity: Math.max(0, quantity) } : f)))
  }

  const totalNutrients: Record<string, number> = {}
  nutrients.forEach((nutrient) => {
    totalNutrients[nutrient.name] = 0
  })

  selectedFoods.forEach((food) => {
    nutrients.forEach((nutrient) => {
      const key = nutrient.name
      const foodName = food.name
      if (nutrientValues[key] && nutrientValues[key][foodName]) {
        const valuePerHundred = nutrientValues[key][foodName]
        const proportionalValue = (valuePerHundred * food.quantity) / 100
        totalNutrients[key] = (totalNutrients[key] || 0) + proportionalValue
      }
    })
  })

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Desktop/Tablet Layout (Search left, Cards right) */}
        <div className="hidden sm:grid sm:grid-cols-1 md:grid-cols-[minmax(320px,1fr)_1fr] lg:grid-cols-[minmax(320px,1fr)_2fr] gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Search Bar */}
            <div>
              <label className="text-sm font-semibold text-foreground/70 mb-2 block">Add Foods</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search foods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-card border-border"
                />
              </div>

              {/* Dropdown Results */}
              {searchQuery && filteredFoods.length > 0 && (
                <div className="absolute top-14 left-0 right-0 bg-card border border-border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {filteredFoods.map((food) => (
                    <button
                      key={food.id}
                      onClick={() => addFood(food)}
                      className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-foreground text-sm"
                    >
                      {food.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

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
                      key={food.id}
                      className="flex items-center justify-between gap-2 bg-background rounded-md p-3 hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-foreground text-sm font-medium flex-1 min-w-0">{food.name}</span>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={food.quantity}
                          onChange={(e) => updateQuantity(food.id, Number.parseInt(e.target.value) || 0)}
                          className="w-14 h-8 px-2 py-1 text-sm text-right bg-muted border-border"
                          min="0"
                        />
                        <span className="text-muted-foreground text-sm whitespace-nowrap">g</span>
                      </div>
                      <button
                        onClick={() => removeFood(food.id)}
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
              {nutrients.map((nutrient) => (
                <NutrientCard
                  key={nutrient.id}
                  name={nutrient.name}
                  current={totalNutrients[nutrient.name] || 0}
                  target={nutrient.rda}
                  unit={nutrient.unit}
                  icon={nutrient.icon}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Portrait Layout (Search top, Cards bottom) */}
        <div className="sm:hidden space-y-6">
          {/* Search Bar */}
          <div>
            <label className="text-sm font-semibold text-foreground/70 mb-2 block">Add Foods</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search foods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-card border-border"
              />
            </div>

            {/* Dropdown Results */}
            {searchQuery && filteredFoods.length > 0 && (
              <div className="absolute top-14 left-0 right-0 bg-card border border-border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {filteredFoods.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => addFood(food)}
                    className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-foreground text-sm"
                  >
                    {food.name}
                  </button>
                ))}
              </div>
            )}
          </div>

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
                    key={food.id}
                    className="flex items-center justify-between gap-2 bg-background rounded-md p-3 hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-foreground text-sm font-medium flex-1 min-w-0">{food.name}</span>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={food.quantity}
                        onChange={(e) => updateQuantity(food.id, Number.parseInt(e.target.value) || 0)}
                        className="w-14 h-8 px-2 py-1 text-sm text-right bg-muted border-border"
                        min="0"
                      />
                      <span className="text-muted-foreground text-sm whitespace-nowrap">g</span>
                    </div>
                    <button
                      onClick={() => removeFood(food.id)}
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
              {nutrients.map((nutrient) => (
                <NutrientCard
                  key={nutrient.id}
                  name={nutrient.name}
                  current={totalNutrients[nutrient.name] || 0}
                  target={nutrient.rda}
                  unit={nutrient.unit}
                  icon={nutrient.icon}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
