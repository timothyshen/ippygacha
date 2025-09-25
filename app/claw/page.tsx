"use client"

import ClawMachine from "@/features/claw/components/ClawMachine"
import { NotificationContainer } from "@/features/shared/components/notification-system"
import { NotificationProvider } from "@/contexts/notification-context"

export default function Page() {
  return (
    <NotificationProvider>
      <ClawMachine />
      <NotificationContainer />
    </NotificationProvider>
  )
}
