"use client";
import { useState, useMemo } from "react";
import { FlightCard } from "@/components/flights/flight-card";
import { PriceGraph } from "@/components/viz/price-graph";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TransformedFlight } from "@/app/types/amadeus.types";

interface SearchResultsProps {
  initialFlights: TransformedFlight[];
}

type SortOption = "price_asc" | "price_desc" | "duration_asc";

export function SearchResults({ initialFlights }: SearchResultsProps) {
  const [flights] = useState<TransformedFlight[]>(initialFlights);
  
  // Filters State
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [stopsFilter, setStopsFilter] = useState<"all" | "0" | "1" | "2+">("all");
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>("price_asc");

  // Derive unique airlines for filter
  const uniqueAirlines = useMemo(() => {
    const airlines = new Set(flights.map(f => f.airline));
    return Array.from(airlines);
  }, [flights]);

  // Derived filtered data
  const filteredFlights = useMemo(() => {
    const res = flights.filter(f => {
       if (f.amount > maxPrice) return false;
       
       if (stopsFilter === "0" && f.stops !== 0) return false;
       if (stopsFilter === "1" && f.stops !== 1) return false;
       if (stopsFilter === "2+" && f.stops < 2) return false;

       if (selectedAirlines.length > 0 && !selectedAirlines.includes(f.airline)) return false;

       return true;
    });

    if (sort === "price_asc") {
        res.sort((a, b) => a.amount - b.amount);
    } else if (sort === "price_desc") {
        res.sort((a, b) => b.amount - a.amount);
    } else if (sort === "duration_asc") {
        // Simple string comparison for PT is risky, simplified for now:
        // In real app, convert duration to minutes in helper
        res.sort((a, b) => a.duration.localeCompare(b.duration)); 
    }

    return res;
  }, [flights, maxPrice, stopsFilter, selectedAirlines, sort]);

  const maxFlightPrice = useMemo(() => Math.max(...flights.map(f => f.amount), 1000), [flights]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-72 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
           <div className="flex items-center gap-2 mb-6">
             <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
             <h2 className="font-bold text-slate-900">Filters</h2>
           </div>

           {/* Stops Filter */}
           <div className="mb-6">
             <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Stops</h3>
             <div className="flex gap-2">
               {["all", "0", "1", "2+"].map((opt) => (
                 <button
                   key={opt}
                   onClick={() => setStopsFilter(opt as any)}
                   className={cn(
                     "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                     stopsFilter === opt 
                       ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20" 
                       : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                   )}
                 >
                   {opt === "all" ? "Any" : opt}
                 </button>
               ))}
             </div>
           </div>

           {/* Price Filter */}
           <div className="mb-6">
             <div className="flex justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase">Max Price</h3>
                <span className="text-xs font-bold text-indigo-600">€{maxPrice}</span>
             </div>
             <input 
               type="range" 
               min={0} 
               max={maxFlightPrice} 
               value={maxPrice} 
               onChange={(e) => setMaxPrice(Number(e.target.value))}
               className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
             />
           </div>

           {/* Airlines Filter */}
           <div>
             <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Airlines</h3>
             <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {uniqueAirlines.map(airline => (
                  <label key={airline} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox"
                      className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      checked={selectedAirlines.includes(airline)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedAirlines([...selectedAirlines, airline]);
                        else setSelectedAirlines(selectedAirlines.filter(a => a !== airline));
                      }}
                    />
                    <span className="text-sm text-slate-600 group-hover:text-slate-900">{airline}</span>
                  </label>
                ))}
             </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        
        {/* Visual Graph & Sorting Header */}
        <div className="grid gap-6">
           <PriceGraph flights={filteredFlights} />
           
           <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
              <p className="text-sm font-medium text-slate-500">
                Found <span className="text-slate-900 font-bold">{filteredFlights.length}</span> flights
              </p>
              
              <div className="flex items-center gap-2">
                 <ArrowUpDown className="h-4 w-4 text-slate-400" />
                 <select 
                   className="text-sm border-none bg-transparent font-medium text-slate-700 focus:ring-0 cursor-pointer"
                   value={sort}
                   onChange={(e) => setSort(e.target.value as SortOption)}
                 >
                   <option value="price_asc">Cheapest first</option>
                   <option value="price_desc">Most expensive</option>
                   <option value="duration_asc">Fastest first</option>
                 </select>
              </div>
           </div>
        </div>

        {/* Results List */}
        <div className="space-y-4">
           {filteredFlights.length > 0 ? (
             filteredFlights.map((flight) => (
               <div key={flight.id} className="animate-up">
                 <FlightCard flight={flight} />
               </div>
             ))
           ) : (
             <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
               <h3 className="text-lg font-semibold text-slate-900">No flights found</h3>
               <p className="text-slate-500">Try adjusting your filters</p>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}
