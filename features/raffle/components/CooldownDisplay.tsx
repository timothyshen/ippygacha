import React from "react"
import { Clock, Shield, Database } from "lucide-react"

interface CooldownDisplayProps {
  cooldownHours: number
  cooldownMinutes: number
  cooldownSeconds: number
  cooldownProgress: number
  contractSyncStatus: "synced" | "syncing" | "error"
  contractValidation: "pending" | "valid" | "invalid"
}

export const CooldownDisplay = React.memo(({
  cooldownHours,
  cooldownMinutes,
  cooldownSeconds,
  cooldownProgress,
  contractSyncStatus,
  contractValidation,
}: CooldownDisplayProps) => {
  return (
    <div className="w-full bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          <h3 className="text-lg font-bold text-orange-800 dark:text-orange-200">
            Smart Contract Cooldown Active
          </h3>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3">
          <div className="text-2xl font-mono font-bold text-orange-600 dark:text-orange-400 mb-2">
            {String(cooldownHours).padStart(2, "0")}:{String(cooldownMinutes).padStart(2, "0")}:
            {String(cooldownSeconds).padStart(2, "0")}
          </div>
          <div className="text-sm text-muted-foreground">Time until next spin</div>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
          <div
            className="bg-gradient-to-r from-orange-400 to-red-500 h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${cooldownProgress}%` }}
          ></div>
        </div>
        <div className="text-xs text-muted-foreground">{cooldownProgress.toFixed(1)}% complete</div>
        {/* Contract Status Indicators */}
        <div className="mt-3 flex items-center justify-center gap-4">
          <div className="flex items-center gap-1">
            <Database className={`h-3 w-3 ${contractSyncStatus === "synced" ? "text-green-500" : contractSyncStatus === "syncing" ? "text-yellow-500" : "text-red-500"}`} />
            <span className="text-xs text-muted-foreground">Sync: {contractSyncStatus}</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className={`h-3 w-3 ${contractValidation === "valid" ? "text-green-500" : contractValidation === "pending" ? "text-yellow-500" : "text-red-500"}`} />
            <span className="text-xs text-muted-foreground">Valid: {contractValidation}</span>
          </div>
        </div>

        <div className="mt-2 text-xs text-muted-foreground">
          Secured by smart contract validation
        </div>
      </div>
    </div>
  )
})

CooldownDisplay.displayName = "CooldownDisplay"