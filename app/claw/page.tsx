"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { NotificationContainer } from "@/features/shared/components/notification-system"
import { NotificationProvider } from "@/contexts/notification-context"

const ClawMachine = dynamic(() => import("@/features/claw/components/ClawMachine"), {
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-indigo-600 font-medium">Loading Claw Machine...</p>
      </div>
    </div>
  ),
  ssr: false
})

export default function Page() {
  return (
    <NotificationProvider>
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-indigo-600 font-medium">Loading Claw Machine...</p>
          </div>
        </div>
      }>
        <ClawMachine />
      </Suspense>
      <NotificationContainer />
    </NotificationProvider>
  )
}
