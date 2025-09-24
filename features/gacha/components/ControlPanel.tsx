import { Gift, Package, Coins } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ControlPanelProps {
    coins: number
    onAddCoin: () => void
    onOpenInventory: () => void
    onOpenMarket: () => void
}

export const ControlPanel = ({
    coins,
    onAddCoin,
    onOpenInventory,
    onOpenMarket,
}: ControlPanelProps) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 p-2 sm:p-4 flex justify-center items-center z-50">
            <div className="flex items-center gap-1 sm:gap-2 md:gap-4 px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl border-2 shadow-lg bg-white/80 backdrop-blur-md border-purple-200/50 w-full max-w-sm sm:max-w-md md:max-w-lg">
                {/* Coin Balance */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onAddCoin}
                    className={cn(
                        "flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-300",
                        "bg-white/80 backdrop-blur-md flex-1",
                        "hover:scale-105 active:scale-95 min-w-0",
                    )}
                >
                    <Coins className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base truncate">{coins}</span>
                </Button>

                {/* Inventory Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onOpenInventory}
                    className={cn(
                        "flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-300",
                        "bg-white/80 backdrop-blur-md flex-1",
                        "hover:scale-105 active:scale-95 min-w-0",
                    )}
                >
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="font-medium text-xs sm:text-sm md:text-base hidden xs:inline sm:inline truncate">Inventory</span>
                </Button>

                {/* Market Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onOpenMarket}
                    className={cn(
                        "flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-300",
                        "bg-white/80 backdrop-blur-md flex-1",
                        "hover:scale-105 active:scale-95 min-w-0",
                    )}
                >
                    <Gift className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="font-medium text-xs sm:text-sm md:text-base hidden xs:inline sm:inline truncate">Market</span>
                </Button>
            </div>
        </div>
    )
} 