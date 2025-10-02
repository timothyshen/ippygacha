"use client"

import { useState, useEffect, useCallback } from "react"

interface UseKeyboardControlsProps {
  gameActive: boolean
  isGrabbing: boolean
  moveClawLeft: () => void
  moveClawRight: () => void
  handleGrab: () => void
}

export function useKeyboardControls({
  gameActive,
  isGrabbing,
  moveClawLeft,
  moveClawRight,
  handleGrab,
}: UseKeyboardControlsProps) {
  const [heldKeys, setHeldKeys] = useState<Set<string>>(new Set())
  const [keyHoldIntervals, setKeyHoldIntervals] = useState<Map<string, NodeJS.Timeout>>(new Map())

  const startKeyHolding = useCallback(
    (key: string, action: () => void) => {
      if (heldKeys?.has(key)) return

      setHeldKeys((prev) => new Set(prev).add(key))
      action()

      const interval = setInterval(() => {
        action()
      }, 100)

      setKeyHoldIntervals((prev) => new Map(prev).set(key, interval))
    },
    [heldKeys],
  )

  const stopKeyHolding = useCallback(
    (key: string) => {
      setHeldKeys((prev) => {
        const newSet = new Set(prev)
        newSet.delete(key)
        return newSet
      })

      const interval = keyHoldIntervals?.get(key)
      if (interval) {
        clearInterval(interval)
        setKeyHoldIntervals((prev) => {
          const newMap = new Map(prev)
          newMap.delete(key)
          return newMap
        })
      }
    },
    [keyHoldIntervals],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!gameActive) return

      const key = event.key.toLowerCase()

      if (["a", "d", " ", "enter", "arrowleft", "arrowright"].includes(key)) {
        event.preventDefault()
      }

      if (heldKeys?.has(key)) return

      let action: (() => void) | null = null

      switch (key) {
        case "a":
        case "arrowleft":
          action = moveClawLeft
          break
        case "d":
        case "arrowright":
          action = moveClawRight
          break
        case " ":
        case "enter":
          if (!isGrabbing) {
            handleGrab()
          }
          return
      }

      if (action) {
        startKeyHolding(key, action)
      }
    },
    [gameActive, isGrabbing, moveClawLeft, moveClawRight, handleGrab, heldKeys, startKeyHolding],
  )

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      stopKeyHolding(key)
    },
    [stopKeyHolding],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    const handleBlur = () => {
      heldKeys?.forEach((key) => stopKeyHolding(key))
    }

    window.addEventListener("blur", handleBlur)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      window.removeEventListener("blur", handleBlur)
    }
  }, [handleKeyDown, handleKeyUp, heldKeys, stopKeyHolding])

  return {
    heldKeys,
    keyHoldIntervals,
  }
}
