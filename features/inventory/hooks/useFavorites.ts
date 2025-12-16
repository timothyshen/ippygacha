"use client"

import { useState, useEffect, useCallback } from "react"
import { usePrivy } from "@privy-io/react-auth"

const getFavoritesKey = (walletAddress?: string) => {
    if (!walletAddress) return null
    return `inventory-favorites-${walletAddress.toLowerCase()}`
}

export function useFavorites() {
    const { user, authenticated } = usePrivy()
    const [favorites, setFavorites] = useState<Set<string>>(new Set())

    const walletAddress = user?.wallet?.address

    // Load favorites from localStorage when wallet address changes
    useEffect(() => {
        // Clear favorites if not authenticated
        if (!authenticated || !walletAddress) {
            setFavorites(new Set())
            return
        }

        // Load user-specific favorites
        try {
            const key = getFavoritesKey(walletAddress)
            if (!key) return

            const stored = localStorage.getItem(key)
            if (stored) {
                setFavorites(new Set(JSON.parse(stored)))
            } else {
                setFavorites(new Set())
            }
        } catch (error) {
            console.error("Failed to load favorites:", error)
            setFavorites(new Set())
        }
    }, [walletAddress, authenticated])

    // Save favorites to localStorage whenever they change
    useEffect(() => {
        // Only save if user is authenticated
        if (!authenticated || !walletAddress) return

        try {
            const key = getFavoritesKey(walletAddress)
            if (!key) return

            if (favorites.size === 0) {
                // Remove from storage if empty
                localStorage.removeItem(key)
            } else {
                localStorage.setItem(key, JSON.stringify([...favorites]))
            }
        } catch (error) {
            console.error("Failed to save favorites:", error)
        }
    }, [favorites, walletAddress, authenticated])

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
