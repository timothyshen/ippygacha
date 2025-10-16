import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps {
    value: number | string
    label: string
    cardClass: string
    valueClass: string
    labelClass: string
}

const StatCard = ({ value, label, cardClass, valueClass, labelClass }: StatCardProps) => (
    <Card className={cardClass}>
        <CardContent className="p-4 text-center">
            <div className={valueClass}>{value}</div>
            <div className={labelClass}>{label}</div>
        </CardContent>
    </Card>
)

interface MarketStatsProps {
    totalListings: number
    hiddenItems: number
    blindBoxes: number
    averagePrice: number
    featuredItems: number
    limitedItems: number
}

export const MarketStats = ({ totalListings, hiddenItems, blindBoxes, averagePrice, featuredItems, limitedItems }: MarketStatsProps) => {
    const stats: StatCardProps[] = [
        {
            value: totalListings,
            label: "Total Listings",
            cardClass: "bg-white/80 border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm",
            valueClass: "text-2xl md:text-3xl font-bold text-slate-800 mb-1",
            labelClass: "text-sm text-slate-600 font-medium",
        },
        {
            value: hiddenItems,
            label: "Hidden Variants",
            cardClass: "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300 shadow-lg hover:shadow-xl transition-all duration-300",
            valueClass: "text-2xl md:text-3xl font-bold text-purple-700 mb-1",
            labelClass: "text-sm text-purple-600 font-medium",
        },
        {
            value: blindBoxes,
            label: "Mystery Boxes",
            cardClass: "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 shadow-lg hover:shadow-xl transition-all duration-300",
            valueClass: "text-2xl md:text-3xl font-bold text-amber-700 mb-1",
            labelClass: "text-sm text-amber-600 font-medium",
        },
        {
            value: averagePrice,
            label: "Avg. Price",
            cardClass: "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300 shadow-lg hover:shadow-xl transition-all duration-300",
            valueClass: "text-2xl md:text-3xl font-bold text-amber-700 mb-1",
            labelClass: "text-sm text-amber-600 font-medium",
        },
        {
            value: featuredItems,
            label: "Featured",
            cardClass: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-lg hover:shadow-xl transition-all duration-300",
            valueClass: "text-2xl md:text-3xl font-bold text-green-700 mb-1",
            labelClass: "text-sm text-green-600 font-medium",
        },
        {
            value: limitedItems,
            label: "Limited Edition",
            cardClass: "bg-gradient-to-br from-red-50 to-pink-50 border-red-300 shadow-lg hover:shadow-xl transition-all duration-300",
            valueClass: "text-2xl md:text-3xl font-bold text-red-700 mb-1",
            labelClass: "text-sm text-red-600 font-medium",
        },
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 pt-10 sm:pt-12 md:pt-14">
            {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
            ))}
        </div>
    )
}
