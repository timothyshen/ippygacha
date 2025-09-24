"use client"

import React, { useEffect } from "react"
import { GameStats } from "./GameStats"
import { PrizesWon } from "./PrizesWon"
import { MobileControls } from "./MobileControls"
import { ControlsInfo } from "./ControlsInfo"
import { ClawGameBoard } from "./ClawGameBoard"
import { GameResultModal } from "./GameResultModal"
import { ClawControlPanel } from "./ClawControlPanel"
import { Header } from "@/features/shared/components/Header"
import { useGameState } from "@/hooks/claw/use-game-state"
import { useMobileDetection } from "@/hooks/claw/use-mobile-detection"
import { useClawAnimation } from "../hooks/useClawAnimation"
import { useClawControls } from "../hooks/useClawControls"
import { useRouter } from "next/navigation"

// Constants for claw behavior
const CLAW_TIP_Y_OFFSET = 35
const CLAW_EFFECTIVE_WIDTH_FOR_GRAB = 30
const CLAW_GRAB_POSITION_Y_OFFSET = 35

const ClawMachine = React.memo(() => {
  const {
    clawX,
    clawY,
    isGrabbing,
    coins,
    score,
    gameActive,
    prizesInMachine,
    collectedPrizes,
    totalInitialPrizeCount,
    grabPhase,
    grabbedPrizeId,
    prizeWillFall,
    touchingPrize,
    gameResult,
    showResult,
    setClawX,
    setClawY,
    setIsGrabbing,
    startGame,
    addCoins,
    dismissResult,
    // Simplified grab function with fewer dependencies
    grabPrize: originalGrabPrize
  } = useGameState()

  const router = useRouter()
  const isMobile = useMobileDetection()

  // Use our optimized animation hook
  const { clawShaking, clawOpenness, clawTipY } = useClawAnimation({
    clawX,
    clawY,
    isGrabbing,
    grabPhase,
    prizeWillFall
  })

  // Simplified grab function with minimal dependencies
  const grabPrize = React.useCallback(() => {
    if (!gameActive || isGrabbing) return
    originalGrabPrize()
  }, [gameActive, isGrabbing, originalGrabPrize])

  // Use our optimized controls hook
  const { controls, handleKeyDown } = useClawControls({
    clawX,
    clawY,
    gameActive,
    isGrabbing,
    setClawX,
    setClawY,
    setIsGrabbing,
    grabPrize
  })

  // Keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <Header
        name="Claw Machine"
        subtitle="Premium Collection Experience"
        isDark={false}
        isMarketplace={true}
      />

      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Game Stats */}
        <div className="lg:col-span-1">
          <GameStats
            coins={coins}
            score={score}
            gameActive={gameActive}
            onStartGame={startGame}
            onAddCoins={addCoins}
          />
        </div>

        {/* Main Game Area */}
        <div className="lg:col-span-2 space-y-6">
          <ClawGameBoard
            clawX={clawX}
            clawY={clawY}
            isGrabbing={isGrabbing}
            grabPhase={grabPhase}
            grabbedPrizeId={grabbedPrizeId}
            clawShaking={clawShaking}
            prizeWillFall={prizeWillFall}
            clawOpenness={clawOpenness}
            touchingPrize={touchingPrize}
            prizesInMachine={prizesInMachine}
            clawTipY={clawTipY}
            effectiveClawWidth={CLAW_EFFECTIVE_WIDTH_FOR_GRAB}
            grabPositionYOffset={CLAW_GRAB_POSITION_Y_OFFSET}
          />

          {/* Controls */}
          {isMobile ? (
            <MobileControls
              onMoveLeft={controls.moveLeft}
              onMoveRight={controls.moveRight}
              onMoveUp={controls.moveUp}
              onMoveDown={controls.moveDown}
              onGrab={controls.grab}
              disabled={!gameActive || isGrabbing}
            />
          ) : (
            <ControlsInfo />
          )}
        </div>

        {/* Prizes Won */}
        <div className="lg:col-span-1">
          <PrizesWon
            collectedPrizes={collectedPrizes}
            score={score}
            totalInitialPrizeCount={totalInitialPrizeCount}
          />
        </div>
      </div>

      {/* Control Panel */}
      <ClawControlPanel
        coins={coins}
        onAddCoin={addCoins}
        onOpenInventory={() => router.push("/inventory")}
        onOpenMarket={() => router.push("/market")}
      />

      {/* Game Result Modal */}
      {showResult && gameResult && (
        <GameResultModal
          result={gameResult}
          onClose={dismissResult}
        />
      )}
    </div>
  )
})

ClawMachine.displayName = "ClawMachine"

export default ClawMachine