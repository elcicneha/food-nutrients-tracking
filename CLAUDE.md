# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Run ESLint
npm run start    # Start production server
```

## Architecture Overview

This is a Next.js 16 nutrition tracking application that uses Supabase as the backend database. Users can search and select foods to track their daily nutrient intake against RDA (Recommended Daily Allowance) values.

### Tech Stack
- **Framework**: Next.js 16 with App Router
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS v4 with CSS custom properties for theming
- **UI Components**: Radix UI primitives with custom shadcn/ui-style wrappers in `components/ui/`

### Key Files and Data Flow

**Main Application Flow:**
- `app/page.tsx` - Entry point, renders `NutritionTracker`
- `components/nutrition-tracker.tsx` - Main component handling food search, selection, and nutrient calculation
- `components/nutrient-card.tsx` - Displays individual nutrient progress with color-coded bars (red <50%, yellow 50-90%, green ≥90%)

**Database Integration:**
- `lib/supabase.ts` - Supabase client initialization and TypeScript types for `Food`, `Nutrient`, and `NutrientMetadata`
- The app queries three Supabase tables:
  - `foods` - Food items with nutrient values as dynamic columns (nutrient codes like `retol`, `thia`, `protcnt`, etc.)
  - `rda_values` - RDA targets with columns: `code`, `nutrient_name`, `value_type`, `rda_value`, `unit`
  - `nutrient_metadata` - Category and unit information with columns: `id`, `category`, `code`, `name`, `unit`

**Data Fetching:**
- `hooks/use-nutrition-data.ts` - Custom hook that fetches all data from Supabase in parallel, builds conversion and category maps

**Nutrient Calculation:**
- `lib/nutrition-utils.ts` - Core calculation logic:
  - `calculateNutrientTotals()` - Sums nutrient values from selected foods with unit conversion
  - `getEffectiveRda()` - Handles fixed and per_kg RDA values
- `lib/unit-conversion.ts` - Unit conversion utilities (g↔mg↔mcg, kJ↔kcal)

### Business Logic Notes

- **Amino acids** are calculated differently: values are per 100g of protein content, not per 100g of food weight
- **RDA value types**: `fixed` (absolute value) or `per_kg` (multiplied by user weight, default 50 kg)
- **Nutrient progress colors**: red (<50% RDA), yellow (50-90%), green (≥90%)

### Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

### Styling Conventions

- Uses Tailwind CSS v4 with `@import "tailwindcss"` syntax
- Theme colors defined as CSS custom properties in `app/globals.css` using OKLCH color space
- Dark mode support via `.dark` class
- Use the `cn()` utility from `lib/utils.ts` for conditional class merging

### Path Aliases

`@/*` maps to the project root (configured in tsconfig.json)

## UI Component Guidelines

Use shadcn/ui components wherever applicable. The project already has Radix UI primitives installed. When adding new UI elements:
- Check if a shadcn/ui component exists for the use case
- Add new shadcn/ui components to `components/ui/` following the existing pattern
- Use `npx shadcn@latest add <component>` to install new components

## Code Quality Guidelines

Follow these principles and explain your decisions as you work:

### Separation of Concerns
- **Hooks** (`hooks/`) for reusable logic (data fetching, keyboard navigation, form state)
- **Components** (`components/`) for UI rendering only
- **Utils** (`lib/`) for pure functions (calculations, conversions, formatting)
- Keep components under 150-200 lines; split larger ones into focused pieces

### Architecture Patterns
- Extract repeated patterns into reusable hooks (e.g., `useRovingTabindex` for keyboard nav)
- Components should receive data and callbacks via props, not fetch their own data
- Page components orchestrate; leaf components render

### Performance
- Use `useMemo` for expensive calculations that depend on props/state
- Use `useCallback` for handlers passed to child components
- Avoid creating new objects/arrays in render (move to useMemo or outside component)

### Accessibility
- Follow WAI-ARIA guidelines (see https://www.w3.org/WAI/ARIA/apg/patterns/)
- Use semantic HTML and ARIA roles (`role="listbox"`, `role="option"`, etc.)
- Ensure full keyboard navigation for all interactive elements

### When Making Changes
- Proactively refactor if a file is getting too large or mixing concerns
- Explain architectural decisions and trade-offs
- Suggest better patterns when you see opportunities
