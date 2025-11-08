import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Simple English pluralization helper
 * @param count - Number of items
 * @param word - Singular form of the word
 * @returns Properly pluralized string (e.g., "1 box", "2 boxes")
 */
export function plural(count: number, word: string): string {
  return `${count} ${word}${count !== 1 ? 's' : ''}`;
}
