import Hero from "@/features/shared/components/HeroHeader"
import PageWrapper from "@/features/shared/components/PageWrapper"
import Footer from "@/features/shared/components/Footer"
import InventoryPage from "@/features/inventory/components/InventoryPage"
import { NotificationProvider } from "@/contexts/notification-context"
import { NotificationContainer } from "@/features/shared/components/notification-system"

export default function Home() {

  return (
    <div className="min-h-screen bg-background">
      <NotificationProvider>
        <InventoryPage />
        <NotificationContainer />
      </NotificationProvider>
    </div>
  )
}
