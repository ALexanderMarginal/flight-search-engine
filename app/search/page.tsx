import { fetchFlights } from "@/app/api/amadeus";
import { SearchResults } from "@/components/search/search-results";
import { SearchParams } from "@/lib/types";
import { SearchForm } from "@/components/search/search-form";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function SearchPage(props: PageProps) {
  const searchParams = await props.searchParams;
  
  const paramsSafe: SearchParams = {
    ...searchParams,
    adults: searchParams.adults || "1",
    max: "50"
  };

  const flights = await fetchFlights(paramsSafe);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header / Search Bar Compact */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
             <div className="font-bold text-xl text-indigo-600 tracking-tight mr-8 hidden md:block">
               FlightSearch
             </div>
             {/* We could put a compact search bar here, simplified for now to just back link or similar */}
             <div className="flex-1 w-full">
                {/* Reusing SearchForm but maybe we want a compact version? 
                    For now, let's just keep the full one but scaled down logic can be added later.
                    Actually, let's keep it simple. */}
             </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
           <h1 className="text-3xl font-bold text-slate-900 mb-2">
             Results for <span className="text-indigo-600">{paramsSafe.origin}</span> to <span className="text-indigo-600">{paramsSafe.destination}</span>
           </h1>
           <p className="text-slate-500">
             {flights.length} flights found • {paramsSafe.date}
           </p>
        </div>

        <SearchResults initialFlights={flights} />
      </main>
    </div>
  );
}
