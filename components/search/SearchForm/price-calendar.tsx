'use client';

import { useState, useEffect, useRef } from 'react';
import { addMonths, startOfMonth, isBefore } from 'date-fns';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { PriceCalendarProps, PriceData } from './types';
import { PriceCalendarMonth } from './price-calendar-month';
import { format } from 'date-fns';

export const PriceCalendar = ({ value, change, close, origin, destination, placeholder }: PriceCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);  

  const fetchPrices = async (queryOrigin: string, queryDestination: string) => {
      if (!queryOrigin || !queryDestination) return;
      console.log('fetching prices for', queryOrigin, queryDestination, format(currentMonth, 'yyyy-MM-dd'));
      setLoading(true);
      try {
        const res = await fetch(`/api/flights/calendar?origin=${queryOrigin}&destination=${queryDestination}&date=${format(currentMonth, 'yyyy-MM-dd')}`);
        console.log('prices', res);
        
        if (res.ok) {
          const data = await res.json();
          setPrices(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch prices', err);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchPrices(origin, destination);
  }, [origin, destination]);

  const handlePrevMonth = () => setCurrentMonth(prev => addMonths(prev, -1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        close();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [close]);

  return (
    <div className='fixed w-full h-full p-10 top-0 left-0 z-50' ref={calendarRef}>
       <div className='bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col w-full max-w-[800px] mx-auto'>
          <div className='flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm'>
            <h3 className='font-semibold text-slate-900 dark:text-white flex items-center gap-2'>
              <span className='w-2 h-2 rounded-full bg-green-500 animate-pulse'></span>
              {placeholder}
            </h3>
            <div className='flex items-center gap-2'>
              <button 
                onClick={handlePrevMonth} 
                disabled={isBefore(currentMonth, startOfMonth(new Date()))}
                className='cursor-pointer p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 disabled:opacity-30 transition-colors'
                type='button'
              >
                <ChevronLeft className='w-5 h-5' />
              </button>
              <button 
                onClick={handleNextMonth} 
                className='cursor-pointer p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors'
                type='button'
              >
                <ChevronRight className='w-5 h-5' />
              </button>
              <div className='w-px h-4 bg-slate-300 mx-1'></div>
              <button onClick={close} className='cursor-pointer p-1.5 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors' type='button'>
                <X className='w-5 h-5' />
              </button>
            </div>
          </div>
          
          <div className='flex flex-col md:flex-row overflow-x-auto max-h-[60vh] md:max-h-none'>
            <PriceCalendarMonth
              date={currentMonth}
              prices={prices}
              value={value}
              change={change}
              close={close}
            />
            <div className='hidden md:block w-px bg-slate-100 dark:bg-slate-800 my-4'></div>
            <div className='hidden md:block'>
              <PriceCalendarMonth
                date={addMonths(currentMonth, 1)}
                prices={prices}
                value={value}
                change={change}
                close={close}
              />
            </div>
          </div>

          {loading && (
             <div className='p-2 text-center text-xs text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 animate-pulse font-medium'>
               Updating prices...
             </div>
          )}
       </div>
    </div>
  );
}
