import { MarketplacePage } from "@/components/market/MarketplacePage"
import { NotificationContainer } from "@/components/notification-system"
import { NotificationProvider } from "@/contexts/notification-context"

export default function Market() {
  return (
    <NotificationProvider>
      <MarketplacePage />
      <NotificationContainer />
    </NotificationProvider>
  )
}
