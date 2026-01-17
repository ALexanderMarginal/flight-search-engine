"use client";
import { useState, useMemo } from "react";
import { FlightCard } from "@/components/flights/flight-card";
import { PriceGraph } from "@/components/viz/price-graph";
import { ArrowUpDown } from "lucide-react";
import { TransformedFlight } from "@/types/amadeus.types";
import { SearchSidebarProps, StopsFilter } from "./types";
import { SearchSidebar } from "./search-sidebar";

interface SearchResultsProps {
  initialFlights: TransformedFlight[];
}

type SortOption = "price_asc" | "price_desc" | "duration_asc";

export function SearchResults({ initialFlights: flights }: SearchResultsProps) {
  // Filters State
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [stopsFilter, setStopsFilter] = useState<StopsFilter>(StopsFilter.All);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>("price_asc");

  // Derive unique airlines for filter
  const uniqueAirlines = useMemo<SearchSidebarProps['uniqueAirlines']>(() => {
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
      <SearchSidebar
        setStopsFilter={setStopsFilter}
        setMaxPrice={setMaxPrice}
        setSelectedAirlines={setSelectedAirlines}
        selectedAirlines={selectedAirlines}
        stopsFilter={stopsFilter}
        maxPrice={maxPrice}
        maxFlightPrice={maxFlightPrice}
        uniqueAirlines={uniqueAirlines}
      />

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
