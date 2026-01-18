'use client';

import { useState } from 'react';
import { TransformedFlight } from '@/types/amadeus.types';
import { formatCurrency, formatDuration, formatTime, calculateLayover, cn } from '@/lib/utils';
import { 
  Plane, ChevronDown, ChevronUp, Clock, PlaneTakeoff, PlaneLanding, Info,
  Users, Calendar, Zap, CreditCard, Luggage, AlertTriangle, Wifi, Utensils, Tv, Headphones, Battery
} from 'lucide-react';

function getAmenityIcon(amenityType: string) {
  switch (amenityType?.toUpperCase()) {
    case 'WIFI':
    case 'INTERNET':
      return <Wifi className='h-3 w-3' />;
    case 'MEAL':
    case 'FOOD':
    case 'SNACK':
      return <Utensils className='h-3 w-3' />;
    case 'ENTERTAINMENT':
    case 'TV':
    case 'MOVIE':
      return <Tv className='h-3 w-3' />;
    case 'HEADPHONES':
    case 'AUDIO':
      return <Headphones className='h-3 w-3' />;
    case 'POWER':
    case 'USB':
    case 'OUTLET':
      return <Battery className='h-3 w-3' />;
    default:
      return <Info className='h-3 w-3' />;
  }
}

interface FlightCardProps {
  flight: TransformedFlight;
}

export function FlightCard({ flight }: FlightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSelect = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={cn(
      'group bg-white rounded-2xl border p-5 transition-all duration-300',
      isExpanded 
        ? 'border-indigo-300 shadow-lg shadow-indigo-500/10' 
        : 'border-slate-200 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5'
    )}>
      <div className='flex flex-col md:flex-row justify-between gap-6'>
        <div className='flex-1 flex flex-col gap-6'>
          {flight.itineraries.map((itinerary, index) => (
            <div key={index} className={cn("flex flex-col md:flex-row gap-6", index > 0 && "pt-6 border-t border-slate-100")}>
              <div className='flex items-start gap-4 md:w-1/4'>
                <div className='h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500'>
                  {itinerary.airlineCode}
                </div>
                <div>
                  <h3 className='font-semibold text-slate-900'>{itinerary.airline}</h3>
                  <p className='text-xs text-slate-500 mt-1 flex items-center gap-1'>
                     Flight {itinerary.segments[0].number}
                  </p>
                </div>
              </div>

              <div className='flex-1 flex items-center justify-center gap-6'>
                <div className='text-right'>
                  <p className='text-xl font-bold text-slate-900'>{formatTime(itinerary.departureTime)}</p>
                  <p className='text-sm text-slate-500 font-medium'>{itinerary.originCode}</p>
                </div>

                <div className='flex flex-col items-center w-32 relative'>
                   <p className='text-xs text-slate-400 mb-1'>{formatDuration(itinerary.duration)}</p>
                   <div className='w-full h-[2px] bg-slate-200 relative'>
                      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-50 px-1'>
                         <Plane className='h-3 w-3 text-slate-400 rotate-90' />
                      </div>
                      {itinerary.stops > 0 && (
                         <div className='absolute top-1/2 left-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500 border-2 border-white mt-[-1px]' />
                      )}
                   </div>
                   <div className='text-center mt-1'>
                     <p className='text-xs text-indigo-600 font-medium'>
                       {itinerary.stops === 0 ? 'Direct' : `${itinerary.stops} Stop${itinerary.stops > 1 ? 's' : ''}`}
                     </p>
                     {itinerary.stops > 0 && itinerary.segments.length > 1 && (
                        <p className='text-[10px] text-slate-400'>
                          via {itinerary.segments[0].arrival.iataCode} 
                          <span className="text-slate-300 mx-1">•</span>
                          {calculateLayover(itinerary.segments[0].arrival.at, itinerary.segments[1].departure.at)}
                        </p>
                     )}
                   </div>
                </div>

                <div className='text-left'>
                  <p className='text-xl font-bold text-slate-900'>{formatTime(itinerary.arrivalTime)}</p>
                  <p className='text-sm text-slate-500 font-medium'>{itinerary.destinationCode}</p>
                </div>
              </div>
            
              <div className='hidden md:flex flex-col items-end justify-center w-20 text-right'>
                 <span className='px-2 py-1 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-600 uppercase tracking-wider'>
                    {itinerary.cabin || 'Eco'}
                 </span>
              </div>
            </div>
          ))}
        </div>

        <div className='md:w-1/4 flex flex-col items-end justify-center border-l border-slate-100 pl-6 md:pl-6 pt-4 md:pt-0 border-t md:border-t-0 mt-4 md:mt-0'>
          <p className='text-sm text-slate-500 mb-1'>Total Price</p>
          <p className='text-3xl font-bold text-slate-900 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600'>
            {formatCurrency(flight.amount, flight.currency)}
          </p>
          
          <button 
            onClick={handleSelect}
            className={cn(
              'cursor-pointer mt-3 w-full py-2 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2',
              isExpanded 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-slate-900 text-white hover:bg-indigo-600 group-hover:scale-[1.02]'
            )}
          >
            {isExpanded ? 'Hide Details' : 'Select'} 
            {isExpanded ? <ChevronUp className='h-3 w-3' /> : <ChevronDown className='h-3 w-3' />}
          </button>
        </div>

      </div>

      {isExpanded && (
        <div className='mt-6 pt-6 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300'>
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6'>
            <div className='flex items-center gap-2'>
              <Info className='h-4 w-4 text-indigo-500' />
              <h4 className='font-semibold text-slate-900'>Complete Flight Details</h4>
            </div>
            <div className='flex flex-wrap gap-2'>
              {flight.numberOfBookableSeats && (
                <span className='px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium flex items-center gap-1'>
                  <Users className='h-3 w-3' />
                  {flight.numberOfBookableSeats} seats left
                </span>
              )}
              {flight.lastTicketingDate && (
                <span className='px-2 py-1 bg-amber-50 text-amber-700 rounded-md text-xs font-medium flex items-center gap-1'>
                  <Calendar className='h-3 w-3' />
                  Book by {new Date(flight.lastTicketingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
              {flight.instantTicketingRequired && (
                <span className='px-2 py-1 bg-red-50 text-red-700 rounded-md text-xs font-medium flex items-center gap-1'>
                  <Zap className='h-3 w-3' />
                  Instant ticketing required
                </span>
              )}
            </div>
          </div>

          {flight.priceBreakdown && (
            <div className='mb-6 p-4 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl'>
              <h5 className='text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2'>
                <CreditCard className='h-4 w-4' />
                Price Breakdown
              </h5>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                <div>
                  <p className='text-slate-500 text-xs'>Base Fare</p>
                  <p className='font-semibold text-slate-900'>{formatCurrency(parseFloat(flight.priceBreakdown.base), flight.priceBreakdown.currency)}</p>
                </div>
                {flight.priceBreakdown.fees && flight.priceBreakdown.fees.length > 0 && (
                  <div>
                    <p className='text-slate-500 text-xs'>Fees & Taxes</p>
                    <p className='font-semibold text-slate-900'>
                      {formatCurrency(
                        flight.priceBreakdown.fees.reduce((sum, fee) => sum + parseFloat(fee.amount), 0),
                        flight.priceBreakdown.currency
                      )}
                    </p>
                  </div>
                )}
                <div>
                  <p className='text-slate-500 text-xs'>Total</p>
                  <p className='font-bold text-indigo-600'>
                    {formatCurrency(parseFloat(flight.priceBreakdown.grandTotal), flight.priceBreakdown.currency)}
                  </p>
                </div>
                {flight.validatingAirlineCodes && (
                  <div>
                    <p className='text-slate-500 text-xs'>Validating Carrier</p>
                    <p className='font-semibold text-slate-900'>{flight.validatingAirlineCodes.join(', ')}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className='space-y-6'>
            {flight.itineraries.map((itinerary, itinIndex) => (
              <div key={itinIndex} className='space-y-4'>
                <div className='flex items-center gap-2'>
                  <span className='px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold'>
                    {itinIndex === 0 ? 'Outbound' : 'Return'}
                  </span>
                  <span className='text-sm text-slate-500'>
                    {new Date(itinerary.departureTime).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <span className='text-xs text-slate-400'>•</span>
                  <span className='text-xs text-slate-500'>
                    Total: {formatDuration(itinerary.duration)}
                  </span>
                </div>

                <div className='grid gap-4'>
                  {itinerary.segments.map((segment, segIndex) => {
                    const fareDetail = itinerary.fareDetails?.find(fd => fd.segmentId === segment.id);
                    
                    return (
                      <div key={segment.id} className='relative'>
                        {segIndex > 0 && (
                          <div className='mb-4 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2'>
                            <Clock className='h-3 w-3' />
                            <span>
                              Layover in {itinerary.segments[segIndex - 1].arrival.iataCode}: {' '}
                              {calculateLayover(
                                itinerary.segments[segIndex - 1].arrival.at, 
                                segment.departure.at
                              )}
                            </span>
                          </div>
                        )}
                        
                        <div className='bg-slate-50 rounded-xl p-4'>
                          <div className='flex flex-wrap items-center gap-2 mb-4 pb-3 border-b border-slate-200'>
                            <div className='h-8 w-8 bg-white rounded-full flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200'>
                              {segment.carrierCode}
                            </div>
                            <div>
                              <p className='text-sm font-semibold text-slate-900'>
                                {segment.carrierCode} {segment.number}
                              </p>
                              {segment.operating && segment.operating.carrierCode !== segment.carrierCode && (
                                <p className='text-[10px] text-slate-400'>
                                  Operated by {segment.operating.carrierCode}
                                </p>
                              )}
                            </div>
                            <div className='flex-1' />
                            <div className='flex flex-wrap gap-1.5'>
                              <span className='px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-600 font-medium'>
                                ✈️ {segment.aircraft.name || segment.aircraft.code}
                              </span>
                              {fareDetail?.cabin && (
                                <span className='px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-medium uppercase'>
                                  {fareDetail.cabin}
                                </span>
                              )}
                              {fareDetail?.class && (
                                <span className='px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px] font-medium'>
                                  Class {fareDetail.class}
                                </span>
                              )}
                              {fareDetail?.fareBasis && (
                                <span className='px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-medium'>
                                  {fareDetail.fareBasis}
                                </span>
                              )}
                              {fareDetail?.brandedFare && (
                                <span className='px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-medium'>
                                  {fareDetail.brandedFare}
                                </span>
                              )}
                            </div>
                          </div>

                          
                          <div className='flex flex-col md:flex-row md:items-center gap-4'>
                            
                            <div className='flex items-start gap-2 flex-1'>
                              <PlaneTakeoff className='h-4 w-4 text-indigo-500 mt-0.5' />
                              <div>
                                <p className='text-lg font-bold text-slate-900'>
                                  {formatTime(segment.departure.at)}
                                </p>
                                <p className='text-sm font-medium text-slate-700'>
                                  {segment.departure.iataCode}
                                  {segment.departure.terminal && (
                                    <span className='text-slate-400 ml-1'>Terminal {segment.departure.terminal}</span>
                                  )}
                                </p>
                                <p className='text-xs text-slate-400'>
                                  {new Date(segment.departure.at).toLocaleDateString('en-US', { 
                                    weekday: 'short',
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>

                            
                            <div className='flex items-center gap-2 text-slate-400'>
                              <div className='w-12 h-[1px] bg-slate-300' />
                              <div className='flex flex-col items-center'>
                                <Clock className='h-3 w-3' />
                                <span className='text-xs whitespace-nowrap mt-1'>{formatDuration(segment.duration)}</span>
                              </div>
                              <div className='w-12 h-[1px] bg-slate-300' />
                            </div>

                            
                            <div className='flex items-start gap-2 flex-1'>
                              <PlaneLanding className='h-4 w-4 text-indigo-500 mt-0.5' />
                              <div>
                                <p className='text-lg font-bold text-slate-900'>
                                  {formatTime(segment.arrival.at)}
                                </p>
                                <p className='text-sm font-medium text-slate-700'>
                                  {segment.arrival.iataCode}
                                  {segment.arrival.terminal && (
                                    <span className='text-slate-400 ml-1'>Terminal {segment.arrival.terminal}</span>
                                  )}
                                </p>
                                <p className='text-xs text-slate-400'>
                                  {new Date(segment.arrival.at).toLocaleDateString('en-US', { 
                                    weekday: 'short',
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>

                          
                          {fareDetail && (
                            <div className='mt-4 pt-3 border-t border-slate-200'>
                              <div className='flex flex-wrap gap-3'>
                                
                                {fareDetail.includedCheckedBags && (
                                  <div className='flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg'>
                                    <Luggage className='h-4 w-4 text-slate-500' />
                                    <span className='text-xs text-slate-600'>
                                      {fareDetail.includedCheckedBags.quantity !== undefined 
                                        ? `${fareDetail.includedCheckedBags.quantity} checked bag${fareDetail.includedCheckedBags.quantity !== 1 ? 's' : ''}`
                                        : fareDetail.includedCheckedBags.weight 
                                          ? `${fareDetail.includedCheckedBags.weight}${fareDetail.includedCheckedBags.weightUnit || 'kg'} baggage`
                                          : 'Checked baggage included'
                                      }
                                    </span>
                                  </div>
                                )}
                                
                                
                                {fareDetail.amenities && fareDetail.amenities.length > 0 && (
                                  fareDetail.amenities.map((amenity, amenIdx) => (
                                    <div 
                                      key={amenIdx} 
                                      className={cn(
                                        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs',
                                        amenity.isChargeable 
                                          ? 'bg-slate-100 text-slate-500'
                                          : 'bg-emerald-50 text-emerald-700'
                                      )}
                                    >
                                      {getAmenityIcon(amenity.amenityType)}
                                      <span>{amenity.description}</span>
                                      {amenity.isChargeable && (
                                        <span className='text-[10px] text-slate-400'>(paid)</span>
                                      )}
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                          
                          
                          {segment.blacklistedInEU && (
                            <div className='mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2'>
                              <AlertTriangle className='h-3 w-3' />
                              <span>This carrier is blacklisted in the EU</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          
          <div className='mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3'>
            <button 
              onClick={() => setIsExpanded(false)}
              className='cursor-pointer px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors'
            >
              Cancel
            </button>
            <button className='cursor-pointer px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg shadow-indigo-500/25'>
              Book Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
