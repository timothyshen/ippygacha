import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { PrizeBall } from "./PrizeBall"
import { CableSystem } from "./CableSystem"
import { ClawMechanism } from "./ClawMechanism"
import type { Prize } from "@/types/game"

interface ClawGameBoardProps {
  clawX: number
  clawY: number
  isGrabbing: boolean
  grabPhase: string
  grabbedPrizeId: string | null
  clawShaking: boolean
  prizeWillFall: boolean
  clawOpenness: number
  touchingPrize: string | null
  prizesInMachine: Prize[]
  clawTipY: number
  effectiveClawWidth: number
  grabPositionYOffset: number
}

export const ClawGameBoard = React.memo(({
  clawX,
  clawY,
  isGrabbing,
  grabPhase,
  grabbedPrizeId,
  clawShaking,
  prizeWillFall,
  clawOpenness,
  touchingPrize,
  prizesInMachine,
  clawTipY,
  effectiveClawWidth,
  grabPositionYOffset
}: ClawGameBoardProps) => {
  return (
    <Card className="relative w-full max-w-3xl mx-auto bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 border-4 border-yellow-400 shadow-2xl overflow-hidden">
      <CardContent className="p-0 relative">
        {/* Game Area Background */}
        <div className="relative w-full h-96 bg-gradient-to-b from-transparent via-blue-800/50 to-blue-900 overflow-hidden">
          
          {/* Glass Effect Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/20 pointer-events-none" />
          
          {/* Cable System */}
          <CableSystem clawX={clawX} clawY={clawY} />
          
          {/* Claw Mechanism */}
          <ClawMechanism
            clawX={clawX}
            clawY={clawY}
            isGrabbing={isGrabbing}
            grabPhase={grabPhase}
            grabbedPrizeId={grabbedPrizeId}
            clawShaking={clawShaking}
            clawOpenness={clawOpenness}
          />
          
          {/* Prize Balls */}
          {prizesInMachine.map((prize) => (
            <PrizeBall
              key={prize.id}
              prize={prize}
              isGrabbed={grabbedPrizeId === prize.id}
              isGrabbing={isGrabbing && touchingPrize === prize.id}
              prizeWillFall={prizeWillFall && grabbedPrizeId === prize.id}
              touchingPrize={touchingPrize === prize.id}
              clawX={clawX}
              clawY={clawTipY}
              effectiveClawWidth={effectiveClawWidth}
              grabPositionYOffset={grabPositionYOffset}
            />
          ))}
          
          {/* Drop Zone Indicator */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-8 border-2 border-dashed border-yellow-400/50 bg-yellow-400/10 rounded flex items-center justify-center">
            <span className="text-yellow-400 text-xs font-bold">DROP</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

ClawGameBoard.displayName = "ClawGameBoard"