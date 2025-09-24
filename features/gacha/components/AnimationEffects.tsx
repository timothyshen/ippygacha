
interface AnimationEffectsProps {
    showCelebration: boolean
}

export const AnimationEffects = ({
    showCelebration,
}: AnimationEffectsProps) => {
    return (
        <>
            {/* Celebration Effect */}
            {showCelebration && (
                <div className="fixed inset-0 pointer-events-none z-50">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent animate-pulse" />
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 rounded-full bg-primary animate-confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${1 + Math.random() * 2}s`,
                            }}
                        />
                    ))}
                </div>
            )}

        </>
    )
} 