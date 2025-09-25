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
        return <GridView items={filteredItems} inventoryLength={inventory.length} />
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
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4">
            <div className="max-w-7xl mx-auto">

                <Header name="Inventory" subtitle="Premium Collection Experience" isDark={true} isMarketplace={true} />

                <div className="w-full max-w-7xl mx-auto flex-1 pt-20 sm:pt-24 md:pt-28">
                    {/* Contract Info Display - Show box price and supply info if available */}
                    {contractInfo && <InventoryStats
                        {...contractInfo}
                    />}

                    {/* NFT Type Breakdown - Enhanced visual display */}
                    {nftTypeBreakdown.length > 0 && (
                        <div className="bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <span className="text-white text-lg">🎭</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800">Collection Breakdown</h3>
                                        <p className="text-sm text-slate-600">Your NFT distribution</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-slate-800">
                                        {nftTypeBreakdown.reduce((sum, { count }) => sum + count, 0)}
                                    </div>
                                    <div className="text-xs text-slate-500">Total NFTs</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                                {nftTypeBreakdown.map(({ typeName, count }, index) => {
                                    const total = nftTypeBreakdown.reduce((sum, { count }) => sum + count, 0);
                                    const percentage = total > 0 ? (count / total) * 100 : 0;
                                    const colors = [
                                        'from-blue-500 to-blue-600',
                                        'from-purple-500 to-purple-600',
                                        'from-pink-500 to-pink-600',
                                        'from-green-500 to-green-600',
                                        'from-orange-500 to-orange-600',
                                        'from-red-500 to-red-600',
                                        'from-indigo-500 to-indigo-600'
                                    ];
                                    const colorClass = colors[index % colors.length];

                                    return (
                                        <div
                                            key={typeName}
                                            className="group relative bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50 hover:border-slate-300/70 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
                                            onClick={() => {
                                                // Filter by this NFT type
                                                setSelectedCollection(typeName.toLowerCase());
                                                setActiveTab("collection");
                                            }}
                                        >
                                            <div className="text-center">
                                                <div className={`w-12 h-12 mx-auto mb-3 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300`}>
                                                    <span className="text-white font-bold text-lg">
                                                        {typeName.charAt(0)}
                                                    </span>
                                                </div>
                                                <div className="font-bold text-2xl text-slate-800 mb-1 group-hover:text-blue-600 transition-colors duration-300">
                                                    {count}
                                                </div>
                                                <div className="text-xs font-medium text-slate-600 mb-2 uppercase tracking-wide">
                                                    {typeName}
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className={`h-full bg-gradient-to-r ${colorClass} rounded-full transition-all duration-500 ease-out`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1">
                                                    {percentage.toFixed(1)}%
                                                </div>
                                            </div>

                                            {/* Hover tooltip */}
                                            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
                                                Click to filter by {typeName}
                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-slate-800"></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Summary stats */}
                            <div className="mt-4 pt-4 border-t border-slate-200/50">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                                            <span className="text-slate-600">Most common: {nftTypeBreakdown.reduce((max, current) => current.count > max.count ? current : max, nftTypeBreakdown[0])?.typeName}</span>
                                        </div>
                                    </div>
                                    <div className="text-slate-500">
                                        {nftTypeBreakdown.length} unique types
                                    </div>
                                </div>
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

        </div>

    )
}
