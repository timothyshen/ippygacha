import { Star, Sparkles, Users, Trophy, Coins } from "lucide-react"

export function HeroHeader() {
  return (
    <>
      {/* Header */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col mb-12 pt-16 md:pt-0 relative">
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
      </div>
    </>
  )
}