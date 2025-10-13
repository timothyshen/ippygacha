import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageWrapperProps {
    children: ReactNode;
    className?: string;
    maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

const maxWidthClasses = {
    sm: "max-w-3xl",
    md: "max-w-5xl",
    lg: "max-w-7xl",
    xl: "max-w-[1400px]",
    full: "max-w-full",
};

export default function PageWrapper({
    children,
    className,
    maxWidth = "xl"
}: PageWrapperProps) {
    return (
        <div className="min-h-screen bg-background">
            <div className={cn(
                "container mx-auto px-4 py-8",
                maxWidthClasses[maxWidth],
                className
            )}>
                {children}
            </div>
        </div>
    );
}
