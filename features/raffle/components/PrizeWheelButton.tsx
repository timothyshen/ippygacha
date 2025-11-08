import React from "react";
import { Sparkles, Clock, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrizeWheelButtonProps {
  walletConnected: boolean;
  canSpin: boolean;
  isSpinning: boolean;
  isTransactionPending: boolean;
  cooldownHours: number;
  cooldownMinutes: number;
  onSpin: () => void;
}

// Button state components for clearer code
const TransactionPendingButton = () => (
  <div className="flex flex-col items-center text-xs">
    <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mb-1" />
    <span>TX...</span>
  </div>
);

const SpinningButton = () => (
  <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
);

const WalletDisconnectedButton = () => (
  <div className="flex flex-col items-center text-xs">
    <Wallet className="h-4 w-4 mb-1" />
    <span>WALLET</span>
  </div>
);

const ReadyToSpinButton = () => (
  <div className="flex flex-col items-center">
    <Sparkles className="h-5 w-5 mb-1" />
    <span>SPIN</span>
  </div>
);

const CooldownButton = ({ cooldownHours, cooldownMinutes }: { cooldownHours: number; cooldownMinutes: number }) => (
  <div className="flex flex-col items-center text-xs">
    <Clock className="h-4 w-4 mb-1" />
    <span className="text-[10px] leading-tight">
      {cooldownHours > 0 ? `${cooldownHours}h` : `${cooldownMinutes}m`}
    </span>
  </div>
);

/**
 * Determines which button state to render based on current conditions
 */
const getButtonContent = (props: Omit<PrizeWheelButtonProps, 'onSpin'>) => {
  if (props.isTransactionPending) {
    return <TransactionPendingButton />;
  }

  if (props.isSpinning) {
    return <SpinningButton />;
  }

  if (!props.walletConnected) {
    return <WalletDisconnectedButton />;
  }

  if (props.canSpin) {
    return <ReadyToSpinButton />;
  }

  return <CooldownButton cooldownHours={props.cooldownHours} cooldownMinutes={props.cooldownMinutes} />;
};

export const PrizeWheelButton = React.memo((props: PrizeWheelButtonProps) => {
  const { walletConnected, canSpin, isSpinning, onSpin } = props;

  return (
    <Button
      onClick={onSpin}
      disabled={!walletConnected || !canSpin || isSpinning}
      className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl border-4 border-white text-sm font-bold"
    >
      {getButtonContent(props)}
    </Button>
  );
});

PrizeWheelButton.displayName = "PrizeWheelButton";
