import React from "react"
import { Trophy } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PRIZES } from "../constants"

interface WinModalProps {
  isOpen: boolean
  onClose: () => void
  selectedPrize: string | null
  selectedPrizeValue: string | null
}

export const WinModal = React.memo(({ isOpen, onClose, selectedPrize, selectedPrizeValue }: WinModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-primary flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Congratulations!
            <Trophy className="h-6 w-6 text-yellow-500" />
          </DialogTitle>
          <DialogDescription className="text-center text-lg">You've won an amazing prize!</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="w-20 h-20 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center">
            {selectedPrize && (
              <>
                {PRIZES.find((p) => p.name === selectedPrize)?.icon && (
                  <div className="text-white">
                    {React.createElement(PRIZES.find((p) => p.name === selectedPrize)!.icon, {
                      className: "h-10 w-10",
                    })}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-primary">{selectedPrize}</h3>
            <p className="text-lg font-semibold text-accent">{selectedPrizeValue}</p>
          </div>
          <div className="bg-muted p-4 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Come back in 12 hours to spin again!</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
})

WinModal.displayName = "WinModal"