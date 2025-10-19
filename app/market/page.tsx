import Hero from "@/features/shared/components/HeroHeader"
import PageWrapper from "@/features/shared/components/PageWrapper"
import Footer from "@/features/shared/components/Footer"
import { MarketplacePage } from "@/features/market/components/MarketplacePage"
import { NotificationContainer } from "@/features/shared/components/notification-system"
import { NotificationProvider } from "@/contexts/notification-context"

export default function Market() {
  return (
    <div className="min-h-screen bg-background">
      <NotificationProvider>
        <MarketplacePage />
        <NotificationContainer />
      </NotificationProvider>
    </div>
  )
}
