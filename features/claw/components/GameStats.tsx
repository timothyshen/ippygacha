"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Coins, Gift, Gamepad2, Volume2, VolumeX } from "lucide-react"

interface GameStatsProps {
  coins: number
  score: number
  gameActive: boolean
  onStartGame: () => void
  onAddCoins: () => void
  onResetGame: () => void
}

export function GameStats({
  coins,
  score,
  gameActive,
  onStartGame,
  onAddCoins,
  onResetGame,
}: GameStatsProps) {
  return (
    <Card className="bg-black/20 border-purple-500/30 backdrop-blur w-full lg:w-80">
      <CardHeader className="font-mono">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Gamepad2 className="w-5 h-5" />
            Game Stats
          </CardTitle>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <VolumeX className="w-5 h-5" />
            <span className="sr-only">Toggle sound</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-white">
          <span className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-yellow-400" />
            Coins:
          </span>
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300">
            {coins}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-white">
          <span className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-green-400" />
            Score:
          </span>
          <Badge variant="secondary" className="bg-green-500/20 text-green-300">
            {score}
          </Badge>
        </div>
        <div className="space-y-2">
          <Button
            onClick={onStartGame}
            disabled={coins === 0 || gameActive}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {gameActive ? "Playing..." : "Start Game (1 Coin)"}
          </Button>
          <Button
            onClick={onAddCoins}
            variant="outline"
            className="w-full border-yellow-500 text-yellow-300 hover:bg-yellow-500/10"
          >
            Add 5 Coins (Mock)
          </Button>
          <Button
            onClick={onResetGame}
            variant="outline"
            className="w-full border-red-500 text-red-300 hover:bg-red-500/10"
          >
            Reset Game
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
