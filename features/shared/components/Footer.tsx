export default function Footer() {
    return (
        <footer className="border-t border-orange-200/50 bg-white/20 dark:bg-orange-900/20 backdrop-blur-sm mt-16" >
            <div className="container mx-auto px-4 py-8 text-center">
                <p className="text-amber-800 dark:text-orange-300">
                    &copy; {new Date().getFullYear()} Ippy Playground. All rights reserved.
                </p>
                <p className="text-amber-700 dark:text-orange-400 text-sm mt-2">
                    Join thousands of players in the Ippy Verse! Collect, trade, and compete across multiple game modes.
                </p>
            </div>
        </footer>
    )
}