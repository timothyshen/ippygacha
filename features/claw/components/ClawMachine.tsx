"use client"

import { useCallback, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { GameStats } from "./GameStats"
import { PrizesWon } from "./PrizesWon"
import { MobileControls } from "./MobileControls"
import { ControlsInfo } from "./ControlsInfo"
import { PrizeBall } from "./PrizeBall"
import { CableSystem } from "./CableSystem"
import { ClawMechanism } from "./ClawMechanism"
import { GameResultModal } from "./GameResultModal"
import { useMobileDetection } from "@/hooks/claw/use-mobile-detection"
import { useButtonInteractions } from "@/hooks/claw/use-button-interactions"
import { useKeyboardControls } from "@/hooks/claw/use-keyboard-controls"
import { useGameState } from "@/hooks/claw/use-game-state"
import { useCablePhysics } from "@/hooks/claw/use-cable-physics"
import type { Prize, DroppedPrize as DroppedPrizeType } from "@/types/game"
import { Header } from "@/features/shared/components/Header"
import { ClawControlPanel } from "./ClawControlPanel"
import { useRouter } from "next/navigation"


// Constants for claw behavior
const CLAW_TIP_Y_OFFSET = 35 // Offset from clawY (mechanism top) to the tips when open/descending
const CLAW_EFFECTIVE_WIDTH_FOR_GRAB = 30 // Effective horizontal grab range of the claw (diameter)
const CLAW_GRAB_POSITION_Y_OFFSET = 35 // How high the mechanism top should be above prize center when grabbing

export default function ClawMachine() {
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
    clawShaking,
    prizeWillFall, // This will now effectively always be false for a successful grab sequence
    clawOpenness,
    touchingPrize,
    gameResult,
    showResult,
    setClawX,
    setClawY,
    setIsGrabbing,
    setClawClosed,
    setGrabPhase,
    setGrabbedPrizeId,
    setClawShaking,
    setPrizeWillFall,
    setClawOpenness,
    setTouchingPrize,
    setScore,
    setDroppedPrize,
    startGame,
    addCoins,
    resetGame,
    endGame,
    dismissResult,
  } = useGameState()
  const router = useRouter()


  const isMobile = useMobileDetection()
  const { pressedButtons, heldButtons, handleButtonPress, startHolding, stopHolding, holdIntervals } =
    useButtonInteractions()
  const { cableSwayAngle, setCableSwayAngle, setIsClawMoving, cableStabilizing, setCableStabilizing } = useCablePhysics(
    { grabbedPrizeId, prizeWillFall, grabPhase, clawY, prizes: prizesInMachine },
  )

  const MACHINE_WIDTH = 400
  const MACHINE_HEIGHT = 400 // Claw area height remains the same
  const MACHINE_TOTAL_HEIGHT = 520 // Extended total height for the machine body
  const COLLECTION_AREA_HEIGHT = 120 // Height of the collection area
  const MAX_DESCENT_Y = MACHINE_HEIGHT - 60 // Allow claw to go deeper to reach bottom balls

  const animationFrameRef = useRef<number | null>(null)

  const cancelAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [])

  const moveClawLeft = useCallback(() => {
    if (!gameActive || isGrabbing) return
    handleButtonPress("left")
    const step = 15
    setClawX((prev) => Math.max(20, prev - step))
    setIsClawMoving(true)
    setCableSwayAngle(-2)
    setTimeout(() => {
      setIsClawMoving(false)
      setCableSwayAngle(0)
    }, 200)
  }, [gameActive, isGrabbing, setClawX, handleButtonPress, setIsClawMoving, setCableSwayAngle])

  const moveClawRight = useCallback(() => {
    if (!gameActive || isGrabbing) return
    handleButtonPress("right")
    const step = 15
    setClawX((prev) => Math.min(MACHINE_WIDTH - 60, prev + step))
    setIsClawMoving(true)
    setCableSwayAngle(2)
    setTimeout(() => {
      setIsClawMoving(false)
      setCableSwayAngle(0)
    }, 200)
  }, [gameActive, isGrabbing, setClawX, handleButtonPress, setIsClawMoving, setCableSwayAngle, MACHINE_WIDTH])

  const finishGrabSequence = useCallback(
    (wasSuccessful = false) => {
      cancelAnimation()
      const returnDuration = 800
      const startX = clawX
      const targetX = 200
      const startTime = Date.now()

      const animateReturn = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / returnDuration, 1)
        const currentX = startX + (targetX - startX) * progress
        setClawX(currentX)
        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animateReturn)
        } else {
          setIsGrabbing(false)
          setGrabPhase("idle")
          setTouchingPrize(null)
          setClawOpenness(1)
          setCableSwayAngle(0)
          setCableStabilizing(false)
          // Only show failure message if this wasn't a successful grab and no result was already set
          if (!wasSuccessful && !gameResult) {
            endGame({
              won: false,
              message: "The claw returned empty. Better luck next time!",
            })
          }
        }
      }
      animationFrameRef.current = requestAnimationFrame(animateReturn)
    },
    [
      clawX,
      setClawX,
      setIsGrabbing,
      setGrabPhase,
      setTouchingPrize,
      setClawOpenness,
      setCableSwayAngle,
      setCableStabilizing,
      endGame,
      gameResult,
      cancelAnimation,
    ],
  )

  const startMovingToDropZone = useCallback(
    (prizeToDrop: Prize) => {
      cancelAnimation()
      const moveDuration = 1000
      const startX = clawX
      const targetX = 50
      const startTime = Date.now()

      const animateMove = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / moveDuration, 1)
        const easeProgress = 1 - Math.pow(1 - progress, 2)
        const currentX = startX + (targetX - startX) * easeProgress
        setClawX(currentX)
        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animateMove)
        } else {
          setGrabPhase("dropping")
          setTimeout(() => {
            cancelAnimation()
            const openStartTime = Date.now()
            const openDuration = 400
            const animateOpen = () => {
              const elapsedOpen = Date.now() - openStartTime
              const progressOpen = Math.min(elapsedOpen / openDuration, 1)
              setClawOpenness(progressOpen)
              if (progressOpen < 1) {
                animationFrameRef.current = requestAnimationFrame(animateOpen)
              } else {
                setClawClosed(false)
                setScore((prev) => prev + (prizeToDrop.rarity === "rare" ? 500 : 100))
                setDroppedPrize({
                  ...prizeToDrop,
                  x: targetX,
                  y: clawY + CLAW_TIP_Y_OFFSET,
                  isDropping: true,
                  dropPhase: "entering",
                  dropStartTime: Date.now(),
                  rotation: 0,
                  bouncing: false,
                } as DroppedPrizeType)
                endGame({ won: true, prize: prizeToDrop, message: `Congratulations! You won a ${prizeToDrop.name}!` })
                setGrabbedPrizeId(null)
                setTimeout(() => finishGrabSequence(true), 800)
              }
            }
            animationFrameRef.current = requestAnimationFrame(animateOpen)
          }, 500)
        }
      }
      animationFrameRef.current = requestAnimationFrame(animateMove)
    },
    [
      clawX,
      clawY,
      setClawX,
      setGrabPhase,
      setClawOpenness,
      setClawClosed,
      setScore,
      endGame,
      finishGrabSequence,
      setGrabbedPrizeId,
      setDroppedPrize,
      cancelAnimation,
    ],
  )

  const startAscent = useCallback(
    (grabbedPrizeDetails: Prize | null) => {
      cancelAnimation()
      const ascentDuration = 1200
      const startY = clawY
      const targetY = 50
      const startTime = Date.now()

      // prizeWillFall is effectively always false for a successful grab, so no weight-based sway needed here if it's tied to that.
      // However, a general sway for carrying *any* prize can remain.
      if (grabbedPrizeDetails) {
        // Simplified: if carrying any prize
        if (grabbedPrizeDetails.weight > 1.0) {
          setCableSwayAngle(grabbedPrizeDetails.weight * 2) // Heavier prizes cause more sway
          setTimeout(() => setCableSwayAngle(0), 800)
        }
      }

      const animateAscent = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / ascentDuration, 1)
        const easeProgress = Math.pow(progress, 2)
        const currentY = startY + (targetY - startY) * easeProgress
        setClawY(currentY)


        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animateAscent)
        } else {
          setCableSwayAngle(0)
          // Replace this block:
          if (grabbedPrizeDetails) {
            setGrabPhase("moving")
            startMovingToDropZone(grabbedPrizeDetails)
          } else {
            finishGrabSequence(false) // No prize was grabbed
          }
        }
      }
      animationFrameRef.current = requestAnimationFrame(animateAscent)
    },
    [
      clawY,
      setClawY,
      setGrabPhase,
      setCableSwayAngle,
      finishGrabSequence,
      startMovingToDropZone,
      cancelAnimation,
    ],
  )

  const grabPrize = useCallback(() => {
    if (!gameActive || isGrabbing) return
    cancelAnimation()
    setIsGrabbing(true)
    setGrabPhase("descending")
    setClawShaking(false)
    setPrizeWillFall(false) // Explicitly set to false at the start of a grab attempt
    setTouchingPrize(null)
    setGrabbedPrizeId(null)

    setCableSwayAngle(0)
    setIsClawMoving(false)
    setCableStabilizing(true)
    setTimeout(() => setCableStabilizing(false), 800)

    const descentDuration = 1500
    const startDescendY = clawY
    const startTime = Date.now()

    const animateDescend = () => {
      const elapsed = Date.now() - startTime
      const rawProgress = elapsed / descentDuration
      let currentY = startDescendY + (MAX_DESCENT_Y - startDescendY) * (1 - Math.pow(1 - rawProgress, 3))
      currentY = Math.min(currentY, MAX_DESCENT_Y)

      let contactedPrize: Prize | null = null
      let descentCompleted = rawProgress >= 1

      const effectiveClawTipY = currentY + CLAW_TIP_Y_OFFSET

      // Find the topmost prize that the claw can contact
      const contactablePrizes = prizesInMachine
        .filter((p) => !p.grabbed)
        .filter((p) => {
          const horizontalMatch = Math.abs(p.x - clawX) < p.radius + CLAW_EFFECTIVE_WIDTH_FOR_GRAB / 2
          const verticalOverlap = effectiveClawTipY >= p.y - p.radius && currentY < p.y + p.radius
          return horizontalMatch && verticalOverlap
        })
        .sort((a, b) => a.y - b.y) // Sort by Y position, topmost first

      if (contactablePrizes.length > 0) {
        contactedPrize = contactablePrizes[0] // Take the topmost contactable prize
        setClawY(contactedPrize.y - CLAW_GRAB_POSITION_Y_OFFSET)
        descentCompleted = true
      }

      if (!contactedPrize && !descentCompleted) {
        setClawY(currentY)
      }

      if (descentCompleted) {
        cancelAnimation()
        const finalClawY = contactedPrize ? contactedPrize.y - CLAW_GRAB_POSITION_Y_OFFSET : MAX_DESCENT_Y

        const prizeToGrab =
          contactedPrize ||
          prizesInMachine
            .filter((p) => !p.grabbed)
            .filter(
              (p) =>
                Math.abs(p.x - clawX) < p.radius + CLAW_EFFECTIVE_WIDTH_FOR_GRAB / 2 + 10 &&
                Math.abs(p.y - (finalClawY + CLAW_TIP_Y_OFFSET)) < p.radius + 10,
            )
            .sort((a, b) => a.y - b.y)[0] // Take the topmost available prize

        if (prizeToGrab) {
          setTouchingPrize(prizeToGrab.id)
          const closeStartTime = Date.now()
          const closeDuration = 800
          const animateClose = () => {
            const elapsedClose = Date.now() - closeStartTime
            const progressClose = Math.min(elapsedClose / closeDuration, 1)
            setClawOpenness(1 - progressClose)
            if (progressClose < 1) {
              animationFrameRef.current = requestAnimationFrame(animateClose)
            } else {
              setClawClosed(true)
              setGrabbedPrizeId(prizeToGrab.id)
              setPrizeWillFall(false) // Ensure it's false for a successful grab
              setTimeout(() => {
                setGrabPhase("ascending")
                startAscent(prizeToGrab)
              }, 500)
            }
          }
          animationFrameRef.current = requestAnimationFrame(animateClose)
        } else {
          const closeStartTime = Date.now()
          const closeDuration = 500
          const animateClose = () => {
            const elapsedClose = Date.now() - closeStartTime
            const progressClose = Math.min(elapsedClose / closeDuration, 1)
            setClawOpenness(1 - progressClose)
            if (progressClose < 1) {
              animationFrameRef.current = requestAnimationFrame(animateClose)
            } else {
              setClawClosed(true)
              setTimeout(() => {
                setGrabPhase("ascending")
                startAscent(null)
              }, 300)
            }
          }
          animationFrameRef.current = requestAnimationFrame(animateClose)
        }
      } else {
        animationFrameRef.current = requestAnimationFrame(animateDescend)
      }
    }
    animationFrameRef.current = requestAnimationFrame(animateDescend)
  }, [
    gameActive,
    isGrabbing,
    clawX,
    clawY,
    prizesInMachine,
    setIsGrabbing,
    setGrabPhase,
    setClawShaking,
    setPrizeWillFall,
    setTouchingPrize,
    setGrabbedPrizeId,
    setCableSwayAngle,
    setIsClawMoving,
    setCableStabilizing,
    setClawY,
    setClawOpenness,
    setClawClosed,
    startAscent,
    MAX_DESCENT_Y,
    cancelAnimation,
  ])

  const { heldKeys, keyHoldIntervals } = useKeyboardControls({
    gameActive,
    isGrabbing,
    moveClawLeft: moveClawLeft,
    moveClawRight: moveClawRight,
    handleGrab: grabPrize,
  })

  useEffect(() => {
    return () => {
      cancelAnimation()
      holdIntervals.forEach((interval) => clearInterval(interval))
      keyHoldIntervals.forEach((interval) => clearInterval(interval))
    }
  }, [holdIntervals, keyHoldIntervals, cancelAnimation])

  const handlePlayAgainFromModal = () => {
    startGame()
  }

  const currentDroppedPrize = useGameState().droppedPrize

  const onStartGame = () => {
    startGame()
  }

  // Add this useEffect after the existing useEffects, before the return statement
  useEffect(() => {
    if (currentDroppedPrize && currentDroppedPrize.isDropping) {
      const animateDroppedPrize = () => {
        const now = Date.now()
        const elapsed = now - (currentDroppedPrize.dropStartTime || now)

        if (currentDroppedPrize.dropPhase === "entering") {
          // Phase 1: Fall from claw to collection area
          const fallDuration = 1000 // 1 second fall
          const progress = Math.min(elapsed / fallDuration, 1)

          // Easing function for realistic fall
          const easeProgress = 1 - Math.pow(1 - progress, 2)

          // Calculate fall trajectory
          const startY = currentDroppedPrize.y
          const targetY = MACHINE_HEIGHT + COLLECTION_AREA_HEIGHT - 40 // Land in collection area
          const currentY = startY + (targetY - startY) * easeProgress

          // Add some horizontal drift
          const driftX = Math.sin(elapsed * 0.01) * 10
          const currentX = currentDroppedPrize.x + driftX

          // Add rotation during fall
          const rotation = elapsed * 0.5

          setDroppedPrize((prev) =>
            prev
              ? {
                ...prev,
                x: currentX,
                y: currentY,
                rotation: rotation,
              }
              : null,
          )

          if (progress >= 1) {
            // Transition to traveling phase
            setDroppedPrize((prev) =>
              prev
                ? {
                  ...prev,
                  dropPhase: "traveling",
                  dropStartTime: now,
                }
                : null,
            )
          }
        } else if (currentDroppedPrize.dropPhase === "traveling") {
          // Phase 2: Bounce and settle in collection area
          const settleDuration = 800
          const progress = Math.min(elapsed / settleDuration, 1)

          // Bouncing effect
          const bounceHeight = 20 * Math.sin(progress * Math.PI * 3) * (1 - progress)
          const baseY = MACHINE_HEIGHT + COLLECTION_AREA_HEIGHT - 40
          const currentY = baseY - Math.abs(bounceHeight)

          // Settle towards center
          const targetX = MACHINE_WIDTH / 2
          const currentX = currentDroppedPrize.x + (targetX - currentDroppedPrize.x) * progress * 0.3

          setDroppedPrize((prev) =>
            prev
              ? {
                ...prev,
                x: currentX,
                y: currentY,
                bouncing: Math.abs(bounceHeight) > 2,
                rotation: (prev.rotation || 0) * (1 - progress),
              }
              : null,
          )

          if (progress >= 1) {
            // Final phase: collected
            setDroppedPrize((prev) =>
              prev
                ? {
                  ...prev,
                  dropPhase: "collected",
                  bouncing: false,
                  rotation: 0,
                }
                : null,
            )

            // Clear the dropped prize after a delay
            setTimeout(() => {
              setDroppedPrize(null)
            }, 2000)
          }
        }
      }

      const animationFrame = requestAnimationFrame(animateDroppedPrize)
      return () => cancelAnimationFrame(animationFrame)
    }
  }, [currentDroppedPrize, setDroppedPrize, MACHINE_HEIGHT, COLLECTION_AREA_HEIGHT, MACHINE_WIDTH])

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 p-2 sm:p-4">
      <Header name="Claw Machine" subtitle="Premium Collection Experience" isDark={false} isMarketplace={false} />
      <div className="w-full max-w-7xl mx-auto mt-[120px]">
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">🎪 Claw Machine 🎪</h1>
          <p className="text-purple-200 text-sm sm:text-base px-2">
            {isMobile ? "Use the buttons below to control the claw!" : "Use A/D or Arrow Keys to move, SPACE to grab!"}
          </p>
        </div>

        {isMobile ? (
          <div className="flex flex-col items-center space-y-4 w-full">
            <div className="w-full max-w-sm">
              <GameStats
                coins={coins}
                score={score}
                gameActive={gameActive}
                onStartGame={onStartGame}
                onAddCoins={addCoins}
                onResetGame={resetGame}
              />
            </div>
            <div className="w-full flex justify-center relative">
              <Card className="bg-gradient-to-b from-pink-200 to-pink-400 border-4 border-pink-300 shadow-2xl rounded-3xl overflow-hidden w-max relative">
                <CardContent className="p-3 sm:p-6">
                  <div className="bg-pink-800 rounded-t-2xl p-2 sm:p-4 mb-2 sm:mb-4 relative">
                    <div className="absolute top-0 left-0 right-0 h-4 sm:h-6 bg-pink-800">
                      <div className="flex">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div key={i} className="flex-1 h-4 sm:h-6 bg-pink-200 rounded-b-full mx-0.5" />
                        ))}
                      </div>
                    </div>
                    <div className="text-center pt-4 sm:pt-8">
                      <h2 className="text-2xl sm:text-4xl font-bold text-pink-100 drop-shadow-lg">GACHA</h2>
                    </div>
                  </div>
                  <div
                    className="relative bg-gradient-to-b from-pink-50 to-pink-100 rounded-2xl border-4 border-pink-800 overflow-hidden shadow-inner mx-auto"
                    style={{
                      width: Math.min(MACHINE_WIDTH, window.innerWidth - 80),
                      height: Math.min(
                        MACHINE_TOTAL_HEIGHT,
                        (window.innerWidth - 80) * (MACHINE_TOTAL_HEIGHT / MACHINE_WIDTH),
                      ),
                    }}
                  >
                    {/* Prize Chute - moved to bottom left */}
                    <div className="absolute left-0 bottom-8 w-8 h-16 bg-gradient-to-r from-gray-800 to-gray-600 rounded-r-lg border-2 border-gray-700 shadow-inner">
                      <div className="absolute inset-1 bg-black/50 rounded-r-md"></div>
                      <div className="absolute top-1 left-1 text-yellow-400 text-xs font-bold transform -rotate-90 origin-left whitespace-nowrap">
                        CHUTE
                      </div>
                    </div>

                    {/* Claw Area - top portion */}
                    <div className="absolute top-0 left-0 right-0" style={{ height: MACHINE_HEIGHT }}>
                      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 space-y-1 sm:space-y-2">
                        <div className="text-pink-800 text-lg sm:text-xl">✕</div>
                        <div className="text-pink-800 text-lg sm:text-xl">✕</div>
                      </div>
                      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 space-y-1 sm:space-y-2">
                        <div className="text-pink-800 text-lg sm:text-xl">✕</div>
                        <div className="text-pink-800 text-lg sm:text-xl">✕</div>
                        <div className="text-pink-800 text-lg sm:text-xl">✕</div>
                      </div>
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-12 sm:top-20 left-12 sm:left-16 w-12 sm:w-16 h-12 sm:h-16 bg-pink-200/30 rounded-full"></div>
                        <div className="absolute top-20 sm:top-32 right-10 sm:right-16 w-8 sm:w-12 h-8 sm:h-12 bg-pink-300/20 rounded-full"></div>
                        <div className="absolute bottom-16 sm:bottom-24 left-20 sm:left-28 w-16 sm:w-20 h-16 sm:h-20 bg-pink-200/25 rounded-full"></div>
                        <div className="absolute bottom-10 sm:bottom-16 right-8 sm:right-12 w-10 sm:w-14 h-10 sm:h-14 bg-pink-300/30 rounded-full"></div>
                      </div>

                      {/* Prizes */}
                      {prizesInMachine.map((prize) => (
                        <PrizeBall
                          key={prize.id}
                          prize={prize}
                          isGrabbed={grabbedPrizeId === prize.id && isGrabbing}
                          isGrabbing={isGrabbing}
                          prizeWillFall={prizeWillFall}
                          touchingPrize={touchingPrize === prize.id}
                          clawX={clawX}
                          clawY={clawY}
                        />
                      ))}

                      {/* Claw */}
                      <div
                        className={`absolute transition-all z-40 ${clawShaking ? "animate-pulse" : ""}`}
                        style={{ left: clawX, top: clawY, transform: "translate(-50%, -50%)" }}
                      >
                        <div className="relative">
                          <CableSystem
                            clawY={clawY}
                            cableSwayAngle={cableSwayAngle}
                            grabbedPrizeId={grabbedPrizeId}
                            prizeWillFall={prizeWillFall}
                            cableStabilizing={cableStabilizing}
                          />
                          <ClawMechanism
                            clawOpenness={clawOpenness}
                            cableSwayAngle={cableSwayAngle}
                            grabbedPrizeId={grabbedPrizeId}
                            prizeWillFall={prizeWillFall}
                          />
                        </div>
                      </div>

                      {/* Game status overlay for claw area only */}
                      {!gameActive && !showResult && (
                        <div className="absolute inset-0 bg-pink-900/40 backdrop-blur-sm flex items-center justify-center rounded-t-2xl">
                          <div className="text-white text-center bg-pink-800/80 p-4 sm:p-6 rounded-2xl mx-2">
                            <p className="text-lg sm:text-xl font-bold mb-2">
                              {coins === 0 ? "No Coins Left!" : "Insert Coin to Play"}
                            </p>
                            <p className="text-xs sm:text-sm opacity-75">Click &quot;Start Game&quot; to begin</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Collection Area - bottom portion */}
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-pink-100 to-pink-200 border-t-4 border-pink-700"
                      style={{ height: COLLECTION_AREA_HEIGHT }}
                    >
                      {/* Collection area background pattern */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-2 left-4 w-6 h-6 bg-pink-300/20 rounded-full"></div>
                        <div className="absolute top-4 right-6 w-4 h-4 bg-pink-400/30 rounded-full"></div>
                        <div className="absolute bottom-4 left-8 w-8 h-8 bg-pink-200/40 rounded-full"></div>
                        <div className="absolute bottom-2 right-4 w-5 h-5 bg-pink-300/25 rounded-full"></div>
                      </div>

                      {/* Collection area label */}
                      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-pink-800 text-xs font-bold bg-pink-200/80 px-2 py-1 rounded border border-pink-600">
                        PRIZE COLLECTION
                      </div>

                      {/* Collected prizes display */}
                      <div className="absolute inset-4 top-8 flex flex-wrap gap-1 justify-center items-center overflow-hidden">
                        {collectedPrizes.slice(0, 12).map((prize, index) => (
                          <div
                            key={prize.id}
                            className={`w-6 h-6 rounded-full ${prize.color} shadow-md border border-white/30 relative overflow-hidden flex-shrink-0`}
                            style={{
                              animationDelay: `${index * 0.1}s`,
                            }}
                          >
                            <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                          </div>
                        ))}
                        {collectedPrizes.length > 12 && (
                          <div className="w-6 h-6 rounded-full bg-pink-600 shadow-md border border-white/30 flex items-center justify-center text-white text-xs font-bold">
                            +{collectedPrizes.length - 12}
                          </div>
                        )}
                      </div>

                      {/* Dropped prize animation in collection area */}
                      {currentDroppedPrize && currentDroppedPrize.dropPhase === "collected" && (
                        <div
                          className={`absolute transition-all duration-300 ${currentDroppedPrize.bouncing ? "animate-bounce" : ""}`}
                          style={{
                            left: "50%",
                            bottom: "20px",
                            transform: `translateX(-50%) rotate(${currentDroppedPrize.rotation || 0}deg)`,
                          }}
                        >
                          <div
                            className={`w-6 h-6 rounded-full ${currentDroppedPrize.color} shadow-lg border border-white/30 relative overflow-hidden`}
                          >
                            <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Falling prize animation */}
                    {currentDroppedPrize &&
                      (currentDroppedPrize.dropPhase === "entering" ||
                        currentDroppedPrize.dropPhase === "traveling") && (
                        <div
                          className="absolute z-50 transition-all duration-100"
                          style={{
                            left: `${currentDroppedPrize.x}px`,
                            top: `${currentDroppedPrize.y}px`,
                            transform: `translate(-50%, -50%) rotate(${currentDroppedPrize.rotation || 0}deg)`,
                          }}
                        >
                          <div
                            className={`w-6 h-6 rounded-full ${currentDroppedPrize.color} shadow-lg border border-white/30 relative overflow-hidden`}
                          >
                            <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                          </div>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="w-full max-w-md">
              <MobileControls
                gameActive={gameActive}
                isGrabbing={isGrabbing}
                pressedButtons={pressedButtons}
                heldButtons={heldButtons}
                onStartHolding={startHolding}
                onStopHolding={stopHolding}
                onMoveLeft={moveClawLeft}
                onMoveRight={moveClawRight}
                onGrab={grabPrize}
              />
            </div>
            <div className="w-full max-w-sm space-y-4">
              <ControlsInfo isMobile={isMobile} heldKeys={heldKeys} />
              <PrizesWon
                collectedPrizes={collectedPrizes}
                score={score}
                totalInitialPrizeCount={totalInitialPrizeCount}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 items-start justify-center font-mono">
            <GameStats
              coins={coins}
              score={score}
              gameActive={gameActive}
              onStartGame={onStartGame}
              onAddCoins={addCoins}
              onResetGame={resetGame}
            />
            <div className="flex flex-col items-center space-y-4 relative">
              <Card className="bg-gradient-to-b from-pink-200 to-pink-400 border-4 border-pink-300 shadow-2xl rounded-3xl overflow-hidden w-max mx-auto relative">
                <CardContent className="p-6">
                  <div className="bg-pink-800 rounded-t-2xl p-4 mb-4 relative">
                    <div className="absolute top-0 left-0 right-0 h-6 bg-pink-800">
                      <div className="flex">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div key={i} className="flex-1 h-6 bg-pink-200 rounded-b-full mx-0.5" />
                        ))}
                      </div>
                    </div>
                    <div className="text-center pt-8">
                      <h2 className="text-4xl font-bold text-pink-100 drop-shadow-lg bg-transparent shadow-none tracking-widest">
                        GACHA
                      </h2>
                    </div>
                  </div>
                  <div
                    className="relative bg-gradient-to-b from-pink-50 to-pink-100 rounded-2xl border-4 border-pink-800 overflow-hidden shadow-inner"
                    style={{ width: MACHINE_WIDTH, height: MACHINE_TOTAL_HEIGHT }}
                  >
                    {/* Prize Chute - moved to bottom left */}
                    <div className="absolute left-0 bottom-12 w-12 h-20 bg-gradient-to-r from-gray-800 to-gray-600 rounded-r-lg border-2 border-gray-700 shadow-inner">
                      <div className="absolute inset-1 bg-black/50 rounded-r-md"></div>
                      <div className="absolute top-2 left-2 text-yellow-400 text-xs font-bold transform -rotate-90 origin-left whitespace-nowrap">
                        PRIZE CHUTE
                      </div>
                    </div>

                    {/* Claw Area - top portion */}
                    <div className="absolute top-0 left-0 right-0" style={{ height: MACHINE_HEIGHT }}>
                      <div className="absolute top-4 right-4 space-y-2">
                        <div className="text-pink-800 text-xl">✕</div>
                        <div className="text-pink-800 text-xl">✕</div>
                      </div>
                      <div className="absolute bottom-4 right-4 space-y-2">
                        <div className="text-pink-800 text-xl">✕</div>
                        <div className="text-pink-800 text-xl">✕</div>
                        <div className="text-pink-800 text-xl">✕</div>
                      </div>
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-20 left-20 w-16 h-16 bg-pink-200/30 rounded-full"></div>
                        <div className="absolute top-32 right-16 w-12 h-12 bg-pink-300/20 rounded-full"></div>
                        <div className="absolute bottom-24 left-32 w-20 h-20 bg-pink-200/25 rounded-full"></div>
                        <div className="absolute bottom-16 right-12 w-14 h-14 bg-pink-300/30 rounded-full"></div>
                      </div>

                      {/* Prizes */}
                      {prizesInMachine.map((prize) => (
                        <PrizeBall
                          key={prize.id}
                          prize={prize}
                          isGrabbed={grabbedPrizeId === prize.id && isGrabbing}
                          isGrabbing={isGrabbing}
                          prizeWillFall={prizeWillFall}
                          touchingPrize={touchingPrize === prize.id}
                          clawX={clawX}
                          clawY={clawY}
                        />
                      ))}

                      {/* Claw */}
                      <div
                        className={`absolute transition-all z-40 ${clawShaking ? "animate-pulse" : ""}`}
                        style={{ left: clawX, top: clawY, transform: "translate(-50%, -50%)" }}
                      >
                        <div className="relative">
                          <CableSystem
                            clawY={clawY}
                            cableSwayAngle={cableSwayAngle}
                            grabbedPrizeId={grabbedPrizeId}
                            prizeWillFall={prizeWillFall}
                            cableStabilizing={cableStabilizing}
                          />
                          <ClawMechanism
                            clawOpenness={clawOpenness}
                            cableSwayAngle={cableSwayAngle}
                            grabbedPrizeId={grabbedPrizeId}
                            prizeWillFall={prizeWillFall}
                          />
                        </div>
                      </div>

                      {/* Game status overlay for claw area only */}
                      {!gameActive && !showResult && (
                        <div className="absolute inset-0 bg-pink-900/40 backdrop-blur-sm flex items-center justify-center rounded-t-2xl">
                          <div className="text-white text-center bg-pink-800/80 p-6 rounded-2xl">
                            <p className="text-xl font-bold mb-2">
                              {coins === 0 ? "No Coins Left!" : "Insert Coin to Play"}
                            </p>
                            <p className="text-sm opacity-75">Click &quot;Start Game&quot; to begin</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Collection Area - bottom portion */}
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-pink-100 to-pink-200 border-t-4 border-pink-700"
                      style={{ height: COLLECTION_AREA_HEIGHT }}
                    >
                      {/* Collection area background pattern */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-3 left-6 w-8 h-8 bg-pink-300/20 rounded-full"></div>
                        <div className="absolute top-6 right-8 w-6 h-6 bg-pink-400/30 rounded-full"></div>
                        <div className="absolute bottom-6 left-12 w-10 h-10 bg-pink-200/40 rounded-full"></div>
                        <div className="absolute bottom-3 right-6 w-7 h-7 bg-pink-300/25 rounded-full"></div>
                      </div>

                      {/* Collection area label */}
                      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 text-pink-800 text-sm font-bold bg-pink-200/80 px-3 py-1 rounded border-2 border-pink-600">
                        PRIZE COLLECTION
                      </div>

                      {/* Collected prizes display */}
                      <div className="absolute inset-6 top-12 flex flex-wrap gap-2 justify-center items-center overflow-hidden">
                        {collectedPrizes.slice(0, 15).map((prize, index) => (
                          <div
                            key={prize.id}
                            className={`w-8 h-8 rounded-full ${prize.color} shadow-lg border-2 border-white/30 relative overflow-hidden flex-shrink-0`}
                            style={{
                              animationDelay: `${index * 0.1}s`,
                            }}
                          >
                            <div className="absolute top-1 left-1 w-2 h-2 bg-white/60 rounded-full"></div>
                          </div>
                        ))}
                        {collectedPrizes.length > 15 && (
                          <div className="w-8 h-8 rounded-full bg-pink-600 shadow-lg border-2 border-white/30 flex items-center justify-center text-white text-xs font-bold">
                            +{collectedPrizes.length - 15}
                          </div>
                        )}
                      </div>

                      {/* Dropped prize animation in collection area */}
                      {currentDroppedPrize && currentDroppedPrize.dropPhase === "collected" && (
                        <div
                          className={`absolute transition-all duration-300 ${currentDroppedPrize.bouncing ? "animate-bounce" : ""}`}
                          style={{
                            left: "50%",
                            bottom: "30px",
                            transform: `translateX(-50%) rotate(${currentDroppedPrize.rotation || 0}deg)`,
                          }}
                        >
                          <div
                            className={`w-8 h-8 rounded-full ${currentDroppedPrize.color} shadow-lg border-2 border-white/30 relative overflow-hidden`}
                          >
                            <div className="absolute top-1 left-1 w-2 h-2 bg-white/60 rounded-full"></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Falling prize animation */}
                    {currentDroppedPrize &&
                      (currentDroppedPrize.dropPhase === "entering" ||
                        currentDroppedPrize.dropPhase === "traveling") && (
                        <div
                          className="absolute z-50 transition-all duration-100"
                          style={{
                            left: `${currentDroppedPrize.x}px`,
                            top: `${currentDroppedPrize.y}px`,
                            transform: `translate(-50%, -50%) rotate(${currentDroppedPrize.rotation || 0}deg)`,
                          }}
                        >
                          <div
                            className={`w-8 h-8 rounded-full ${currentDroppedPrize.color} shadow-lg border-2 border-white/30 relative overflow-hidden`}
                          >
                            <div className="absolute top-1 left-1 w-2 h-2 bg-white/60 rounded-full"></div>
                          </div>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4 w-full lg:w-80">
              <ControlsInfo isMobile={isMobile} heldKeys={heldKeys} />
              <PrizesWon
                collectedPrizes={collectedPrizes}
                score={score}
                totalInitialPrizeCount={totalInitialPrizeCount}
              />
            </div>
          </div>
        )}
      </div>
      <ClawControlPanel
        coins={coins}
        onAddCoin={addCoins}
        onOpenInventory={() => router.push("/inventory")}
        onOpenMarket={() => router.push("/market")}
      />
      {showResult && gameResult && (
        <GameResultModal
          result={gameResult}
          coins={coins}
          onPlayAgain={handlePlayAgainFromModal}
          onDismiss={dismissResult}
        />
      )}
    </div>
  )
}
