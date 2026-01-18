'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plane, Calendar, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, parseLocalDate } from '@/utils';

import { AirportCombobox } from './airport-combobox';
import { PriceCalendar } from './price-calendar';
import { SearchFormState } from './types';

const getTodayDate = () => {
  const today = new Date();
  return new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
};

interface DateInputProps {
  label: string;
  value: string;
  placeholder: string;
  isActive: boolean;
  onActivate: () => void;
  onClose: () => void;
  onChange: (date: string) => void;
  origin: string;
  destination: string;
  minDate?: Date;
}

const DateInput = ({ 
  value, 
  placeholder, 
  isActive, 
  onActivate, 
  onClose, 
  onChange, 
  origin, 
  destination, 
  minDate 
}: DateInputProps) => (
  <div className='flex-1 relative group'>
    <Calendar className='absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors z-10' />
    <div onClick={onActivate} className='cursor-pointer'>
       <div className={cn(
         'flex h-11 w-full rounded-xl border border-input bg-slate-50 px-3 py-1 pl-10 text-base shadow-sm transition-colors md:text-sm items-center',
         !value && 'text-muted-foreground',
         'hover:bg-white focus:bg-white'
       )}>
         {value || 'Select Date'}
       </div>
    </div>
    
    {isActive && (
      <PriceCalendar 
        value={value} 
        change={onChange} 
        close={onClose}
        origin={origin}
        destination={destination}
        placeholder={placeholder}
        minDate={minDate}
      />
    )}
  </div>
);

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchState, setSearchState] = useState<SearchFormState>({
    origin: searchParams.get('origin') || '',
    destination: searchParams.get('destination') || '',
    date: searchParams.get('date') || getTodayDate(),
    returnDate: searchParams.get('returnDate') || '',
    adults: searchParams.get('adults') || '1',
  });

  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>(
    searchParams.get('returnDate') ? 'round-trip' : 'one-way'
  );

  const [loading, setLoading] = useState(false);
  const [activeCalendar, setActiveCalendar] = useState<'departure' | 'return' | null>(null);

  const updateSearchState = (field: keyof SearchFormState, value: string): void => {        
    setSearchState(prev => ({ ...prev, [field]: value }));
  };

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
      updateSearchState('returnDate', '');
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
        {(['one-way', 'round-trip'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => handleTripTypeChange(type)}
            className={cn(
              "cursor-pointer text-sm font-medium transition-colors hover:text-indigo-600 capitalize",
              tripType === type ? "text-indigo-600 border-b-2 border-indigo-600 pb-1" : "text-slate-500"
            )}
          >
            {type.replace('-', ' ')}
          </button>
        ))}
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
            placeholder='Passengers'
            value={searchState.adults} 
            onChange={(e) => updateSearchState('adults', e.target.value)} 
            type='number'
            min='1'
          />
        </div>

        <DateInput
          label="Departure"
          value={searchState.date}
          placeholder="Select Departure Date"
          isActive={activeCalendar === 'departure'}
          onActivate={() => setActiveCalendar('departure')}
          onClose={() => setActiveCalendar(null)}
          onChange={handleDepartureDateChange}
          origin={searchState.origin}
          destination={searchState.destination}
          minDate={new Date()}
        />

        {tripType === 'round-trip' && (
          <DateInput
            label="Return"
            value={searchState.returnDate}
            placeholder="Select Return Date"
            isActive={activeCalendar === 'return'}
            onActivate={() => setActiveCalendar('return')}
            onClose={() => setActiveCalendar(null)}
            onChange={(date) => {
              updateSearchState('returnDate', date);
              setActiveCalendar(null);
            }}
            origin={searchState.destination}
            destination={searchState.origin}
            minDate={searchState.date ? parseLocalDate(searchState.date) : new Date()}
          />
        )}

        <Button 
          size='lg' 
          type='submit' 
          className='cursor-pointer md:w-auto w-full h-11 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95' 
          isLoading={loading}
        >
          <Search className='h-4 w-4 mr-2' />
          Search
        </Button>
      </div>
    </form>
  );
}
