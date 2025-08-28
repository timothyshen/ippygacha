import { Layout } from "@/features/shared/components/Layout"
import { HeroHeader } from "@/features/shared/components/HeroHeader"
import { GamesGrid } from "@/features/shared/components/GamesGrid"

export default function HomePage() {
  return (
    <Layout>
      <HeroHeader />
      <div className="max-w-7xl mx-auto p-6">
        <GamesGrid />
      </div>
      <div className="container mx-auto px-4">
        <p className="text-center text-white">
          &copy; {new Date().getFullYear()} Gacha Machine. All rights reserved.
        </p>
      </div>
    </Layout>
  )
}