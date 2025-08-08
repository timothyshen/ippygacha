"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Store, Loader2, AlertCircle, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { MarketplaceBuyingModal } from "@/components/market/MarketplaceBuyingModal"
import { Header } from "@/components/Header"
import { MarketStats } from "@/components/market/MarketStats"
import { useActiveListings } from "@/hooks/marketplace/useMarketplace"

// Update the GachaItem interface to include version
interface GachaItem {
  id: string
  name: string
  collection: "ippy"
  emoji: string
  description: string
  version: "standard" | "hidden"
}

interface MarketListing {
  id: string
  item?: GachaItem // Make item optional for blind boxes
  blindBox?: {
    id: string
    name: string
    description: string
    emoji: string
  }
  seller: string
  price: number
  quantity: number
  featured?: boolean
  limited?: boolean
  discount?: number
  isBlindBox?: boolean // Add this flag
}
interface TradeActivity {
  id: string
  type: "sale" | "listing" | "offer" | "transfer"
  item: GachaItem | { isBlindBox: true; id: string; name: string; emoji: string }
  from?: string
  to?: string
  price?: number
  timestamp: string
  status: "completed" | "pending" | "cancelled"
}

// Update the mock trades with collection-based items
const MOCK_ACTIVITY: TradeActivity[] = [
  {
    id: "1",
    type: "sale",
    item: {
      id: "8",
      name: "Dragon Egg",
      collection: "ippy",
      emoji: "🥚",
      description: "Ancient and powerful",
      version: "standard",
    },
    from: "DragonMaster",
    to: "FantasyCollector",
    price: 35,
    timestamp: "2 minutes ago",
    status: "completed",
  },
  {
    id: "2",
    type: "listing",
    item: {
      id: "9h",
      name: "Phoenix Feather",
      collection: "ippy",
      emoji: "🪶",
      description: "Burns with eternal flame",
      version: "hidden",
    },
    from: "FireBird",
    price: 85,
    timestamp: "5 minutes ago",
    status: "pending",
  },
  {
    id: "3",
    type: "sale",
    item: {
      id: "16h",
      name: "Moon Crystal",
      collection: "ippy",
      emoji: "🌙",
      description: "Lunar energy",
      version: "hidden",
    },
    from: "MoonWalker",
    to: "SpaceExplorer",
    price: 180,
    timestamp: "12 minutes ago",
    status: "completed",
  },
  {
    id: "4",
    type: "offer",
    item: {
      id: "4",
      name: "Magic Wand",
      collection: "ippy",
      emoji: "🪄",
      description: "Sparkles with mystery",
      version: "standard",
    },
    from: "WizardKing",
    to: "MagicUser",
    price: 15,
    timestamp: "18 minutes ago",
    status: "pending",
  },
  {
    id: "5",
    type: "sale",
    item: {
      isBlindBox: true,
      id: "bb1",
      name: "Mystery Premium Box",
      emoji: "📦",
    },
    from: "MysteryTrader",
    to: "BoxCollector",
    price: 8,
    timestamp: "25 minutes ago",
    status: "completed",
  },
  {
    id: "6",
    type: "transfer",
    item: {
      id: "11h",
      name: "Laser Sword",
      collection: "ippy",
      emoji: "⚡",
      description: "Futuristic weapon",
      version: "hidden",
    },
    from: "TechMaster",
    to: "CyberWarrior",
    timestamp: "1 hour ago",
    status: "completed",
  },
]

export default function Market() {
  const [searchTerm, setSearchTerm] = useState("")
  const [trades] = useState<TradeActivity[]>(MOCK_ACTIVITY)
  const [selectedCollection, setSelectedCollection] = useState("all")
  const [selectedVersion, setSelectedVersion] = useState("all")

  // Use real marketplace data
  const { listings: marketplaceListings, loading, error, refetch } = useActiveListings()

  // Filter marketplace listings
  const filteredListings = marketplaceListings.filter((listing) => {
    const matchesSearch = listing.metadata?.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase()) ?? true
    const matchesCollection = selectedCollection === "all" || listing.metadata?.collection === selectedCollection
    const matchesVersion = selectedVersion === "all" || listing.metadata?.version === selectedVersion
    return matchesSearch && matchesCollection && matchesVersion
  })

  const getActivityColor = (type: string) => {
    switch (type) {
      case "sale":
        return "text-green-600 bg-green-50 border-green-200"
      case "listing":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "offer":
        return "text-orange-600 bg-orange-50 border-orange-200"
      case "transfer":
        return "text-purple-600 bg-purple-50 border-purple-200"
      default:
        return "text-slate-600 bg-slate-50 border-slate-200"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4 pt-20">
        <div className="max-w-7xl mx-auto">
          <Header name="NFT Marketplace" subtitle="Buy & Sell Premium NFTs" isDark={true} isMarketplace={false} />
          <Card className="bg-white/80 border-slate-200 shadow-lg backdrop-blur-sm">
            <CardContent className="p-16 text-center">
              <Loader2 className="w-20 h-20 text-blue-500 mx-auto mb-6 animate-spin" />
              <h3 className="text-2xl font-bold text-slate-700 mb-3">Loading Marketplace</h3>
              <p className="text-slate-500 text-lg">Fetching active listings from the blockchain...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4 pt-20">
        <div className="max-w-7xl mx-auto">
          <Header name="NFT Marketplace" subtitle="Buy & Sell Premium NFTs" isDark={true} isMarketplace={true} />
          <Card className="bg-white/80 border-slate-200 shadow-lg backdrop-blur-sm">
            <CardContent className="p-16 text-center">
              <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-700 mb-3">Failed to Load Marketplace</h3>
              <p className="text-slate-500 text-lg mb-6">{error}</p>
              <Button onClick={refetch} className="bg-blue-600 hover:bg-blue-700">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        <Header name="NFT Marketplace" subtitle="Buy & Sell Premium NFTs" isDark={true} isMarketplace={true} />

        {/* Market Stats */}
        <MarketStats totalListings={marketplaceListings.length} hiddenItems={0} blindBoxes={0} averagePrice={0} featuredItems={0} limitedItems={0} />

        {/* Featured Items Section
        {featuredListings.length > 0 && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 mb-8 shadow-xl">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center gap-3 text-xl">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                Featured Designer Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredListings.slice(0, 3).map((listing) => (
                  <Card
                    key={listing.id}
                    className={cn(
                      "transition-all duration-300 cursor-pointer border-2 shadow-lg hover:shadow-xl hover:scale-105",
                      COLLECTION_COLORS[listing.item?.collection || "ippy"],
                      listing.item && VERSION_STYLES[listing.item.version],
                      listing.item && COLLECTION_GLOW[listing.item.collection],
                      "ring-2 ring-blue-300/50",
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="text-4xl text-center mb-3 drop-shadow-sm">{listing.item?.emoji}</div>
                      <CardTitle className="text-base text-center font-bold leading-tight">
                        {listing.item?.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <p className="text-xs text-center opacity-80 leading-relaxed">{listing.item?.description}</p>

                      <div className="flex justify-between items-center">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs font-bold bg-pink-100 text-pink-800 border-pink-300",

                          )}
                        >
                          {listing.item?.collection.toUpperCase()}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs font-bold">FEATURED</Badge>
                      </div>

                      <div className="text-center space-y-2">
                        <div className="text-sm font-semibold text-slate-600">Seller: {listing.seller}</div>
                        <div className="flex items-center justify-center gap-1 mb-3">
                          <Coins className="w-4 h-4 text-amber-600" />
                          <span className="font-bold text-lg">{listing.price}</span>
                        </div>

                        <Button
                          onClick={() => buyItem(listing)}
                          disabled={coins < listing.price}
                          className={cn(
                            "w-full font-bold shadow-lg hover:shadow-xl transition-all duration-300",
                            coins >= listing.price
                              ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                              : "bg-slate-300 text-slate-500 cursor-not-allowed",
                          )}
                          size="sm"
                        >
                          {coins >= listing.price ? "Buy Now" : `Need ${listing.price - coins} more coins`}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )} */}

        <Tabs defaultValue="marketplace" className="space-y-6">
          <TabsList className="bg-white/80 border-slate-200 shadow-lg backdrop-blur-sm">
            <TabsTrigger
              value="marketplace"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Store className="w-4 h-4 mr-2" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Activity className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace" className="space-y-6">
            {/* Search and Filters */}
            <Card className="bg-white/80 border-slate-200 shadow-lg backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-slate-800 flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  Search & Filter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search NFTs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-white/80"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedCollection === "all" ? "default" : "outline"}
                      onClick={() => setSelectedCollection("all")}
                      className={cn(
                        selectedCollection === "all"
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      All Collections
                    </Button>
                    <Button
                      variant={selectedCollection === "ippy" ? "default" : "outline"}
                      onClick={() => setSelectedCollection("ippy")}
                      className={cn(
                        selectedCollection === "ippy"
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      IPPY
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Marketplace Items */}
            {filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredListings.map((listing) => (
                  <MarketplaceBuyingModal key={`${listing.nftAddress}-${listing.tokenId}`} listing={listing} />
                ))}
              </div>
            ) : (
              <Card className="bg-white/80 border-slate-200 shadow-lg backdrop-blur-sm">
                <CardContent className="p-16 text-center">
                  <Store className="w-20 h-20 text-slate-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-slate-700 mb-3">
                    {marketplaceListings.length === 0 ? "No Items Listed" : "No Items Found"}
                  </h3>
                  <p className="text-slate-500 text-lg">
                    {marketplaceListings.length === 0
                      ? "No NFTs are currently listed for sale on the marketplace."
                      : "No items match your current search criteria."
                    }
                  </p>
                  {marketplaceListings.length === 0 && (
                    <Button onClick={refetch} className="mt-4 bg-blue-600 hover:bg-blue-700">
                      Refresh Marketplace
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-white/80 border-slate-200 shadow-lg backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-slate-800 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {trades.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-lg border border-slate-200 hover:bg-slate-100/50 transition-colors"
                  >

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-800">
                          {"isBlindBox" in item.item ? item.item.name : item.item.name}
                        </span>
                        <Badge className={cn("text-xs", getActivityColor(item.type))}>{item.type.toUpperCase()}</Badge>
                        {"collection" in item.item && (
                          <Badge variant="outline" className="text-xs">
                            {item.item.collection.toUpperCase()}
                          </Badge>
                        )}
                      </div>

                      <div className="text-sm text-slate-600">
                        {item.type === "sale" && (
                          <>
                            Sold by <span className="font-medium">{item.from}</span> to{" "}
                            <span className="font-medium">{item.to}</span>
                          </>
                        )}
                        {item.type === "listing" && (
                          <>
                            Listed by <span className="font-medium">{item.from}</span>
                          </>
                        )}
                        {item.type === "offer" && (
                          <>
                            Offer from <span className="font-medium">{item.from}</span> to{" "}
                            <span className="font-medium">{item.to}</span>
                          </>
                        )}
                        {item.type === "transfer" && (
                          <>
                            Transferred from <span className="font-medium">{item.from}</span> to{" "}
                            <span className="font-medium">{item.to}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      {item.price && (
                        <div className="flex items-center gap-1 text-slate-800 font-bold">
                          {item.price} IP
                        </div>
                      )}
                      <div className="text-xs text-slate-500 mt-1">{item.timestamp}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
