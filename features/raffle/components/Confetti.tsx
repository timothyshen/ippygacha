import React from "react"

interface ConfettiProps {
  show: boolean
}

export const Confetti = React.memo(({ show }: ConfettiProps) => {
  if (!show) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute inset-0">
        {[...Array(150)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-3 h-3 rounded-full animate-bounce ${
              i % 6 === 0
                ? "bg-yellow-400"
                : i % 6 === 1
                ? "bg-green-400"
                : i % 6 === 2
                ? "bg-blue-400"
                : i % 6 === 3
                ? "bg-purple-400"
                : i % 6 === 4
                ? "bg-pink-400"
                : "bg-red-400"
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${0.8 + Math.random() * 0.4}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
})

Confetti.displayName = "Confetti"