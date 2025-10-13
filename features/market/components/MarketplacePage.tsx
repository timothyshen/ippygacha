"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Store, Loader2, AlertCircle, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { MarketplaceBuyingModal } from "./MarketplaceBuyingModal"
import { Header } from "@/features/shared/components/Header"
import { MarketStats } from "./MarketStats"
import { useActiveListings } from "@/hooks/marketplace/useMarketplace"
import Footer from "@/features/shared/components/Footer"

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

export const MarketplacePage = React.memo(() => {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading the marketplace...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Unable to load marketplace</h2>
              <p className="text-slate-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        <Header name="NFT Marketplace" subtitle="Buy & Sell Premium NFTs" isDark={true} isMarketplace={false} />

        {/* Market Stats */}
        <MarketStats totalListings={marketplaceListings.length} hiddenItems={0} blindBoxes={0} averagePrice={0} featuredItems={0} limitedItems={0} />

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
        <Footer />
      </div>
    </div>
  )
})

MarketplacePage.displayName = "MarketplacePage"