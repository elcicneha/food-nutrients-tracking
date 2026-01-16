import { NutritionTracker } from "@/components/nutrition-tracker"

export const metadata = {
  title: "Nutrition Tracker",
  description: "Track your daily nutrition intake",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <NutritionTracker />
    </main>
  )
}
