"use client"
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export const defaultCategories = ["All Games", "Gacha", "Arcade", "Strategy", "Adventure"];

type FilterBarProps = {
    categories?: string[];
    activeCategory: string;
    onCategoryChange: (value: string) => void;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    sortOrder: "asc" | "desc";
    onSortChange: (value: "asc" | "desc") => void;
};

export default function FilterBar({
    categories = defaultCategories,
    activeCategory,
    onCategoryChange,
    searchQuery,
    onSearchChange,
    sortOrder,
    onSortChange,
}: FilterBarProps) {
    return (
        <div className="space-y-4 mb-12">
            {/* Search and Sort Row */}
            <div className="flex gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search games..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={sortOrder} onValueChange={(value) => onSortChange(value as "asc" | "desc")}>
                    <SelectTrigger className="w-[180px]">
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Sort by players" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="desc">Most Players</SelectItem>
                        <SelectItem value="asc">Least Players</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Categories Tabs */}
            <Tabs value={activeCategory} onValueChange={onCategoryChange}>
                <TabsList className="w-full justify-start">
                    {categories.map((category) => (
                        <TabsTrigger key={category} value={category}>
                            {category}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </div>
    );
}
