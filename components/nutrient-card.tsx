"use client"

import { Card } from "@/components/ui/card"

interface NutrientCardProps {
  name: string
  current: number
  target: number
  unit: string
  icon?: string
}

export function NutrientCard({ name, current, target, unit, icon }: NutrientCardProps) {
  const percentage = Math.round((current / target) * 100)

  // Color coding based on percentage
  let barColor = "bg-red-500" // < 50%
  if (percentage >= 50 && percentage < 90) {
    barColor = "bg-yellow-500" // 50-90%
  } else if (percentage >= 90) {
    barColor = "bg-green-500" // 90%+
  }

  return (
    <Card className="p-4 bg-card border-border hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Header with icon and name */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {icon && <span className="text-xl">{icon}</span>}
            <div>
              <h3 className="font-semibold text-foreground text-sm leading-tight">{name}</h3>
            </div>
          </div>
          <span className="text-lg font-bold text-foreground">{percentage}%</span>
        </div>

        {/* Current and Target */}
        <div className="text-sm">
          <p className="text-foreground font-medium">
            {current.toFixed(1)} {unit}
            <span className="text-muted-foreground font-normal ml-1">
              / {target} {unit}
            </span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${barColor} transition-all duration-300`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </Card>
  )
}
