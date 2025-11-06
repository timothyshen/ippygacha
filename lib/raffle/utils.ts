/**
 * Raffle utility functions
 * Extracted from components to reduce duplication and improve maintainability
 */

/**
 * Formats a wallet address for display
 * @param address - Full wallet address
 * @returns Shortened address (e.g., "0x1234...5678")
 */
export const formatWalletAddress = (address: string): string => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Calculates wheel segment geometry for prize wheel visualization
 */
export const calculateWheelSegment = (index: number, totalSegments: number) => {
  const segmentAngle = 360 / totalSegments;
  const gapAngle = 3;
  const actualSegmentAngle = segmentAngle - gapAngle;
  const startAngle = index * segmentAngle + gapAngle / 2;

  return {
    segmentAngle,
    gapAngle,
    actualSegmentAngle,
    startAngle,
  };
};

/**
 * Generates clip-path polygon for wheel segment
 */
export const generateSegmentClipPath = (startAngle: number, actualSegmentAngle: number): string => {
  const radius = 45; // Percentage from center
  const centerX = 50;
  const centerY = 50;

  const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
  const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
  const x2 = centerX + radius * Math.cos(((startAngle + actualSegmentAngle) * Math.PI) / 180);
  const y2 = centerY + radius * Math.sin(((startAngle + actualSegmentAngle) * Math.PI) / 180);

  return `polygon(50% 50%, ${x1}% ${y1}%, ${x2}% ${y2}%)`;
};

/**
 * Calculates icon position and rotation for wheel segment
 */
export const calculateIconTransform = (startAngle: number, actualSegmentAngle: number) => {
  const iconDistance = 80; // Distance from center in pixels
  const rotation = startAngle + actualSegmentAngle / 2;

  return {
    top: "50%",
    left: "50%",
    transform: `translate(-50%, -50%) rotate(${rotation}deg) translateY(-${iconDistance}px)`,
    transformOrigin: "center",
  };
};

/**
 * Gets background color for prize by index
 */
export const getPrizeBackgroundColor = (index: number): string => {
  const colors = [
    "bg-yellow-100 dark:bg-yellow-900/20",
    "bg-green-100 dark:bg-green-900/20",
    "bg-blue-100 dark:bg-blue-900/20",
    "bg-purple-100 dark:bg-purple-900/20",
    "bg-pink-100 dark:bg-pink-900/20",
    "bg-red-100 dark:bg-red-900/20",
  ];
  return colors[index % colors.length];
};

/**
 * Formats cooldown time for display
 */
export const formatCooldownTime = (hours: number, minutes: number, seconds: number): string => {
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

/**
 * Calculates cooldown display data from remaining time
 */
export const calculateCooldownDisplay = (remainingTimeMs: number, cooldownPeriodMs: number) => {
  const clampedRemainingTime = Math.max(0, remainingTimeMs);

  const hours = Math.floor(clampedRemainingTime / (60 * 60 * 1000));
  const minutes = Math.floor((clampedRemainingTime % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((clampedRemainingTime % (60 * 1000)) / 1000);
  const progress = cooldownPeriodMs > 0
    ? Math.min(100, ((cooldownPeriodMs - clampedRemainingTime) / cooldownPeriodMs) * 100)
    : 0;

  return {
    hours,
    minutes,
    seconds,
    progress,
    timeRemaining: formatCooldownTime(hours, minutes, seconds),
  };
};

/**
 * Converts contract prize data to UI display format
 */
export const convertContractPrizeToWinner = (
  prize: any,
  index: number
): {
  id: number;
  name: string;
  prize: string;
  date: string;
  value: string;
  tier: number;
} => {
  const { formatEther } = require("viem");

  const ipAmount = formatEther(prize[2]);
  const hasNFT = prize[3] > 0;
  let prizeName = `${ipAmount} IP`;
  if (hasNFT) {
    prizeName += " + NFT";
  }

  return {
    id: index + 1,
    name: formatWalletAddress(prize[0] as string),
    prize: prizeName,
    date: new Date(Number(prize[5]) * 1000).toLocaleString(),
    value: ipAmount,
    tier: prize[1] as number,
  };
};

/**
 * Generates random confetti particle style
 */
export const generateConfettiStyle = (index: number) => {
  const colors = [
    "bg-yellow-400",
    "bg-green-400",
    "bg-blue-400",
    "bg-purple-400",
    "bg-pink-400",
    "bg-red-400",
  ];

  return {
    className: colors[index % colors.length],
    style: {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 2}s`,
      animationDuration: `${0.8 + Math.random() * 0.4}s`,
    },
  };
};
