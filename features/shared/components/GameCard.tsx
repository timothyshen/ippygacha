"use client"
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Gift } from "lucide-react";
import { useRouter } from "next/navigation";

interface GameCardProps {
    title: string;
    description: string;
    image: string;
    category: string;
    status: string;
    players: string;
    rewards: string;
    hot?: boolean;
}

export default function GameCard({
    title,
    description,
    image,
    category,
    status,
    players,
    rewards,
    hot = false,
}: GameCardProps) {
    const router = useRouter();
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "online":
                return "bg-green-600 text-white border-green-600";
            case "maintenance":
                return "bg-amber-600 text-white border-amber-600";
            default:
                return "bg-gray-600 text-white border-gray-600";
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category.toLowerCase()) {
            case "gacha":
                return "bg-purple-600 text-white border-purple-600";
            case "arcade":
                return "bg-red-600 text-white border-red-600";
            case "strategy":
                return "bg-blue-600 text-white border-blue-600";
            default:
                return "bg-gray-600 text-white border-gray-600";
        }
    };

    return (
        <Card className="overflow-hidden shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all duration-300 group cursor-pointer" onClick={() => router.push(`/${title.toLowerCase().replace(/ /g, "-")}`)}>
            <div className="relative aspect-video overflow-hidden bg-muted rounded-t-[var(--radius)]">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {hot && (
                    <Badge className="absolute top-3 right-3 bg-red-500 text-white border-0">
                        HOT
                    </Badge>
                )}
                <div className="absolute bottom-3 left-3 flex gap-2">
                    <Badge variant="outline" className={getCategoryColor(category)}>
                        {category}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(status)}>
                        {status}
                    </Badge>
                </div>
            </div>

            <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 text-primary">{title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {description}
                </p>

                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-primary" />
                        <span className="text-muted-foreground">{players}</span>
                        <span className="text-muted-foreground/50">Players</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Gift className="h-3 w-3 text-primary" />
                        <span className="text-muted-foreground">{rewards}</span>
                        <span className="text-muted-foreground/50">Rewards</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
