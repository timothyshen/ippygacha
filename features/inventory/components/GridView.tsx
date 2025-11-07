"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Package, Loader2 } from "lucide-react"
import { GachaItemWithCount } from "@/features/inventory/types"
import { ListingModal } from "./ListingModal"

interface GridViewProps {
    items: GachaItemWithCount[]
    inventoryLength: number
}

export function GridView({ items, inventoryLength }: GridViewProps) {
    // Check if any items are still loading metadata
    const hasLoadingItems = items.some((item) => item.metadataLoading);

    // Show loading state if metadata is still being fetched
    if (hasLoadingItems) {
        return (
            <Card className="bg-white/80 border-slate-200 shadow-lg backdrop-blur-sm mx-0.5 sm:mx-0">
                <CardContent className="p-8 sm:p-12 md:p-16 text-center">
                    <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                        <h3 className="text-xl font-semibold text-slate-700">Loading Collection</h3>
                        <p className="text-slate-500">
                            Fetching your NFT metadata...
                        </p>
                        <div className="w-48 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (items.length === 0) {
        return (
            <Card className="bg-white/80 border-slate-200 shadow-lg backdrop-blur-sm mx-0.5 sm:mx-0">
                <CardContent className="p-8 sm:p-12 md:p-16 text-center">
                    <Package className="w-20 h-20 text-slate-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-slate-700 mb-3">No Items Found</h3>
                    <p className="text-slate-500 text-lg">
                        {inventoryLength === 0
                            ? "Your collection is empty. Start pulling some gacha to build your collection!"
                            : "No items match your current filters. Try adjusting your search criteria."}
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 px-0.5 sm:px-0">
            {items.map((item, index) => (
                <ListingModal
                    item={item}
                    key={`${item.id}-${index}`}
                />
            ))}
        </div>
    )
} 