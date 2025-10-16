import type { LucideIcon } from "lucide-react";
import { Gift, Trophy, Users } from "lucide-react";
import { Header } from "./Header";

interface HeroStat {
  title: string;
  subtitle: string;
  icon: LucideIcon;
}

const StatPill = ({ title, subtitle, icon: Icon }: HeroStat) => (
  <div className="flex items-center gap-2 bg-background/60 backdrop-blur-sm px-5 py-3 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all">
    <div className="p-2 bg-gradient-primary rounded-full">
      <Icon className="h-4 w-4 text-primary-foreground" />
    </div>
    <div className="text-left">
      <div className="text-lg font-bold text-primary">{title}</div>
      <div className="text-xs text-muted-foreground">{subtitle}</div>
    </div>
  </div>
);

const heroStats: HeroStat[] = [
  {
    title: "5K+",
    subtitle: "Players",
    icon: Users,
  },
  {
    title: "100+",
    subtitle: "Collectibles",
    icon: Trophy,
  },
  {
    title: "Daily",
    subtitle: "Rewards",
    icon: Gift,
  },
];

export default function Hero() {
  return (
    <div className="bg-gradient-hero border-b border-border relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-background/20 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Navigation with shadow */}
      <Header name="Ippy Playground" subtitle="Welcome to the Ippy Verse" isDark={true} isMarketplace={false} />

      {/* Hero Content */}
      <div className="container mx-auto px-4 py-24 text-center relative z-10">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary mb-6 drop-shadow-sm">
            Ippy Playground
          </h1>
          <p className="text-xl md:text-2xl text-gradient font-semibold mb-3 animate-slide-up">
            Welcome to the Ippy Verse
          </p>
          <p className="text-base md:text-lg text-primary/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join the ultimate gaming experience through Gacha, Claw machines, and more exciting adventures!
          </p>
        </div>

        {/* Stats with enhanced styling */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 animate-slide-up">
          {heroStats.map((stat) => (
            <StatPill key={stat.subtitle} {...stat} />
          ))}
        </div>
      </div>
    </div>
  );
}
