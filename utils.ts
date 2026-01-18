import { type ClassValue, clsx } from 'clsx';
import { eachDayOfInterval, endOfMonth, getDay, startOfMonth, differenceInMinutes } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export const calculateLayover = (arrivalIso: string, departureIso: string) => {
  const arrival = new Date(arrivalIso);
  const departure = new Date(departureIso);
  const diffMinutes = differenceInMinutes(departure, arrival);
  
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number, currency: string = 'EUR') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export const formatDuration = (isoDuration: string) => {
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?/);
  if (!match) return isoDuration;
  
  const hours = match[1] ? match[1].replace('H', 'h ') : '';
  const minutes = match[2] ? match[2].replace('M', 'm') : '';
  return `${hours}${minutes}`.trim();
}

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit', 
  }).format(date);
}

export const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date);
}

export const getDaysForMonth = (date: Date) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const days = eachDayOfInterval({ start, end });
    
  const startDay = getDay(start);
  const padding = Array(startDay).fill(null);
  return [...padding, ...days];
};

export const parseLocalDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};
