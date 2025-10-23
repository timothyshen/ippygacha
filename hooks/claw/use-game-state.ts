"use client";

import { useState } from "react";
import type {
  Prize,
  GrabPhase,
  GameResult as GameResultType,
  DroppedPrize as DroppedPrizeType,
} from "../../types/game";
import { useBlindBox } from "../useBlindBox";

const INITIAL_PRIZES_CONFIG: Omit<
  Prize,
  "grabbed" | "vx" | "vy" | "isResting"
>[] = [
  // Bottom layer - deepest balls (harder to reach)
  {
    id: 1,
    x: 100,
    y: 360,
    emoji: "💎",
    name: "Diamond",
    color: "bg-gradient-to-br from-purple-600 to-pink-600",
    radius: 16,
    mass: 1.5,
    weight: 2.0,
    rarity: "rare",
  },
  {
    id: 2,
    x: 200,
    y: 365,
    emoji: "🏆",
    name: "Trophy",
    color: "bg-gradient-to-br from-yellow-500 to-orange-500",
    radius: 16,
    mass: 1.4,
    weight: 1.8,
    rarity: "rare",
  },
  {
    id: 3,
    x: 300,
    y: 360,
    emoji: "👑",
    name: "Crown",
    color: "bg-gradient-to-br from-yellow-400 to-yellow-600",
    radius: 16,
    mass: 1.3,
    weight: 1.6,
    rarity: "rare",
  },

  // Middle layer - partially buried
  {
    id: 4,
    x: 80,
    y: 340,
    emoji: "🎮",
    name: "Game Console",
    color: "bg-purple-500",
    radius: 16,
    mass: 1.2,
    weight: 1.5,
    rarity: "normal",
  },
  {
    id: 5,
    x: 150,
    y: 345,
    emoji: "📱",
    name: "Phone",
    color: "bg-green-400",
    radius: 16,
    mass: 0.8,
    weight: 0.6,
    rarity: "normal",
  },
  {
    id: 6,
    x: 250,
    y: 340,
    emoji: "⌚",
    name: "Watch",
    color: "bg-yellow-500",
    radius: 16,
    mass: 0.9,
    weight: 0.7,
    rarity: "normal",
  },
  {
    id: 7,
    x: 320,
    y: 345,
    emoji: "🎁",
    name: "Gift Box",
    color: "bg-red-400",
    radius: 16,
    mass: 1.1,
    weight: 1.0,
    rarity: "normal",
  },
  {
    id: 8,
    x: 120,
    y: 350,
    emoji: "🧸",
    name: "Teddy Bear",
    color: "bg-blue-400",
    radius: 16,
    mass: 1,
    weight: 0.8,
    rarity: "normal",
  },

  // Top layer - easily accessible surface balls
  {
    id: 9,
    x: 60,
    y: 320,
    emoji: "🍭",
    name: "Candy",
    color: "bg-pink-400",
    radius: 16,
    mass: 0.6,
    weight: 0.3,
    rarity: "normal",
  },
  {
    id: 10,
    x: 140,
    y: 325,
    emoji: "🎪",
    name: "Toy",
    color: "bg-indigo-400",
    radius: 16,
    mass: 0.7,
    weight: 0.5,
    rarity: "normal",
  },
  {
    id: 11,
    x: 200,
    y: 320,
    emoji: "🎨",
    name: "Art Kit",
    color: "bg-orange-400",
    radius: 16,
    mass: 0.8,
    weight: 0.6,
    rarity: "normal",
  },
  {
    id: 12,
    x: 260,
    y: 325,
    emoji: "🎵",
    name: "Music Box",
    color: "bg-cyan-400",
    radius: 16,
    mass: 0.9,
    weight: 0.7,
    rarity: "normal",
  },
  {
    id: 13,
    x: 340,
    y: 320,
    emoji: "🌟",
    name: "Star",
    color: "bg-yellow-300",
    radius: 16,
    mass: 0.5,
    weight: 0.4,
    rarity: "normal",
  },
  {
    id: 14,
    x: 180,
    y: 305,
    emoji: "🎯",
    name: "Target",
    color: "bg-red-500",
    radius: 16,
    mass: 0.8,
    weight: 0.6,
    rarity: "normal",
  },
  {
    id: 15,
    x: 280,
    y: 305,
    emoji: "🚀",
    name: "Rocket",
    color: "bg-blue-500",
    radius: 16,
    mass: 1.0,
    weight: 0.9,
    rarity: "normal",
  },
];

const getInitialPrizes = (): Prize[] =>
  INITIAL_PRIZES_CONFIG.map((p) => ({
    ...p,
    grabbed: false,
    vx: 0,
    vy: 0,
    isResting: true,
  }));

export function useGameState() {
  const [clawX, setClawX] = useState(200);
  const [clawY, setClawY] = useState(50);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [coins, setCoins] = useState(10);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [prizesInMachine, setPrizesInMachine] = useState<Prize[]>(
    getInitialPrizes()
  ); // Prizes currently in the machine
  const [collectedPrizes, setCollectedPrizes] = useState<Prize[]>([]); // Prizes won by player

  const [clawClosed, setClawClosed] = useState(false);
  const [grabPhase, setGrabPhase] = useState<GrabPhase>("idle");
  const [grabbedPrizeId, setGrabbedPrizeId] = useState<number | null>(null);
  const [clawShaking, setClawShaking] = useState(false);
  const [prizeWillFall, setPrizeWillFall] = useState(false);
  const [clawOpenness, setClawOpenness] = useState(1);
  const [touchingPrize, setTouchingPrize] = useState<number | null>(null);
  const [gameResult, setGameResult] = useState<GameResultType | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [droppedPrize, setDroppedPrize] = useState<DroppedPrizeType | null>(
    null
  );
  const { purchaseBoxes, openBoxes } = useBlindBox();

  const totalInitialPrizeCount = INITIAL_PRIZES_CONFIG.length;

  const startGame = () => {
    if (coins > 0) {
      setCoins((prev) => prev - 1);
      setGameActive(true);
      setClawX(200);
      setClawY(50);
      setGrabPhase("idle");
      setClawOpenness(1);
      setGameResult(null);
      setShowResult(false);
      setDroppedPrize(null);
      setGrabbedPrizeId(null);
      setPrizeWillFall(false);
    }
  };

  const resetGame = () => {
    setPrizesInMachine(getInitialPrizes());
    setCollectedPrizes([]);
    setScore(0);
    setCoins(10);
    setGameActive(false);
    setClawX(200);
    setClawY(50);
    setGrabPhase("idle");
    setClawOpenness(1);
    setTouchingPrize(null);
    setGameResult(null);
    setShowResult(false);
    setDroppedPrize(null);
    setGrabbedPrizeId(null);
  };

  const endGame = async (result: GameResultType) => {
    if (!gameResult) {
      const txHash = await purchaseBoxes(1);
      setGameResult(result);
      if (result.won && result.prize) {
        // Remove from machine, add to collected
        setPrizesInMachine((prevInMachine) =>
          prevInMachine.filter((p) => p.id !== result.prize!.id)
        );
        setCollectedPrizes((prevCollected) => [
          ...prevCollected,
          { ...result.prize!, grabbed: true },
        ]);
      }
      if (txHash) {
        setShowResult(true);
      }
    }
    setGameActive(false);
  };

  const dismissResult = () => {
    setShowResult(false);
    setDroppedPrize(null);
  };

  // Simple grabPrize method for the optimized version
  const grabPrize = () => {
    if (!gameActive || isGrabbing) return;
    setIsGrabbing(true);
    setGrabPhase("descending");
    // This is a simplified version - the full logic is in the original ClawMachine
  };

  return {
    clawX,
    clawY,
    isGrabbing,
    coins,
    score,
    gameActive,
    prizesInMachine, // Renamed from 'prizes'
    collectedPrizes,
    totalInitialPrizeCount,
    clawClosed,
    grabPhase,
    grabbedPrizeId,
    clawShaking,
    prizeWillFall,
    clawOpenness,
    touchingPrize,
    gameResult,
    showResult,
    droppedPrize,
    setClawX,
    setClawY,
    setIsGrabbing,
    setPrizesInMachine, // Renamed from 'setPrizes'
    setCollectedPrizes,
    setClawClosed,
    setGrabPhase,
    setGrabbedPrizeId,
    setClawShaking,
    setPrizeWillFall,
    setClawOpenness,
    setTouchingPrize,
    setScore,
    setGameActive, // Keep this setter if needed elsewhere, though endGame/startGame manage it
    setDroppedPrize,
    startGame,
    resetGame,
    endGame,
    dismissResult,
    grabPrize,
  };
}

export type GameResult = GameResultType;
