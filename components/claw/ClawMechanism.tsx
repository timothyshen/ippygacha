interface ClawMechanismProps {
  clawOpenness: number
  cableSwayAngle: number
  grabbedPrizeId: number | null
  prizeWillFall: boolean
}

export function ClawMechanism({ clawOpenness, cableSwayAngle, grabbedPrizeId, prizeWillFall }: ClawMechanismProps) {
  return (
    <div
      className="relative origin-top" // Ensures rotation pivot is at the top where cable connects
      style={{
        transform: `rotate(${cableSwayAngle * 0.5}deg)`, // Reduced sway effect on claw itself for stability
        transition: "transform 0.2s ease-out",
      }}
    >
      {/* Claw body/motor */}
      <div className="w-6 h-4 bg-gradient-to-b from-gray-400 to-gray-600 rounded-sm shadow-md relative">
        <div className="absolute inset-1 bg-gray-300 rounded-sm opacity-50"></div>
      </div>

      {/* Realistic Claw Arms */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <div className="relative w-8 h-8">
          {/* Left claw arm */}
          <div
            className="absolute w-1 h-6 bg-gradient-to-b from-gray-300 to-gray-500 rounded-full origin-top shadow-sm"
            style={{
              left: "25%",
              transform: `rotate(${-20 - clawOpenness * 25}deg)`,
              transformOrigin: "50% 0%", // Pivot from the top of the arm
            }}
          >
            <div className="absolute bottom-0 w-2 h-2 bg-gray-400 rounded-full transform -translate-x-1/4"></div>
          </div>

          {/* Right claw arm */}
          <div
            className="absolute w-1 h-6 bg-gradient-to-b from-gray-300 to-gray-500 rounded-full origin-top shadow-sm"
            style={{
              right: "25%",
              transform: `rotate(${20 + clawOpenness * 25}deg)`,
              transformOrigin: "50% 0%", // Pivot from the top of the arm
            }}
          >
            <div className="absolute bottom-0 w-2 h-2 bg-gray-400 rounded-full transform translate-x-1/4"></div>
          </div>

          {/* Center claw arm */}
          <div
            className="absolute w-1 h-6 bg-gradient-to-b from-gray-300 to-gray-500 rounded-full origin-top shadow-sm"
            style={{
              left: "50%",
              transform: `translateX(-50%) rotate(0deg)`, // Center arm doesn't rotate with openness
              transformOrigin: "50% 0%",
            }}
          >
            <div className="absolute bottom-0 w-2 h-2 bg-gray-400 rounded-full transform -translate-x-1/2"></div>
          </div>
        </div>
      </div>

      {/* Load indicator when carrying prize */}
      {grabbedPrizeId && !prizeWillFall && (
        <div className="absolute -top-1 -right-1 text-xs text-red-500 animate-bounce">⚖️</div>
      )}
    </div>
  )
}
