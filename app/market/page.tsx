import { MarketplacePage } from "@/features/market/components/MarketplacePage"
import { NotificationContainer } from "@/features/shared/components/notification-system"
import { NotificationProvider } from "@/contexts/notification-context"

export default function Market() {
  return (
    <NotificationProvider>
      <MarketplacePage />
      <NotificationContainer />
    </NotificationProvider>
  )
}
