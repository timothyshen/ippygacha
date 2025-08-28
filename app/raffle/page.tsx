"use client"
import Footer from "@/features/shared/components/Footer"
import { NotificationContainer } from "@/features/shared/components/notification-system"
import { NotificationProvider } from "@/contexts/notification-context"

export default function Page() {
    return (
        <NotificationProvider>
            <Footer />
            <NotificationContainer />
        </NotificationProvider>
    )
}
