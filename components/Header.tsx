import { Crown, Package, Store, User, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"


export const Header = ({ name, subtitle, isDark, isMarketplace }: { name: string, subtitle: string, isDark: boolean, isMarketplace: boolean }) => {
    const { login, logout, user } = usePrivy()
    const router = useRouter()

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
        <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 md:p-6 flex justify-center h-20">
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
                    {user && (
                        <div className="px-2 py-1 sm:px-3 sm:py-2 border-1 border-slate-200 rounded-md text-xs sm:text-sm bg-white/80 backdrop-blur-sm font-medium transition-all duration-300 shadow-lg">
                            {sliceAddress(user?.wallet?.address || "")}
                        </div>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/80 border-slate-200 text-slate-700 hover:bg-white backdrop-blur-sm sm:size-default lg:size-lg"
                        onClick={handleMarketplaceClick}
                    >
                        <Home className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">{isMarketplace ? "Inventory" : "Marketplace"}</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/80 border-slate-200 text-slate-700 hover:bg-white backdrop-blur-sm sm:size-default lg:size-lg"
                        onClick={handleHomeClick}
                    >
                        <Home className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Home</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                            "text-xs sm:text-sm md:text-base font-medium transition-all duration-300 shadow-lg hover:shadow-xl",
                            "bg-white/80 border-slate-200 text-slate-700 hover:bg-white backdrop-blur-sm",
                            "sm:size-default lg:size-lg"
                        )}
                        onClick={user ? logout : login}
                    >
                        <User className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">{user ? "Logout" : "Login"}</span>
                    </Button>
                </div>
            </div>
        </div>
    )
} 