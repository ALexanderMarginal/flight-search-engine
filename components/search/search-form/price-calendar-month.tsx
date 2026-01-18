import { cn } from '@/lib/utils';
import { PriceCalendarMonthProps } from './types';
import { format, isSameMonth, isBefore, isAfter, startOfDay } from 'date-fns';
import { getDaysForMonth } from '@/lib/utils';

export const PriceCalendarMonth = ({ date, prices, value, change, close, minDate, maxDate }: PriceCalendarMonthProps) => {
  const days = getDaysForMonth(date);
  const monthName = format(date, 'MMMM yyyy');
  const monthPrices = prices.filter(p => isSameMonth(new Date(p.date), date));
  const minPrice = monthPrices.length > 0 ? Math.min(...monthPrices.map(p => p.price)) : null;
  
  return (
        <div className='flex-1 min-w-[300px] p-4 text-center'>
          <div className='font-bold mb-4 text-slate-800 dark:text-white capitalize'>{monthName}</div>
          <div className='grid grid-cols-7 gap-1 mb-2 text-xs font-semibold text-slate-400'>
            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
          </div>
          <div className='grid grid-cols-7 gap-1'>
            {days.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;
              
              const dateStr = format(day, 'yyyy-MM-dd');
              const priceData = prices.find(p => p.date === dateStr);
              const isSelected = value === dateStr;
              const isPast = isBefore(day, startOfDay(new Date()));
              const isBeforeMin = minDate ? isBefore(day, startOfDay(minDate)) : false;
              const isAfterMax = maxDate ? isAfter(day, startOfDay(maxDate)) : false;
              const isDisabled = isPast || isBeforeMin || isAfterMax;
              const isCheapest = priceData && minPrice && priceData.price === minPrice;
  
              return (
                <button
                  key={dateStr}
                  onClick={() => {
                    if (!isDisabled) {                      
                      change(dateStr);
                      close();
                    }
                  }}
                  disabled={isDisabled}
                  className={cn(
                    'cursor-pointer h-14 flex flex-col items-center justify-center rounded-lg border transition-all text-sm relative group',
                    isSelected 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30 font-bold z-10 scale-105' 
                      : 'bg-white dark:bg-slate-800 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700',
                    isDisabled && 'opacity-30 cursor-not-allowed hover:bg-transparent',
                    !isDisabled && !isSelected && isCheapest && 'border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-semibold',
                    !isDisabled && !isSelected && !isCheapest && 'text-slate-700 dark:text-slate-200'
                  )}
                >
                  <span>{format(day, 'd')}</span>
                  {priceData && !isDisabled && (
                    <span className={cn(
                      'text-[10px] leading-tight',
                      isSelected ? 'text-indigo-100' : (isCheapest ? 'text-green-600 dark:text-green-400 font-bold' : 'text-slate-400')
                    )}>
                      {Math.round(priceData.price)}€
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      );
}
