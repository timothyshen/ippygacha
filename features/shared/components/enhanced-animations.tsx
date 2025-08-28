"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

// Collection-specific particle effects (renamed from RarityParticles)
export const RarityParticles = ({
  rarity,
  show,
  theme,
}: {
  rarity: "toys" | "magic" | "fantasy" | "tech" | "nature" | "space"
  show: boolean
  theme: any
}) => {
  if (!show) return null

  const particleConfigs = {
    toys: {
      count: 10,
      emojis: ["🎀", "🎈", "🧸", "🎪"],
      colors: ["#EC4899", "#F472B6"],
      duration: 2,
    },
    magic: {
      count: 12,
      emojis: ["✨", "🔮", "🪄", "⭐"],
      colors: ["#8B5CF6", "#A78BFA"],
      duration: 2.5,
    },
    fantasy: {
      count: 14,
      emojis: ["👑", "🏰", "🗡️", "🛡️"],
      colors: ["#F59E0B", "#FBBF24"],
      duration: 2.5,
    },
    tech: {
      count: 11,
      emojis: ["⚡", "🔋", "🤖", "💻"],
      colors: ["#06B6D4", "#67E8F9"],
      duration: 2,
    },
    nature: {
      count: 13,
      emojis: ["🌸", "🍃", "🌿", "🦋"],
      colors: ["#10B981", "#6EE7B7"],
      duration: 3,
    },
    space: {
      count: 16,
      emojis: ["🌟", "🚀", "🛸", "🌌"],
      colors: ["#6366F1", "#818CF8"],
      duration: 3.5,
    },
  }

  const config = particleConfigs[rarity]

  const particles = Array.from({ length: config.count }, (_, i) => {
    const emoji = config.emojis[Math.floor(Math.random() * config.emojis.length)]
    const delay = Math.random() * 1
    const duration = config.duration + Math.random() * 1
    const xOffset = (Math.random() - 0.5) * 600
    const yOffset = -150 - Math.random() * 100
    const rotation = Math.random() * 360
    const scale = 0.8 + Math.random() * 0.4

    return (
      <div
        key={i}
        className="absolute pointer-events-none text-2xl"
        style={{
          left: "50%",
          bottom: "50%",
          transform: `translateX(${xOffset}px) translateY(${yOffset}px) rotate(${rotation}deg) scale(${scale})`,
          animation: `rarityFloat-${i} ${duration}s ease-out ${delay}s forwards`,
          zIndex: 50,
        }}
      >
        {emoji}
      </div>
    )
  })

  return (
    <>
      <style jsx>{`
        ${Array.from({ length: config.count }, (_, i) => {
        const finalY = -200 - Math.random() * 150
        const finalX = (Math.random() - 0.5) * 800
        const finalRotation = Math.random() * 720
        return `
            @keyframes rarityFloat-${i} {
              0% {
                opacity: 0;
                transform: translateX(${(Math.random() - 0.5) * 600}px) translateY(${-150 - Math.random() * 100}px) rotate(0deg) scale(0.5);
              }
              20% {
                opacity: 1;
                transform: translateX(${(Math.random() - 0.5) * 600}px) translateY(${-150 - Math.random() * 100}px) rotate(${Math.random() * 180}deg) scale(1.2);
              }
              80% {
                opacity: 1;
                transform: translateX(${finalX}px) translateY(${finalY * 0.8}px) rotate(${finalRotation * 0.8}deg) scale(1);
              }
              100% {
                opacity: 0;
                transform: translateX(${finalX}px) translateY(${finalY}px) rotate(${finalRotation}deg) scale(0.2);
              }
            }
          `
      }).join("")}
      `}</style>
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">{particles}</div>
    </>
  )
}

// Collection-specific particle effects (new export name)
export const CollectionParticles = ({
  collection,
  show,
  theme,
}: {
  collection: "toys" | "magic" | "fantasy" | "tech" | "nature" | "space"
  show: boolean
  theme: any
}) => {
  if (!show) return null

  const particleConfigs = {
    toys: {
      count: 10,
      emojis: ["🎀", "🎈", "🧸", "🎪"],
      colors: ["#EC4899", "#F472B6"],
      duration: 2,
    },
    magic: {
      count: 12,
      emojis: ["✨", "🔮", "🪄", "⭐"],
      colors: ["#8B5CF6", "#A78BFA"],
      duration: 2.5,
    },
    fantasy: {
      count: 14,
      emojis: ["👑", "🏰", "🗡️", "🛡️"],
      colors: ["#F59E0B", "#FBBF24"],
      duration: 2.5,
    },
    tech: {
      count: 11,
      emojis: ["⚡", "🔋", "🤖", "💻"],
      colors: ["#06B6D4", "#67E8F9"],
      duration: 2,
    },
    nature: {
      count: 13,
      emojis: ["🌸", "🍃", "🌿", "🦋"],
      colors: ["#10B981", "#6EE7B7"],
      duration: 3,
    },
    space: {
      count: 16,
      emojis: ["🌟", "🚀", "🛸", "🌌"],
      colors: ["#6366F1", "#818CF8"],
      duration: 3.5,
    },
  }

  const config = particleConfigs[collection]

  const particles = Array.from({ length: config.count }, (_, i) => {
    const emoji = config.emojis[Math.floor(Math.random() * config.emojis.length)]
    const delay = Math.random() * 1
    const duration = config.duration + Math.random() * 1
    const xOffset = (Math.random() - 0.5) * 600
    const yOffset = -150 - Math.random() * 100
    const rotation = Math.random() * 360
    const scale = 0.8 + Math.random() * 0.4

    return (
      <div
        key={i}
        className="absolute pointer-events-none text-2xl"
        style={{
          left: "50%",
          bottom: "50%",
          transform: `translateX(${xOffset}px) translateY(${yOffset}px) rotate(${rotation}deg) scale(${scale})`,
          animation: `rarityFloat-${i} ${duration}s ease-out ${delay}s forwards`,
          zIndex: 50,
        }}
      >
        {emoji}
      </div>
    )
  })

  return (
    <>
      <style jsx>{`
        ${Array.from({ length: config.count }, (_, i) => {
        const finalY = -200 - Math.random() * 150
        const finalX = (Math.random() - 0.5) * 800
        const finalRotation = Math.random() * 720
        return `
            @keyframes rarityFloat-${i} {
              0% {
                opacity: 0;
                transform: translateX(${(Math.random() - 0.5) * 600}px) translateY(${-150 - Math.random() * 100}px) rotate(0deg) scale(0.5);
              }
              20% {
                opacity: 1;
                transform: translateX(${(Math.random() - 0.5) * 600}px) translateY(${-150 - Math.random() * 100}px) rotate(${Math.random() * 180}deg) scale(1.2);
              }
              80% {
                opacity: 1;
                transform: translateX(${finalX}px) translateY(${finalY * 0.8}px) rotate(${finalRotation * 0.8}deg) scale(1);
              }
              100% {
                opacity: 0;
                transform: translateX(${finalX}px) translateY(${finalY}px) rotate(${finalRotation}deg) scale(0.2);
              }
            }
          `
      }).join("")}
      `}</style>
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">{particles}</div>
    </>
  )
}

// Machine idle animation component
export const MachineIdleEffects = ({
  isActive,
}: {
  isActive: boolean
}) => {
  const [pulsePhase, setPulsePhase] = useState(0)

  useEffect(() => {
    if (isActive) return

    const interval = setInterval(() => {
      setPulsePhase((prev) => (prev + 1) % 4)
    }, 2000)

    return () => clearInterval(interval)
  }, [isActive])

  if (isActive) return null

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Subtle glow effect */}
      <div
        className={cn(
          "absolute inset-0 rounded-3xl opacity-20 transition-opacity duration-2000",
          "bg-purple-300/10",
          pulsePhase % 2 === 0 ? "opacity-20" : "opacity-10",
        )}
      />

      {/* Floating sparkles */}
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className="absolute text-xs opacity-30"
          style={{
            left: `${20 + i * 30}%`,
            top: `${30 + i * 20}%`,
            animation: `float ${3 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
          }}
        >
          ✨
        </div>
      ))}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }
      `}</style>
    </div>
  )
}

// Enhanced coin animation
export const CoinAnimation = ({
  show,
  onComplete,
}: {
  show: boolean
  onComplete: () => void
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onComplete, 1000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!show) return null

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      <div
        className="absolute top-1/2 left-1/2 text-4xl"
        style={{
          animation: "coinDrop 1s ease-out forwards",
          transform: "translate(-50%, -50%)",
        }}
      >
        🪙
      </div>

      <style jsx>{`
        @keyframes coinDrop {
          0% {
            transform: translate(-50%, -200px) rotate(0deg) scale(0.5);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50px) rotate(180deg) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, 50px) rotate(360deg) scale(0.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

// Item entrance animation
export const ItemEntranceEffect = ({
  item,
  show,
  onComplete,
}: {
  item: any
  show: boolean
  onComplete: () => void
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onComplete, 2000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!show || !item) return null

  const collectionEffects = {
    toys: "itemEntranceToys",
    magic: "itemEntranceMagic",
    fantasy: "itemEntranceFantasy",
    tech: "itemEntranceTech",
    nature: "itemEntranceNature",
    space: "itemEntranceSpace",
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-45">
      <div
        className="absolute top-1/2 left-1/2 text-6xl"
        style={{
          animation: `${collectionEffects[item.collection]} 2s ease-out forwards`,
          transform: "translate(-50%, -50%)",
        }}
      >
        {item.emoji}
      </div>

      <style jsx>{`
        @keyframes itemEntranceToys {
          0% {
            transform: translate(-50%, -300px) scale(0.3);
            opacity: 0;
          }
          60% {
            transform: translate(-50%, -50px) scale(1.1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes itemEntranceMagic {
          0% {
            transform: translate(-50%, -300px) scale(0.3) rotate(-180deg);
            opacity: 0;
          }
          60% {
            transform: translate(-50%, -50px) scale(1.2) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        
        @keyframes itemEntranceFantasy {
          0% {
            transform: translate(-50%, -300px) scale(0.2) rotate(-360deg);
            opacity: 0;
            filter: hue-rotate(0deg);
          }
          30% {
            transform: translate(-50%, -100px) scale(0.8) rotate(-180deg);
            opacity: 0.7;
            filter: hue-rotate(180deg);
          }
          70% {
            transform: translate(-50%, -30px) scale(1.3) rotate(0deg);
            opacity: 1;
            filter: hue-rotate(360deg);
          }
          100% {
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            opacity: 1;
            filter: hue-rotate(0deg);
          }
        }

        @keyframes itemEntranceTech {
          0% {
            transform: translate(-50%, -300px) scale(0.1);
            opacity: 0;
            filter: brightness(0.5);
          }
          50% {
            transform: translate(-50%, -80px) scale(1.4);
            opacity: 1;
            filter: brightness(2);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
            filter: brightness(1);
          }
        }

        @keyframes itemEntranceNature {
          0% {
            transform: translate(-50%, -200px) scale(0.5);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -60px) scale(1.2);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }

        @keyframes itemEntranceSpace {
          0% {
            transform: translate(-50%, -400px) scale(0.1) rotate(-720deg);
            opacity: 0;
            filter: brightness(0.5) hue-rotate(0deg);
          }
          20% {
            transform: translate(-50%, -200px) scale(0.6) rotate(-360deg);
            opacity: 0.5;
            filter: brightness(1.5) hue-rotate(180deg);
          }
          50% {
            transform: translate(-50%, -80px) scale(1.4) rotate(-180deg);
            opacity: 1;
            filter: brightness(2) hue-rotate(360deg);
          }
          80% {
            transform: translate(-50%, -20px) scale(1.1) rotate(0deg);
            opacity: 1;
            filter: brightness(1.5) hue-rotate(540deg);
          }
          100% {
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            opacity: 1;
            filter: brightness(1) hue-rotate(0deg);
          }
        }
      `}</style>
    </div>
  )
}
