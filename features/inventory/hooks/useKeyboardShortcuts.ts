"use client"

import { useEffect } from "react"

interface KeyboardShortcutsConfig {
    onToggleBatchMode?: () => void
    onToggleFavorites?: () => void
    onClearFilters?: () => void
    onSelectAll?: () => void
    onEscape?: () => void
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in input fields
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                e.target instanceof HTMLSelectElement
            ) {
                return
            }

            // Cmd/Ctrl + B: Toggle batch mode
            if ((e.metaKey || e.ctrlKey) && e.key === "b") {
                e.preventDefault()
                config.onToggleBatchMode?.()
            }

            // Cmd/Ctrl + F: Toggle favorites view
            if ((e.metaKey || e.ctrlKey) && e.key === "f") {
                e.preventDefault()
                config.onToggleFavorites?.()
            }

            // Cmd/Ctrl + K: Clear all filters
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault()
                config.onClearFilters?.()
            }

            // Cmd/Ctrl + A: Select all (in batch mode)
            if ((e.metaKey || e.ctrlKey) && e.key === "a") {
                e.preventDefault()
                config.onSelectAll?.()
            }

            // Escape: Clear selection or exit batch mode
            if (e.key === "Escape") {
                config.onEscape?.()
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [config])
}
