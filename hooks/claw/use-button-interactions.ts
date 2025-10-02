"use client"

import { useState, useCallback } from "react"

export function useButtonInteractions() {
  const [pressedButtons, setPressedButtons] = useState<Set<string>>(new Set())
  const [heldButtons, setHeldButtons] = useState<Set<string>>(new Set())
  const [holdIntervals, setHoldIntervals] = useState<Map<string, NodeJS.Timeout>>(new Map())

  const handleButtonPress = useCallback((buttonId: string) => {
    setPressedButtons((prev) => new Set(prev).add(buttonId))
    setTimeout(() => {
      setPressedButtons((prev) => {
        const newSet = new Set(prev)
        newSet.delete(buttonId)
        return newSet
      })
    }, 150)
  }, [])

  const startHolding = useCallback(
    (buttonId: string, action: () => void) => {
      if (heldButtons?.has(buttonId)) return

      setHeldButtons((prev) => new Set(prev).add(buttonId))
      action()

      const interval = setInterval(() => {
        action()
      }, 100)

      setHoldIntervals((prev) => new Map(prev).set(buttonId, interval))
    },
    [heldButtons],
  )

  const stopHolding = useCallback(
    (buttonId: string) => {
      setHeldButtons((prev) => {
        const newSet = new Set(prev)
        newSet.delete(buttonId)
        return newSet
      })

      const interval = holdIntervals?.get(buttonId)
      if (interval) {
        clearInterval(interval)
        setHoldIntervals((prev) => {
          const newMap = new Map(prev)
          newMap.delete(buttonId)
          return newMap
        })
      }
    },
    [holdIntervals],
  )

  return {
    pressedButtons,
    heldButtons,
    handleButtonPress,
    startHolding,
    stopHolding,
    holdIntervals,
  }
}
