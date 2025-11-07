"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { SortBy } from "@/features/inventory/types"

interface CollectionFiltersProps {
    searchTerm: string
    onSearchChange: (value: string) => void
    selectedCollection: string
    onCollectionChange: (value: string) => void
    selectedVersion: string
    onVersionChange: (value: string) => void
    sortBy: SortBy
    onSortChange: (value: SortBy) => void
}

export function CollectionFilters({
    searchTerm,
    onSearchChange,
    selectedCollection,
    onCollectionChange,
    selectedVersion,
    onVersionChange,
    sortBy,
    onSortChange,
}: CollectionFiltersProps) {

    return (
        <div className="space-y-6">
            {/* Enhanced Filters */}
            <Card className="bg-white/80 border-slate-200 shadow-lg backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <Input
                                    placeholder="Search your collection..."
                                    value={searchTerm}
                                    onChange={(e) => onSearchChange(e.target.value)}
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
                                    { value: "recent" as const, label: "Recent" },
                                    { value: "collection" as const, label: "Collection" },
                                    { value: "name" as const, label: "Name" },
                                    { value: "count" as const, label: "Count" },
                                ].map((sort) => (
                                    <Button
                                        key={sort.value}
                                        variant={sortBy === sort.value ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => {
                                            onSortChange(sort.value)
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
                                    onCollectionChange("all")
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
                            <Button
                                variant={selectedCollection === "ippy" ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                    onCollectionChange("ippy")
                                }}
                                className={cn(
                                    "transition-all duration-300",
                                    selectedCollection === "ippy"
                                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                                        : "bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-100",
                                )}
                            >
                                IPPY NFT
                            </Button>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                            <span className="text-sm font-medium text-slate-600">Version:</span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={selectedVersion === "all" ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                    onVersionChange("all")
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
                                    onVersionChange("standard")
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
                                    onVersionChange("hidden")
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
                </CardContent>
            </Card>
        </div>
    )
} 