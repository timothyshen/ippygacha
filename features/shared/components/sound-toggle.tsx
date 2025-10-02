"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX } from "lucide-react"
import { soundManager } from "@/utils/sounds"
import { cn } from "@/lib/utils"

interface SoundToggleProps {
  className?: string
}

export function SoundToggle({ className }: SoundToggleProps) {
  const [isMuted, setIsMuted] = useState(true)

  const toggleMute = () => {
    const newMutedState = soundManager.toggleMute()
    setIsMuted(newMutedState)
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleMute}
      className={cn(
        "w-8 h-8 rounded-full",
        "bg-white/80 border-slate-200 text-slate-700 hover:bg-white backdrop-blur-sm",
        className,
      )}
      title={isMuted ? "Unmute sounds" : "Mute sounds"}
    >
      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
    </Button>
  )
}
