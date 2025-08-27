import { Layout } from "@/components/Layout"
import { HeroHeader } from "@/components/HeroHeader"
import { GamesGrid } from "@/components/GamesGrid"

export default function HomePage() {
  return (
    <Layout>
      <HeroHeader />
      <div className="max-w-7xl mx-auto p-6">
        <GamesGrid />
      </div>
    </Layout>
  )
}