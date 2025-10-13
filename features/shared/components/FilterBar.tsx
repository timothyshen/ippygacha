"use client"
import { useState } from "react";
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

const categories = ["All Games", "Gacha", "Arcade", "Strategy", "Adventure"];

export default function FilterBar() {
    const [activeCategory, setActiveCategory] = useState("All Games");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    return (
        <div className="space-y-4 mb-12">
            {/* Search and Sort Row */}
            <div className="flex gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search games..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
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
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
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
