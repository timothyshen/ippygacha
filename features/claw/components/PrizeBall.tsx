import type { Prize } from "@/types/game"

interface PrizeBallProps {
  prize: Prize
  isGrabbed: boolean
  isGrabbing: boolean
  prizeWillFall: boolean
  touchingPrize: boolean
  clawX: number
  clawY: number
}

export function PrizeBall({
  prize,
  isGrabbed,
  isGrabbing,
  prizeWillFall,
  touchingPrize,
  clawX,
  clawY,
}: PrizeBallProps) {
  if (prize.grabbed) return null

  return (
    <div
      className={`absolute select-none transition-all duration-100 ${
        isGrabbed && isGrabbing ? "z-50" : ""
      } ${isGrabbed && prizeWillFall ? "animate-bounce" : ""} ${
        touchingPrize ? "animate-pulse" : ""
      } ${!prize.isResting ? "animate-pulse" : ""}`}
      style={{
        left: isGrabbed && isGrabbing ? clawX : prize.x,
        top: isGrabbed && isGrabbing && !prizeWillFall ? clawY + 35 : prize.y,
        transform: `translate(-50%, -50%) ${!prize.isResting ? `rotate(${prize.vx * 10}deg)` : ""}`,
        transition:
          isGrabbed && isGrabbing
            ? "left 0.3s ease-out, top 0.3s ease-out"
            : prize.isResting
              ? "all 0.3s ease"
              : "none",
        filter: `${isGrabbed && prizeWillFall ? "blur(1px)" : "none"} ${!prize.isResting ? "blur(0.5px)" : ""}`,
      }}
    >
      <div
        className={`${touchingPrize ? "scale-110" : "scale-100"} ${!prize.isResting ? "scale-105" : "scale-100"} transition-transform duration-200`}
      >
        <div
          className={`w-8 h-8 rounded-full ${prize.color} shadow-lg border-2 border-white/30 relative overflow-hidden ${!prize.isResting ? "shadow-xl" : ""}`}
        >
          <div className="absolute top-1 left-1 w-2 h-2 bg-white/60 rounded-full"></div>
          {!prize.isResting && <div className="absolute inset-0 bg-white/10 rounded-full animate-ping"></div>}
        </div>
        {isGrabbed && isGrabbing && <div className="absolute -top-2 -right-2 text-xs animate-spin">✨</div>}
      </div>
    </div>
  )
}
