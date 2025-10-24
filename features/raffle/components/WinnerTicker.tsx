import React from "react"
import { Trophy } from "lucide-react"
import { Winner } from "../types"

interface WinnerTickerProps {
  recentWinners: Winner[]
}

export const WinnerTicker = React.memo(({ recentWinners }: WinnerTickerProps) => {
  return (
    <div className="sticky left-0 right-0 z-40 bg-primary text-primary-foreground py-2 overflow-hidden shadow-lg mt-2">
      <div
        className="flex whitespace-nowrap animate-scroll"
        style={{
          animation: "scroll-left 30s linear infinite",
        }}
      >
        {[...Array(2)].map((_, duplicateIndex) => (
          <div key={duplicateIndex} className="flex">
            {recentWinners.map((winner, index) => (
              <div key={`${winner.id}-${duplicateIndex}`} className="flex items-center mx-8">
                <Trophy className="h-4 w-4 mr-2 text-yellow-300" />
                <span className="font-semibold">
                  🎉 {winner.name} just won {winner.prize} ({winner.value})!
                </span>
                {index < recentWinners.length - 1 && <span className="mx-4 text-primary-foreground/60">•</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
})

WinnerTicker.displayName = "WinnerTicker"