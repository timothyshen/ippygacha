"use client"
import { memo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useUserData } from "@/contexts/user-data-context";
import { useMarketplace } from "@/hooks/marketplace/useMarketplace";
import { useActiveWalletAddress } from "@/hooks/useActiveWalletAddress";
import { useIPPrice } from "@/hooks/useIPPrice";
import { formatEther } from "viem";

import { Box, Gift, LogOut, PackageOpen, ShoppingBag, Trophy, Activity as ActivityIcon, Sparkles, ExternalLink, Wallet, Loader2 } from "lucide-react";
import { LEVEL_CONFIG } from "@/lib/points-system";

type HeaderProps = {
    name: string;
    subtitle: string;
    isDark: boolean;
};

// Helper function to get activity display info
const getActivityInfo = (activityType: string) => {
    const activityMap: Record<string, { label: string; icon: string; color: string }> = {
        GACHA_PULL: { label: "Gacha Pull", icon: "🎰", color: "text-purple-600" },
        BOX_REVEAL: { label: "Box Revealed", icon: "🎁", color: "text-amber-600" },
        RAFFLE_DRAW: { label: "Raffle Entry", icon: "🎟️", color: "text-pink-600" },
        MARKETPLACE_TRADE: { label: "Trade", icon: "🔄", color: "text-blue-600" },
        MARKETPLACE_LIST: { label: "Listed Item", icon: "📝", color: "text-green-600" },
        MARKETPLACE_SALE: { label: "Item Sold", icon: "💰", color: "text-emerald-600" },
        MARKETPLACE_PURCHASE: { label: "Purchased", icon: "🛒", color: "text-indigo-600" },
        CLAW_WIN: { label: "Claw Win", icon: "🎮", color: "text-orange-600" },
        DAILY_LOGIN: { label: "Daily Login", icon: "📅", color: "text-sky-600" },
        FIRST_GACHA_DAILY: { label: "First Gacha", icon: "⭐", color: "text-yellow-600" },
        RARE_NFT_PULL: { label: "Rare NFT", icon: "💎", color: "text-violet-600" },
        HIDDEN_NFT_PULL: { label: "Hidden NFT", icon: "🌟", color: "text-fuchsia-600" },
        RARE_CLAW_WIN: { label: "Rare Claw Win", icon: "🏆", color: "text-red-600" },
    };
    return activityMap[activityType] || { label: activityType, icon: "📌", color: "text-slate-600" };
};

// Helper function to format time ago
const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export const Header = memo(({ name, subtitle, isDark }: HeaderProps) => {
    const { login, logout, user } = usePrivy();
    const activeWalletAddress = useActiveWalletAddress();
    const router = useRouter();
    const { userData, recentActivities, isLoadingUser } = useUserData();
    const { getProceeds, withdrawProceeds } = useMarketplace();
    const { price: ipPrice } = useIPPrice();

    const [proceeds, setProceeds] = useState<bigint>(BigInt(0));
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [isLoadingProceeds, setIsLoadingProceeds] = useState(false);

    const sliceAddress = (address: string) => {
        if (!address) return "";
        return `${address.slice(0, 4)}...${address.slice(-3)}`;
    };

    const containerStyles = isDark
        ? "border-slate-200/80 bg-white/80 text-slate-900"
        : "border-white/25 bg-slate-950/60 text-white";

    const secondaryText = isDark ? "text-slate-500" : "text-white/70";
    const navLinkStyles = isDark ? "text-slate-600 hover:text-slate-900" : "text-white/80 hover:text-white";
    const triggerStyles = isDark
        ? "border-slate-200/70 bg-white/85 text-slate-900 hover:bg-white"
        : "border-white/30 bg-white/10 text-white hover:bg-white/20";

    const handleHomeClick = () => {
        router.push("/");
    };

    const handleInventoryClick = () => {
        router.push("/inventory");
    };

    // Fetch proceeds when user wallet is available
    useEffect(() => {
        const fetchProceeds = async () => {
            if (activeWalletAddress) {
                try {
                    setIsLoadingProceeds(true);
                    const userProceeds = await getProceeds(activeWalletAddress);
                    setProceeds(userProceeds || BigInt(0));
                } catch (error) {
                    console.error("Error fetching proceeds:", error);
                } finally {
                    setIsLoadingProceeds(false);
                }
            }
        };

        fetchProceeds();
    }, [activeWalletAddress, getProceeds]);

    const handleWithdraw = async () => {
        try {
            setIsWithdrawing(true);
            await withdrawProceeds();
            // Refresh proceeds after withdrawal
            if (activeWalletAddress) {
                const userProceeds = await getProceeds(activeWalletAddress);
                setProceeds(userProceeds || BigInt(0));
            }
        } catch (error) {
            console.error("Withdrawal error:", error);
        } finally {
            setIsWithdrawing(false);
        }
    };

    return (
        <header className={cn("rounded-3xl border px-5 py-4 shadow-sm backdrop-blur", containerStyles)}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-wrap items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-400 bg-amber-100 text-sm font-semibold tracking-wide text-amber-700">
                        IP
                    </div>
                    <div className="flex min-w-0 flex-col">
                        <span className="truncate text-lg font-semibold sm:text-xl">{name}</span>
                        <span className={cn("hidden truncate text-xs sm:inline sm:text-sm", secondaryText)}>{subtitle}</span>
                    </div>
                </div>


                <div className="flex flex-1 items-center justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={handleHomeClick}
                        className={cn("transition-colors", navLinkStyles)}
                    >
                        Home
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleInventoryClick}
                        className={cn("transition-colors", navLinkStyles)}
                    >
                        Inventory
                    </Button>
                    {!user && (
                        <Button
                            onClick={login}
                            className="rounded-full bg-yellow-400 px-5 text-sm font-semibold text-slate-900 transition-colors hover:bg-yellow-300"
                        >
                            Login
                        </Button>
                    )}

                    {user && (
                        <Sheet>
                            <SheetTrigger asChild>
                                <button
                                    aria-label="Open profile sidebar"
                                    className={cn(
                                        "flex items-center gap-3 rounded-full border px-2 py-1.5 text-sm font-medium transition-colors sm:px-3",
                                        triggerStyles,
                                    )}
                                >
                                    <Avatar className="h-8 w-8 border border-white/40">
                                        <AvatarImage src={""} alt="User avatar" />
                                        <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-semibold text-white">
                                            {activeWalletAddress ? activeWalletAddress.slice(2, 4).toUpperCase() : "IP"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden sm:inline text-xs font-semibold">
                                        {sliceAddress(activeWalletAddress || "") || "Profile"}
                                    </span>
                                </button>
                            </SheetTrigger>
                            <SheetContent
                                side="right"
                                className="w-full max-w-md border-l border-slate-200 bg-white p-0 text-slate-900"
                            >
                                <SheetHeader className="border-b border-slate-200 bg-slate-50 px-6 py-6 text-left">
                                    <SheetTitle>
                                        <div className="flex items-start gap-4 pr-8">
                                        <Avatar className="h-14 w-14 border border-amber-200">
                                            <AvatarImage src={""} alt="User avatar" />
                                            <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-base font-semibold text-white">
                                                {activeWalletAddress ? activeWalletAddress.slice(2, 4).toUpperCase() : "IP"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="text-lg font-semibold text-slate-900">
                                                {sliceAddress(activeWalletAddress || "")}
                                            </p>
                                                <Badge className="rounded-full bg-amber-100 px-3 text-amber-700">
                                                    Level {userData?.currentLevel || 1}
                                                </Badge>
                                            </div>
                                        </div>
                                    </SheetTitle>
                                </SheetHeader>

                                <div className="space-y-6 px-6 py-6">
                                    {isLoadingUser ? (
                                        <div className="text-center text-sm text-slate-500">Loading user data...</div>
                                    ) : (
                                        <>
                                            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="text-sm font-semibold text-slate-800">Level & Progress</h3>
                                                        <p className="text-xs text-slate-500">Keep playing to level up!</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-semibold text-slate-800">
                                                            {userData?.currentLevel || 1}
                                                        </span>
                                                        <span className="text-xs text-slate-500">
                                                            {userData?.totalXp?.toLocaleString() || 0} / {LEVEL_CONFIG.getXpForLevel(userData?.currentLevel || 1)}
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={userData?.totalXp || 0}
                                                        className="[&>div]:bg-gradient-to-r [&>div]:from-yellow-400 [&>div]:via-orange-500 [&>div]:to-red-500 [&>div]:rounded-l-full"
                                                    />
                                                </div>
                                                <div className="mt-4 space-y-3">
                                                    <div className="flex justify-between text-xs text-slate-500">
                                                        <span>Total XP</span>
                                                        <span className="font-medium text-slate-700">
                                                            {userData?.totalXp?.toLocaleString() || 0}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-slate-500">Total Points</span>
                                                        <span className="font-semibold text-amber-600">
                                                            {userData?.totalPoints?.toLocaleString() || 0}
                                                        </span>
                                                    </div>
                                                </div>
                                            </section>
                                        </>
                                    )}

                                    {/* Withdraw Earnings Section */}
                                    <section className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-4 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-semibold text-emerald-800">Marketplace Earnings</h3>
                                                <p className="text-xs text-emerald-600 mt-0.5">From NFT sales</p>
                                            </div>
                                            <Wallet className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div className="mt-3 flex items-end justify-between">
                                            <div>
                                                {isLoadingProceeds ? (
                                                    <div className="h-8 w-24 bg-emerald-100 animate-pulse rounded" />
                                                ) : (
                                                    <>
                                                        <div className="text-2xl font-bold text-emerald-900">
                                                            {formatEther(proceeds)} IP
                                                        </div>
                                                        <div className="text-xs text-emerald-600">
                                                            ≈ ${(parseFloat(formatEther(proceeds)) * ipPrice).toFixed(2)}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <Button
                                                onClick={handleWithdraw}
                                                disabled={isWithdrawing || proceeds <= BigInt(0) || isLoadingProceeds}
                                                size="sm"
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                                            >
                                                {isWithdrawing ? (
                                                    <>
                                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                        Withdrawing...
                                                    </>
                                                ) : (
                                                    "Withdraw"
                                                )}
                                            </Button>
                                        </div>
                                    </section>

                                    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <h3 className="text-sm font-semibold text-slate-800">Quick actions</h3>
                                        <div className="mt-4 grid grid-cols-2 gap-3">
                                            <Link
                                                href="/inventory"
                                                className="group flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center transition-colors hover:border-amber-300 hover:bg-amber-50"
                                            >
                                                <span className="rounded-full bg-amber-100 p-3 text-amber-600">
                                                    <PackageOpen className="h-5 w-5" />
                                                </span>
                                                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                                                    Inventory
                                                </span>
                                            </Link>
                                            <Link
                                                href="/market"
                                                className="group flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center transition-colors hover:border-emerald-300 hover:bg-emerald-50"
                                            >
                                                <span className="rounded-full bg-emerald-100 p-3 text-emerald-600">
                                                    <ShoppingBag className="h-5 w-5" />
                                                </span>
                                                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                                                    Market
                                                </span>
                                            </Link>
                                            <Link
                                                href="/gacha"
                                                className="group flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center transition-colors hover:border-amber-300 hover:bg-amber-50"
                                            >
                                                <span className="rounded-full bg-amber-100 p-3 text-amber-600">
                                                    <Box className="h-5 w-5" />
                                                </span>
                                                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                                                    Gacha
                                                </span>
                                            </Link>
                                            <Link
                                                href="/raffle"
                                                className="group flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center transition-colors hover:border-emerald-300 hover:bg-emerald-50"
                                            >
                                                <span className="rounded-full bg-emerald-100 p-3 text-emerald-600">
                                                    <Gift className="h-5 w-5" />
                                                </span>
                                                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                                                    Raffle
                                                </span>
                                            </Link>
                                        </div>
                                    </section>

                                    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-semibold text-slate-800">Recent Activity</h3>
                                            <ActivityIcon className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <div className="mt-4 space-y-2">
                                            {!recentActivities || recentActivities.length === 0 ? (
                                                <div className="rounded-xl bg-slate-50 px-4 py-6 text-center">
                                                    <Sparkles className="mx-auto h-8 w-8 text-slate-300" />
                                                    <p className="mt-2 text-xs text-slate-500">No activity yet</p>
                                                    <p className="text-xs text-slate-400">Start playing to see your history!</p>
                                                </div>
                                            ) : (
                                                recentActivities.map((activity) => {
                                                    const info = getActivityInfo(activity.activityType);
                                                    return (
                                                        <div
                                                            key={activity.id}
                                                            className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 transition-colors hover:bg-slate-100"
                                                        >
                                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                <span className="text-lg flex-shrink-0">{info.icon}</span>
                                                                <div className="flex flex-col min-w-0 flex-1">
                                                                    <span className={cn("text-xs font-medium", info.color)}>
                                                                        {info.label}
                                                                    </span>
                                                                    <span className="text-xs text-slate-400">
                                                                        {getTimeAgo(activity.createdAt)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-xs font-semibold text-amber-600">
                                                                        +{activity.pointsEarned}
                                                                    </span>
                                                                    <Trophy className="h-3 w-3 text-amber-500" />
                                                                </div>
                                                                {activity.txnHash && (
                                                                    <a
                                                                        href={`https://aeneid.storyscan.io/tx/${activity.txnHash}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-0.5 text-xs text-blue-500 hover:text-blue-600 transition-colors"
                                                                    >
                                                                        <span className="font-mono">
                                                                            {activity.txnHash.slice(0, 6)}...
                                                                        </span>
                                                                        <ExternalLink className="h-2.5 w-2.5" />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </section>

                                    {/* Logout Section */}
                                    <section className="pt-4 border-t border-slate-200">
                                        <Button
                                            variant="outline"
                                            onClick={logout}
                                            className="w-full justify-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            <span>Logout</span>
                                        </Button>
                                    </section>
                                </div>
                            </SheetContent>
                        </Sheet>
                    )}
                </div>
            </div>
        </header>
    );
});

Header.displayName = "Header";
