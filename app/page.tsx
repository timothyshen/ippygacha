"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
    Gamepad2,
    Sword,
    Target,
    Puzzle,
    Joystick,
    Flame,
    Zap,
    Trophy,
    Search,
    Filter,
    ShoppingBag,
    PackageOpen,
    Clock,
    CheckCircle2,
    BadgeAlert,
    Star,
    Sparkles,
    Users,
    Coins,
    Play,
} from "lucide-react";
import { Header } from "@/features/shared/components/Header";
import Image from "next/image";

// Real games from the original GamesGrid
const ALL_GAMES = [
    {
        id: "gacha",
        name: "Gacha Zone",
        type: "Gacha",
        status: "Online",
        description: "Collect premium designer figures and build your ultimate collection",
        cover: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=60",
        players: "1.2K+",
        rewards: "IPPY",
        href: "/gacha",
        emoji: "🎰",
        isPopular: true,
    },
    {
        id: "claw",
        name: "Claw Master",
        type: "Arcade",
        status: "Maintenance",
        description: "Test your skills with the classic claw machine experience",
        cover: "https://images.unsplash.com/photo-1511512578047-9f1f2f0d3cb7?auto=format&fit=crop&w=1200&q=60",
        players: "Soon",
        rewards: "Plush Toys",
        emoji: "🦾",
        isNew: false,
    },
    {
        id: "raffle",
        name: "Lucky Raffle",
        type: "Lottery",
        status: "Beta",
        description: "Enter daily raffles for exclusive prizes and rewards",
        cover: "https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?auto=format&fit=crop&w=1200&q=60",
        players: "Coming Soon",
        rewards: "Mystery Boxes",
        emoji: "🎫",
        href: "/raffle",
        isNew: true,
    },
    // Coming soon placeholders
    {
        id: "game-4",
        name: "Mystery Game #1",
        type: "Strategy",
        status: "Maintenance",
        description: "An exciting new game experience coming soon",
        cover: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=60",
        emoji: "🎮",
    },
    {
        id: "game-5",
        name: "Mystery Game #2",
        type: "Puzzle",
        status: "Maintenance",
        description: "Challenge your mind with this upcoming puzzle adventure",
        cover: "https://images.unsplash.com/photo-1520975693416-0d37d2a7a4ae?auto=format&fit=crop&w=1200&q=60",
        emoji: "🧩",
    },
    {
        id: "game-6",
        name: "Mystery Game #3",
        type: "RPG",
        status: "Maintenance",
        description: "Embark on an epic journey in the Ippy universe",
        cover: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=1200&q=60",
        emoji: "⚔️",
    },
];

const typeIcon = (t: string) => {
    switch (t) {
        case "Gacha":
            return <Gamepad2 className="h-4 w-4" />;
        case "Arcade":
            return <Target className="h-4 w-4" />;
        case "Lottery":
            return <Trophy className="h-4 w-4" />;
        case "RPG":
            return <Sword className="h-4 w-4" />;
        case "Puzzle":
            return <Puzzle className="h-4 w-4" />;
        default:
            return <Joystick className="h-4 w-4" />;
    }
};

const statusBadge = (s: string) => {
    const map: Record<string, string> = {
        Online: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        Maintenance: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
        Beta: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    };
    const icon = s === "Online" ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
    ) : s === "Maintenance" ? (
        <BadgeAlert className="h-3.5 w-3.5" />
    ) : (
        <Flame className="h-3.5 w-3.5" />
    );
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${map[s]}`}>
            {icon}
            {s}
        </span>
    );
};

export default function HomePage() {
    const [query, setQuery] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [platformPC, setPlatformPC] = useState(true);
    const [platformMobile, setPlatformMobile] = useState(false);

    const filtered = useMemo(() => {
        return ALL_GAMES.filter((g) => {
            const matchesQuery = query
                ? g.name.toLowerCase().includes(query.toLowerCase())
                : true;
            const matchesType = filterType === "all" ? true : g.type === filterType;
            const matchesStatus = filterStatus === "all" ? true : g.status === filterStatus;
            // simple platform demo: alternate availability
            const isPC = parseInt(g.id.replace("game-", "") || "1") % 2 === 0 || g.id === "gacha" || g.id === "claw";
            const isMobile = !isPC;
            const matchesPlatform = (platformPC && isPC) || (platformMobile && isMobile);
            return matchesQuery && matchesType && matchesStatus && matchesPlatform;
        });
    }, [query, filterType, filterStatus, platformPC, platformMobile]);

    const handleGameClick = (game: any) => {
        if (game.href && game.status === "Online") {
            window.location.href = game.href;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-100 to-red-100 dark:from-amber-900 dark:via-orange-900 dark:to-red-900">


            {/* Top bar */}
            <Header name="Ippy Playground" subtitle="Welcome to the Ippy Verse" isDark={false} isMarketplace={false} />

            {/* Hero Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-orange-200 via-amber-200 to-yellow-200 pt-16 pb-8">
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex items-center justify-center gap-2 md:gap-4 mb-4 flex-wrap">
                        <div className="relative">
                            <Star className="w-8 h-8 md:w-12 md:h-12 text-yellow-400 drop-shadow-lg animate-pulse" />
                            <div className="absolute inset-0 w-8 h-8 md:w-12 md:h-12 text-yellow-400 animate-ping opacity-20">
                                <Star className="w-full h-full" />
                            </div>
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-7xl font-bold text-white tracking-tight drop-shadow-2xl">
                            Ippy Playground
                        </h1>
                        <div className="relative">
                            <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-yellow-400 drop-shadow-lg animate-pulse" />
                            <div className="absolute inset-0 w-8 h-8 md:w-12 md:h-12 text-yellow-400 animate-ping opacity-20">
                                <Sparkles className="w-full h-full" />
                            </div>
                        </div>
                    </div>
                    <p className="text-lg md:text-2xl text-orange-100 font-medium mb-2">🌟 Welcome to the Ippy Verse 🌟</p>
                    <p className="text-base md:text-lg text-amber-100 max-w-2xl mx-auto px-4">
                        Join the ultimate gaming experience through Gacha, Claw machines, and more exciting adventures!
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-6 text-orange-100 mt-8">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            <span className="font-medium">5K+ Players</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Trophy className="w-5 h-5" />
                            <span className="font-medium">100+ Collectibles</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Coins className="w-5 h-5" />
                            <span className="font-medium">Daily Rewards</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
                {/* Side filter (visible on lg+) */}
                <aside className="hidden lg:block">
                    <Card className="bg-white/80 backdrop-blur-sm border-orange-200 dark:bg-orange-900/20 dark:border-orange-700">
                        <CardHeader>
                            <CardTitle className="text-base text-amber-900 dark:text-orange-200">Filters</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-amber-800 dark:text-orange-300">Search</label>
                                <div className="relative">
                                    <Input
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search games..."
                                        className="pl-9 bg-white/50 border-orange-300 text-amber-900 placeholder:text-amber-600 dark:bg-orange-900/30 dark:border-orange-600 dark:text-orange-200 dark:placeholder:text-orange-400"
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-600 dark:text-orange-400" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-amber-800 dark:text-orange-300">Type</label>
                                <Select value={filterType} onValueChange={setFilterType}>
                                    <SelectTrigger aria-label="Filter by type" className="bg-white/50 border-orange-300 text-amber-900 dark:bg-orange-900/30 dark:border-orange-600 dark:text-orange-200">
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All types</SelectItem>
                                        <SelectItem value="Gacha">Gacha</SelectItem>
                                        <SelectItem value="Arcade">Arcade</SelectItem>
                                        <SelectItem value="Lottery">Lottery</SelectItem>
                                        <SelectItem value="Strategy">Strategy</SelectItem>
                                        <SelectItem value="Puzzle">Puzzle</SelectItem>
                                        <SelectItem value="RPG">RPG</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-amber-800 dark:text-orange-300">Status</label>
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger aria-label="Filter by status" className="bg-white/50 border-orange-300 text-amber-900 dark:bg-orange-900/30 dark:border-orange-600 dark:text-orange-200">
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All statuses</SelectItem>
                                        <SelectItem value="Online">Online</SelectItem>
                                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                                        <SelectItem value="Beta">Beta</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-amber-800 dark:text-orange-300">Platform</label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm text-amber-800 dark:text-orange-300">
                                        <Checkbox checked={platformPC} onCheckedChange={(v) => setPlatformPC(Boolean(v))} />
                                        <span>PC</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-amber-800 dark:text-orange-300">
                                        <Checkbox checked={platformMobile} onCheckedChange={(v) => setPlatformMobile(Boolean(v))} />
                                        <span>Mobile</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button variant="secondary" onClick={() => { setQuery(""); setFilterType("all"); setFilterStatus("all"); setPlatformPC(true); setPlatformMobile(false); }}>
                                    Reset
                                </Button>
                                <Button className="gap-1 bg-orange-500 hover:bg-orange-600 text-white">
                                    <Filter className="h-4 w-4" /> Apply
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </aside>

                {/* Gallery grid */}
                <section className="space-y-6">
                    {/* Mobile filter row */}
                    <div className="lg:hidden">
                        <Card className="bg-white/80 backdrop-blur-sm border-orange-200 dark:bg-orange-900/20 dark:border-orange-700">
                            <CardContent className="pt-6 space-y-3">
                                <div className="relative">
                                    <Input
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search games..."
                                        className="pl-9 bg-white/50 border-orange-300 text-amber-900 placeholder:text-amber-600 dark:bg-orange-900/30 dark:border-orange-600 dark:text-orange-200 dark:placeholder:text-orange-400"
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-600 dark:text-orange-400" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Select value={filterType} onValueChange={setFilterType}>
                                        <SelectTrigger aria-label="Filter by type" className="bg-white/50 border-orange-300 text-amber-900 dark:bg-orange-900/30 dark:border-orange-600 dark:text-orange-200">
                                            <SelectValue placeholder="All types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="Gacha">Gacha</SelectItem>
                                            <SelectItem value="Arcade">Arcade</SelectItem>
                                            <SelectItem value="Lottery">Lottery</SelectItem>
                                            <SelectItem value="Strategy">Strategy</SelectItem>
                                            <SelectItem value="Puzzle">Puzzle</SelectItem>
                                            <SelectItem value="RPG">RPG</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                                        <SelectTrigger aria-label="Filter by status" className="bg-white/50 border-orange-300 text-amber-900 dark:bg-orange-900/30 dark:border-orange-600 dark:text-orange-200">
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="Online">Online</SelectItem>
                                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                                            <SelectItem value="Beta">Beta</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Game Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((game) => (
                            <Card
                                key={game.id}
                                className="overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer bg-white/80 backdrop-blur-sm border-orange-200 hover:border-orange-400 dark:bg-orange-900/20 dark:border-orange-700 dark:hover:border-orange-500"
                                onClick={() => handleGameClick(game)}
                            >
                                <div className="relative">
                                    <AspectRatio ratio={16 / 9}>
                                        <Image
                                            src={game.cover}
                                            alt={game.name}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                        <div className="absolute left-3 right-3 bottom-3 flex items-center justify-between">
                                            <Badge variant="secondary" className="gap-1 bg-white/80 backdrop-blur-sm text-amber-800">
                                                {typeIcon(game.type)}
                                                {game.type}
                                            </Badge>
                                            {statusBadge(game.status)}
                                        </div>
                                        {game.isNew && (
                                            <Badge className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold animate-bounce">
                                                NEW!
                                            </Badge>
                                        )}
                                        {game.isPopular && (
                                            <Badge className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold">
                                                🔥 HOT
                                            </Badge>
                                        )}
                                        {/* Game Emoji */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl opacity-80 group-hover:scale-110 transition-transform duration-300">
                                            {game.emoji}
                                        </div>
                                    </AspectRatio>
                                </div>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg text-amber-900 dark:text-orange-200 flex items-center justify-between">
                                        {game.name}
                                        {game.status === "Online" && game.href && (
                                            <Play className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-amber-700 dark:text-orange-300" />
                                        )}
                                    </CardTitle>
                                    <p className="text-sm text-amber-700 dark:text-orange-300 line-clamp-2">{game.description}</p>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    {(game.players || game.rewards) && (
                                        <div className="grid grid-cols-2 gap-2 text-center text-xs">
                                            {game.players && (
                                                <div className="bg-white/50 rounded-lg p-2 backdrop-blur-sm dark:bg-orange-900/30">
                                                    <div className="text-amber-900 dark:text-orange-200 font-bold">{game.players}</div>
                                                    <div className="text-amber-700 dark:text-orange-300">Players</div>
                                                </div>
                                            )}
                                            {game.rewards && (
                                                <div className="bg-white/50 rounded-lg p-2 backdrop-blur-sm dark:bg-orange-900/30">
                                                    <div className="text-amber-900 dark:text-orange-200 font-bold">{game.rewards}</div>
                                                    <div className="text-amber-700 dark:text-orange-300">Rewards</div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Coming Soon section */}
                    <div className="pt-8">
                        <h2 className="text-xl font-semibold mb-6 text-amber-900 dark:text-orange-200">Coming Soon</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Card key={`coming-${i}`} className="overflow-hidden bg-white/60 backdrop-blur-sm border-orange-200 dark:bg-orange-900/20 dark:border-orange-700">
                                    <div className="relative">
                                        <AspectRatio ratio={16 / 9}>
                                            <div className="h-full w-full bg-gradient-to-br from-orange-200 to-amber-300 dark:from-orange-800 dark:to-amber-900 grid place-items-center">
                                                <div className="flex flex-col items-center gap-2 text-amber-700 dark:text-orange-300">
                                                    <Clock className="h-8 w-8" />
                                                    <span className="text-lg font-semibold">Soon</span>
                                                </div>
                                            </div>
                                        </AspectRatio>
                                        <Badge className="absolute left-3 top-3 bg-orange-500 text-white">Teaser</Badge>
                                    </div>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base text-amber-900 dark:text-orange-200">Mystery Game #{i + 1}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm text-amber-700 dark:text-orange-300">
                                        Stay tuned for updates from the Ippy Verse!
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-orange-200/50 bg-white/20 dark:bg-orange-900/20 backdrop-blur-sm mt-16">
                <div className="container mx-auto px-4 py-8 text-center">
                    <p className="text-amber-800 dark:text-orange-300">
                        &copy; {new Date().getFullYear()} Ippy Playground. All rights reserved.
                    </p>
                    <p className="text-amber-700 dark:text-orange-400 text-sm mt-2">
                        Join thousands of players in the Ippy Verse! Collect, trade, and compete across multiple game modes.
                    </p>
                </div>
            </footer>
        </div>
    );
}