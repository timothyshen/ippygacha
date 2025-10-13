import Hero from "@/features/shared/components/HeroHeader";
import FilterBar from "@/features/shared/components/FilterBar";
import GamesGrid from "@/features/shared/components/GamesGrid";
import PageWrapper from "@/features/shared/components/PageWrapper";
import Footer from "@/features/shared/components/Footer";

const Index = () => {
    return (
        <div className="min-h-screen bg-background">
            <Hero />
            <PageWrapper className="py-16">
                <FilterBar />
                <GamesGrid />
            </PageWrapper>
            <Footer />
        </div>
    );
};

export default Index;
