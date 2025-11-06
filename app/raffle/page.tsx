"use client"
import Footer from "@/features/shared/components/Footer"
import { NotificationContainer } from "@/features/shared/components/notification-system"
import { NotificationProvider } from "@/contexts/notification-context"
import { RaffleProvider } from "@/contexts/raffle-context"
import RafflePage from "@/features/raffle/components/RafflePage"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { RaffleErrorFallback } from "@/features/raffle/components/RaffleErrorFallback"

export default function Page() {
    return (
        <ErrorBoundary
            fallback={<RaffleErrorFallback />}
            onError={(error, errorInfo) => {
                // Log to error tracking service (e.g., Sentry)
                console.error("Raffle page error:", error, errorInfo);
            }}
        >
            <NotificationProvider>
                <RaffleProvider>
                    <RafflePage />
                    <Footer />
                    <NotificationContainer />
                </RaffleProvider>
            </NotificationProvider>
        </ErrorBoundary>
    )
}
