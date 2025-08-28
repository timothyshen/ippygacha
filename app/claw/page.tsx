"use client"

import ClawMachine from "@/components/claw/ClawMachine"
import { NotificationContainer } from "@/components/notification-system"
import { NotificationProvider } from "@/contexts/notification-context"

export default function Page() {
  return (
    <NotificationProvider>
      <ClawMachine />
      <NotificationContainer />
    </NotificationProvider>
  )
}
