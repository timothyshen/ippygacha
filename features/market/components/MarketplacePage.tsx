"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Store, Search, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { MarketplaceBuyingModal } from "./MarketplaceBuyingModal"
import { Header } from "@/features/shared/components/Header"
import { MarketStats } from "./MarketStats"
import { useActiveListings } from "@/hooks/marketplace/useMarketplace"
import Footer from "@/features/shared/components/Footer"

interface TradeActivity {
  id: string
  type: "sale" | "listing" | "purchase"
  item: { name: string; tokenId: string }
  from: string
  price?: number
  timestamp: string
  status: "completed"
  txnHash?: string
}

// Database activity interface
interface DBActivity {
  id: string
  activityType: string
  metadata: {
    tokenId?: string
    nftAddress?: string
    price?: string
    timestamp?: string
  }
  txnHash?: string | null
  createdAt: string
  user: {
    walletAddress: string
    username?: string | null
  }
}

// Format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`
}

// Shorten wallet address
function shortenAddress(address: string): string {
  if (!address) return "Unknown"
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Transform database activity to TradeActivity
function transformActivity(activity: DBActivity): TradeActivity {
  const typeMap: Record<string, "listing" | "purchase" | "sale"> = {
    MARKETPLACE_LIST: "listing",
    MARKETPLACE_PURCHASE: "purchase",
    MARKETPLACE_SALE: "sale",
  }

  return {
    id: activity.id,
    type: typeMap[activity.activityType] || "listing",
    item: {
      name: `IPPY #${activity.metadata?.tokenId || "?"}`,
      tokenId: activity.metadata?.tokenId || "?",
    },
    from: activity.user?.username || shortenAddress(activity.user?.walletAddress || ""),
    price: activity.metadata?.price ? parseFloat(activity.metadata.price) : undefined,
    timestamp: formatRelativeTime(activity.createdAt),
    status: "completed",
    txnHash: activity.txnHash || undefined,
  }
}

export const MarketplacePage = React.memo(() => {
  const [searchTerm, setSearchTerm] = useState("")
  const [trades, setTrades] = useState<TradeActivity[]>([])
  const [tradesLoading, setTradesLoading] = useState(true)
  const [selectedCollection, setSelectedCollection] = useState("all")
  const [selectedVersion] = useState("all")

  // Use real marketplace data
  const { listings: marketplaceListings, loading, error, refetch } = useActiveListings()

  // Fetch marketplace activities
  const fetchActivities = useCallback(async () => {
    try {
      setTradesLoading(true)
      const response = await fetch(
        "/api/activities?activityTypes=MARKETPLACE_LIST,MARKETPLACE_PURCHASE,MARKETPLACE_SALE&limit=20"
      )
      if (response.ok) {
        const data = await response.json()
        const transformedActivities = (data.activities || []).map(transformActivity)
        setTrades(transformedActivities)
      }
    } catch (err) {
      console.error("Error fetching activities:", err)
    } finally {
      setTradesLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  // Filter marketplace listings
  const filteredListings = marketplaceListings.filter((listing) => {
    // If there's a search term, only match if metadata name contains it
    // If no search term, show all items
    const matchesSearch = searchTerm.trim() === ""
      ? true
      : (listing.metadata?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
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
      case "purchase":
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
        <Header name="NFT Marketplace" subtitle="Buy & Sell Premium NFTs" isDark={true} />

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
                  <MarketplaceBuyingModal
                    key={`${listing.nftAddress}-${listing.tokenId}`}
                    listing={listing}
                    onPurchaseSuccess={refetch}
                  />
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
                {tradesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : trades.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>No marketplace activity yet</p>
                    <p className="text-sm mt-2">Activities will appear here when users list or purchase NFTs</p>
                  </div>
                ) : (
                  trades.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-lg border border-slate-200 hover:bg-slate-100/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-slate-800">
                            {item.item.name}
                          </span>
                          <Badge className={cn("text-xs", getActivityColor(item.type))}>{item.type.toUpperCase()}</Badge>
                          <Badge variant="outline" className="text-xs">
                            IPPY
                          </Badge>
                        </div>

                        <div className="text-sm text-slate-600">
                          {item.type === "sale" && (
                            <>
                              Sold by <span className="font-medium">{item.from}</span>
                            </>
                          )}
                          {item.type === "listing" && (
                            <>
                              Listed by <span className="font-medium">{item.from}</span>
                            </>
                          )}
                          {item.type === "purchase" && (
                            <>
                              Purchased by <span className="font-medium">{item.from}</span>
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
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500">{item.timestamp}</span>
                          {item.txnHash && (
                            <a
                              href={`https://aeneid.storyscan.io/tx/${item.txnHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
