import { Card, CardContent } from "@/components/ui/card"

interface MarketStatsProps {
    totalListings: number
    hiddenItems: number
    blindBoxes: number
    averagePrice: number
    featuredItems: number
    limitedItems: number
}

export const MarketStats = ({ totalListings, hiddenItems, blindBoxes, averagePrice, featuredItems, limitedItems }: MarketStatsProps) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 pt-20 sm:pt-24 md:pt-28">
            <Card className="bg-white/80 border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">{totalListings}</div>
                    <div className="text-sm text-slate-600 font-medium">Total Listings</div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-purple-700 mb-1">{hiddenItems}</div>
                    <div className="text-sm text-purple-600 font-medium">Hidden Variants</div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-amber-700 mb-1">{blindBoxes}</div>
                    <div className="text-sm text-amber-600 font-medium">Mystery Boxes</div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-amber-700 mb-1">{averagePrice}</div>
                    <div className="text-sm text-amber-600 font-medium">Avg. Price</div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-green-700 mb-1">{featuredItems}</div>
                    <div className="text-sm text-green-600 font-medium">Featured</div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-300 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-red-700 mb-1">{limitedItems}</div>
                    <div className="text-sm text-red-600 font-medium">Limited Edition</div>
                </CardContent>
            </Card>
        </div>
    )
}