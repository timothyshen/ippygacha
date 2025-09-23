"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "lucide-react";

// Simple mock data for the gallery
const ALL_GAMES = Array.from({ length: 12 }).map((_, i) => {
    const types = ["RPG", "Shooter", "Puzzle", "Strategy"] as const;
    const statuses = ["Online", "Maintenance", "Beta"] as const;
    const type = types[i % types.length];
    const status = statuses[i % statuses.length];
    return {
        id: `game-${i + 1}`,
        name: `Game ${i + 1}`,
        type,
        status,
        cover: `https://images.unsplash.com/photo-${[
                "1511512578047-dfb367046420",
                "1511512578047-9f1f2f0d3cb7",
                "1516117172878-fd2c41f4a759",
                "1505740420928-5e560c06d30e",
                "1520975693416-0d37d2a7a4ae",
                "1525547719571-a2d4ac8945e2",
            ][i % 6]
            }?auto=format&fit=crop&w=1200&q=60`,
    };
});

const typeIcon = (t: string) => {
    switch (t) {
        case "RPG":
            return <Sword className="h-4 w-4" />;
        case "Shooter":
            return <Target className="h-4 w-4" />;
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

export default function GalleryPage() {
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
            const isPC = parseInt(g.id.replace("game-", "")) % 2 === 0;
            const isMobile = !isPC;
            const matchesPlatform = (platformPC && isPC) || (platformMobile && isMobile);
            return matchesQuery && matchesType && matchesStatus && matchesPlatform;
        });
    }, [query, filterType, filterStatus, platformPC, platformMobile]);

    return (
        <div className="min-h-screen">
            {/* Top bar */}
            <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-base font-medium">
                        <Gamepad2 className="h-5 w-5" />
                        <span>Application Gallery</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="sm:hidden" aria-label="Open filters">
                            <Filter className="h-4 w-4" />
                        </Button>
                        {/* Avatar trigger for right sidebar */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <button aria-label="Open profile sidebar" className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=256&q=60&auto=format&fit=crop" />
                                        <AvatarFallback>PL</AvatarFallback>
                                    </Avatar>
                                </button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-full sm:max-w-sm">
                                <SheetHeader>
                                    <SheetTitle className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=256&q=60&auto=format&fit=crop" />
                                            <AvatarFallback>PL</AvatarFallback>
                                        </Avatar>
                                        PlayerOne
                                    </SheetTitle>
                                </SheetHeader>

                                <div className="mt-4 space-y-6">
                                    {/* Ranking and EXP */}
                                    <section>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-medium flex items-center gap-2"><Trophy className="h-4 w-4" /> Rank</h3>
                                            <Badge variant="secondary">Diamond III</Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground mb-1">EXP 3,420 / 5,000</div>
                                        <Progress value={68} />
                                    </section>

                                    {/* Recent Activity */}
                                    <section>
                                        <h3 className="text-sm font-medium mb-2">Recent Activity</h3>
                                        <div className="space-y-2">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="flex items-start gap-3 rounded-md border p-3">
                                                    <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                                    <div className="text-sm leading-snug">
                                                        Completed daily quest in <span className="font-medium">Game {i}</span>
                                                        <div className="text-xs text-muted-foreground">{i}h ago</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Shortcuts - mobile app-like */}
                                    <section>
                                        <h3 className="text-sm font-medium mb-2">Shortcuts</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Link href="/inventory" className="group rounded-xl border p-4 flex flex-col items-center justify-center gap-2 hover:bg-accent">
                                                <PackageOpen className="h-5 w-5" />
                                                <span className="text-sm">Inventory</span>
                                            </Link>
                                            <Link href="/market" className="group rounded-xl border p-4 flex flex-col items-center justify-center gap-2 hover:bg-accent">
                                                <ShoppingBag className="h-5 w-5" />
                                                <span className="text-sm">Market</span>
                                            </Link>
                                        </div>
                                    </section>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
                {/* Side filter (visible on lg+) */}
                <aside className="hidden lg:block">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Filters</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Search</label>
                                <div className="relative">
                                    <Input
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search games..."
                                        className="pl-9"
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type</label>
                                <Select value={filterType} onValueChange={setFilterType}>
                                    <SelectTrigger aria-label="Filter by type">
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All types</SelectItem>
                                        <SelectItem value="RPG">RPG</SelectItem>
                                        <SelectItem value="Shooter">Shooter</SelectItem>
                                        <SelectItem value="Puzzle">Puzzle</SelectItem>
                                        <SelectItem value="Strategy">Strategy</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger aria-label="Filter by status">
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
                                <label className="text-sm font-medium">Platform</label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm">
                                        <Checkbox checked={platformPC} onCheckedChange={(v) => setPlatformPC(Boolean(v))} />
                                        <span>PC</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-sm">
                                        <Checkbox checked={platformMobile} onCheckedChange={(v) => setPlatformMobile(Boolean(v))} />
                                        <span>Mobile</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button variant="secondary" onClick={() => { setQuery(""); setFilterType("all"); setFilterStatus("all"); setPlatformPC(true); setPlatformMobile(false); }}>
                                    Reset
                                </Button>
                                <Button className="gap-1">
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
                        <Card>
                            <CardContent className="pt-6 space-y-3">
                                <div className="relative">
                                    <Input
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search games..."
                                        className="pl-9"
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Select value={filterType} onValueChange={setFilterType}>
                                        <SelectTrigger aria-label="Filter by type">
                                            <SelectValue placeholder="All types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="RPG">RPG</SelectItem>
                                            <SelectItem value="Shooter">Shooter</SelectItem>
                                            <SelectItem value="Puzzle">Puzzle</SelectItem>
                                            <SelectItem value="Strategy">Strategy</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                                        <SelectTrigger aria-label="Filter by status">
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

                    {/* 4 x 3 Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {filtered.map((g) => (
                            <Card key={g.id} className="overflow-hidden group">
                                <div className="relative">
                                    <AspectRatio ratio={16 / 9}>
                                        <img
                                            src={g.cover}
                                            alt={g.name}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                                        <div className="absolute left-3 right-3 bottom-3 flex items-center justify-between">
                                            <Badge variant="secondary" className="gap-1">
                                                {typeIcon(g.type)}
                                                {g.type}
                                            </Badge>
                                            {statusBadge(g.status)}
                                        </div>
                                    </AspectRatio>
                                </div>
                                <CardHeader className="pb-0">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        {g.name}
                                        <span className="sr-only">{g.type} - {g.status}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-3">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> Popular</span>
                                        <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5" /> Trending</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Coming Soon section */}
                    <div className="pt-4">
                        <h2 className="text-sm font-medium mb-3">Coming Soon</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Card key={`coming-${i}`} className="overflow-hidden">
                                    <div className="relative">
                                        <AspectRatio ratio={16 / 9}>
                                            <div className="h-full w-full bg-muted grid place-items-center">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Clock className="h-4 w-4" />
                                                    <span>Soon</span>
                                                </div>
                                            </div>
                                        </AspectRatio>
                                        <Badge className="absolute left-3 top-3">Teaser</Badge>
                                    </div>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Unannounced #{i + 1}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm text-muted-foreground">
                                        Stay tuned for updates.
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Bottom mobile nav (only visible inside sidebar per task, but we provide quick nav here too if needed) */}
            {/* Intentionally minimal outside of the Sheet to match request focus. */}
        </div>
    );
}