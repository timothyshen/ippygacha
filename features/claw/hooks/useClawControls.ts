import { useCallback, useMemo } from "react"

interface UseClawControlsProps {
  clawX: number
  clawY: number
  gameActive: boolean
  isGrabbing: boolean
  setClawX: (x: number) => void
  setClawY: (y: number) => void
  setIsGrabbing: (grabbing: boolean) => void
  grabPrize: () => void
}

export const useClawControls = ({
  clawX,
  clawY,
  gameActive,
  isGrabbing,
  setClawX,
  setClawY,
  setIsGrabbing,
  grabPrize
}: UseClawControlsProps) => {
  
  // Memoized control functions with minimal dependencies
  const controls = useMemo(() => ({
    moveLeft: () => {
      if (!gameActive || isGrabbing) return
      setClawX(Math.max(50, clawX - 15))
    },
    
    moveRight: () => {
      if (!gameActive || isGrabbing) return  
      setClawX(Math.min(550, clawX + 15))
    },
    
    moveUp: () => {
      if (!gameActive || isGrabbing) return
      setClawY(Math.max(30, clawY - 15))
    },
    
    moveDown: () => {
      if (!gameActive || isGrabbing) return
      setClawY(Math.min(350, clawY + 15))
    },
    
    grab: () => {
      if (!gameActive || isGrabbing) return
      setIsGrabbing(true)
      grabPrize()
    }
  }), [gameActive, isGrabbing, clawX, clawY, setClawX, setClawY, setIsGrabbing, grabPrize])

  // Stable keyboard handlers
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key.toLowerCase()) {
      case 'arrowleft':
      case 'a':
        event.preventDefault()
        controls.moveLeft()
        break
      case 'arrowright':
      case 'd':
        event.preventDefault()
        controls.moveRight()
        break
      case 'arrowup':
      case 'w':
        event.preventDefault()
        controls.moveUp()
        break
      case 'arrowdown':
      case 's':
        event.preventDefault()
        controls.moveDown()
        break
      case ' ':
      case 'enter':
        event.preventDefault()
        controls.grab()
        break
    }
  }, [controls])

  return {
    controls,
    handleKeyDown
  }
}