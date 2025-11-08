"use client"
import { cn } from "@/lib/utils"
import { GachaItem } from "@/types/gacha"
import { COLLECTION_COLORS } from "@/types/gacha"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface RevealedItemViewProps {
    item: GachaItem
    onClose: () => void
}

export const RevealedItemView = ({ item, onClose }: RevealedItemViewProps) => {
    return (
        <>
            {/* Revealed Item Display */}
            <div className="mb-8">
                <div className="item-reveal text-center">
                    <div
                        className={cn(
                            "mx-auto w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 p-6 md:p-8 flex flex-col items-center justify-center mb-6 transition-all duration-500 shadow-xl",
                            COLLECTION_COLORS.ippy,
                            "legendary-glow"
                        )}
                    >
                        <div className="text-4xl md:text-5xl mb-2 drop-shadow-lg">
                            <img
                                src={item.image}
                                alt={item.name}
                                width={100}
                                height={100}
                                onError={(e) => {
                                    e.currentTarget.src = '/imageAssets/placeholder.png';
                                }}
                            />
                        </div>
                        <div className="text-xs md:text-sm font-bold text-center leading-tight">
                            {item.name}
                        </div>
                    </div>
                    <h2 className={cn("text-2xl md:text-3xl font-bold mb-3", "text-black")}>
                        {item.name}
                    </h2>
                    <p className={cn("mb-4 text-base md:text-lg font-medium", "text-black")}>
                        {item.description}
                    </p>
                    <div className="flex justify-center gap-3 mb-4">
                        <Badge variant="secondary" className="text-sm font-bold px-3 py-1">
                            {item.collection.toUpperCase()}
                        </Badge>
                        <Badge
                            variant={item.version === "hidden" ? "default" : "outline"}
                            className={`text-sm font-bold px-3 py-1 ${
                                item.version === "hidden"
                                    ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"
                                    : ""
                            }`}
                        >
                            {item.version.toUpperCase()}
                        </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {item.attributes?.map((attribute, idx) => (
                            <Badge key={idx} variant="outline" className="text-sm font-bold px-3 py-1">
                                {attribute.trait_type}: {attribute.value}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>

            {/* View Inventory Button */}
            <Button
                onClick={onClose}
                size="lg"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
                ✓ View in Inventory
            </Button>
        </>
    )
}
