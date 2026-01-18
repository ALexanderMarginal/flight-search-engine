'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AirportCombobox } from './airport-combobox';
import { Plane, Calendar, Search } from 'lucide-react';
import { SearchFormState } from './types';
import { PriceCalendar } from './price-calendar';
import { cn, parseLocalDate } from '@/utils';
import { Input } from '@/components/ui/input';

const getTodayDate = () => {
  const today = new Date();
  return new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
};

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchState, setSearchState] = useState<SearchFormState>({
    origin: searchParams.get('origin') || '',
    destination: searchParams.get('destination') || '',
    date: searchParams.get('date') || getTodayDate(),
    returnDate: searchParams.get('returnDate') || '',
    adults: searchParams.get('adults') || '1',
  })

  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>(
    searchParams.get('returnDate') ? 'round-trip' : 'one-way'
  );

  const [loading, setLoading] = useState(false);
  const [activeCalendar, setActiveCalendar] = useState<'departure' | 'return' | null>(null);

  const updateSearchState = (field: keyof SearchFormState, value: string): void => {        
    setSearchState({
      ...searchState,
      [field]: value,
    });
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const params = new URLSearchParams();
    params.set('origin', searchState.origin);
    params.set('destination', searchState.destination);
    params.set('date', searchState.date);
    params.set('adults', searchState.adults);
    
    if (tripType === 'round-trip' && searchState.returnDate) {
      params.set('returnDate', searchState.returnDate);
    }

    router.push(`/search?${params.toString()}`);
    setLoading(false);
  };

  const handleTripTypeChange = (type: 'one-way' | 'round-trip') => {
    setTripType(type);
    if (type === 'one-way') {
      setSearchState(prev => ({ ...prev, returnDate: '' }));
    }
  };

  const handleDepartureDateChange = (date: string) => {
    setSearchState(prev => ({
      ...prev,
      date,
      returnDate: prev.returnDate && date > prev.returnDate ? '' : prev.returnDate
    }));
    setActiveCalendar(null);
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col gap-2">
      <div className="flex gap-4 px-2">
        <button
          type="button"
          onClick={() => handleTripTypeChange('one-way')}
          className={cn(
            "cursor-pointer text-sm font-medium transition-colors hover:text-indigo-600",
            tripType === 'one-way' ? "text-indigo-600 border-b-2 border-indigo-600 pb-1" : "text-slate-500"
          )}
        >
          One-way
        </button>
        <button
          type="button"
          onClick={() => handleTripTypeChange('round-trip')}
          className={cn(
            "cursor-pointer text-sm font-medium transition-colors hover:text-indigo-600",
            tripType === 'round-trip' ? "text-indigo-600 border-b-2 border-indigo-600 pb-1" : "text-slate-500"
          )}
        >
          Round-trip
        </button>
      </div>
      <div className='bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row gap-2 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 dark:bg-slate-900 relative z-20'>
        
        <div className='flex-1 relative group'>
          <AirportCombobox
            placeholder='From (e.g. Barcelona)'
            value={searchState.origin}
            onChange={(val: string) => updateSearchState('origin', val)}
            icon={<Plane className='h-4 w-4' />}
          />
        </div>

        <div className='flex-1 relative group'>
          <AirportCombobox
            placeholder='To (e.g. Madrid)'
            value={searchState.destination}
            onChange={(val: string) => updateSearchState('destination', val)}
            icon={<Plane className='h-4 w-4 rotate-90' />}
          />
        </div>

        <div className='flex-1 relative group'>
          <Input 
            placeholder='Number of passengers'
            value={searchState.adults} 
            onChange={(e) => updateSearchState('adults', e.target.value)} 
            type='number'
          />
        </div>

        <div className='flex-1 relative group'>
          <Calendar className='absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors z-10' />
          <div 
            onClick={() => setActiveCalendar('departure')}
            className='cursor-pointer'
          >
             <div className={cn(
               'flex h-11 w-full rounded-xl border border-input bg-slate-50 px-3 py-1 pl-10 text-base shadow-sm transition-colors md:text-sm items-center',
               !searchState.date && 'text-muted-foreground',
               'hover:bg-white focus:bg-white'
             )}>
               {searchState.date || 'Select Date'}
             </div>
          </div>
          
          {activeCalendar === 'departure' && (
            <PriceCalendar 
              value={searchState.date} 
              change={handleDepartureDateChange} 
              close={() => setActiveCalendar(null)}
              origin={searchState.origin}
              destination={searchState.destination}
              placeholder='Select Date of Departure'
              minDate={new Date()}
            />
          )}
        </div>

        {tripType === 'round-trip' && (
          <div className='flex-1 relative group'>
            <Calendar className='absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors z-10' />
            <div 
              onClick={() => setActiveCalendar('return')}
              className='cursor-pointer'
            >
               <div className={cn(
                 'flex h-11 w-full rounded-xl border border-input bg-slate-50 px-3 py-1 pl-10 text-base shadow-sm transition-colors md:text-sm items-center',
                 !searchState.returnDate && 'text-muted-foreground',
                 'hover:bg-white focus:bg-white'
               )}>
                 {searchState.returnDate || 'Select Date'}
               </div>
            </div>
            
            {activeCalendar === 'return' && (
              <PriceCalendar 
                value={searchState.returnDate} 
                change={(date) => {
                  updateSearchState('returnDate', date);
                  setActiveCalendar(null);
                }} 
                close={() => setActiveCalendar(null)}
                origin={searchState.destination}
                destination={searchState.origin}
                placeholder='Select Date of Return'
                minDate={searchState.date ? parseLocalDate(searchState.date) : new Date()}
              />
            )}
          </div>
        )}

        <Button size='lg' type='submit' className='cursor-pointer md:w-auto w-full h-11 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95' isLoading={loading}>
          <Search className='h-4 w-4 mr-2' />
          Search
        </Button>
      </div>
    </form>
  );
}
