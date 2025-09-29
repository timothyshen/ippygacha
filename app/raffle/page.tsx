"use client"
import Footer from "@/features/shared/components/Footer"
import { NotificationContainer } from "@/features/shared/components/notification-system"
import { NotificationProvider } from "@/contexts/notification-context"
import RafflePage from "@/features/raffle/components/RafflePage"

export default function Page() {
    return (
        <NotificationProvider>
            <RafflePage />
            <Footer />
            <NotificationContainer />
        </NotificationProvider>
    )
}
