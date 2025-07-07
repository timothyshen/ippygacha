"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Store, Coins, Star, Filter, Search } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { BuyingModal } from "@/components/market/BuyingModal"
import { Header } from "@/components/Header"
import { MarketStats } from "@/components/market/MarketStats"

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

// Collection-based colors and styles
const COLLECTION_COLORS = {
  ippy: "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500",
}

const COLLECTION_GLOW = {
  ippy: "hover:shadow-pink-200/50",
}

// Add version styles
const VERSION_STYLES = {
  standard: "",
  hidden: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-white/30 shadow-lg",
}



// Update the mock listings with collection-based pricing
const MOCK_LISTINGS: MarketListing[] = [
  {
    id: "1",
    item: {
      id: "8",
      name: "Dragon Egg",
      collection: "ippy",
      emoji: "🥚",
      description: "Ancient and powerful",
      version: "standard",
    },
    seller: "DragonMaster",
    price: 35,
    quantity: 1,
  },
  {
    id: "2",
    item: {
      id: "4",
      name: "Magic Wand",
      collection: "ippy",
      emoji: "🪄",
      description: "Sparkles with mystery",
      version: "standard",
    },
    seller: "WizardKing",
    price: 15,
    quantity: 3,
  },
  {
    id: "3",
    item: {
      id: "9h",
      name: "Phoenix Feather",
      collection: "ippy",
      emoji: "🪶",
      description: "Burns with eternal flame",
      version: "hidden",
    },
    seller: "FireBird",
    price: 85,
    quantity: 1,
    limited: true,
  },
  {
    id: "4",
    item: {
      id: "1",
      name: "Rubber Duck",
      collection: "ippy",
      emoji: "🦆",
      description: "A squeaky companion",
      version: "standard",
    },
    seller: "DuckCollector",
    price: 2,
    quantity: 10,
    discount: 20,
  },
  {
    id: "5",
    item: {
      id: "15",
      name: "IPPY",
      collection: "ippy",
      emoji: "⭐",
      description: "The first Mascot of IPPY Verse",
      version: "standard",
    },
    seller: "StarGazer",
    price: 120,
    quantity: 1,
    featured: true,
  }
]

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
  const [coins, setCoins] = useState(0)
  const [inventory, setInventory] = useState<GachaItem[]>([])
  const [listings] = useState<MarketListing[]>(MOCK_LISTINGS)
  const [trades] = useState<TradeActivity[]>(MOCK_ACTIVITY)
  const [selectedCollection, setSelectedCollection] = useState<string>("all")
  const [selectedVersion, setSelectedVersion] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"price" | "collection" | "name">("price")
  const [searchTerm, setSearchTerm] = useState("")
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)
  const [showLimitedOnly, setShowLimitedOnly] = useState(false)
  const [showDiscountOnly, setShowDiscountOnly] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    // Initialize sound manager
    const savedCoins = localStorage.getItem("gacha-coins")
    if (savedCoins) {
      setCoins(Number.parseInt(savedCoins))
    }

    const savedInventory = localStorage.getItem("gacha-inventory")
    if (savedInventory) {
      setInventory(JSON.parse(savedInventory))
    }
  }, [])

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

  const buyItem = (listing: MarketListing) => {
    if (coins >= listing.price) {

      setCoins((prev) => {
        const newCoins = prev - listing.price
        localStorage.setItem("gacha-coins", newCoins.toString())
        return newCoins
      })

      if (listing.isBlindBox && listing.blindBox) {
        // Add blind box to unrevealed items
        const blindBoxItem: GachaItem = {
          id: listing.blindBox.id,
          name: listing.blindBox.name,
          collection: "ippy", // Placeholder - will be determined when opened
          emoji: listing.blindBox.emoji,
          description: listing.blindBox.description,
          version: "standard", // Placeholder
        }

        const currentUnrevealed = JSON.parse(localStorage.getItem("gacha-unrevealed") || "[]")
        localStorage.setItem("gacha-unrevealed", JSON.stringify([...currentUnrevealed, blindBoxItem]))

        alert(`Successfully purchased ${listing.blindBox.name} for ${listing.price} coins! Check your blind boxes.`)
      } else if (listing.item) {
        const newInventory = [...inventory, listing.item]
        setInventory(newInventory)
        localStorage.setItem("gacha-inventory", JSON.stringify(newInventory))

        alert(`Successfully purchased ${listing.item.name} for ${listing.price} coins!`)
      }
    } else {
      alert(`Not enough coins! You need ${listing.price - coins} more coins.`)
    }
  }


  // Filter and sort listings
  const filteredListings = listings
    .filter((listing) => {
      const matchesSearch = (listing.isBlindBox ? listing.blindBox?.name : listing.item?.name)
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
      const matchesCollection = selectedCollection === "all" || listing.item?.collection === selectedCollection
      const matchesVersion = selectedVersion === "all" || listing.item?.version === selectedVersion
      const matchesFeatured = showFeaturedOnly ? listing.featured : true
      const matchesLimited = showLimitedOnly ? listing.limited : true
      const matchesDiscount = showDiscountOnly ? listing.discount && listing.discount > 0 : true
      return (
        matchesSearch && matchesCollection && matchesVersion && matchesFeatured && matchesLimited && matchesDiscount
      )
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price":
          return a.price - b.price
        case "collection":
          return (a.item?.collection || "").localeCompare(b.item?.collection || "")
        case "name":
          return (a.isBlindBox ? a.blindBox?.name || "" : a.item?.name || "").localeCompare(b.isBlindBox ? b.blindBox?.name || "" : b.item?.name || "")
        default:
          return 0
      }
    })

  // Calculate market stats
  const totalListings = listings.length
  const spaceItems = listings.filter((listing) => listing.item?.collection === "ippy").length
  const hiddenItems = listings.filter((listing) => listing.item?.version === "hidden").length
  const blindBoxes = listings.filter((listing) => listing.isBlindBox).length
  const averagePrice = Math.round(listings.reduce((sum, listing) => sum + listing.price, 0) / listings.length)
  const featuredItems = listings.filter((listing) => listing.featured).length
  const limitedItems = listings.filter((listing) => listing.limited).length

  // Featured listings
  const featuredListings = listings.filter((listing) => listing.featured)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        <Header name="Designer Market" subtitle="Buy, Sell & Trade Premium Collectibles" isDark={true} />
        {/* Market Stats */}
        <MarketStats totalListings={totalListings} hiddenItems={hiddenItems} blindBoxes={blindBoxes} averagePrice={averagePrice} featuredItems={featuredItems} limitedItems={limitedItems} />

        {/* Featured Items Section */}
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
        )}

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
            {/* Enhanced Filters */}
            <Card className="bg-white/80 border-slate-200 shadow-lg backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        placeholder="Search marketplace..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/80 border-slate-200 text-slate-800 placeholder:text-slate-400 h-12 text-base shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Sort By */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-600">Sort:</span>
                    </div>
                    <div className="flex gap-2">
                      {[
                        { value: "price", label: "Price" },
                        { value: "collection", label: "Collection" },
                        { value: "name", label: "Name" },
                      ].map((sort) => (
                        <Button
                          key={sort.value}
                          variant={sortBy === sort.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setSortBy(sort.value as any)
                          }}
                          className={cn(
                            "transition-all duration-300",
                            sortBy === sort.value
                              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                              : "bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-100",
                          )}
                        >
                          {sort.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600">Collection:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedCollection === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedCollection("all")
                      }}
                      className={cn(
                        "transition-all duration-300",
                        selectedCollection === "all"
                          ? "bg-slate-600 hover:bg-slate-700 text-white"
                          : "bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-100",
                      )}
                    >
                      All
                    </Button>
                    {["toys", "magic", "fantasy", "tech", "nature", "space"].map((collection) => (
                      <Button
                        key={collection}
                        variant={selectedCollection === collection ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedCollection(collection)
                        }}
                        className={cn(
                          "transition-all duration-300",
                          "bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-100",
                        )}
                      >
                        {collection.charAt(0).toUpperCase() + collection.slice(1)}
                      </Button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-sm font-medium text-slate-600">Version:</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedVersion === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedVersion("all")
                      }}
                      className={cn(
                        "transition-all duration-300",
                        selectedVersion === "all"
                          ? "bg-slate-600 hover:bg-slate-700 text-white"
                          : "bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-100",
                      )}
                    >
                      All Versions
                    </Button>
                    <Button
                      variant={selectedVersion === "standard" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedVersion("standard")
                      }}
                      className={cn(
                        "transition-all duration-300",
                        selectedVersion === "standard"
                          ? "bg-slate-600 hover:bg-slate-700 text-white"
                          : "bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-100",
                      )}
                    >
                      Standard
                    </Button>
                    <Button
                      variant={selectedVersion === "hidden" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedVersion("hidden")
                      }}
                      className={cn(
                        "transition-all duration-300",
                        selectedVersion === "hidden"
                          ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"
                          : "bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-100",
                      )}
                    >
                      Hidden
                    </Button>
                  </div>
                </div>

                {/* Special Filters */}
                <div className="flex flex-wrap gap-3 mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600">Special:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={showFeaturedOnly ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setShowFeaturedOnly(!showFeaturedOnly)
                      }}
                      className={cn(
                        "transition-all duration-300",
                        showFeaturedOnly
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-100",
                      )}
                    >
                      Featured Only
                    </Button>
                    <Button
                      variant={showLimitedOnly ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setShowLimitedOnly(!showLimitedOnly)
                      }}
                      className={cn(
                        "transition-all duration-300",
                        showLimitedOnly
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-100",
                      )}
                    >
                      Limited Edition
                    </Button>
                    <Button
                      variant={showDiscountOnly ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setShowDiscountOnly(!showDiscountOnly)
                      }}
                      className={cn(
                        "transition-all duration-300",
                        showDiscountOnly
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-100",
                      )}
                    >
                      On Sale
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Marketplace Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredListings.map((listing, index) => (
                <BuyingModal key={index} />
              ))}
            </div>

            {filteredListings.length === 0 && (
              <Card className="bg-white/80 border-slate-200 shadow-lg backdrop-blur-sm">
                <CardContent className="p-16 text-center">
                  <Store className="w-20 h-20 text-slate-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-slate-700 mb-3">No Items Found</h3>
                  <p className="text-slate-500 text-lg">
                    No items match your current filters. Try adjusting your search criteria.
                  </p>
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
                          <Coins className="w-4 h-4 text-amber-500" />
                          {item.price}
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
