"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"
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
}: CollectionFiltersProps) {
    return (
        <Card className="bg-white/80 border-slate-200 shadow-lg backdrop-blur-sm mx-0.5 sm:mx-0">
            <CardContent className="p-4 sm:p-6 space-y-4">
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
                        {searchTerm && (
                            <button
                                onClick={() => onSearchChange("")}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Active Filter Badges */}
                {(searchTerm || selectedVersion !== "all" || sortBy !== "recent") && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {searchTerm && (
                            <Badge variant="secondary" className="gap-1.5 bg-blue-50 text-blue-700 border-blue-200">
                                <span className="text-xs">Search: <strong>{searchTerm}</strong></span>
                                <X
                                    className="w-3 h-3 cursor-pointer hover:text-red-600 transition-colors"
                                    onClick={() => onSearchChange("")}
                                />
                            </Badge>
                        )}

                        {selectedVersion !== "all" && (
                            <Badge variant="secondary" className="gap-1.5 bg-blue-50 text-blue-700 border-blue-200">
                                <span className="text-xs">Version: <strong>{selectedVersion}</strong></span>
                                <X
                                    className="w-3 h-3 cursor-pointer hover:text-red-600 transition-colors"
                                    onClick={() => onVersionChange("all")}
                                />
                            </Badge>
                        )}

                        {sortBy !== "recent" && (
                            <Badge variant="secondary" className="gap-1.5 bg-blue-50 text-blue-700 border-blue-200">
                                <span className="text-xs">Sort: <strong>{sortBy}</strong></span>
                            </Badge>
                        )}
                    </div>
                )}

                {/* Version and Sort in same row */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    {/* Version Filter */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-medium text-slate-600 shrink-0">Version:</span>
                        <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                            <Button
                                variant={selectedVersion === "all" ? "default" : "outline"}
                                size="sm"
                                onClick={() => onVersionChange("all")}
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
                                onClick={() => onVersionChange("standard")}
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
                                onClick={() => onVersionChange("hidden")}
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

                    {/* Sort Filter */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-medium text-slate-600 shrink-0">Sort:</span>
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
                                    onClick={() => onSortChange(sort.value)}
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
            </CardContent>
        </Card>
    )
} 