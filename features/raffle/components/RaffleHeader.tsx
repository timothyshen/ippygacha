import React from "react"
import { Sparkles, Wallet, Database, Shield, Users, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ContractRaffleInfo, ContractUserStats } from "../types"
import { formatEther } from "viem"

interface RaffleHeaderProps {
  raffleInfo: ContractRaffleInfo | null
  userStats: ContractUserStats | null
  entryPrice: bigint | null
}

export const RaffleHeader = React.memo(({
  raffleInfo,
  userStats,
  entryPrice,
}: RaffleHeaderProps) => {
  const entryPriceDisplay = entryPrice ? formatEther(entryPrice) : "0.1";
  const totalEntries = raffleInfo ? Number(raffleInfo.totalEntries) : 0;
  const totalCollected = raffleInfo ? formatEther(raffleInfo.totalIPTokensCollected) : "0";
  const nftPoolSize = raffleInfo ? Number(raffleInfo.nftPoolSize) : 0;
  const userEntries = userStats ? Number(userStats.totalUserEntries) : 0;
  const userWinnings = userStats ? formatEther(userStats.totalWinnings) : "0";

  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center gap-3 mb-4">
        <Sparkles className="h-8 w-8 text-accent animate-pulse" />
        <h1 className="text-4xl md:text-6xl font-bold text-primary">On-Chain Raffle</h1>
        <Sparkles className="h-8 w-8 text-accent animate-pulse" />
      </div>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
        Enter the raffle and win guaranteed returns plus bonus prizes! Entry cost: {entryPriceDisplay} IP per entry.
      </p>

     

      {/* Raffle Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        <div className="bg-card/50 rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">Total Entries</span>
          </div>
          <p className="text-2xl font-bold text-primary">{totalEntries.toLocaleString()}</p>
        </div>

        <div className="bg-card/50 rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-muted-foreground">Total Collected</span>
          </div>
          <p className="text-2xl font-bold text-primary">{totalCollected} IP</p>
        </div>

        <div className="bg-card/50 rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-purple-500" />
            <span className="text-sm text-muted-foreground">NFT Pool</span>
          </div>
          <p className="text-2xl font-bold text-primary">{nftPoolSize}</p>
        </div>

        <div className="bg-card/50 rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">Your Entries</span>
          </div>
          <p className="text-2xl font-bold text-primary">{userEntries}</p>
        </div>
      </div>
    </div>
  )
})

RaffleHeader.displayName = "RaffleHeader"