import { SlidersHorizontal } from 'lucide-react';
import { SearchSidebarProps, StopsFilter } from './types';
import { cn } from '@/utils';

export const SearchSidebar = (props: SearchSidebarProps) => {
  return (
    <aside className='w-full lg:w-72 space-y-6'>
        <div className='bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24'>
           <div className='flex items-center gap-2 mb-6'>
             <SlidersHorizontal className='h-4 w-4 text-indigo-600' />
             <h2 className='font-bold text-slate-900'>Filters</h2>
           </div>

           {/* Stops Filter */}
           <div className='mb-6'>
             <h3 className='text-xs font-bold text-slate-500 uppercase mb-3'>Stops</h3>
             <div className='flex gap-2'>
               {['all', '0', '1', '2+'].map((opt) => (
                 <button
                   key={opt}
                   onClick={() => props.setStopsFilter(opt as StopsFilter)}
                   className={cn(
                     'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                     props.stopsFilter === opt 
                       ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20' 
                       : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                   )}
                 >
                   {opt === 'all' ? 'Any' : opt}
                 </button>
               ))}
             </div>
           </div>

           {/* Price Filter */}
           <div className='mb-6'>
             <div className='flex justify-between mb-2'>
                <h3 className='text-xs font-bold text-slate-500 uppercase'>Max Price</h3>
                <span className='text-xs font-bold text-indigo-600'>€{props.maxPrice}</span>
             </div>
             <input 
               type='range' 
               min={0} 
               max={props.maxFlightPrice} 
               value={props.maxPrice} 
               onChange={(e) => props.setMaxPrice(Number(e.target.value))}
               className='w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600'
             />
           </div>

           {/* Airlines Filter */}
           <div>
             <h3 className='text-xs font-bold text-slate-500 uppercase mb-3'>Airlines</h3>
             <div className='space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar'>
                {props.uniqueAirlines.map(airline => (
                  <label key={airline} className='flex items-center gap-2 cursor-pointer group'>
                    <input 
                      type='checkbox'
                      className='rounded text-indigo-600 focus:ring-indigo-500 border-slate-300'
                      checked={props.selectedAirlines.includes(airline)}
                      onChange={(e) => {
                        if (e.target.checked) props.setSelectedAirlines([...props.selectedAirlines, airline]);
                        else props.setSelectedAirlines(props.selectedAirlines.filter(a => a !== airline));
                      }}
                    />
                    <span className='text-sm text-slate-600 group-hover:text-slate-900'>{airline}</span>
                  </label>
                ))}
             </div>
           </div>
        </div>
      </aside>
  )
}  
