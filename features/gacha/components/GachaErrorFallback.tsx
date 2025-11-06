"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, Home, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";

export const GachaErrorFallback = () => {
  const router = useRouter();

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border-2 border-red-200 p-8 text-center">
        <div className="mb-6">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Gacha Machine Error
          </h1>
          <p className="text-slate-600 text-sm">
            Something went wrong with the Gacha Machine. This might be due to a network issue or
            an unexpected error.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleRefresh}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            size="lg"
          >
            <RefreshCcw className="h-5 w-5 mr-2" />
            Refresh Page
          </Button>

          <Button
            onClick={handleGoHome}
            variant="outline"
            className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
            size="lg"
          >
            <Home className="h-5 w-5 mr-2" />
            Go to Home
          </Button>
        </div>

        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-xs text-amber-800">
            💡 <strong>Tip:</strong> If the problem persists, try disconnecting and reconnecting
            your wallet, or check your network connection.
          </p>
        </div>
      </div>
    </div>
  );
};
