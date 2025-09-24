interface CableSystemProps {
  clawY: number
  cableSwayAngle: number
  grabbedPrizeId: number | null
  prizeWillFall: boolean
  cableStabilizing: boolean
}

export function CableSystem({
  clawY,
  cableSwayAngle,
  grabbedPrizeId,
  prizeWillFall,
  cableStabilizing,
}: CableSystemProps) {
  const cableHeight = Math.max(0, clawY - 20)
  const isCarryingPrize = grabbedPrizeId && !prizeWillFall

  return (
    <>
      {/* Cable */}
      <div
        className={`absolute bg-gradient-to-b shadow-lg origin-top transition-all duration-100 ease-out ${
          isCarryingPrize ? "from-gray-700 to-gray-900" : "from-gray-600 to-gray-800"
        }`}
        style={{
          width: isCarryingPrize ? "5px" : "4px",
          height: cableHeight,
          left: "50%",
          top: -cableHeight,
          transform: `translateX(-50%) rotate(${cableSwayAngle}deg)`,
          transformOrigin: "top center",
          borderRadius: "2px",
          boxShadow: `inset 0 0 2px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2) ${
            isCarryingPrize ? ", 0 0 4px rgba(100,100,100,0.4)" : ""
          }`,
        }}
      >
        {/* Cable texture for realism */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-full"></div>

        {/* Cable segments for more realistic look */}
        <div className="absolute inset-0">
          {Array.from({ length: Math.floor(cableHeight / 20) }).map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-0.5 bg-gray-500/30"
              style={{
                top: `${(i + 1) * 20}px`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Cable Stabilization Indicator */}
      {cableStabilizing && (
        <div
          className="absolute text-green-400 text-xs font-bold animate-pulse pointer-events-none z-50"
          style={{
            left: "50%",
            top: -cableHeight / 3,
            transform: "translateX(-50%)",
            textShadow: "0 0 4px rgba(0,255,0,0.8)",
          }}
        >
          🔒 STABILIZED
        </div>
      )}

      {/* Visual Cable Clamp Mechanism */}
      {cableStabilizing && (
        <div
          className="absolute z-40 pointer-events-none"
          style={{
            left: "50%",
            top: -cableHeight / 2,
            transform: "translateX(-50%)",
          }}
        >
          {/* Left Clamp Jaw */}
          <div
            className="absolute bg-gradient-to-r from-gray-700 to-gray-500 rounded-l-lg shadow-lg animate-pulse"
            style={{
              width: "8px",
              height: "16px",
              left: "-12px",
              top: "-8px",
              transform: "rotate(-5deg)",
              border: "1px solid #374151",
              boxShadow: "inset 1px 1px 2px rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.4)",
            }}
          >
            <div className="absolute right-0 top-1 w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="absolute right-0 top-3 w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="absolute right-0 top-5 w-1 h-1 bg-gray-300 rounded-full"></div>
          </div>

          {/* Right Clamp Jaw */}
          <div
            className="absolute bg-gradient-to-l from-gray-700 to-gray-500 rounded-r-lg shadow-lg animate-pulse"
            style={{
              width: "8px",
              height: "16px",
              right: "-12px",
              top: "-8px",
              transform: "rotate(5deg)",
              border: "1px solid #374151",
              boxShadow: "inset -1px 1px 2px rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.4)",
            }}
          >
            <div className="absolute left-0 top-1 w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="absolute left-0 top-3 w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="absolute left-0 top-5 w-1 h-1 bg-gray-300 rounded-full"></div>
          </div>

          {/* Central Clamp Body */}
          <div
            className="absolute bg-gradient-to-b from-gray-600 to-gray-800 rounded shadow-md"
            style={{
              width: "12px",
              height: "20px",
              left: "-6px",
              top: "-10px",
              border: "1px solid #4B5563",
              boxShadow: "inset 0 1px 2px rgba(255,255,255,0.2), 0 2px 6px rgba(0,0,0,0.3)",
            }}
          >
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-2 h-4 bg-gray-400 rounded-sm opacity-80"></div>
            <div className="absolute top-1 right-1 w-1 h-1 bg-green-400 rounded-full animate-ping"></div>
            <div
              className="absolute top-3 right-1 w-1 h-1 bg-green-400 rounded-full animate-ping"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>

          {/* Clamp activation sparks */}
          <div className="absolute -left-2 -top-1 text-yellow-300 text-xs animate-ping">⚡</div>
          <div
            className="absolute -right-2 -top-1 text-yellow-300 text-xs animate-ping"
            style={{ animationDelay: "0.1s" }}
          >
            ⚡
          </div>
          <div
            className="absolute left-0 -bottom-1 text-orange-400 text-xs animate-ping"
            style={{ animationDelay: "0.3s" }}
          >
            ✨
          </div>
        </div>
      )}

      {/* Cable attachment point with smooth transitions */}
      <div
        className={`absolute rounded-full shadow-md transition-all duration-200 ${
          isCarryingPrize ? "w-4 h-4 bg-gray-900" : "w-3 h-3 bg-gray-800"
        }`}
        style={{
          left: "50%",
          top: -cableHeight - (isCarryingPrize ? 8 : 6),
          transform: `translateX(-50%) rotate(${cableSwayAngle * 0.3}deg)`,
          transformOrigin: `0 ${cableHeight + (isCarryingPrize ? 8 : 6)}px`,
          boxShadow: `0 2px 4px rgba(0,0,0,0.3) ${isCarryingPrize ? ", 0 0 4px rgba(100,100,100,0.4)" : ""}`,
        }}
      >
        {/* Attachment point detail */}
        <div className="absolute inset-0.5 bg-gray-600 rounded-full opacity-60"></div>
      </div>
    </>
  )
}
