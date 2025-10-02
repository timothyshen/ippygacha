import React from "react"
import { Trophy } from "lucide-react"
import { PRIZES } from "../constants"
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

  const filterPrize = new Set(PRIZES)
  return (
    <div className="bg-muted p-4 rounded-lg w-full">
      <h4 className="font-semibold text-primary mb-3 flex items-center gap-2 justify-center">
        <Trophy className="h-4 w-4" />
        Available Prizes
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {Array.from(filterPrize).map((prize, index) => {
          return (
            <div
              key={prize.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${index === 0
                ? "bg-yellow-100 dark:bg-yellow-900/20"
                : index === 1
                  ? "bg-green-100 dark:bg-green-900/20"
                  : index === 2
                    ? "bg-blue-100 dark:bg-blue-900/20"
                    : index === 3
                      ? "bg-purple-100 dark:bg-purple-900/20"
                      : index === 4
                        ? "bg-pink-100 dark:bg-pink-900/20"
                        : "bg-red-100 dark:bg-red-900/20"
                }`}
            >
              <prize.icon className={`h-4 w-4 ${prize.color}`} />
              <span>{prize.name}</span>
            </div>
          )
        })}
      </div>
      <div className="mt-3 text-center text-sm text-muted-foreground">
        Entry Fee: <span className="font-semibold text-black text-accent">{entryPriceDisplay} IP</span>
        <br />
        <span className="text-xs">Secured by smart contract validation</span>
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