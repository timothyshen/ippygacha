"use client"
import { memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { LogOut, PackageOpen, ShoppingBag, Trophy, Zap } from "lucide-react";

type HeaderProps = {
    name: string;
    subtitle: string;
    isDark: boolean;
    isMarketplace: boolean;
};

export const Header = memo(({ name, subtitle, isDark, isMarketplace }: HeaderProps) => {
    const { login, logout, user } = usePrivy();
    const router = useRouter();

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
        if (isMarketplace) {
            router.push("/market");
        } else {
            router.push("/inventory");
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

                <nav className="flex flex-1 items-center justify-start gap-4 text-sm font-medium sm:justify-center">
                    <button
                        type="button"
                        onClick={handleHomeClick}
                        className={cn("transition-colors", navLinkStyles)}
                    >
                        Home
                    </button>
                    <button
                        type="button"
                        onClick={handleInventoryClick}
                        className={cn("transition-colors", navLinkStyles)}
                    >
                        {isMarketplace ? "Marketplace" : "Inventory"}
                    </button>
                </nav>

                <div className="flex flex-1 items-center justify-end gap-3">
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
                                        <AvatarImage src={user?.profile?.pictureUrl || ""} alt="User avatar" />
                                        <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-semibold text-white">
                                            {user?.wallet?.address ? user.wallet.address.slice(2, 4).toUpperCase() : "IP"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden sm:inline text-xs font-semibold">
                                        {sliceAddress(user?.wallet?.address || "") || "Profile"}
                                    </span>
                                </button>
                            </SheetTrigger>
                            <SheetContent
                                side="right"
                                className="w-full max-w-md border-l border-slate-200 bg-white p-0 text-slate-900"
                            >
                                <SheetHeader className="border-b border-slate-200 bg-slate-50 px-6 py-6 text-left">
                                    <SheetTitle>
                                        <div className="flex items-start gap-4">
                                            <Avatar className="h-14 w-14 border border-amber-200">
                                                <AvatarImage src={user?.profile?.pictureUrl || ""} alt="User avatar" />
                                                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-base font-semibold text-white">
                                                    {user?.wallet?.address ? user.wallet.address.slice(2, 4).toUpperCase() : "IP"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="text-lg font-semibold text-slate-900">
                                                    {sliceAddress(user?.wallet?.address || "")}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    Linked via Privy · Active
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={logout}>
                                                <LogOut className="h-4 w-4" />
                                                <span className="hidden sm:inline">Logout</span>
                                            </Button>
                                        </div>
                                    </SheetTitle>
                                </SheetHeader>

                                <div className="space-y-6 px-6 py-6">
                                    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-semibold text-slate-800">Rank</h3>
                                                <p className="text-xs text-slate-500">Daily progression toward rewards</p>
                                            </div>
                                            <Badge className="rounded-full bg-amber-100 px-3 text-amber-700">Diamond III</Badge>
                                        </div>
                                        <div className="mt-4 space-y-2">
                                            <div className="flex justify-between text-xs text-slate-500">
                                                <span>EXP</span>
                                                <span className="font-medium text-slate-700">3,420 / 5,000</span>
                                            </div>
                                            <Progress value={68} className="h-2" />
                                            <p className="text-xs text-slate-500">1,580 EXP to next tier</p>
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
                                        </div>
                                    </section>

                                    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <h3 className="text-sm font-semibold text-slate-800">Weekly snapshot</h3>
                                        <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                                            <div className="rounded-xl bg-slate-50 px-3 py-4">
                                                <Trophy className="mx-auto h-5 w-5 text-amber-500" />
                                                <span className="mt-2 block text-lg font-semibold text-slate-800">12</span>
                                                <span className="text-xs text-slate-500">Games played</span>
                                            </div>
                                            <div className="rounded-xl bg-slate-50 px-3 py-4">
                                                <Zap className="mx-auto h-5 w-5 text-sky-500" />
                                                <span className="mt-2 block text-lg font-semibold text-slate-800">8</span>
                                                <span className="text-xs text-slate-500">Prizes won</span>
                                            </div>
                                        </div>
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
