"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Users, Package, Gift, Search, CheckCircle2, AlertTriangle, Flame } from "lucide-react";
import { Header } from "@/features/shared/components/Header";

type Game = {
    id: string;
    name: string;
    type: string;
    status: "Online" | "Maintenance" | "Beta";
    description: string;
    cover: string;
    players?: string;
    rewards?: string;
    href?: string;
    isNew?: boolean;
    isPopular?: boolean;
    platforms: Array<"pc" | "mobile">;
};

const ALL_GAMES: Game[] = [
    {
        id: "gacha",
        name: "Gacha Zone",
        type: "Gacha",
        status: "Online",
        description: "Collect premium designer figures and build your ultimate collection.",
        cover: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=60",
        players: "1.2K+",
        rewards: "IPPY",
        href: "/gacha",
        isPopular: true,
        platforms: ["pc", "mobile"],
    },
    {
        id: "claw",
        name: "Claw Master",
        type: "Arcade",
        status: "Maintenance",
        description: "Test your skills with the classic claw machine experience.",
        cover: "https://images.unsplash.com/photo-1511512578047-9f1f2f0d3cb7?auto=format&fit=crop&w=1200&q=60",
        players: "Soon",
        rewards: "Plush Toys",
        platforms: ["pc"],
    },
    {
        id: "raffle",
        name: "Lucky Raffle",
        type: "Lottery",
        status: "Beta",
        description: "Enter daily raffles for exclusive prizes and rewards.",
        cover: "https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?auto=format&fit=crop&w=1200&q=60",
        players: "Soon",
        rewards: "Mystery Boxes",
        href: "/raffle",
        isNew: true,
        platforms: ["mobile"],
    },
    {
        id: "game-4",
        name: "Mystery Game #1",
        type: "Strategy",
        status: "Maintenance",
        description: "An exciting new game experience coming soon.",
        cover: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=60",
        platforms: ["pc"],
    },
    {
        id: "game-5",
        name: "Mystery Game #2",
        type: "Puzzle",
        status: "Maintenance",
        description: "Challenge your mind with this upcoming puzzle adventure.",
        cover: "https://images.unsplash.com/photo-1520975693416-0d37d2a7a4ae?auto=format&fit=crop&w=1200&q=60",
        platforms: ["mobile"],
    },
    {
        id: "game-6",
        name: "Mystery Game #3",
        type: "RPG",
        status: "Maintenance",
        description: "Embark on an epic journey in the Ippy universe.",
        cover: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=1200&q=60",
        platforms: ["pc", "mobile"],
    },
];

const TYPE_OPTIONS = ["all", ...Array.from(new Set(ALL_GAMES.map((game) => game.type)))];

const STAT_ITEMS = [
    { label: "5K+ Players", icon: Users },
    { label: "100+ Collectibles", icon: Package },
    { label: "Daily Rewards", icon: Gift },
];

const statusStyles: Record<Game["status"], string> = {
    Online: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    Maintenance: "bg-amber-100 text-amber-700 border border-amber-200",
    Beta: "bg-sky-100 text-sky-700 border border-sky-200",
};

const statusIcon: Record<Game["status"], JSX.Element> = {
    Online: <CheckCircle2 className="h-3.5 w-3.5" />,
    Maintenance: <AlertTriangle className="h-3.5 w-3.5" />,
    Beta: <Flame className="h-3.5 w-3.5" />,
};

const typeBadgeLabel: Record<string, string> = {
    Gacha: "Gacha",
    Arcade: "Arcade",
    Lottery: "Raffle",
    Strategy: "Strategy",
    Puzzle: "Puzzle",
    RPG: "RPG",
};

export default function HomePage() {
    const { login, logout, user } = usePrivy();
    const router = useRouter();

    const [query, setQuery] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [platformPC, setPlatformPC] = useState(true);
    const [platformMobile, setPlatformMobile] = useState(true);

    const filtered = useMemo(() => {
        return ALL_GAMES.filter((game) => {
            const matchesQuery = query
                ? game.name.toLowerCase().includes(query.toLowerCase()) ||
                  game.description.toLowerCase().includes(query.toLowerCase())
                : true;
            const matchesType = filterType === "all" ? true : game.type === filterType;
            const matchesStatus = filterStatus === "all" ? true : game.status === filterStatus;
            const matchesPlatform =
                (!platformPC && !platformMobile) ||
                (platformPC && game.platforms.includes("pc")) ||
                (platformMobile && game.platforms.includes("mobile"));

            return matchesQuery && matchesType && matchesStatus && matchesPlatform;
        });
    }, [query, filterType, filterStatus, platformPC, platformMobile]);

    const handleGameClick = (game: Game) => {
        if (game.href) {
            router.push(game.href);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <section className="relative border-b border-slate-200/60 bg-gradient-to-br from-amber-50 via-white to-yellow-50">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(253,230,138,0.35),_transparent_60%)]" />
                <div className="relative mx-auto max-w-6xl px-6 py-10 md:py-14">
                    <Header name="Ippy Playground" subtitle="Welcome to the Ippy Verse" isDark={true} isMarketplace={false} />

                    <div className="mt-10 max-w-3xl space-y-6">
                        <div className="space-y-3">
                            <p className="text-xs font-semibold tracking-[0.3em] text-amber-600">ON-CHAIN COLLECTIBLES</p>
                            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                                Discover drops, raffles, and claw machines built for super fans.
                            </h1>
                            <p className="text-base text-slate-600 sm:text-lg">
                                Explore curated games powered by the Ippy protocol. Track inventory, enter daily raffles, and claim
                                limited collectibles with consistent metadata.
                            </p>
                        </div>

                        <dl className="grid gap-4 sm:grid-cols-3">
                            {STAT_ITEMS.map(({ label, icon: Icon }) => (
                                <div
                                    key={label}
                                    className="flex items-center gap-3 rounded-xl border border-amber-200/60 bg-white/70 px-4 py-3 text-slate-700 shadow-sm"
                                >
                                    <Icon className="h-5 w-5 text-amber-600" />
                                    <span className="text-sm font-medium sm:text-base">{label}</span>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </section>

            <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
                <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-wrap gap-2 rounded-full bg-slate-100/80 p-1 lg:flex-1">
                            {TYPE_OPTIONS.map((type) => {
                                const isActive = filterType === type;
                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setFilterType(type)}
                                        aria-pressed={isActive}
                                        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                            isActive ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                                        }`}
                                    >
                                        {type === "all" ? "All Games" : type}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <div className="relative w-full md:w-64">
                                <Input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Search experiences"
                                    className="h-10 rounded-full border-slate-200 bg-slate-50 pl-10 text-sm text-slate-700 placeholder:text-slate-400"
                                />
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            </div>

                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="h-10 w-full rounded-full border-slate-200 bg-slate-50 text-sm text-slate-600 md:w-40">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value="Online">Online</SelectItem>
                                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                                    <SelectItem value="Beta">Beta</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex w-full items-center justify-between gap-2 rounded-full border border-slate-200 bg-slate-50 p-1 md:w-auto">
                                <button
                                    type="button"
                                    aria-pressed={platformPC}
                                    onClick={() => setPlatformPC((prev) => !prev)}
                                    className={`w-full rounded-full px-3 py-1 text-xs font-medium transition-colors md:w-auto md:px-4 md:text-sm ${
                                        platformPC ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                                    }`}
                                >
                                    Desktop
                                </button>
                                <button
                                    type="button"
                                    aria-pressed={platformMobile}
                                    onClick={() => setPlatformMobile((prev) => !prev)}
                                    className={`w-full rounded-full px-3 py-1 text-xs font-medium transition-colors md:w-auto md:px-4 md:text-sm ${
                                        platformMobile ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                                    }`}
                                >
                                    Mobile
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {filtered.map((game) => (
                            <Card
                                key={game.id}
                                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 shadow-sm transition-transform hover:-translate-y-1"
                                onClick={() => handleGameClick(game)}
                            >
                                <div className="relative">
                                    <AspectRatio ratio={16 / 10}>
                                        {/* TODO: Replace static cover with NFT media fetched from a dedicated API. */}
                                        <Image
                                            src={game.cover}
                                            alt={game.name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        />
                                    </AspectRatio>
                                    <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-full bg-white/80 px-4 py-1.5 text-xs font-medium text-slate-600 backdrop-blur">
                                        <span>{typeBadgeLabel[game.type] ?? game.type}</span>
                                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${statusStyles[game.status]}`}>
                                            {statusIcon[game.status]}
                                            {game.status}
                                        </span>
                                    </div>
                                </div>
                                <CardHeader className="space-y-2">
                                    <CardTitle className="text-lg font-semibold text-slate-900">
                                        {game.name}
                                    </CardTitle>
                                    <p className="text-sm text-slate-500">{game.description}</p>
                                </CardHeader>
                                <CardContent className="flex items-center gap-4 text-xs text-slate-500">
                                    {game.players && (
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-900">{game.players}</span>
                                            <span>Players</span>
                                        </div>
                                    )}
                                    {game.rewards && (
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-900">{game.rewards}</span>
                                            <span>Rewards</span>
                                        </div>
                                    )}
                                </CardContent>
                                {(game.isNew || game.isPopular) && (
                                    <div className="absolute right-4 top-4 flex flex-col items-end gap-2 text-xs font-semibold text-slate-900">
                                        {game.isNew && <Badge className="rounded-full bg-sky-500 px-3 text-white">New</Badge>}
                                        {game.isPopular && <Badge className="rounded-full bg-amber-400 px-3 text-slate-900">Popular</Badge>}
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center">
                            <h3 className="text-lg font-semibold text-slate-800">No results yet</h3>
                            <p className="max-w-md text-sm text-slate-500">
                                Adjust the filters or enable a platform to see available games. New drops are added regularly.
                            </p>
                        </div>
                    )}
                </section>

                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-slate-900">Coming Soon</h2>
                        <span className="text-sm text-slate-500">Prototype features under development</span>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <Card key={`coming-${index}`} className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm">
                                <div className="relative">
                                    <AspectRatio ratio={16 / 10}>
                                        <div className="h-full w-full rounded-t-2xl bg-gradient-to-br from-amber-100 via-yellow-100 to-white" />
                                    </AspectRatio>
                                    <Badge className="absolute left-4 top-4 rounded-full bg-slate-900 px-3 text-xs font-semibold text-white">
                                        Preview
                                    </Badge>
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-base font-semibold text-slate-900">
                                        Mystery Game #{index + 1}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-slate-500">
                                    We are polishing the experience. Subscribe for early access updates.
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            </main>

            <footer className="border-t border-slate-200/70 bg-white/70">
                <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Ippy Playground. All rights reserved.</p>
                    <p className="mt-2 max-w-2xl">
                        Join a growing community of collectors and players earning on-chain rewards across interoperable games.
                    </p>
                </div>
            </footer>
        </div>
    );
}
