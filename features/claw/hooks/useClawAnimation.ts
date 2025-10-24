import { useState, useEffect } from "react"

interface UseClawAnimationProps {
  clawX: number
  clawY: number  
  isGrabbing: boolean
  grabPhase: string
  prizeWillFall: boolean
}

export const useClawAnimation = ({
  clawX,
  clawY,
  isGrabbing,
  grabPhase, 
  prizeWillFall
}: UseClawAnimationProps) => {
  const [clawShaking, setClawShaking] = useState(false)
  const [clawOpenness, setClawOpenness] = useState(0)
  
  // Animation logic for claw shaking during grab attempts
  useEffect(() => {
    if (grabPhase === "shake" && prizeWillFall) {
      setClawShaking(true)
      const shakeTimer = setTimeout(() => {
        setClawShaking(false)
      }, 1500)
      return () => clearTimeout(shakeTimer)
    }
  }, [grabPhase, prizeWillFall])

  // Animation logic for claw openness
  useEffect(() => {
    if (isGrabbing || grabPhase === "grab" || grabPhase === "lift") {
      setClawOpenness(0.3) // Partially closed when grabbing
    } else {
      setClawOpenness(1) // Open when not grabbing
    }
  }, [isGrabbing, grabPhase])

  // Calculate claw tip position for visual effects
  const clawTipX = clawX
  const clawTipY = clawY + 35 // CLAW_TIP_Y_OFFSET

  return {
    clawShaking,
    clawOpenness,
    clawTipX,
    clawTipY
  }
}
