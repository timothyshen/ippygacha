import React from "react"
import { Gift, Database, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CooldownDisplay } from "./CooldownDisplay"
import { PrizeWheel } from "./PrizeWheel"
import { PrizesInfo } from "./PrizesInfo"
import { ContractRaffleInfo, ContractUserStats } from "../types"
import { formatEther } from "viem"

interface PrizeWheelCardProps {
  walletAddress: string
  canSpin: boolean
  timeRemaining: string
  spinnerRotation: number
  isSpinning: boolean
  isTransactionPending: boolean
  cooldownHours: number
  cooldownMinutes: number
  cooldownSeconds: number
  cooldownProgress: number
  raffleInfo: ContractRaffleInfo | null
  userStats: ContractUserStats | null
  entryPrice: bigint | null
  onSpin: () => void
}

export const PrizeWheelCard = React.memo(({
  walletAddress,
  canSpin,
  timeRemaining,
  spinnerRotation,
  isSpinning,
  isTransactionPending,
  cooldownHours,
  cooldownMinutes,
  cooldownSeconds,
  cooldownProgress,
  raffleInfo,
  userStats,
  entryPrice,
  onSpin,
}: PrizeWheelCardProps) => {
  const entryPriceDisplay = entryPrice ? formatEther(entryPrice) : "0.1";
  const userEntries = userStats ? Number(userStats.totalUserEntries) : 0;
  const userWinnings = userStats ? formatEther(userStats.totalWinnings) : "0";
  return (
    <Card className="border-2 border-accent/30 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-primary flex items-center justify-center gap-2">
          <Gift className="h-6 w-6" />
          Prize Wheel
        </CardTitle>
        <CardDescription>
          {!walletAddress
            ? "Connect your wallet to start spinning!"
            : canSpin
              ? `Click the button to spin and win! (${entryPriceDisplay} IP entry fee)`
              : `Next spin available in: ${timeRemaining}`}
        </CardDescription>

        {/* User Stats */}
        {walletAddress && userStats && (
          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-primary">{userEntries}</div>
                <div className="text-muted-foreground">Your Entries</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-accent">{userWinnings} IP</div>
                <div className="text-muted-foreground">Total Winnings</div>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        {!canSpin && walletAddress && (
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
          walletConnected={true}
          canSpin={canSpin}
          cooldownHours={cooldownHours}
          cooldownMinutes={cooldownMinutes}
          onSpin={onSpin}
        />

        <PrizesInfo
          raffleInfo={raffleInfo}
          entryPrice={entryPrice}
        />
      </CardContent>
    </Card>
  )
})

PrizeWheelCard.displayName = "PrizeWheelCard"