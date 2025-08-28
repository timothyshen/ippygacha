"use client"
import Footer from "@/components/Footer"
import { NotificationContainer } from "@/components/notification-system"
import { NotificationProvider } from "@/contexts/notification-context"

export default function Page() {
    return (
        <NotificationProvider>
            <Footer />
            <NotificationContainer />
        </NotificationProvider>
    )
}
