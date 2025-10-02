import React from "react"
import { Sparkles, Clock, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PRIZES, PRIZE_COLORS } from "../constants"

interface PrizeWheelProps {
  spinnerRotation: number
  isSpinning: boolean
  isTransactionPending: boolean
  walletConnected: boolean
  canSpin: boolean
  cooldownHours: number
  cooldownMinutes: number
  onSpin: () => void
}

export const PrizeWheel = React.memo(({
  spinnerRotation,
  isSpinning,
  isTransactionPending,
  walletConnected,
  canSpin,
  cooldownHours,
  cooldownMinutes,
  onSpin,
}: PrizeWheelProps) => {
  return (
    <div className="relative">
      <div
        className="w-80 h-80 rounded-full border-8 border-primary/20 relative overflow-hidden transition-transform duration-4000 ease-out shadow-2xl"
        style={{
          transform: `rotate(${spinnerRotation}deg)`,
        }}
      >
        {PRIZES.map((prize, index) => {
          const segmentAngle = 360 / PRIZES.length // 60 degrees each
          const gapAngle = 3
          const actualSegmentAngle = segmentAngle - gapAngle
          const startAngle = index * segmentAngle + gapAngle / 2

          return (
            <div
              key={`${prize.name}-${index}`}
              className={`absolute inset-0 ${PRIZE_COLORS[index]} border-2 border-white/30`}
              style={{
                clipPath: `polygon(50% 50%, ${
                  50 + 45 * Math.cos((startAngle * Math.PI) / 180)
                }% ${50 + 45 * Math.sin((startAngle * Math.PI) / 180)}%, ${
                  50 + 45 * Math.cos(((startAngle + actualSegmentAngle) * Math.PI) / 180)
                }% ${50 + 45 * Math.sin(((startAngle + actualSegmentAngle) * Math.PI) / 180)}%)`,
              }}
            >
              <div
                className="absolute flex flex-col items-center justify-center text-white"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: `translate(-50%, -50%) rotate(${
                    startAngle + actualSegmentAngle / 2
                  }deg) translateY(-80px)`,
                  transformOrigin: "center",
                }}
              >
                <prize.icon className="h-6 w-6 mb-1 drop-shadow-lg" />
                <span className="text-xs font-bold drop-shadow-lg">{prize.name}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3">
        <div className="w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-primary shadow-lg"></div>
      </div>

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <Button
          onClick={onSpin}
          disabled={!walletConnected || !canSpin || isSpinning}
          className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl border-4 border-white text-sm font-bold"
        >
          {isTransactionPending ? (
            <div className="flex flex-col items-center text-xs">
              <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mb-1" />
              <span>TX...</span>
            </div>
          ) : isSpinning ? (
            <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : !walletConnected ? (
            <div className="flex flex-col items-center text-xs">
              <Wallet className="h-4 w-4 mb-1" />
              <span>WALLET</span>
            </div>
          ) : canSpin ? (
            <div className="flex flex-col items-center">
              <Sparkles className="h-5 w-5 mb-1" />
              <span>SPIN</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-xs">
              <Clock className="h-4 w-4 mb-1" />
              <span className="text-[10px] leading-tight">
                {cooldownHours > 0 ? `${cooldownHours}h` : `${cooldownMinutes}m`}
              </span>
            </div>
          )}
        </Button>
      </div>
    </div>
  )
})

PrizeWheel.displayName = "PrizeWheel"