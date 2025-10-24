import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SectionProps {
    children: ReactNode;
    className?: string;
    id?: string;
    contained?: boolean;
    spacing?: "sm" | "md" | "lg" | "xl";
}

const spacingClasses = {
    sm: "py-8 md:py-12",
    md: "py-12 md:py-16",
    lg: "py-16 md:py-24",
    xl: "py-24 md:py-32",
};

export default function Section({
    children,
    className,
    id,
    contained = true,
    spacing = "md",
}: SectionProps) {
    return (
        <section id={id} className={cn(spacingClasses[spacing], className)}>
            {contained ? (
                <div className="container mx-auto px-4">{children}</div>
            ) : (
                children
            )}
        </section>
    );
}
