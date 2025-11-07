"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { SortBy } from "@/features/inventory/types"

interface CollectionFiltersProps {
    searchTerm: string
    onSearchChange: (value: string) => void
    selectedVersion: string
    onVersionChange: (value: string) => void
    sortBy: SortBy
    onSortChange: (value: SortBy) => void
    onClearAll: () => void
}

export function CollectionFilters({
    searchTerm,
    onSearchChange,
    selectedVersion,
    onVersionChange,
    sortBy,
    onSortChange,
    onClearAll,
}: CollectionFiltersProps) {
    // Check if any filters are active
    const hasActiveFilters = searchTerm !== "" || selectedVersion !== "all" || sortBy !== "recent"

    return (
        <div className="space-y-3 sm:space-y-4">
            {/* Active Filters Display */}
            {hasActiveFilters && (
                <Card className="bg-blue-50/80 border-blue-200 shadow-md backdrop-blur-sm mx-0.5 sm:mx-0">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-slate-700">Active filters:</span>
                            </div>

                            {searchTerm && (
                                <Badge variant="secondary" className="gap-1.5 bg-white/90 text-slate-700 hover:bg-white">
                                    <span className="text-xs">Search: <strong>{searchTerm}</strong></span>
                                    <X
                                        className="w-3 h-3 cursor-pointer hover:text-red-600 transition-colors"
                                        onClick={() => onSearchChange("")}
                                    />
                                </Badge>
                            )}


                            {selectedVersion !== "all" && (
                                <Badge variant="secondary" className="gap-1.5 bg-white/90 text-slate-700 hover:bg-white">
                                    <span className="text-xs">Version: <strong>{selectedVersion}</strong></span>
                                    <X
                                        className="w-3 h-3 cursor-pointer hover:text-red-600 transition-colors"
                                        onClick={() => onVersionChange("all")}
                                    />
                                </Badge>
                            )}

                            {sortBy !== "recent" && (
                                <Badge variant="secondary" className="gap-1.5 bg-white/90 text-slate-700 hover:bg-white">
                                    <span className="text-xs">Sort: <strong>{sortBy}</strong></span>
                                    <X
                                        className="w-3 h-3 cursor-pointer hover:text-red-600 transition-colors"
                                        onClick={() => onSortChange("recent")}
                                    />
                                </Badge>
                            )}

                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={onClearAll}
                                className="ml-auto text-xs hover:text-red-600 hover:bg-red-50 h-7"
                            >
                                Clear all
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Enhanced Filters */}
            <Card className="bg-white/80 border-slate-200 shadow-lg backdrop-blur-sm mx-0.5 sm:mx-0">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4 sm:gap-6">
                        {/* Search */}
                        <div className="w-full">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                                <Input
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    className="pl-9 sm:pl-10 bg-white/80 border-slate-200 text-slate-800 placeholder:text-slate-400 h-10 sm:h-12 text-sm sm:text-base shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Sort By */}
                        <div className="flex flex-col gap-2 sm:gap-3">
                            <div className="flex items-center gap-2">
                                <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
                                <span className="text-xs sm:text-sm font-medium text-slate-600">Sort:</span>
                            </div>
                            <div className="flex gap-1.5 sm:gap-2 flex-wrap">
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
                                            "transition-all duration-300 text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-3",
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
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="text-xs sm:text-sm font-medium text-slate-600">Version:</span>
                        </div>
                        <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                            <Button
                                variant={selectedVersion === "all" ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                    onVersionChange("all")
                                }}
                                className={cn(
                                    "transition-all duration-300 text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-3",
                                    selectedVersion === "all"
                                        ? "bg-slate-600 hover:bg-slate-700 text-white"
                                        : "bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-100",
                                )}
                            >
                                All
                            </Button>
                            <Button
                                variant={selectedVersion === "standard" ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                    onVersionChange("standard")
                                }}
                                className={cn(
                                    "transition-all duration-300 text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-3",
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
                                    "transition-all duration-300 text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-3",
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