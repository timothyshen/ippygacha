"use client"

/**
 * Display grid of games with search, sort, and category filtering.
 */

import { useMemo, useState } from "react";
import FilterBar, { defaultCategories } from "./FilterBar";
import GameCard from "./GameCard";
import { Card, CardContent } from "@/components/ui/card";

// Mock data - in real app, this would come from API/NFT data
const games = [
  {
    id: 1,
    title: "Gacha",
    description: "Collect premium designer figures and build your ultimate collection",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80",
    category: "Gacha",
    status: "Online",
    players: "1.2K+",
    rewards: "IPPY",
    hot: true,
  },
  {
    id: 2,
    title: "Raffle",
    description: "Enter exciting raffles for a chance to win exclusive prizes",
    image: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=800&q=80",
    category: "Arcade",
    status: "Online",
    players: "850+",
    rewards: "Prizes",
    hot: false,
  },
];

// Coming soon placeholders
const comingSoonGames = Array(4).fill(null).map((_, i) => ({
  id: `coming-${i}`,
  comingSoon: true,
}));

const parsePlayerCount = (players: string) => {
  const normalized = players.trim().toUpperCase().replace(/\+/g, "");
  const match = normalized.match(/^([\d.,]+)([KMB]?)$/);
  if (!match) {
    return 0;
  }

  const value = parseFloat(match[1].replace(/,/g, ""));
  const suffix = match[2];

  const multipliers: Record<string, number> = {
    K: 1_000,
    M: 1_000_000,
    B: 1_000_000_000,
  };

  return value * (suffix ? multipliers[suffix] ?? 1 : 1);
};

export default function GamesGrid() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [activeCategory, setActiveCategory] = useState(defaultCategories[0]);

  const filteredGames = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase().trim();

    const matchesSearch = (title: string, description: string) => {
      if (!normalizedQuery) return true;
      return (
        title.toLowerCase().includes(normalizedQuery) ||
        description.toLowerCase().includes(normalizedQuery)
      );
    };

    const matchesCategory = (category: string) => {
      if (activeCategory === defaultCategories[0]) return true;
      return category === activeCategory;
    };

    const sorted = games
      .filter((game) => matchesCategory(game.category) && matchesSearch(game.title, game.description))
      .sort((a, b) => {
        const aPlayers = parsePlayerCount(a.players);
        const bPlayers = parsePlayerCount(b.players);

        return sortOrder === "asc" ? aPlayers - bPlayers : bPlayers - aPlayers;
      });

    return sorted;
  }, [activeCategory, searchQuery, sortOrder]);

  return (
    <div>
      <FilterBar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map((game) => (
          <GameCard key={game.id} {...game} />
        ))}
        {comingSoonGames.map((item) => (
          <Card key={item.id} className="overflow-hidden shadow-[var(--shadow-md)]">
            <div className="relative aspect-video overflow-hidden bg-muted flex items-center justify-center rounded-t-[var(--radius)]">
              <span className="text-muted-foreground font-medium">Coming Soon</span>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg text-muted-foreground">New Game</h3>
              <p className="text-sm text-muted-foreground/60 mt-2">
                More exciting games launching soon...
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
