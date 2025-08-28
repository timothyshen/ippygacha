"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Bookmark } from "lucide-react"

// Import all the new components
import { InventoryStats } from "./InventoryStats"
import { BlindBoxTab } from "./BlindBoxTab"
import { CollectionFilters } from "./CollectionFilters"
import { GridView } from "./GridView"
import Footer from "@/features/shared/components/Footer"


// Import custom hooks
import { useInventoryLogic } from "@/hooks/gacha/useInventoryLogic"
import { useInventoryFilters } from "@/hooks/gacha/useInventoryFilters"
import { Header } from "@/features/shared/components/Header"

export default function Inventory() {
    // Use the enhanced inventory logic hook
    const {
        inventory,
        unrevealedItems,
        uniqueItems,
        unrevealedBoxes,
        contractInfo,
        isLoading,
        error,
        getFilteredItems,
        getNFTTypeBreakdown,
        revealItemFromInventory,
    } = useInventoryLogic()

    // Use the inventory filters hook
    const {
        searchTerm,
        setSearchTerm,
        selectedCollection,
        setSelectedCollection,
        selectedVersion,
        setSelectedVersion,
        viewMode,
        setViewMode,
        sortBy,
        setSortBy,
        activeTab,
        setActiveTab,
    } = useInventoryFilters()


    // Get filtered items based on current filters
    const filteredItems = getFilteredItems(searchTerm, selectedCollection, selectedVersion, sortBy)

    // Get NFT type breakdown for additional insights
    const nftTypeBreakdown = getNFTTypeBreakdown()

    const renderCollectionContent = () => {
        if (viewMode === "grid") {
            return <GridView items={filteredItems} inventoryLength={inventory.length} />
        }

        return null
    }

    // Show loading state
    if (isLoading && inventory.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-slate-600">Loading your inventory...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Show error state
    if (error && inventory.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="text-red-500 text-6xl mb-4">⚠️</div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Unable to load inventory</h2>
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
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">

            <Header name="Inventory" subtitle="Premium Collection Experience" isDark={true} isMarketplace={false} />

            <div className="w-full max-w-7xl mx-auto flex-1 pt-20 sm:pt-24 md:pt-28">
                {/* Contract Info Display - Show box price and supply info if available */}
                {contractInfo && <InventoryStats
                    {...contractInfo}
                />}

                {/* NFT Type Breakdown - Show distribution of NFT types if available */}
                {nftTypeBreakdown.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-6 border border-slate-200 shadow-lg">
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">🎭 Your Collection Breakdown</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-sm">
                            {nftTypeBreakdown.map(({ typeName, count }) => (
                                <div key={typeName} className="text-center">
                                    <div className="font-semibold text-blue-600">{count}</div>
                                    <div className="text-slate-600 text-xs">{typeName}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Tabs */}
                <Tabs
                    value={activeTab}
                    onValueChange={(value) => setActiveTab(value as "blindbox" | "collection")}
                    className="space-y-6"
                >
                    <TabsList className="bg-white/80 border-slate-200 shadow-lg backdrop-blur-sm">
                        <TabsTrigger
                            value="blindbox"
                            className="data-[state=active]:bg-amber-600 data-[state=active]:text-white"
                        >
                            <Package className="w-4 h-4 mr-2" />
                            Blind Boxes ({unrevealedBoxes})
                        </TabsTrigger>
                        <TabsTrigger
                            value="collection"
                            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                        >
                            <Bookmark className="w-4 h-4 mr-2" />
                            Collection ({uniqueItems})
                        </TabsTrigger>
                    </TabsList>

                    {/* Blind Box Tab */}
                    <TabsContent value="blindbox" className="space-y-6">
                        <BlindBoxTab
                            unrevealedItems={unrevealedItems}
                            onRevealItem={revealItemFromInventory}
                        />
                    </TabsContent>

                    {/* Collection Tab */}
                    <TabsContent value="collection" className="space-y-6">
                        <CollectionFilters
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            selectedCollection={selectedCollection}
                            onCollectionChange={setSelectedCollection}
                            selectedVersion={selectedVersion}
                            onVersionChange={setSelectedVersion}
                            sortBy={sortBy}
                            onSortChange={setSortBy}
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                        />

                        {renderCollectionContent()}
                    </TabsContent>
                </Tabs>

                {/* Collection Detail Modal
          <CollectionModal
            selectedCollectionDetail={selectedCollectionDetail}
            showModal={showCollectionModal}
            onClose={closeCollectionModal}
            collectionStats={collectionStats}
            collectionCompletionPercentage={collectionCompletionPercentage}
            getCollectionItems={getCollectionItems}
          /> */}
            </div>

            <Footer />

        </div>

    )
}
