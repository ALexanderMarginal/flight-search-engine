import { NextRequest, NextResponse } from 'next/server';
import { amadeusApi } from '@/app/api/amadeus';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export const dynamic = 'force-dynamic';

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
    const inputDate = new Date(dateStr);
    const start = format(startOfMonth(inputDate), 'yyyy-MM-dd');
    const end = format(endOfMonth(inputDate), 'yyyy-MM-dd');
    const dateRange = `${start},${end}`;

    const cheapestDates = await amadeusApi.getCheapestDates(
      origin,
      destination,
      dateRange,
      true
    );

    const priceData = cheapestDates.map(item => ({
      date: item.departureDate,
      price: parseFloat(item.price.total),
      currency: 'EUR'
    }));

    return NextResponse.json({ data: priceData });
  } catch (error) {
    console.error('Error fetching calendar prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar prices' },
      { status: 500 }
    );
  }
}
