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
  contractSyncStatus: "synced" | "syncing" | "error"
  contractValidation: "pending" | "valid" | "invalid"
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
  contractSyncStatus,
  contractValidation,
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

        {/* Contract Status Indicators */}
        <div className="flex items-center justify-center gap-4 mt-2">
          <div className="flex items-center gap-2">
            <Database className={`h-4 w-4 ${contractSyncStatus === "synced" ? "text-green-500" : contractSyncStatus === "syncing" ? "text-yellow-500" : "text-red-500"}`} />
            <Badge variant={contractSyncStatus === "synced" ? "default" : contractSyncStatus === "syncing" ? "secondary" : "destructive"}>
              {contractSyncStatus}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Shield className={`h-4 w-4 ${contractValidation === "valid" ? "text-green-500" : contractValidation === "pending" ? "text-yellow-500" : "text-red-500"}`} />
            <Badge variant={contractValidation === "valid" ? "default" : contractValidation === "pending" ? "secondary" : "destructive"}>
              {contractValidation}
            </Badge>
          </div>
        </div>

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
            contractSyncStatus={contractSyncStatus}
            contractValidation={contractValidation}
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
          contractSyncStatus={contractSyncStatus}
        />
      </CardContent>
    </Card>
  )
})

PrizeWheelCard.displayName = "PrizeWheelCard"