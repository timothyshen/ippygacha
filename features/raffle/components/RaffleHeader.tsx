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

      <div className="mt-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <Database
                className={`h-3 w-3 ${serverSyncStatus === "synced"
                  ? "text-green-500"
                  : serverSyncStatus === "syncing"
                    ? "text-yellow-500"
                    : "text-red-500"
                  }`}
              />
              <span className="text-muted-foreground">Server: {serverSyncStatus}</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield
                className={`h-3 w-3 ${contractValidation === "valid"
                  ? "text-green-500"
                  : contractValidation === "pending"
                    ? "text-yellow-500"
                    : "text-red-500"
                  }`}
              />
              <span className="text-muted-foreground">Contract: {contractValidation}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

RaffleHeader.displayName = "RaffleHeader"