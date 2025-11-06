import React from "react"
import { PRIZES, PRIZE_COLORS } from "../constants"
import {
  calculateWheelSegment,
  generateSegmentClipPath,
  calculateIconTransform
} from "@/lib/raffle/utils"
import { PrizeWheelButton } from "./PrizeWheelButton"

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
          const { startAngle, actualSegmentAngle } = calculateWheelSegment(index, PRIZES.length);
          const clipPath = generateSegmentClipPath(startAngle, actualSegmentAngle);
          const iconStyle = calculateIconTransform(startAngle, actualSegmentAngle);

          return (
            <div
              key={`${prize.name}-${index}`}
              className={`absolute inset-0 ${PRIZE_COLORS[index]} border-2 border-white/30`}
              style={{ clipPath }}
            >
              <div
                className="absolute flex flex-col items-center justify-center text-white"
                style={iconStyle}
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
        <PrizeWheelButton
          walletConnected={walletConnected}
          canSpin={canSpin}
          isSpinning={isSpinning}
          isTransactionPending={isTransactionPending}
          cooldownHours={cooldownHours}
          cooldownMinutes={cooldownMinutes}
          onSpin={onSpin}
        />
      </div>
    </div>
  )
})

PrizeWheel.displayName = "PrizeWheel"