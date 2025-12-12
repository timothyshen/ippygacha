import React from "react"
import { Trophy, Gift, Sparkles, Info } from "lucide-react"
import { ContractRaffleInfo } from "../types"
import { formatEther } from "viem"

interface PrizesInfoProps {
  raffleInfo: ContractRaffleInfo | null
  entryPrice: bigint | null
}

export const PrizesInfo = React.memo(({ raffleInfo, entryPrice }: PrizesInfoProps) => {
  const entryPriceDisplay = entryPrice ? formatEther(entryPrice) : "0.1";
  const nftPoolSize = raffleInfo ? Number(raffleInfo.nftPoolSize) : 0;
  const totalCollected = raffleInfo ? formatEther(raffleInfo.totalIPTokensCollected) : "0";

  return (
    <div className="bg-muted p-4 rounded-lg w-full">
      <h4 className="font-semibold text-primary mb-3 flex items-center gap-2 justify-center">
        <Trophy className="h-4 w-4" />
        How It Works
      </h4>

      {/* Entry Fee */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
        <div className="text-center">
          <span className="text-sm text-muted-foreground">Entry Fee</span>
          <div className="text-2xl font-bold text-primary">{entryPriceDisplay} IP</div>
        </div>
      </div>

      {/* Prize Structure */}
      <div className="space-y-3">
        {/* Guaranteed Return */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Gift className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-green-700 dark:text-green-400">Guaranteed Return</span>
            <span className="ml-auto text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">100%</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Every spin returns your entry fee ({entryPriceDisplay} IP) - you never lose!
          </p>
        </div>

        {/* Bonus Prizes */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-yellow-600" />
            <span className="font-semibold text-yellow-700 dark:text-yellow-400">Bonus Prizes</span>
            <span className="ml-auto text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full">Chance to Win</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">+40% Bonus</span>
              <span className="font-medium text-green-600">+{(parseFloat(entryPriceDisplay) * 0.4).toFixed(2)} IP</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">+100% Bonus + NFT</span>
              <span className="font-medium text-purple-600">+{entryPriceDisplay} IP + NFT</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">+200% Jackpot</span>
              <span className="font-medium text-pink-600">+{(parseFloat(entryPriceDisplay) * 2).toFixed(1)} IP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
        <span>Bonus prizes are awarded randomly on top of your guaranteed return.</span>
      </div>

      {/* Contract Statistics */}
      {raffleInfo && (
        <div className="mt-4 p-3 bg-background/50 rounded-lg border">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="text-center">
              <div className="font-semibold text-primary">{nftPoolSize}</div>
              <div className="text-muted-foreground">NFTs in Pool</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-accent">{totalCollected} IP</div>
              <div className="text-muted-foreground">Total Collected</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

PrizesInfo.displayName = "PrizesInfo"