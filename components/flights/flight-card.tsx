import { TransformedFlight } from "@/lib/types";
import { formatCurrency, formatDuration, formatTime, cn } from "@/lib/utils";
import { Plane, Clock, ArrowRight } from "lucide-react";

interface FlightCardProps {
  flight: TransformedFlight;
}

export function FlightCard({ flight }: FlightCardProps) {
  // We only show the first segment details for simplicity in this card, or a summary
  // In a real app we'd map all segments or show the connection points.
  // For this demo, let's assume it's a direct flight or show stops count.
  
  return (
    <div className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        
        {/* Airline Info */}
        <div className="flex items-start gap-4 md:w-1/4">
          <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">
            {flight.airlineCode}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{flight.airline}</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
               Flight {flight.segments[0].number}
            </p>
          </div>
        </div>

        {/* Route Info */}
        <div className="flex-1 flex items-center justify-center gap-6">
          <div className="text-right">
            <p className="text-xl font-bold text-slate-900">{formatTime(flight.departureTime)}</p>
            <p className="text-sm text-slate-500 font-medium">{flight.originCode}</p>
          </div>

          <div className="flex flex-col items-center w-32 relative">
             <p className="text-xs text-slate-400 mb-1">{formatDuration(flight.duration)}</p>
             <div className="w-full h-[2px] bg-slate-200 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-50 px-1">
                   <Plane className="h-3 w-3 text-slate-400 rotate-90" />
                </div>
                {flight.stops > 0 && (
                   <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500 border-2 border-white mt-[-1px]" />
                )}
             </div>
             <p className="text-xs text-indigo-600 font-medium mt-1">
               {flight.stops === 0 ? "Direct" : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}
             </p>
          </div>

          <div className="text-left">
            <p className="text-xl font-bold text-slate-900">{formatTime(flight.arrivalTime)}</p>
            <p className="text-sm text-slate-500 font-medium">{flight.destinationCode}</p>
          </div>
        </div>

        {/* Price & Action */}
        <div className="md:w-1/4 flex flex-col items-end justify-center border-l border-slate-100 pl-6 md:pl-6 pt-4 md:pt-0 border-t md:border-t-0 mt-4 md:mt-0">
          <p className="text-sm text-slate-500 mb-1">Total Price</p>
          <p className="text-3xl font-bold text-slate-900 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
            {formatCurrency(flight.amount, flight.currency)}
          </p>
          
          <button className="mt-3 w-full py-2 px-4 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 group-hover:scale-[1.02]">
            Select <ArrowRight className="h-3 w-3" />
          </button>
        </div>

      </div>
    </div>
  );
}
