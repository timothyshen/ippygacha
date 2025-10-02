"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, Zap, Trophy, Play, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Game {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  emoji: string
  status: "available" | "coming-soon" | "beta"
  players: string
  rewards: string
  bgGradient: string
  borderColor: string
  textColor: string
  href?: string
  isNew?: boolean
  isPopular?: boolean
}

const GAMES: Game[] = [
  {
    id: "gacha",
    title: "Gacha Zone",
    description: "Collect premium designer figures and build your ultimate collection",
    icon: <Gamepad2 className="w-8 h-8" />,
    emoji: "🎰",
    status: "available",
    players: "1.2K+",
    rewards: "IPPY",
    bgGradient: "bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500",
    borderColor: "border-pink-300",
    textColor: "text-white",
    href: "/gacha",
  },
  {
    id: "claw",
    title: "Claw Master",
    description: "Test your skills with the classic claw machine experience",
    icon: <Trophy className="w-8 h-8" />,
    emoji: "🦾",
    status: "available",
    players: "Soon",
    rewards: "Plush Toys",
    bgGradient: "bg-gradient-to-br from-amber-500 via-orange-500 to-red-500",
    borderColor: "border-amber-300",
    textColor: "text-white",
    href: "/claw",
  },
  {
    id: "",
    title: "",
    description: "",
    icon: <Zap className="w-8 h-8" />,
    emoji: "",
    status: "coming-soon",
    players: "Soon",
    rewards: "Coming Soon",
    bgGradient: "bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700",
    borderColor: "border-gray-400",
    textColor: "text-white",
  }
]

const StatusBadge = ({ status }: { status: Game["status"] }) => {
  const statusConfig = {
    available: { label: "LIVE", className: "bg-green-500 text-white animate-pulse" },
    "coming-soon": { label: "COMING SOON", className: "bg-amber-500 text-white" },
    beta: { label: "BETA", className: "bg-blue-500 text-white" },
  }

  const config = statusConfig[status]
  return <Badge className={cn("text-xs font-bold", config.className)}>{config.label}</Badge>
}

export function GamesGrid() {
  const [hoveredGame, setHoveredGame] = useState<string | null>(null)

  const handleGameClick = (game: Game) => {
    if (game.status === "available" && game.href) {
      window.location.href = game.href
    } else {
      alert(`${game.title} is ${game.status === "beta" ? "in beta testing" : "coming soon"}! Stay tuned for updates.`)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {GAMES.map((game) => (
        <Card
          key={game.id}
          className={cn(
            "relative overflow-hidden border-4 shadow-2xl transition-all duration-500 cursor-pointer group",
            game.borderColor,
            "hover:scale-105 hover:shadow-3xl",
            hoveredGame === game.id && "scale-105 shadow-3xl ring-4 ring-white/30",
          )}
          onMouseEnter={() => setHoveredGame(game.id)}
          onMouseLeave={() => setHoveredGame(null)}
          onClick={() => handleGameClick(game)}
        >
          <div className={cn("absolute inset-0", game.bgGradient)} />
          
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 group-hover:from-white/20 transition-all duration-500" />

          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <StatusBadge status={game.status} />
            {game.isNew && (
              <Badge className="bg-green-500 text-white text-xs font-bold animate-bounce">NEW!</Badge>
            )}
            {game.isPopular && <Badge className="bg-red-500 text-white text-xs font-bold">🔥 HOT</Badge>}
          </div>

          <CardHeader className="relative z-10 pb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="text-6xl mb-2 drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                {game.emoji}
              </div>
            </div>
            <CardTitle className={cn("text-2xl font-bold text-center mb-2", game.textColor)}>
              {game.title}
            </CardTitle>
            <p className={cn("text-center text-sm leading-relaxed", game.textColor, "opacity-90")}>
              {game.description}
            </p>
          </CardHeader>

          <CardContent className="relative z-10 space-y-4">
            {game.id === "gacha" || game.id === "claw" ? (
              <>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-black/20 rounded-lg p-3 backdrop-blur-sm">
                    <div className={cn("text-lg font-bold", game.textColor)}>{game.players}</div>
                    <div className={cn("text-xs opacity-80", game.textColor)}>Players</div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3 backdrop-blur-sm">
                    <div className={cn("text-lg font-bold", game.textColor)}>{game.rewards}</div>
                    <div className={cn("text-xs opacity-80", game.textColor)}>Rewards</div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Button
                    size="sm"
                    className={cn(
                      "font-bold shadow-lg transition-all duration-300",
                      game.status === "available"
                        ? "bg-white/20 hover:bg-white/30 text-white border-white/30 hover:scale-105"
                        : "bg-white/10 text-white/70 border-white/20 cursor-not-allowed",
                    )}
                    disabled={game.status !== "available"}
                  >
                    {game.status === "available" ? (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Play Now
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Coming Soon
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="bg-black/20 rounded-lg p-6 backdrop-blur-sm">
                  <div className={cn("text-2xl font-bold mb-2", game.textColor)}>Coming Soon</div>
                  <div className={cn("text-sm opacity-80", game.textColor)}>Stay tuned for updates!</div>
                </div>
              </div>
            )}
          </CardContent>

          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </Card>
      ))}
    </div>
  )
}