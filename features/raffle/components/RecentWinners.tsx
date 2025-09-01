import React from "react"
import { Trophy, Star, Clock, Gift, Coins, ImageIcon, Heart } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Winner } from "../types"

interface RecentWinnersProps {
  recentWinners: Winner[]
}

export const RecentWinners = React.memo(({ recentWinners }: RecentWinnersProps) => {
  const getPrizeIcon = (prizeName: string) => {
    if (prizeName.includes("1 IP")) return <Coins className="h-5 w-5 text-yellow-500" />
    if (prizeName.includes("2 IP")) return <Coins className="h-5 w-5 text-green-500" />
    if (prizeName.includes("0.5 IP")) return <Coins className="h-5 w-5 text-blue-500" />
    if (prizeName.includes("5 IP")) return <Coins className="h-5 w-5 text-purple-500" />
    if (prizeName.includes("NFT")) return <ImageIcon className="h-5 w-5 text-pink-500" />
    if (prizeName.includes("Thank You")) return <Heart className="h-5 w-5 text-red-500" />
    return <Gift className="h-5 w-5 text-primary" />
  }

  return (
    <Card className="border-2 border-primary/20 h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Trophy className="h-5 w-5" />
          Recent Winners
        </CardTitle>
        <CardDescription>See who's been lucky lately! Your prize could be next on this list.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentWinners.map((winner, index) => (
            <div
              key={winner.id}
              className={`p-4 rounded-lg border transition-all duration-300 ${
                index === 0 && winner.date === "Just now"
                  ? "bg-accent/10 border-accent animate-pulse shadow-lg"
                  : "bg-card border-border hover:border-primary/30 hover:shadow-md"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {index === 0 && winner.date === "Just now" ? (
                      <div className="relative">
                        <Star className="h-6 w-6 text-yellow-400 fill-current animate-pulse" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-ping"></div>
                      </div>
                    ) : (
                      getPrizeIcon(winner.prize)
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-card-foreground">{winner.name}</p>
                    <p className="text-sm text-muted-foreground">Won: {winner.prize}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={index === 0 && winner.date === "Just now" ? "default" : "secondary"}
                    className="mb-1"
                  >
                    {winner.value}
                  </Badge>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {winner.date}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
})

RecentWinners.displayName = "RecentWinners"