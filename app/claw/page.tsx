"use client"

import ClawMachine from "@/components/claw/claw-machine"
import Footer from "@/components/Footer"
import { NotificationContainer } from "@/components/notification-system"
import { NotificationProvider } from "@/contexts/notification-context"

export default function Page() {
  return (
    <NotificationProvider>
      <ClawMachine />
      <Footer />
      <NotificationContainer />
    </NotificationProvider>
  )
}
