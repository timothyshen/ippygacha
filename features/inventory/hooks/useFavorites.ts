"use client"

import { useState, useEffect, useCallback } from "react"

const FAVORITES_KEY = "inventory-favorites"

export function useFavorites() {
    const [favorites, setFavorites] = useState<Set<string>>(new Set())

    // Load favorites from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(FAVORITES_KEY)
            if (stored) {
                setFavorites(new Set(JSON.parse(stored)))
            }
        } catch (error) {
            console.error("Failed to load favorites:", error)
        }
    }, [])

    // Save favorites to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]))
        } catch (error) {
            console.error("Failed to save favorites:", error)
        }
    }, [favorites])

    const toggleFavorite = useCallback((itemId: string) => {
        setFavorites((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(itemId)) {
                newSet.delete(itemId)
            } else {
                newSet.add(itemId)
            }
            return newSet
        })
    }, [])

    const isFavorite = useCallback(
        (itemId: string) => {
            return favorites.has(itemId)
        },
        [favorites]
    )

    const clearAllFavorites = useCallback(() => {
        setFavorites(new Set())
    }, [])

    return {
        favorites,
        favoriteCount: favorites.size,
        toggleFavorite,
        isFavorite,
        clearAllFavorites,
    }
}
