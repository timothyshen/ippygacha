import { GachaMachine } from "@/features/gacha/components/GachaMachine"
import { NotificationContainer } from "@/features/shared/components/notification-system"
import { NotificationProvider } from "@/contexts/notification-context"

export default function Home() {
  return (
    <NotificationProvider>
      <GachaMachine />
      <NotificationContainer />
    </NotificationProvider>
  )
}
