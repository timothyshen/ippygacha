"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { NotificationContainer } from "@/features/shared/components/notification-system"
import { NotificationProvider } from "@/contexts/notification-context"

const GachaMachine = dynamic(() => import("@/features/gacha/components/GachaMachine").then(mod => ({ default: mod.GachaMachine })), {
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-purple-600 font-medium">Loading Gacha Machine...</p>
      </div>
    </div>
  ),
  ssr: false
})

export default function Home() {
  return (
    <NotificationProvider>
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-purple-600 font-medium">Loading Gacha Machine...</p>
          </div>
        </div>
      }>
        <GachaMachine />
      </Suspense>
      <NotificationContainer />
    </NotificationProvider>
  )
}
