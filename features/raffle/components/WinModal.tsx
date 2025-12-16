import React from "react"
import { Trophy, Clock, ExternalLink } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PRIZES } from "../constants"
import { ContractRaffleInfo, ContractUserStats, PrizeEvent } from "../types"
import { formatEther } from "viem"

interface WinModalProps {
  isOpen: boolean
  onClose: () => void
  selectedPrize: string | null
  selectedPrizeValue: string | null
  cooldownHours: number
  cooldownMinutes: number
  cooldownSeconds: number
  raffleInfo: ContractRaffleInfo | null
  userStats: ContractUserStats | null
  transactionHash?: string | null
  latestPrize: PrizeEvent | null
}

export const WinModal = React.memo(({
  isOpen,
  onClose,
  selectedPrize,
  selectedPrizeValue,
  cooldownHours,
  cooldownMinutes,
  cooldownSeconds,
  userStats,
  transactionHash,
  latestPrize
}: WinModalProps) => {
  const totalEntries = userStats ? Number(userStats.totalUserEntries) : 0;
  const totalWinnings = userStats ? formatEther(userStats.totalWinnings) : "0";
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-primary flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Congratulations!
            <Trophy className="h-6 w-6 text-yellow-500" />
          </DialogTitle>
          <DialogDescription className="text-center text-lg">You've won an amazing prize!</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="w-20 h-20 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center">
            {selectedPrize && (
              <>
                {PRIZES.find((p) => p.name === selectedPrize)?.icon && (
                  <div className="text-white">
                    {React.createElement(PRIZES.find((p) => p.name === selectedPrize)!.icon, {
                      className: "h-10 w-10",
                    })}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-primary">{selectedPrize}</h3>
            {selectedPrizeValue && selectedPrizeValue !== selectedPrize && (
              <p className="text-lg font-semibold text-accent">{selectedPrizeValue}</p>
            )}
          </div>

          {/* Real Prize Information from Contract */}
          {latestPrize && (
            <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-green-800 dark:text-green-200">
                  {latestPrize.type === "guaranteed" ? "Guaranteed Return" : "Bonus Prize"} Won!
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Prize Type:</span>
                  <span className="font-semibold">
                    {latestPrize.type === "guaranteed" ? "Guaranteed Return" : "Bonus Prize"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tier:</span>
                  <span className="font-semibold">Tier {latestPrize.tier}</span>
                </div>
                <div className="flex justify-between">
                  <span>IP Amount:</span>
                  <span className="font-semibold text-accent">
                    {formatEther(latestPrize.ipTokenAmount)} IP
                  </span>
                </div>
                {latestPrize.nftTokenId > 0 && (
                  <div className="flex justify-between">
                    <span>NFT:</span>
                    <span className="font-semibold text-blue-600">
                      Token ID #{latestPrize.nftTokenId.toString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Transaction Hash */}
          {transactionHash && (
            <div className="bg-muted p-3 rounded-lg text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Transaction Hash</span>
              </div>
              <a
                href={`https://aeneid.storyscan.io/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-mono break-all underline"
              >
                {transactionHash}
              </a>
            </div>
          )}

          {/* User Stats */}
          {userStats && (
            <div className="bg-muted p-3 rounded-lg mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-primary">{totalEntries}</div>
                  <div className="text-muted-foreground">Total Entries</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-black text-accent">{totalWinnings} IP</div>
                  <div className="text-muted-foreground">Total Winnings</div>
                </div>
              </div>
            </div>
          )}

          {/* Cooldown Info - Only show if there's an active cooldown */}
          {(cooldownHours > 0 || cooldownMinutes > 0) && (
            <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <span className="font-semibold text-orange-800 dark:text-orange-200">Next Spin Available</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Come back in {cooldownHours > 0
                  ? `${cooldownHours}h ${cooldownMinutes}m`
                  : cooldownMinutes > 0
                    ? `${cooldownMinutes}m ${cooldownSeconds}s`
                    : `${cooldownSeconds}s`
                } to spin again!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Secured by smart contract validation ✓
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
})

WinModal.displayName = "WinModal"