'use client';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatCurrency } from '@/utils';
import { TransformedFlight } from '@/types/amadeus.types';

interface PriceGraphProps {
  flights: TransformedFlight[];
}

export function PriceGraph({ flights }: PriceGraphProps) {
  // Transform data for the graph
  // We want to show price distribution or trend.
  // Since this is a single search results page (usually same date), showing a 'trend' by date isn't possible unless we search adjacent dates.
  // HOWEVER, the requirement is 'Live Price Graph... showing price trends... updates as users apply filters'.
  // If we filter, the graph changes.
  // A common visualization for single-date results is a 'Price distribution' or simply plotting the cheapest flights by Airline.
  // OR, we can just plot the sorted flights by price to show the curve.
  // Let's plot 'Cheapest Flight by Airline' or simply 'All Flights Price Curve'.
  
  // Let's sort flights by price and plot them to show the distribution curve.
  const sortedData = [...flights].sort((a, b) => a.amount - b.amount).map((f, i) => ({
    name: f.airlineCode, // Label on X axis?
    price: f.amount,
    airline: f.airline,
    formattedPrice: formatCurrency(f.amount, f.currency),
    index: i,
  }));

  if (flights.length === 0) {
    return (
      <div className='h-48 w-full bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-dashed border-slate-200'>
        No flight data to visualize
      </div>
    );
  }

  return (
    <div className='h-64 w-full bg-white p-4 rounded-2xl border border-slate-200 shadow-sm'>
      <div className='flex justify-between items-center mb-4'>
         <h3 className='text-sm font-bold text-slate-700 uppercase tracking-wide'>Price Overview</h3>
         <span className='text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full'>{flights.length} options</span>
      </div>
      
      <ResponsiveContainer width='100%' height='80%'>
        <AreaChart data={sortedData}>
          <defs>
            <linearGradient id='colorPrice' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#6366f1' stopOpacity={0.3}/>
              <stop offset='95%' stopColor='#6366f1' stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#f1f5f9' />
          <XAxis 
            dataKey='airline' 
            hide 
            // We hide X axis labels because they would be crowded
          />
          <YAxis 
            tick={{fontSize: 10, fill: '#94a3b8'}}
            tickFormatter={(val) => `€${val}`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
             contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
             labelStyle={{ display: 'none' }}
             formatter={(value: any, name: any, props: any) => [props.payload.formattedPrice, props.payload.airline]}
          />
          <Area 
            type='monotone' 
            dataKey='price' 
            stroke='#6366f1' 
            strokeWidth={3}
            fillOpacity={1} 
            fill='url(#colorPrice)' 
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
