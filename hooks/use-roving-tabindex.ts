"use client"

import { useState, useEffect, useRef, useCallback } from "react"

type UseRovingTabindexOptions = {
  itemCount: number
  onDelete?: (index: number) => void
}

/**
 * WAI-ARIA compliant roving tabindex hook for keyboard navigation.
 *
 * Supports:
 * - Arrow Down/Right: Next item (wraps to first)
 * - Arrow Up/Left: Previous item (wraps to last)
 * - Home: First item
 * - End: Last item
 * - Delete/Backspace: Triggers onDelete callback
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/listbox/
 */
export function useRovingTabindex({ itemCount, onDelete }: UseRovingTabindexOptions) {
  const [activeIndex, setActiveIndex] = useState(0)
  const itemRefs = useRef<(HTMLElement | null)[]>([])

  // Reset activeIndex when items change
  useEffect(() => {
    if (itemCount === 0) {
      setActiveIndex(0)
    } else if (activeIndex >= itemCount) {
      setActiveIndex(itemCount - 1)
    }
  }, [itemCount, activeIndex])

  const focusItem = useCallback((index: number) => {
    setActiveIndex(index)
    itemRefs.current[index]?.focus()
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    // Skip if focused on an input (let input handle its own keys)
    if (e.target instanceof HTMLInputElement) return

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault()
        focusItem(index < itemCount - 1 ? index + 1 : 0) // Wrap to first
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault()
        focusItem(index > 0 ? index - 1 : itemCount - 1) // Wrap to last
        break
      case 'Home':
        e.preventDefault()
        focusItem(0)
        break
      case 'End':
        e.preventDefault()
        focusItem(itemCount - 1)
        break
      case 'Delete':
      case 'Backspace':
        if (onDelete) {
          e.preventDefault()
          onDelete(index)
        }
        break
    }
  }, [itemCount, focusItem, onDelete])

  const getItemProps = useCallback((index: number) => ({
    ref: (el: HTMLElement | null) => { itemRefs.current[index] = el },
    tabIndex: index === activeIndex ? 0 : -1,
    onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, index),
  }), [activeIndex, handleKeyDown])

  // Focus the currently active item (useful for external focus redirect)
  const focusActiveItem = useCallback(() => {
    itemRefs.current[activeIndex]?.focus()
  }, [activeIndex])

  return { activeIndex, getItemProps, focusActiveItem }
}
