import { Airport } from '@/types/amadeus.types';
import { cn } from '@/utils';
import { Check } from 'lucide-react';

interface AirportComboboxListProps {
  options: Airport[];
  onSelect: (airport: Airport) => void;
  selectedCode: string;
}

export const AirportComboboxList = ({ options, onSelect, selectedCode }: AirportComboboxListProps) => {
  return (
    <div 
      className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'
    >
      {options.map((airport) => (
        <div
          key={airport.id}
          className={cn(
            'cursor-pointer hover:bg-slate-50 select-none py-2 px-3 text-slate-900 flex items-center justify-between',
            selectedCode === airport.iataCode ? 'bg-indigo-50' : ''
          )}
          onClick={() => onSelect(airport)}
        >
          <div className='flex flex-col'>
            <span className='font-medium truncate'>
              {airport.address.cityName} ({airport.iataCode})
            </span>
            <span className='text-xs text-slate-500 truncate'>
              {airport.name}
            </span>
          </div>
          {selectedCode === airport.iataCode && (
            <span className='text-indigo-600'>
              <Check className='h-4 w-4' aria-hidden='true' />
            </span>
          )}
        </div>
      ))}
    </div>
  );
};
