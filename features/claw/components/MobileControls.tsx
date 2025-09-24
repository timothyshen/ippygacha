"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Hand } from "lucide-react"

interface MobileControlsProps {
  gameActive: boolean
  isGrabbing: boolean
  pressedButtons: Set<string>
  heldButtons: Set<string>
  onStartHolding: (buttonId: string, action: () => void) => void
  onStopHolding: (buttonId: string) => void
  onMoveLeft: () => void
  onMoveRight: () => void
  onGrab: () => void
}

export function MobileControls({
  gameActive,
  isGrabbing,
  pressedButtons,
  heldButtons,
  onStartHolding,
  onStopHolding,
  onMoveLeft,
  onMoveRight,
  onGrab,
}: MobileControlsProps) {
  return (
    <Card className="bg-black/20 border-blue-500/30 backdrop-blur w-full">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col items-center space-y-4 sm:space-y-6">
          <div className="flex items-center justify-center space-x-4 sm:space-x-8 w-full">
            <Button
              onTouchStart={() => onStartHolding("left", onMoveLeft)}
              onTouchEnd={() => onStopHolding("left")}
              onMouseDown={() => onStartHolding("left", onMoveLeft)}
              onMouseUp={() => onStopHolding("left")}
              onMouseLeave={() => onStopHolding("left")}
              disabled={!gameActive || isGrabbing}
              className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 touch-manipulation shadow-lg transition-all duration-150 ease-out ${
                pressedButtons.has("left") || heldButtons.has("left")
                  ? "scale-90 shadow-inner bg-blue-800 ring-4 ring-blue-400/50"
                  : "scale-100 hover:scale-105 active:scale-95"
              }`}
              style={{ touchAction: "manipulation" }}
            >
              <ArrowLeft
                className={`transition-all duration-150 ${
                  pressedButtons.has("left") || heldButtons.has("left")
                    ? "w-6 h-6 sm:w-10 sm:h-10"
                    : "w-8 h-8 sm:w-12 sm:h-12"
                }`}
              />
              {heldButtons.has("left") && (
                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full animate-pulse" />
              )}
            </Button>

            <Button
              onTouchStart={onGrab}
              onClick={onGrab}
              disabled={!gameActive || isGrabbing}
              className={`w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 touch-manipulation text-white font-bold shadow-xl border-4 border-red-400 transition-all duration-150 ease-out ${
                pressedButtons.has("grab")
                  ? "scale-90 shadow-inner bg-red-800 ring-4 ring-red-400/50 border-red-600"
                  : "scale-100 hover:scale-105 active:scale-95"
              }`}
              style={{ touchAction: "manipulation" }}
            >
              <div className="flex flex-col items-center">
                <Hand
                  className={`mb-1 sm:mb-2 transition-all duration-150 ${
                    pressedButtons.has("grab") ? "w-6 h-6 sm:w-8 sm:h-8" : "w-8 h-8 sm:w-10 sm:h-10"
                  }`}
                />
                <span
                  className={`font-bold transition-all duration-150 ${
                    pressedButtons.has("grab") ? "text-xs sm:text-sm" : "text-sm sm:text-lg"
                  }`}
                >
                  GRAB
                </span>
              </div>
            </Button>

            <Button
              onTouchStart={() => onStartHolding("right", onMoveRight)}
              onTouchEnd={() => onStopHolding("right")}
              onMouseDown={() => onStartHolding("right", onMoveRight)}
              onMouseUp={() => onStopHolding("right")}
              onMouseLeave={() => onStopHolding("right")}
              disabled={!gameActive || isGrabbing}
              className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 touch-manipulation shadow-lg transition-all duration-150 ease-out ${
                pressedButtons.has("right") || heldButtons.has("right")
                  ? "scale-90 shadow-inner bg-blue-800 ring-4 ring-blue-400/50"
                  : "scale-100 hover:scale-105 active:scale-95"
              }`}
              style={{ touchAction: "manipulation" }}
            >
              <ArrowRight
                className={`transition-all duration-150 ${
                  pressedButtons.has("right") || heldButtons.has("right")
                    ? "w-6 h-6 sm:w-10 sm:h-10"
                    : "w-8 h-8 sm:w-12 sm:h-12"
                }`}
              />
              {heldButtons.has("right") && (
                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full animate-pulse" />
              )}
            </Button>
          </div>

          <div className="text-center text-white/70 text-xs sm:text-sm">
            <p className="font-medium">Hold LEFT/RIGHT for continuous movement</p>
            <p className="text-xs mt-1 text-white/50">Press GRAB to drop claw and attempt to win!</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
