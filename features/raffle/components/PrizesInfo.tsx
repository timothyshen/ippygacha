import React from "react"
import { Trophy } from "lucide-react"
import { PRIZES } from "../constants"

export const PrizesInfo = React.memo(() => {
  return (
    <div className="bg-muted p-4 rounded-lg w-full">
      <h4 className="font-semibold text-primary mb-3 flex items-center gap-2 justify-center">
        <Trophy className="h-4 w-4" />
        Available Prizes
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {PRIZES.map((prize, index) => (
          <div
            key={prize.name}
            className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
              index === 0
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
        ))}
      </div>
      <div className="mt-3 text-center text-sm text-muted-foreground">
        Entry Fee: <span className="font-semibold text-accent">0.1 IP</span>
        <br />
        <span className="text-xs">Secured by hybrid server + blockchain validation</span>
      </div>
    </div>
  )
})

PrizesInfo.displayName = "PrizesInfo"