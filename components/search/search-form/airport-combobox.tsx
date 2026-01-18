'use client';
import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils';
import { searchAirportsAction } from '@/app/actions/flight-actions';
import { Airport } from '@/types/amadeus.types';
import { AirportComboboxList } from './airport-combobox-list';

interface AirportComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
}

export const AirportCombobox = ({
  value,
  onChange,
  placeholder = 'Search airport...',
  className,
  icon
}: AirportComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [inputValue, setInputValue] = useState(value);
  const [options, setOptions] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 3) {
        setLoading(true);
        try {
          const results = await searchAirportsAction(query);
          setOptions(results);
        } catch (error) {
          console.error('Failed to fetch airports', error);
          setOptions([]);
        } finally {
          setLoading(false);
        }
      } else {
        setOptions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  const handleSelect = (airport: Airport) => {
    onChange(airport.iataCode);
    setInputValue(`${airport.address.cityName} (${airport.iataCode})`);
    setOpen(false);
    setQuery('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setInputValue(newVal);
    setQuery(newVal);
    setOpen(true);
    if (newVal === '') {
        onChange('');
    }
  };

  return (
    <div className={cn('relative w-full', className)} ref={wrapperRef}>
      <div className='relative group'>
        {icon && (
           <div className='absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none'>
             {icon}
           </div>
        )}
        <input
          type='text'
          className={cn(
            'flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out shadow-sm',
            icon ? 'pl-10' : ''
          )}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
              if (query.length >= 3) setOpen(true);
          }}
        />
        {loading && (
            <div className='absolute right-3 top-3.5'>
                <Loader2 className='h-4 w-4 animate-spin text-slate-400' />
            </div>
        )}
      </div>

      {open && options.length > 0 && (
        <AirportComboboxList options={options} onSelect={handleSelect} selectedCode={value} />
      )}
      
      {open && query.length >= 3 && !loading && options.length === 0 && (
          <div className='absolute z-10 mt-1 w-full overflow-auto rounded-md bg-white py-2 px-3 text-sm text-slate-500 shadow-lg ring-1 ring-black ring-opacity-5'>
              No airports found.
          </div>
      )}
    </div>
  );
}
