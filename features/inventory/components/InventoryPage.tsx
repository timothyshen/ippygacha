"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Bookmark } from "lucide-react"

// Import all the new components
import { CollectionHeader } from "./CollectionHeader"
import { BlindBoxTab } from "./BlindBoxTab"
import { CollectionFilters } from "./CollectionFilters"
import { GridView } from "./GridView"
import Footer from "@/features/shared/components/Footer"


// Import custom hooks
import { useInventoryLogic, useInventoryFilters, useBatchSelection, useFavorites, useKeyboardShortcuts } from "@/features/inventory/hooks"
import { Header } from "@/features/shared/components/Header"
import { Button } from "@/components/ui/button"
import { CheckSquare, Square, Heart, X, List, Keyboard } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

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
        refreshInventory,
    } = useInventoryLogic()

    // Use the inventory filters hook
    const {
        searchTerm,
        setSearchTerm,
        selectedVersion,
        setSelectedVersion,
        selectedNFTType,
        setSelectedNFTType,
        sortBy,
        setSortBy,
        activeTab,
        setActiveTab,
        clearAllFilters,
    } = useInventoryFilters()

    // Batch selection and favorites
    const batchSelection = useBatchSelection()
    const favorites = useFavorites()

    // Quick filter state
    const [quickFilter, setQuickFilter] = useState<"all" | "favorites">("all")
    const [showShortcuts, setShowShortcuts] = useState(false)

    // Keyboard shortcuts
    useKeyboardShortcuts({
        onToggleBatchMode: () => {
            if (activeTab === "collection") {
                batchSelection.toggleBatchMode()
            }
        },
        onToggleFavorites: () => {
            if (activeTab === "collection") {
                setQuickFilter((prev) => (prev === "all" ? "favorites" : "all"))
            }
        },
        onClearFilters: () => {
            if (activeTab === "collection") {
                clearAllFilters()
                setQuickFilter("all")
            }
        },
        onSelectAll: () => {
            if (activeTab === "collection" && batchSelection.batchMode) {
                batchSelection.selectAll(filteredItems)
            }
        },
        onEscape: () => {
            if (batchSelection.selectedCount > 0) {
                batchSelection.clearSelection()
            } else if (batchSelection.batchMode) {
                batchSelection.toggleBatchMode()
            }
        },
    })


    // Get filtered items based on current filters
    let filteredItems = getFilteredItems(searchTerm, selectedVersion, selectedNFTType, sortBy)

    // Store the base filtered count before applying quick filter
    const allItemsCount = filteredItems.length

    // Calculate favorites count from filtered items
    const filteredFavoritesCount = filteredItems.filter((item) => {
        const itemId = item.id || `${item.name}-${item.tokenId}`
        return favorites.isFavorite(itemId)
    }).length

    // Apply quick filter for favorites
    if (quickFilter === "favorites") {
        filteredItems = filteredItems.filter((item) => {
            const itemId = item.id || `${item.name}-${item.tokenId}`
            return favorites.isFavorite(itemId)
        })
    }

    // Get NFT type breakdown for additional insights
    const nftTypeBreakdown = getNFTTypeBreakdown

    const renderCollectionContent = () => {
        return (
            <GridView
                items={filteredItems}
                inventoryLength={inventory.length}
                batchSelection={batchSelection}
                favorites={favorites}
                onListSuccess={refreshInventory}
                onCancelSuccess={refreshInventory}
            />
        )
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
        <div className="min-h-screen relative overflow-hidden p-3 sm:p-4 md:p-6">
            {/* Animated background layers */}
            <div className="fixed inset-0 -z-10">
                {/* Base gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50" />

                {/* Animated gradient orbs */}
                <div className="absolute top-0 -left-48 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
                <div className="absolute top-0 -right-48 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: "2s" }} />
                <div className="absolute -bottom-48 left-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: "4s" }} />

                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }} />
            </div>

            <div className="max-w-7xl mx-auto relative">

                <Header name="Inventory" subtitle="Premium Collection Experience" isDark={true} />

                <div className="w-full max-w-7xl mx-auto flex-1 pt-6 sm:pt-10 md:pt-12 lg:pt-14 px-1 sm:px-0">
                    {/* Collection Header */}
                    {contractInfo && nftTypeBreakdown.length > 0 && (
                        <CollectionHeader
                            contractInfo={contractInfo}
                            nftTypeBreakdown={nftTypeBreakdown}
                            totalItems={inventory.length}
                        />
                    )}

                    {/* Main Tabs */}
                    <Tabs
                        value={activeTab}
                        onValueChange={(value) => setActiveTab(value as "blindbox" | "collection")}
                        className="space-y-4 sm:space-y-6"
                    >
                        <TabsList className="bg-white/80 border-slate-200 shadow-lg backdrop-blur-sm w-full sm:w-auto">
                            <TabsTrigger
                                value="blindbox"
                                className="data-[state=active]:bg-amber-600 data-[state=active]:text-white flex-1 sm:flex-none text-xs sm:text-sm"
                            >
                                <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                <span className="hidden xs:inline">Blind </span>Boxes<span className="hidden sm:inline"> ({unrevealedBoxes})</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="collection"
                                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white flex-1 sm:flex-none text-xs sm:text-sm"
                            >
                                <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                Collection<span className="hidden sm:inline"> ({uniqueItems})</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* Blind Box Tab */}
                        <TabsContent value="blindbox" className="space-y-4 sm:space-y-6">
                            <BlindBoxTab
                                unrevealedItems={unrevealedItems}
                                onRevealItem={revealItemFromInventory}
                            />
                        </TabsContent>

                        {/* Collection Tab */}
                        <TabsContent value="collection" className="space-y-4 sm:space-y-6">
                            {/* Quick Filter & Batch Mode Toolbar */}
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-slate-200 shadow-lg mx-0.5 sm:mx-0">
                                {/* Quick Filters */}
                                <div className="flex gap-2 flex-wrap">
                                    <Button
                                        size="sm"
                                        variant={quickFilter === "all" ? "default" : "outline"}
                                        onClick={() => setQuickFilter("all")}
                                        className="h-9 text-xs sm:text-sm"
                                    >
                                        All Items
                                        <span className="ml-1.5 font-bold">({allItemsCount})</span>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={quickFilter === "favorites" ? "default" : "outline"}
                                        onClick={() => setQuickFilter("favorites")}
                                        className="h-9 text-xs sm:text-sm"
                                    >
                                        <Heart className="w-3.5 h-3.5 mr-1.5" />
                                        Favorites
                                        <span className="ml-1.5 font-bold">({filteredFavoritesCount})</span>
                                    </Button>
                                </div>

                                {/* Batch Mode Toggle */}
                                <Button
                                    size="sm"
                                    variant={batchSelection.batchMode ? "default" : "outline"}
                                    onClick={batchSelection.toggleBatchMode}
                                    className="h-9 text-xs sm:text-sm"
                                >
                                    {batchSelection.batchMode ? (
                                        <>
                                            <CheckSquare className="w-3.5 h-3.5 mr-1.5" />
                                            Exit Batch Mode
                                        </>
                                    ) : (
                                        <>
                                            <Square className="w-3.5 h-3.5 mr-1.5" />
                                            Batch Select
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Batch Action Toolbar (when items selected) */}
                            {batchSelection.batchMode && batchSelection.selectedCount > 0 && (
                                <div className="bg-blue-600 text-white rounded-xl p-3 sm:p-4 shadow-xl mx-0.5 sm:mx-0 animate-in slide-in-from-top-4 duration-300">
                                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-sm sm:text-base">
                                                {batchSelection.selectedCount} item{batchSelection.selectedCount > 1 ? "s" : ""} selected
                                            </span>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={batchSelection.clearSelection}
                                                className="text-white hover:text-white hover:bg-white/20 h-7 text-xs"
                                            >
                                                <X className="w-3 h-3 mr-1" />
                                                Clear
                                            </Button>
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="h-9 text-xs sm:text-sm"
                                                disabled
                                            >
                                                <List className="w-3.5 h-3.5 mr-1.5" />
                                                Batch List
                                                <span className="ml-1 text-[10px] opacity-70">(Soon)</span>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => {
                                                    batchSelection.selectedItems.forEach((id) => {
                                                        favorites.toggleFavorite(id)
                                                    })
                                                    batchSelection.clearSelection()
                                                }}
                                                className="h-9 text-xs sm:text-sm"
                                            >
                                                <Heart className="w-3.5 h-3.5 mr-1.5" />
                                                Add to Favorites
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <CollectionFilters
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                                selectedVersion={selectedVersion}
                                onVersionChange={setSelectedVersion}
                                sortBy={sortBy}
                                onSortChange={setSortBy}
                                onClearAll={clearAllFilters}
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

                {/* Keyboard Shortcuts Help Button */}
                <button
                    onClick={() => setShowShortcuts(!showShortcuts)}
                    className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 group"
                >
                    <Keyboard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>

                {/* Keyboard Shortcuts Panel */}
                {showShortcuts && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in-0 duration-200">
                        <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Keyboard className="w-6 h-6" />
                                    Keyboard Shortcuts
                                </h3>
                                <button
                                    onClick={() => setShowShortcuts(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <span className="text-sm text-slate-700">Toggle Batch Mode</span>
                                    <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono">⌘/Ctrl + B</kbd>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <span className="text-sm text-slate-700">Toggle Favorites</span>
                                    <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono">⌘/Ctrl + F</kbd>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <span className="text-sm text-slate-700">Clear Filters</span>
                                    <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono">⌘/Ctrl + K</kbd>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <span className="text-sm text-slate-700">Select All</span>
                                    <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono">⌘/Ctrl + A</kbd>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <span className="text-sm text-slate-700">Clear/Exit</span>
                                    <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono">Esc</kbd>
                                </div>
                            </div>

                            <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-xs text-blue-800">
                                    <strong>Tip:</strong> Shortcuts only work on the Collection tab when not typing in input fields.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <Footer />
            </div>

        </div>

    )
}
