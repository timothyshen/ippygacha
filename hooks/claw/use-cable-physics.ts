"use client";

import { useState, useEffect, useRef } from "react";
import type { GrabPhase } from "../../types/game";

interface UseCablePhysicsProps {
  grabbedPrizeId: number | null;
  prizeWillFall: boolean;
  grabPhase: GrabPhase;
  prizes: Array<{ id: number; weight: number }>;
}

export function useCablePhysics({
  grabbedPrizeId,
  prizeWillFall,
  grabPhase,
  prizes,
}: UseCablePhysicsProps) {
  const [cableSwayAngle, setCableSwayAngle] = useState(0);
  const [isClawMoving, setIsClawMoving] = useState(false);
  const [cableStabilizing, setCableStabilizing] = useState(false);

  // Use refs for smooth animation
  const swayAnimationRef = useRef<number | null>(null);
  const targetSwayAngle = useRef(0);
  const currentSwayAngle = useRef(0);

  // Smooth cable sway animation with improved physics
  useEffect(() => {
    const animateSway = () => {
      const diff = targetSwayAngle.current - currentSwayAngle.current;
      const dampening = 0.12; // Slightly slower for more realistic movement

      if (Math.abs(diff) > 0.01) {
        currentSwayAngle.current += diff * dampening;
        setCableSwayAngle(currentSwayAngle.current);
        swayAnimationRef.current = requestAnimationFrame(animateSway);
      } else {
        currentSwayAngle.current = targetSwayAngle.current;
        setCableSwayAngle(targetSwayAngle.current);
      }
    };

    if (swayAnimationRef.current) {
      cancelAnimationFrame(swayAnimationRef.current);
    }
    swayAnimationRef.current = requestAnimationFrame(animateSway);

    return () => {
      if (swayAnimationRef.current) {
        cancelAnimationFrame(swayAnimationRef.current);
      }
    };
  }, []);

  // Enhanced cable physics during different phases
  useEffect(() => {
    if (grabPhase === "ascending" && grabbedPrizeId && !prizeWillFall) {
      const grabbedPrize = prizes.find((p) => p.id === grabbedPrizeId);
      if (grabbedPrize) {
        // More realistic weight-based sway during ascent
        const weightFactor = grabbedPrize.weight * 0.8;
        const timeBasedSway = Math.sin(Date.now() * 0.002) * weightFactor;
        targetSwayAngle.current = timeBasedSway;
      }
    } else if (grabPhase === "moving" && grabbedPrizeId && !prizeWillFall) {
      // Gentle pendulum motion during horizontal movement
      const pendulumSway = Math.sin(Date.now() * 0.0015) * 0.6;
      targetSwayAngle.current = pendulumSway;
    } else if (grabPhase === "idle" && !isClawMoving) {
      // Return to neutral position when idle
      targetSwayAngle.current = 0;
    } else if (grabPhase === "descending" || grabPhase === "dropping") {
      // Minimal sway during descent and dropping
      targetSwayAngle.current = 0;
    }
  }, [grabPhase, grabbedPrizeId, prizeWillFall, prizes, isClawMoving]);

  // Reset cable when stabilizing
  useEffect(() => {
    if (cableStabilizing) {
      targetSwayAngle.current = 0;
      currentSwayAngle.current = 0;
      setCableSwayAngle(0);
    }
  }, [cableStabilizing]);

  const setSmoothCableSwayAngle = (angle: number) => {
    targetSwayAngle.current = angle;
  };

  return {
    cableSwayAngle,
    setCableSwayAngle: setSmoothCableSwayAngle,
    isClawMoving,
    setIsClawMoving,
    cableStabilizing,
    setCableStabilizing,
  };
}
