
"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import Footer from "@/features/shared/components/Footer";
import { NotificationContainer } from "@/features/shared/components/notification-system";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GachaErrorFallback } from "@/features/gacha/components/GachaErrorFallback";

const GachaMachine = dynamic(
  () => import("@/features/gacha/components/GachaMachine").then((mod) => ({ default: mod.GachaMachine })),
  {
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-700 font-semibold text-lg">Loading Gacha Machine...</p>
          <p className="text-purple-500 text-sm mt-2">Preparing your premium experience</p>
        </div>
      </div>
    ),
    ssr: false,
  }
);

export default function GachaPage() {
  return (
    <ErrorBoundary
      fallback={<GachaErrorFallback />}
      onError={(error, errorInfo) => {
        // Log to error tracking service (e.g., Sentry)
        console.error("Gacha page error:", error, errorInfo);
      }}
    >
      <Suspense
        fallback={
          <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
              <p className="text-purple-700 font-semibold text-lg">Loading Gacha Machine...</p>
              <p className="text-purple-500 text-sm mt-2">Preparing your premium experience</p>
            </div>
          </div>
        }
      >
        <GachaMachine />
        <NotificationContainer />
      </Suspense>
    </ErrorBoundary>
  );
}

