'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';
import { formatCurrency } from '@/utils';
import { Loader2, TrendingDown, TrendingUp, Calendar } from 'lucide-react';

interface PriceDataPoint {
  date: string;
  price: number;
  currency: string;
  formattedDate: string;
  dayOfWeek: string;
  isSelected: boolean;
  isLowest: boolean;
}

interface PriceGraphProps {
  origin: string;
  destination: string;
  selectedDate: string;
}

export function PriceGraph({ origin, destination, selectedDate }: PriceGraphProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [priceData, setPriceData] = useState<PriceDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalendarPrices = async () => {
      if (!origin || !destination || !selectedDate) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `/api/flights/calendar?origin=${origin}&destination=${destination}&date=${selectedDate}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch calendar prices');
        }
        
        const result = await response.json();
        
        if (result.data && result.data.length > 0) {
          const lowestPrice = Math.min(...result.data.map((d: { price: number }) => d.price));
          
          const formattedData: PriceDataPoint[] = result.data.map((item: { date: string; price: number; currency?: string }) => {
            const date = new Date(item.date);
            return {
              date: item.date,
              price: item.price,
              currency: item.currency || 'EUR',
              formattedDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }),
              isSelected: item.date === selectedDate,
              isLowest: item.price === lowestPrice,
            };
          });
          
          // Sort by date
          formattedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          setPriceData(formattedData);
        } else {
          setPriceData([]);
        }
      } catch (err) {
        setError('Unable to load price calendar');
        console.error('Error fetching calendar prices:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCalendarPrices();
  }, [origin, destination, selectedDate]);

  const handleBarClick = (data: PriceDataPoint) => {
    if (data.date === selectedDate) return;
    
    // Navigate to the new date
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', data.date);
    router.push(`/search?${params.toString()}`);
  };

  // Calculate stats
  const lowestPrice = priceData.length > 0 ? Math.min(...priceData.map(d => d.price)) : 0;
  const highestPrice = priceData.length > 0 ? Math.max(...priceData.map(d => d.price)) : 0;
  const selectedPrice = priceData.find(d => d.isSelected)?.price || 0;
  const avgPrice = priceData.length > 0 ? priceData.reduce((sum, d) => sum + d.price, 0) / priceData.length : 0;

  // Loading state
  if (isLoading) {
    return (
      <div className='h-64 w-full bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center'>
        <div className='flex flex-col items-center gap-2'>
          <Loader2 className='h-8 w-8 text-indigo-500 animate-spin' />
          <p className='text-sm text-slate-500'>Loading price calendar...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || priceData.length === 0) {
    return (
      <div className='h-48 w-full bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-dashed border-slate-200'>
        <div className='flex flex-col items-center gap-2'>
          <Calendar className='h-6 w-6' />
          <p>{error || 'No price data available for nearby dates'}</p>
        </div>
      </div>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as PriceDataPoint;
      return (
        <div className='bg-white px-3 py-2 rounded-lg shadow-lg border border-slate-200'>
          <p className='text-xs text-slate-500'>{data.dayOfWeek}, {data.formattedDate}</p>
          <p className='text-lg font-bold text-slate-900'>{formatCurrency(data.price, data.currency)}</p>
          {data.isLowest && (
            <span className='text-xs text-emerald-600 font-medium'>★ Best price</span>
          )}
        </div>
      );
    }
    return null;
  };

  // Get bar color based on price
  const getBarColor = (entry: PriceDataPoint) => {
    if (entry.isSelected) return '#6366f1'; // indigo for selected
    if (entry.isLowest) return '#10b981'; // green for lowest
    
    // Gradient from green to red based on price
    const priceRange = highestPrice - lowestPrice;
    const pricePercent = priceRange > 0 ? (entry.price - lowestPrice) / priceRange : 0;
    
    if (pricePercent < 0.33) return '#22c55e'; // green
    if (pricePercent < 0.66) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <div className='w-full bg-white p-4 rounded-2xl border border-slate-200 shadow-sm'>
      {/* Header */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4'>
        <div className='flex items-center gap-2'>
          <Calendar className='h-4 w-4 text-indigo-500' />
          <h3 className='text-sm font-bold text-slate-700 uppercase tracking-wide'>Price Calendar</h3>
          <span className='text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full'>{priceData.length} dates</span>
        </div>
        
        {/* Stats */}
        <div className='flex flex-wrap gap-3'>
          <div className='flex items-center gap-1.5'>
            <TrendingDown className='h-4 w-4 text-emerald-500' />
            <span className='text-xs text-slate-500'>Lowest:</span>
            <span className='text-xs font-bold text-emerald-600'>{formatCurrency(lowestPrice, 'EUR')}</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <TrendingUp className='h-4 w-4 text-red-500' />
            <span className='text-xs text-slate-500'>Highest:</span>
            <span className='text-xs font-bold text-red-600'>{formatCurrency(highestPrice, 'EUR')}</span>
          </div>
          {selectedPrice > 0 && selectedPrice > lowestPrice && (
            <div className='flex items-center gap-1.5 bg-amber-50 px-2 py-0.5 rounded'>
              <span className='text-xs text-amber-700'>
                Save {formatCurrency(selectedPrice - lowestPrice, 'EUR')} on the cheapest date!
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Chart */}
      <div className='h-48'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={priceData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <XAxis 
              dataKey='formattedDate' 
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-45}
              textAnchor='end'
              height={50}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickFormatter={(val) => `€${val}`}
              axisLine={false}
              tickLine={false}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />
            
            {/* Reference line for average price */}
            <ReferenceLine 
              y={avgPrice} 
              stroke='#cbd5e1' 
              strokeDasharray='3 3' 
              label={{ value: 'avg', position: 'right', fontSize: 10, fill: '#94a3b8' }}
            />
            
            <Bar 
              dataKey='price' 
              radius={[4, 4, 0, 0]}
              cursor='pointer'
              onClick={(data: any) => handleBarClick(data as PriceDataPoint)}
            >
              {priceData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry)}
                  opacity={entry.isSelected ? 1 : 0.8}
                  stroke={entry.isSelected ? '#4338ca' : 'transparent'}
                  strokeWidth={entry.isSelected ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className='mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-4 justify-center text-xs text-slate-500'>
        <div className='flex items-center gap-1.5'>
          <div className='w-3 h-3 rounded bg-indigo-500' />
          <span>Selected date</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <div className='w-3 h-3 rounded bg-emerald-500' />
          <span>Best price</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <div className='w-3 h-3 rounded bg-amber-500' />
          <span>Medium</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <div className='w-3 h-3 rounded bg-red-500' />
          <span>Higher price</span>
        </div>
        <span className='text-slate-400'>• Click a bar to view flights</span>
      </div>
    </div>
  );
}
