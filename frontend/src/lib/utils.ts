import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a numeric amount into Indian Rupees (INR) using Indian numbering system (Lakh/Crore).
 * e.g. 1500000 -> "₹15,00,000" or compact "₹15.00 L"
 */
export function formatINR(amount: number, compact: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "₹0"
  }

  if (compact) {
    const abs = Math.abs(amount)
    if (abs >= 1_00_00_000) {
      return `₹${(amount / 1_00_00_000).toFixed(2)} Cr`
    }
    if (abs >= 1_00_000) {
      return `₹${(amount / 1_00_000).toFixed(2)} L`
    }
    if (abs >= 1_000) {
      return `₹${(amount / 1_000).toFixed(1)} K`
    }
    return `₹${amount.toLocaleString("en-IN")}`
  }

  // Standard Indian Rupee grouping: en-IN
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDays(days: number): string {
  if (days === 1) return "1 day"
  return `${days} days`
}
