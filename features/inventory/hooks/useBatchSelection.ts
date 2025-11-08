"use client"

import { useState, useCallback } from "react"
import { GachaItemWithCount } from "@/features/inventory/types"

export function useBatchSelection() {
    const [batchMode, setBatchMode] = useState(false)
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

    const toggleBatchMode = useCallback(() => {
        setBatchMode((prev) => !prev)
        // Clear selections when exiting batch mode
        if (batchMode) {
            setSelectedItems(new Set())
        }
    }, [batchMode])

    const toggleItemSelection = useCallback((itemId: string) => {
        setSelectedItems((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(itemId)) {
                newSet.delete(itemId)
            } else {
                newSet.add(itemId)
            }
            return newSet
        })
    }, [])

    const selectAll = useCallback((items: GachaItemWithCount[]) => {
        const allIds = items.map((item) => item.id || `${item.name}-${item.tokenId}`)
        setSelectedItems(new Set(allIds))
    }, [])

    const clearSelection = useCallback(() => {
        setSelectedItems(new Set())
    }, [])

    const isSelected = useCallback(
        (itemId: string) => {
            return selectedItems.has(itemId)
        },
        [selectedItems]
    )

    return {
        batchMode,
        selectedItems,
        selectedCount: selectedItems.size,
        toggleBatchMode,
        toggleItemSelection,
        selectAll,
        clearSelection,
        isSelected,
    }
}
