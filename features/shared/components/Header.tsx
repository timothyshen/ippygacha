import React, { useState, useEffect } from "react"
import { Crown, Package, Store, User, Home, LogOut, PackageOpen, ShoppingBag } from "lucide-react"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Filter } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Clock, Zap } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"


export const Header = React.memo(({ name, subtitle, isDark, isMarketplace }: { name: string, subtitle: string, isDark: boolean, isMarketplace: boolean }) => {
    const { login, logout, user } = usePrivy()
    const router = useRouter()
    const [userEntries, setUserEntries] = useState<[]>([])




    const sliceAddress = (address: string) => {
        return `${address.slice(0, 4)}...${address.slice(-3)}`
    }

    const handleHomeClick = () => {
        router.push('/')
    }

    const handleMarketplaceClick = () => {
        if (isMarketplace) {
            router.push('/market')
        } else {
            router.push('/inventory')
        }
    }

    return (
        <div className="sticky p-3 sm:p-4 md:p-6 flex justify-center h-20">
            <div className="flex justify-between items-center w-full max-w-7xl">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="relative flex-shrink-0">
                        <Crown className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-amber-400 drop-shadow-lg" />
                        <div className="absolute inset-0 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-amber-400 animate-ping opacity-20">
                            <Crown className="w-full h-full" />
                        </div>
                    </div>
                    <div className="min-w-0 flex-1">
                        <h1
                            className={cn(
                                "text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold tracking-tight truncate",
                                isDark ? "text-slate-800" : "text-white",
                                "drop-shadow-lg",
                            )}
                        >
                            {name}
                        </h1>
                        <p
                            className={cn(
                                "text-xs sm:text-sm md:text-base font-medium tracking-wide hidden sm:block truncate",
                                isDark ? "text-slate-600" : "text-white",
                            )}
                        >
                            {subtitle}
                        </p>
                    </div>
                </div>

                <div className="flex gap-1 sm:gap-2 md:gap-3 lg:gap-4 items-center flex-shrink-0">

                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm md:text-base font-medium transition-all duration-300 shadow-lg hover:shadow-xl bg-white/80 border-slate-200 text-slate-700 hover:bg-white backdrop-blur-sm sm:size-default lg:size-lg"
                        onClick={handleMarketplaceClick}
                    >
                        <Home className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">{isMarketplace ? "Marketplace" : "Inventory"}</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm md:text-base font-medium transition-all duration-300 shadow-lg hover:shadow-xl bg-white/80 border-slate-200 text-slate-700 hover:bg-white backdrop-blur-sm sm:size-default lg:size-lg"
                        onClick={handleHomeClick}
                    >
                        <Home className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Home</span>
                    </Button>
                    {!user && (<Button
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm md:text-base font-medium transition-all duration-300 shadow-lg hover:shadow-xl bg-white/80 border-slate-200 text-slate-700 hover:bg-white backdrop-blur-sm sm:size-default lg:size-lg"
                        onClick={login}
                    >
                        <User className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Login</span>
                    </Button>
                    )}
                    {user && (
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="sm:hidden" aria-label="Open filters">
                                <Filter className="h-4 w-4" />
                            </Button>
                            {/* Avatar trigger for right sidebar */}
                            <Sheet>
                                <SheetTrigger asChild>
                                    <button aria-label="Open profile sidebar" className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring hover:scale-105 transition-transform duration-200">
                                        <Avatar className="h-9 w-9 ring-2 ring-white/20 hover:ring-white/40 transition-all duration-200">
                                            <AvatarImage src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=256&q=60&auto=format&fit=crop" />
                                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">PL</AvatarFallback>
                                        </Avatar>
                                    </button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-full sm:max-w-sm bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-l-0 p-0">
                                    <SheetHeader className="px-6 pt-6 pb-8 border-b border-slate-200 dark:border-slate-700 shadow-sm bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                                        <SheetTitle className="flex items-center gap-4 text-left">
                                            <Avatar className="h-14 w-14 ring-4 ring-white/30 shadow-xl">
                                                <AvatarImage src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=256&q=60&auto=format&fit=crop" />
                                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-xl">PL</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                                                    {sliceAddress(user?.wallet?.address || "")}
                                                </div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                                                        Level 42
                                                    </span>
                                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                    <span>Active</span>
                                                </div>
                                            </div>
                                            <div>
                                                <Button variant="outline" size="sm" onClick={logout}>
                                                    <LogOut className="h-4 w-4" />
                                                    <span className="hidden sm:inline">Logout</span>
                                                </Button>
                                            </div>
                                        </SheetTitle>
                                    </SheetHeader>

                                    <div className="px-6 py-6 space-y-8">
                                        {/* Ranking and EXP */}
                                        <section className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                                    <Trophy className="h-4 w-4 text-yellow-500" />
                                                    Rank
                                                </h3>
                                                <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 font-semibold">
                                                    Diamond III
                                                </Badge>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                                                    <span>EXP Progress</span>
                                                    <span className="font-medium">3,420 / 5,000</span>
                                                </div>
                                                <Progress value={68} className="h-2" />
                                                <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                                                    1,580 EXP to next level
                                                </div>
                                            </div>
                                        </section>

                                        {/* Recent Activity */}
                                        {/* <section>
                                            <h3 className="text-sm font-semibold mb-4 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                Recent Activity
                                            </h3>
                                            <div className="space-y-3">
                                                {userEntries.map((entry, i) => (
                                                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200">
                                                        <div className={`p-2 rounded-full bg-blue-100 dark:bg-blue-900/30`}>
                                                            <Clock className={`h-4 w-4 text-blue-600 dark:text-blue-400`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                                <span className="font-semibold text-blue-600 dark:text-blue-400">Raffle Entry</span>
                                                            </div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{entry.timestamp}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section> */}

                                        {/* Quick Actions */}
                                        <section>
                                            <h3 className="text-sm font-semibold mb-4 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <Zap className="h-4 w-4" />
                                                Quick Actions
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                <Link href="/inventory" className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col items-center justify-center gap-3 hover:shadow-lg transition-all duration-200 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-600">
                                                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors duration-200">
                                                        <PackageOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Inventory</span>
                                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                                </Link>
                                                <Link href="/market" className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col items-center justify-center gap-3 hover:shadow-lg transition-all duration-200 bg-white dark:bg-slate-800 hover:border-green-300 dark:hover:border-green-600">
                                                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors duration-200">
                                                        <ShoppingBag className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Market</span>
                                                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                                </Link>
                                            </div>
                                        </section>

                                        {/* Stats Summary */}
                                        <section className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                                            <h3 className="text-sm font-semibold mb-3 text-purple-700 dark:text-purple-300">This Week</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="text-center">
                                                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">12</div>
                                                    <div className="text-xs text-purple-500 dark:text-purple-400">Games Played</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">8</div>
                                                    <div className="text-xs text-purple-500 dark:text-purple-400">Prizes Won</div>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
})

Header.displayName = "Header" 