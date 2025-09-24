import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Prize } from "@/types/game"

interface PrizesWonProps {
  collectedPrizes: Prize[] // Changed from 'prizes'
  score: number
  totalInitialPrizeCount: number // New prop
}

const getRarityColor = (rarity: "normal" | "rare") => {
  switch (rarity) {
    case "normal":
      return "bg-gray-500/20 text-gray-300 border-gray-400"
    case "rare":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-400"
    default:
      return "bg-gray-500/20 text-gray-300 border-gray-400"
  }
}

export function PrizesWon({ collectedPrizes, score, totalInitialPrizeCount }: PrizesWonProps) {
  const prizesInMachineCount = totalInitialPrizeCount - collectedPrizes.length

  return (
    <Card className="bg-black/20 border-green-500/30 backdrop-blur w-full">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>Prize Collection</span>
          <Badge variant="secondary" className="bg-green-500/20 text-green-300">
            {collectedPrizes.length}/{totalInitialPrizeCount}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-white/70 text-sm">
              Score: <span className="text-green-400 font-bold">{score}</span>
            </p>
            <p className="text-white/50 text-xs mt-1">Prizes in machine: {prizesInMachineCount}</p>
          </div>

          {collectedPrizes.length > 0 && (
            <div>
              <p className="text-white/80 text-sm mb-2 text-center font-semibold">Caught:</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {collectedPrizes.map((prize) => (
                  <div
                    key={prize.id}
                    className={`text-center bg-white/10 rounded-lg p-2 relative border ${getRarityColor(prize.rarity).split(" ")[2]}`}
                  >
                    <div className="text-2xl mb-1">{prize.emoji}</div>
                    <div className="text-xs text-white/70 mb-1 truncate" title={prize.name}>
                      {prize.name}
                    </div>
                    <Badge variant="outline" className={`text-xs ${getRarityColor(prize.rarity)}`}>
                      {prize.rarity}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {collectedPrizes.length === 0 && (
            <div className="text-center text-white/50 py-4">
              <div className="mb-2 text-3xl">🎁</div>
              <p>No prizes caught yet!</p>
            </div>
          )}

          {prizesInMachineCount === 0 && collectedPrizes.length === totalInitialPrizeCount && (
            <div className="text-center text-green-400 py-4 mt-4">
              <div className="mb-2 text-4xl">🏆</div>
              <p className="font-bold">COLLECTION COMPLETE!</p>
              <p className="text-xs mt-1 text-green-300">You caught all the prizes!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
