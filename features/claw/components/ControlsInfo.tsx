import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ControlsInfoProps {
  isMobile: boolean
  heldKeys: Set<string>
}

export function ControlsInfo({ isMobile, heldKeys }: ControlsInfoProps) {
  return (
    <Card className="bg-black/20 border-blue-500/30 backdrop-blur w-full">
      <CardHeader>
        <CardTitle className="text-white">Controls</CardTitle>
      </CardHeader>
      <CardContent className="text-white space-y-2">
        {!isMobile ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-white/10 p-2 rounded text-center my-1 ">
                <kbd className="bg-white/20 px-2 py-1 rounded">←</kbd>
                <p>Move Left</p>
                {(heldKeys?.has("a") || heldKeys?.has("arrowleft")) && (
                  <div className="mt-1 flex justify-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </div>
                )}
              </div>
              <div className="bg-white/10 p-2 rounded text-center leading-8 my-1">
                <kbd className="bg-white/20 px-2 py-1 rounded">→</kbd>
                <p>Move Right</p>
                {(heldKeys?.has("d") || heldKeys?.has("arrowright")) && (
                  <div className="mt-1 flex justify-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </div>
                )}
              </div>
              <div className="bg-white/10 p-2 rounded text-center col-span-2 my-1 leading-8">
                <kbd className="bg-white/20 px-2 py-1 rounded">SPACE</kbd>
                <p>Grab Prize</p>
              </div>
            </div>

            <div className="text-center text-xs text-white/60 border-t border-white/20 pt-3">
              <p className="font-medium mb-1">🎮 Realistic Claw Machine</p>
              <p>Watch the claw open and close automatically</p>
              <p>Claw grabs when it touches a ball</p>
              <p className="text-green-400 mt-1">● = Key being held</p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm mb-2">🎮 Realistic Claw Machine</p>
            <p className="text-xs text-white/70 mb-3">Watch the claw automatically open and close when grabbing!</p>
            <div className="flex justify-center space-x-2">
              <div className="bg-blue-600/20 px-2 py-1 rounded text-xs">← Left</div>
              <div className="bg-red-600/20 px-2 py-1 rounded text-xs">🤏 Grab</div>
              <div className="bg-blue-600/20 px-2 py-1 rounded text-xs">→ Right</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
