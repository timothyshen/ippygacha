import React from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface RaffleErrorFallbackProps {
  error?: Error | null;
  onReset?: () => void;
  title?: string;
  description?: string;
}

/**
 * Error fallback UI specifically for raffle feature
 * Provides helpful context and recovery options
 */
export const RaffleErrorFallback: React.FC<RaffleErrorFallbackProps> = ({
  error,
  onReset,
  title = "Raffle Temporarily Unavailable",
  description = "We encountered an issue loading the raffle. This might be due to a network error or a temporary problem with the smart contract.",
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-card border-2 border-destructive/50 rounded-lg p-8 shadow-xl">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>

            <h1 className="text-3xl font-bold text-primary mb-3">{title}</h1>

            <p className="text-muted-foreground mb-6 max-w-md">{description}</p>

            {error && (
              <div className="w-full bg-muted/50 border border-border rounded-md p-4 mb-6 text-left">
                <p className="text-xs font-mono text-muted-foreground break-all">
                  <span className="font-semibold text-destructive">Error:</span>{" "}
                  {error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {onReset && (
                <Button
                  onClick={onReset}
                  className="flex items-center gap-2"
                  size="lg"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
              )}

              <Link href="/" passHref>
                <Button variant="outline" size="lg" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
              </Link>
            </div>

            <div className="mt-8 text-sm text-muted-foreground">
              <p className="mb-2">Common solutions:</p>
              <ul className="list-disc list-inside text-left space-y-1">
                <li>Check your internet connection</li>
                <li>Refresh the page</li>
                <li>Make sure your wallet is connected</li>
                <li>Try again in a few moments</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Lightweight error fallback for smaller sections
 */
export const RaffleSectionErrorFallback: React.FC<{
  onReset?: () => void;
  sectionName?: string;
}> = ({ onReset, sectionName = "this section" }) => {
  return (
    <div className="w-full bg-destructive/10 border-2 border-destructive/30 rounded-lg p-6 text-center">
      <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-3" />
      <p className="text-sm font-semibold text-destructive mb-2">
        Failed to load {sectionName}
      </p>
      {onReset && (
        <Button onClick={onReset} size="sm" variant="outline">
          <RefreshCw className="w-3 h-3 mr-2" />
          Retry
        </Button>
      )}
    </div>
  );
};
