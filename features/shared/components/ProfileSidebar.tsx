"use client"
import { Calendar, Home, Inbox, Link, Search, Settings, X } from "lucide-react"
import { useEffect, useState } from "react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail,
} from "@/components/ui/sidebar"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Menu items.
const items = [
    {
        title: "Home",
        url: "#",
        icon: Home,
    },
    {
        title: "Inbox",
        url: "#",
        icon: Inbox,
    },
    {
        title: "Calendar",
        url: "#",
        icon: Calendar,
    },
    {
        title: "Search",
        url: "#",
        icon: Search,
    },
    {
        title: "Settings",
        url: "#",
        icon: Settings,
    },
]

export function ProfileSidebar({
    isOpen,
    onOpenChange,
}: {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    return (
        <SidebarProvider
            defaultOpen={false}
            open={isOpen}
            onOpenChange={onOpenChange}
            style={
                {
                    "--sidebar-width": "20rem",
                    "--header-height": "3rem",
                } as React.CSSProperties
            }
            className="z-50"
        >
            <Sidebar
                side="right"
                collapsible="offcanvas"
                className="[&[data-side=right]]:right-0 [&[data-side=right]]:left-auto"
            >
                <SidebarHeader>
                    <div className="flex justify-between items-center p-2">
                        <h2 className="text-lg font-semibold">Profile</h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onOpenChange(false)}
                            className="h-8 w-8"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-auto p-4"
                            >
                                <Avatar className="h-12 w-12 rounded-lg border-2 border-border">
                                    <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
                                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                                        CN
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-1 flex-col text-left space-y-2">
                                    <div className="truncate font-semibold text-base">shadcn</div>
                                    <div className="flex flex-row gap-1.5">
                                        <Badge variant="secondary" className="w-fit text-xs font-medium px-2 py-1">
                                            Rank #123
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="w-fit text-xs font-medium px-2 py-1 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
                                        >
                                            Level 4
                                        </Badge>
                                    </div>
                                </div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex flex-col gap-3 border rounded-lg p-4 bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="font-semibold text-slate-800">Status</span>
                            </div>
                            <div className="text-xs text-slate-600 font-mono bg-slate-200 rounded px-2 py-1 truncate">
                                0x12345678901
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600">Balance:</span>
                                    <span className="font-semibold text-slate-800">100 IP</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600">Gas:</span>
                                    <span className="font-semibold text-slate-800">2.1 Gwei</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span className="font-semibold text-slate-800">Ranking</span>
                            </div>
                            <div className="text-xs text-slate-600 font-mono bg-purple-200 rounded px-2 py-1 truncate">
                                #123 Global
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600">Score:</span>
                                    <span className="font-semibold text-slate-800">1,250 pts</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600">Tier:</span>
                                    <span className="font-semibold text-purple-700">Diamond</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="font-semibold text-slate-800">Recent Activity</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-2 bg-white rounded border border-blue-100">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-800">Gacha Pull</span>
                                    <span className="text-xs text-slate-500">2 minutes ago</span>
                                </div>
                                <span className="text-sm font-semibold text-green-600">+50 pts</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-white rounded border border-blue-100">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-800">Daily Login</span>
                                    <span className="text-xs text-slate-500">5 hours ago</span>
                                </div>
                                <span className="text-sm font-semibold text-blue-600">+10 pts</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 border rounded-lg p-4 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                            <span className="font-semibold text-slate-800">Application</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {items.map((item) => (
                                <a
                                    key={item.title}
                                    href={item.url}
                                    className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 min-h-[80px]"
                                >
                                    <item.icon className="w-6 h-6 mb-2 text-gray-600" />
                                    <span className="text-xs font-medium text-slate-800 text-center leading-tight">
                                        {item.title}
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>
                </SidebarContent>

                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <Link href="/">
                                    <Home />
                                    <span className="text-sm text-black">Home</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>

                <SidebarRail />
            </Sidebar>
        </SidebarProvider>
    )
}