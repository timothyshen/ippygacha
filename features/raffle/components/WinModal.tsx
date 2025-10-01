import React from "react"
import { Trophy, Clock, ExternalLink, Shield, Database } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { PRIZES } from "../constants"
import { ContractRaffleInfo, ContractUserStats } from "../types"
import { formatEther } from "viem"

interface WinModalProps {
  isOpen: boolean
  onClose: () => void
  selectedPrize: string | null
  selectedPrizeValue: string | null
  cooldownHours: number
  cooldownMinutes: number
  raffleInfo: ContractRaffleInfo | null
  userStats: ContractUserStats | null
  contractSyncStatus: "synced" | "syncing" | "error"
  contractValidation: "pending" | "valid" | "invalid"
  transactionHash?: string
}

export const WinModal = React.memo(({
  isOpen,
  onClose,
  selectedPrize,
  selectedPrizeValue,
  cooldownHours,
  cooldownMinutes,
  raffleInfo,
  userStats,
  contractSyncStatus,
  contractValidation,
  transactionHash
}: WinModalProps) => {
  const totalEntries = userStats ? Number(userStats.totalUserEntries) : 0;
  const totalWinnings = userStats ? formatEther(userStats.totalWinnings) : "0";
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
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
            <p className="text-lg font-semibold text-accent">{selectedPrizeValue}</p>
          </div>
          {/* Contract Status */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <Database className={`h-4 w-4 ${contractSyncStatus === "synced" ? "text-green-500" : contractSyncStatus === "syncing" ? "text-yellow-500" : "text-red-500"}`} />
              <Badge variant={contractSyncStatus === "synced" ? "default" : contractSyncStatus === "syncing" ? "secondary" : "destructive"}>
                {contractSyncStatus}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Shield className={`h-4 w-4 ${contractValidation === "valid" ? "text-green-500" : contractValidation === "pending" ? "text-yellow-500" : "text-red-500"}`} />
              <Badge variant={contractValidation === "valid" ? "default" : contractValidation === "pending" ? "secondary" : "destructive"}>
                {contractValidation}
              </Badge>
            </div>
          </div>

          {/* Transaction Hash */}
          {transactionHash && (
            <div className="bg-muted p-3 rounded-lg text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Transaction Hash</span>
              </div>
              <p className="text-xs text-muted-foreground font-mono break-all">
                {transactionHash}
              </p>
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
                  <div className="font-semibold text-accent">{totalWinnings} IP</div>
                  <div className="text-muted-foreground">Total Winnings</div>
                </div>
              </div>
            </div>
          )}

          {/* Cooldown Info */}
          <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <span className="font-semibold text-orange-800 dark:text-orange-200">Next Spin Available</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Come back in {cooldownHours > 0 ? `${cooldownHours}h ${cooldownMinutes}m` : `${cooldownMinutes}m`} to spin again!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Secured by smart contract validation
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
})

WinModal.displayName = "WinModal"