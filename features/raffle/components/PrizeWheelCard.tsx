import React from "react"
import { Gift } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CooldownDisplay } from "./CooldownDisplay"
import { PrizeWheel } from "./PrizeWheel"
import { PrizesInfo } from "./PrizesInfo"

interface PrizeWheelCardProps {
  walletConnected: boolean
  canSpin: boolean
  timeRemaining: string
  spinnerRotation: number
  isSpinning: boolean
  isTransactionPending: boolean
  cooldownHours: number
  cooldownMinutes: number
  cooldownSeconds: number
  cooldownProgress: number
  onSpin: () => void
}

export const PrizeWheelCard = React.memo(({
  walletConnected,
  canSpin,
  timeRemaining,
  spinnerRotation,
  isSpinning,
  isTransactionPending,
  cooldownHours,
  cooldownMinutes,
  cooldownSeconds,
  cooldownProgress,
  onSpin,
}: PrizeWheelCardProps) => {
  return (
    <Card className="border-2 border-accent/30 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-primary flex items-center justify-center gap-2">
          <Gift className="h-6 w-6" />
          Prize Wheel
        </CardTitle>
        <CardDescription>
          {!walletConnected
            ? "Connect your wallet to start spinning!"
            : canSpin
            ? "Click the button to spin and win! (0.1 IP entry fee)"
            : `Next spin available in: ${timeRemaining}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        {!canSpin && walletConnected && (
          <CooldownDisplay
            cooldownHours={cooldownHours}
            cooldownMinutes={cooldownMinutes}
            cooldownSeconds={cooldownSeconds}
            cooldownProgress={cooldownProgress}
          />
        )}

        <PrizeWheel
          spinnerRotation={spinnerRotation}
          isSpinning={isSpinning}
          isTransactionPending={isTransactionPending}
          walletConnected={walletConnected}
          canSpin={canSpin}
          cooldownHours={cooldownHours}
          cooldownMinutes={cooldownMinutes}
          onSpin={onSpin}
        />

        <PrizesInfo />
      </CardContent>
    </Card>
  )
})

PrizeWheelCard.displayName = "PrizeWheelCard"