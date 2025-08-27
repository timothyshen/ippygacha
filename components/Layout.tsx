"use client"
import { useState } from "react"
import LoginButton from "@/components/LoginButton"
import { ProfileSidebar } from "@/components/ProfileSidebar"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="absolute text-4xl opacity-10 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            >
              {["🎮", "🎰", "🏆", "⭐", "🎯", "🚀", "💎", "🎪"][Math.floor(Math.random() * 8)]}
            </div>
          ))}
        </div>

        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
        `}</style>

        {/* Login Button - Fixed Position */}
        <div className="fixed top-4 right-4 z-20 flex gap-3 items-center h-10">
          <LoginButton setSidebarOpen={setSidebarOpen} />
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>

      {/* Sidebar */}
      <ProfileSidebar isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
    </>
  )
}