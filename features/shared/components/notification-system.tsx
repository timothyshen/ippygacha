"use client"

import { useEffect, useState } from "react"
import { X, Trophy, AlertTriangle, Info, CheckCircle, XCircle, Zap, Star, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useNotifications, type Notification } from "@/contexts/notification-context"

const NotificationIcon = ({ type, icon }: { type: Notification["type"]; icon?: string }) => {
  if (icon) {
    return <span className="text-2xl">{icon}</span>
  }

  const iconMap = {
    success: <CheckCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    collection: <Star className="w-5 h-5" />,
  }

  return iconMap[type]
}

const NotificationCard = ({ notification, onRemove }: { notification: Notification; onRemove: () => void }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const handleRemove = () => {
    setIsLeaving(true)
    setTimeout(onRemove, 300) // Wait for exit animation
  }

  const typeStyles = {
    success: "bg-green-500/90 border-green-400 text-white",
    warning: "bg-yellow-500/90 border-yellow-400 text-black",
    info: "bg-blue-500/90 border-blue-400 text-white",
    error: "bg-red-500/90 border-red-400 text-white",
    collection: "bg-gradient-to-r from-blue-500 to-purple-500 border-blue-400 text-white",
  }

  return (
    <Card
      className={cn(
        "border-2 shadow-lg backdrop-blur-sm transition-all duration-300 ease-out",
        typeStyles[notification.type],
        isVisible && !isLeaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
        isLeaving && "-translate-x-full opacity-0",
      )}
    >
      <CardContent>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <NotificationIcon type={notification.type} icon={notification.icon} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm truncate">{notification.title}</h4>
            </div>

            {notification.message && <p className="text-xs opacity-90 leading-relaxed">{notification.message}</p>}

            {notification.action && (
              <Button
                size="sm"
                variant="outline"
                onClick={notification.action.onClick}
                className="mt-2 h-7 text-xs bg-white/10 border-white/30 hover:bg-white/20"
              >
                {notification.action.label}
              </Button>
            )}
          </div>

          {!notification.persistent && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRemove}
              className="flex-shrink-0 h-6 w-6 p-0 hover:bg-white/20"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications()

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm w-full">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  )
}