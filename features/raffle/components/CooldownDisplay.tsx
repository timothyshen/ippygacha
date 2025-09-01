import React from "react"
import { Clock } from "lucide-react"

interface CooldownDisplayProps {
  cooldownHours: number
  cooldownMinutes: number
  cooldownSeconds: number
  cooldownProgress: number
}

export const CooldownDisplay = React.memo(({
  cooldownHours,
  cooldownMinutes,
  cooldownSeconds,
  cooldownProgress,
}: CooldownDisplayProps) => {
  return (
    <div className="w-full bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          <h3 className="text-lg font-bold text-orange-800 dark:text-orange-200">
            Hybrid Cooldown Active
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
        <div className="mt-2 text-xs text-muted-foreground">
          Validated by both server database and smart contract
        </div>
      </div>
    </div>
  )
})

CooldownDisplay.displayName = "CooldownDisplay"