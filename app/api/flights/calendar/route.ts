import { NextRequest, NextResponse } from 'next/server';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export const dynamic = 'force-dynamic';

/**
 * Prices are generated deterministically based on origin, destination, and date.
 * This ensures the calendar and graph components show consistent prices.
 */

// Simple deterministic hash function for consistent random-like values
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; 
  }
  return Math.abs(hash);
}
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

// Generate realistic mock price data based on route and date
// Prices are deterministic - same inputs always produce same outputs
function generateMockPriceData(origin: string, destination: string, selectedDate: string) {
  const baseDate = new Date(selectedDate);
  const monthStart = startOfMonth(baseDate);
  const monthEnd = endOfMonth(baseDate);
  
  // Generate prices for all days in the month
  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Base price varies deterministically by route
  const routeHash = hashCode(`${origin}-${destination}`);
  const basePrice = 30 + (routeHash % 50); // Base price between 30-80
  
  const priceData = allDays.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayOfWeek = day.getDay();
    const dayOfMonth = day.getDate();
    
    // Create deterministic seed from route + date
    const seed = hashCode(`${origin}-${destination}-${dateStr}`);
    
    // Price factors:
    let price = basePrice;
    
    // Weekend premium (Fri, Sat, Sun) - deterministic
    if (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6) {
      price += 15 + (seed % 25);
    }
    
    // Mid-month discount
    if (dayOfMonth >= 10 && dayOfMonth <= 20) {
      price -= 5 + (seed % 10);
    }
    
    // Early/late month premium
    if (dayOfMonth <= 5 || dayOfMonth >= 25) {
      price += 10 + (seed % 15);
    }
    
    // Deterministic daily variation based on seed
    const variation = seededRandom(seed) * 30 - 15;
    price += variation;
    
    // Ensure minimum price
    price = Math.max(25, Math.round(price * 100) / 100);
    
    return {
      date: dateStr,
      price: Math.round(price * 100) / 100,
      currency: 'EUR'
    };
  });
  
  return priceData;
}

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const dateStr = searchParams.get('date');

  if (!origin || !destination || !dateStr) {
    return NextResponse.json(
      { error: 'Origin, destination, and date are required' },
      { status: 400 }
    );
  }

  try {
    // Generate deterministic price data for demonstration
    
    const priceData = generateMockPriceData(origin, destination, dateStr);

    return NextResponse.json({ 
      data: priceData
    });
  } catch (error) {
    console.error('Error generating calendar prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar prices' },
      { status: 500 }
    );
  }
}
