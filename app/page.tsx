"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, Sparkles, Zap, Star, Trophy, Users, Play, ArrowRight, Coins } from "lucide-react"
import { cn } from "@/lib/utils"
import LoginButton from "@/components/LoginButton"
import { ProfileSidebar } from "@/components/ProfileSidebar"

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



export default function HomePage() {
  const [hoveredGame, setHoveredGame] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)


  const handleGameClick = (game: Game) => {
    if (game.status === "available" && game.href) {
      // Navigate to available game
      window.location.href = game.href
    } else {
      // Show coming soon message
      alert(`${game.title} is ${game.status === "beta" ? "in beta testing" : "coming soon"}! Stay tuned for updates.`)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="absolute text-4xl opacity-10 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            >
              {["🎮", "🎰", "🏆", "⭐", "🎯", "🚀", "💎", "🎪"][Math.floor(Math.random() * 8)]}
            </div>
          ))}
        </div>

        <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col mb-12 pt-16 md:pt-0 relative">
              {/* Login and Sound Controls - Positioned at top right on desktop, top on mobile */}
              <div className="fixed top-4 right-4 z-20 flex gap-3 items-center h-10">
                <LoginButton setSidebarOpen={setSidebarOpen} />
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 md:gap-4 mb-4 flex-wrap">
                  <div className="relative">
                    <Star className="w-8 h-8 md:w-12 md:h-12 text-yellow-400 drop-shadow-lg animate-pulse" />
                    <div className="absolute inset-0 w-8 h-8 md:w-12 md:h-12 text-yellow-400 animate-ping opacity-20">
                      <Star className="w-full h-full" />
                    </div>
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-7xl font-bold text-white tracking-tight drop-shadow-2xl">
                    Ippy Playground
                  </h1>
                  <div className="relative">
                    <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-pink-400 drop-shadow-lg animate-pulse" />
                    <div className="absolute inset-0 w-8 h-8 md:w-12 md:h-12 text-pink-400 animate-ping opacity-20">
                      <Sparkles className="w-full h-full" />
                    </div>
                  </div>
                </div>
                <p className="text-lg md:text-2xl text-purple-200 font-medium mb-2">🌟 Welcome to the Ippy Verse 🌟</p>
                <p className="text-base md:text-lg text-purple-300 max-w-2xl mx-auto px-4">
                  Join the ultimate gaming experience through Gacha, Claw machines, and more exciting adventures!
                </p>
              </div>
            </div>

            {/* Games Grid */}
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
                  {/* Background Gradient */}
                  <div className={cn("absolute inset-0", game.bgGradient)} />

                  {/* Animated Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 group-hover:from-white/20 transition-all duration-500" />

                  {/* Special Badges */}
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
                    {/* Game Stats - Only show for Gacha and Claw */}
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

                        {/* Difficulty & Action */}
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
                      /* Simplified Coming Soon Content */
                      <div className="text-center py-8">
                        <div className="bg-black/20 rounded-lg p-6 backdrop-blur-sm">
                          <div className={cn("text-2xl font-bold mb-2", game.textColor)}>Coming Soon</div>
                          <div className={cn("text-sm opacity-80", game.textColor)}>Stay tuned for updates!</div>
                        </div>
                      </div>
                    )}
                  </CardContent>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </Card>
              ))}
            </div>

            {/* Footer Info */}
            <div className="text-center mt-16 space-y-4">
              <div className="flex items-center justify-center gap-6 text-purple-200">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">5K+ Players</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  <span className="font-medium">100+ Collectibles</span>
                </div>
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5" />
                  <span className="font-medium">Daily Rewards</span>
                </div>
              </div>
              <p className="text-purple-300 text-sm max-w-2xl mx-auto">
                Join thousands of players in the Ippy Verse! Collect, trade, and compete across multiple game modes. New
                games and features added regularly.
              </p>
            </div>
            <div className="container mx-auto px-4">
              <p className="text-center">
                &copy; {new Date().getFullYear()} Gacha Machine. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
      <ProfileSidebar isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
    </>
  )
}
