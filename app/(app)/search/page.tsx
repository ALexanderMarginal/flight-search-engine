import { fetchFlights } from "@/app/api/amadeus";
import { SearchResults } from "@/components/search/SearchResults/search-results";
import { Fragment } from "react";
import { SearchParams } from "@/types/search.types";
import { SearchForm } from "@/components/search/SearchForm";

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
    <Fragment>
      <div className="mb-8 flex flex-col lg:flex-row gap-2 justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Results for <span className="text-indigo-600">{paramsSafe.origin}</span> to <span className="text-indigo-600">{paramsSafe.destination}</span>
          </h1>
          <div className="text-slate-500">
            {flights.length} flights found • {paramsSafe.date}
          </div>
        </div>
        <SearchForm/>
      </div>
    
      <SearchResults initialFlights={flights} />
    </Fragment>
  );
}
