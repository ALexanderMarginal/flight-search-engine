import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "EUR") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDuration(isoDuration: string) {
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?/);
  if (!match) return isoDuration;
  
  const hours = match[1] ? match[1].replace('H', 'h ') : '';
  const minutes = match[2] ? match[2].replace('M', 'm') : '';
  return `${hours}${minutes}`.trim();
}

export function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit", 
  }).format(date);
}

export function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date);
}
