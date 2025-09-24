import InventoryPage from "@/features/inventory/components/InventoryPage"
import { NotificationProvider } from "@/contexts/notification-context"
import { NotificationContainer } from "@/features/shared/components/notification-system"

export default function Home() {

  return (
    <NotificationProvider>
      <InventoryPage />
      <NotificationContainer />
    </NotificationProvider>
  )
}
