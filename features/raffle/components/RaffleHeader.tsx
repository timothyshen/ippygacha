import React from "react"
import { Sparkles, Wallet, Database, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RaffleHeaderProps {
  serverSyncStatus: "synced" | "syncing" | "error"
  contractValidation: "pending" | "valid" | "invalid"
}

export const RaffleHeader = React.memo(({
  serverSyncStatus,
  contractValidation,
}: RaffleHeaderProps) => {
  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center gap-3 mb-4">
        <Sparkles className="h-8 w-8 text-accent animate-pulse" />
        <h1 className="text-4xl md:text-6xl font-bold text-primary">Playground Raffle Game</h1>
        <Sparkles className="h-8 w-8 text-accent animate-pulse" />
      </div>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Spin the wheel of fortune and win amazing prizes! Entry cost: 0.1 IP per spin.
      </p>
    </div>
  )
})

RaffleHeader.displayName = "RaffleHeader"