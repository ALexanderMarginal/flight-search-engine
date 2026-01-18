
import { 
  AmadeusTokenResponse, 
  TransformedFlight, 
  FlightOffer, 
  SearchParams,
  Airport,
  FlightDestination
} from '@/types/amadeus.types';
import { ur } from 'zod/locales';

class AmadeusApi {
  private v1Url: string = 'https://test.api.amadeus.com/v1';
  private v2Url: string = 'https://test.api.amadeus.com/v2';
  private clientId: string | undefined = process.env.AMADEUS_CLIENT_ID;
  private clientSecret: string | undefined = process.env.AMADEUS_CLIENT_SECRET;
  private cachedToken: string | null = null;
  private tokenExpiry: number = 0;

  private async getAccessToken(forceRefresh: boolean = false): Promise<string | null> {
    if (!this.clientId || !this.clientSecret) {
      console.warn('Using Mock Data: Missing Amadeus API Credentials');
      return null;
    }

    if (!forceRefresh && this.cachedToken && Date.now() < this.tokenExpiry) {
      return this.cachedToken;
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);

    try {
    const res = await fetch(`${this.v1Url}/security/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
      cache: 'no-store'
    });
    

    if (!res.ok) {
      const error = await res.text();
      console.error('Amadeus Token Error:', error);
      return null;
    }

    const data: AmadeusTokenResponse = await res.json();
    this.cachedToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 30000; 

    return this.cachedToken;
    } catch (error) {
      console.error('Auth Error:', error);
      return null;
    }
  }

  private get headers(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.cachedToken}`,
      'Content-Type': 'application/json',
    };
  }

  async fetchFlights(params: SearchParams): Promise<TransformedFlight[]> {
    const url = new URL(`${this.v2Url}/shopping/flight-offers`);
    url.searchParams.append('originLocationCode', params.origin);
    url.searchParams.append('destinationLocationCode', params.destination);
    url.searchParams.append('departureDate', params.date);
    url.searchParams.append('adults', params.adults);
  
  if (params.returnDate) {
    url.searchParams.append('returnDate', params.returnDate);
  }
  
  url.searchParams.append('max', params.max || '20');
  url.searchParams.append('currencyCode', 'EUR');

  let res = await fetch(url.toString(), {
    headers: this.headers,
    next: { revalidate: 300 } 
  });

  if (res.status === 401) {
    await this.getAccessToken(true);
    
    if (this.cachedToken) {
        res = await fetch(url.toString(), {
            headers: this.headers,
            next: { revalidate: 300 } 
        });
    }
  }

  if (!res.ok) {
    const err = await res.text();
    console.error('Amadeus API Error:', err);
    return [];
  }

  const json = await res.json();
  
  const offers: FlightOffer[] = json.data;
  const dictionaries = json.dictionaries;

  if (!offers || offers.length === 0) return [];

  return offers.map(offer => {
    const travelerPricing = offer.travelerPricings?.[0];
    
    const itineraries = offer.itineraries.map((itinerary) => {
      const firstSegment = itinerary.segments[0];
      const lastSegment = itinerary.segments[itinerary.segments.length - 1];
      const carrierCode = firstSegment.carrierCode;
      const airlineName = dictionaries?.carriers?.[carrierCode] || carrierCode;

      // Get fare details for all segments in this itinerary
      const fareDetailsForItinerary = itinerary.segments.map(seg => {
        const fareDetail = travelerPricing?.fareDetailsBySegment.find(f => f.segmentId === seg.id);
        return fareDetail ? {
          segmentId: seg.id,
          cabin: fareDetail.cabin,
          fareBasis: fareDetail.fareBasis,
          brandedFare: fareDetail.brandedFare,
          class: fareDetail.class,
          includedCheckedBags: fareDetail.includedCheckedBags,
          amenities: fareDetail.amenities,
        } : null;
      }).filter((fd): fd is NonNullable<typeof fd> => fd !== null);

      const firstFareDetail = fareDetailsForItinerary[0];
      
      // Enrich segments with dictionaries data
      const enrichedSegments = itinerary.segments.map(seg => ({
        ...seg,
        // Add aircraft name from dictionaries if available
        aircraft: {
          ...seg.aircraft,
          name: dictionaries?.aircraft?.[seg.aircraft.code] || seg.aircraft.code,
        },
        // Add operating carrier name if different from marketing carrier
        operating: seg.operating ? {
          ...seg.operating,
          carrierName: dictionaries?.carriers?.[seg.operating.carrierCode] || seg.operating.carrierCode,
        } : undefined,
      }));
      
      return {
        duration: itinerary.duration,
        segments: enrichedSegments,
        stops: itinerary.segments.length - 1,
        airline: airlineName,
        airlineCode: carrierCode,
        departureTime: firstSegment.departure.at,
        arrivalTime: lastSegment.arrival.at,
        originCode: firstSegment.departure.iataCode,
        destinationCode: lastSegment.arrival.iataCode,
        cabin: firstFareDetail?.cabin,
        class: firstFareDetail?.class,
        fareDetails: fareDetailsForItinerary,
      };
    });

    return {
      id: offer.id,
      amount: parseFloat(offer.price.grandTotal),
      currency: offer.price.currency,
      itineraries,
      // Additional offer-level information
      numberOfBookableSeats: offer.numberOfBookableSeats,
      validatingAirlineCodes: offer.validatingAirlineCodes,
      lastTicketingDate: offer.lastTicketingDate,
      instantTicketingRequired: offer.instantTicketingRequired,
      nonHomogeneous: offer.nonHomogeneous,
      oneWay: offer.oneWay,
      priceBreakdown: {
        base: offer.price.base,
        total: offer.price.total,
        grandTotal: offer.price.grandTotal,
        currency: offer.price.currency,
        fees: offer.price.fees,
      },
    };
  });
  }

  async searchAirport(query: string): Promise<Airport[]> {
    const url = new URL(`${this.v1Url}/reference-data/locations`);
    url.searchParams.append('subType', 'CITY');
    url.searchParams.append('keyword', query);

    let res = await fetch(url.toString(), {
      headers: this.headers,
      next: { revalidate: 300 } 
    });

    if (res.status === 401) {
      await this.getAccessToken(true);
      
      if (this.cachedToken) {
          res = await fetch(url.toString(), {
              headers: this.headers,
              next: { revalidate: 300 } 
          });
      }
    }

    if (!res.ok) {
      const err = await res.text();
      console.error('Amadeus API Error:', err);
      return [];
    }

    const json = await res.json();
    const airports: Airport[] = json.data;
    return airports;
  } 

  async getCheapestDates(origin: string, destination: string, departureDate?: string, oneWay: boolean = true): Promise<FlightDestination[]> {
    const url = new URL(`${this.v1Url}/shopping/flight-dates`);
    url.searchParams.append('origin', origin);
    url.searchParams.append('destination', destination);
    if (departureDate) {
      url.searchParams.append('departureDate', departureDate);
    }
    url.searchParams.append('oneWay', String(oneWay));
    url.searchParams.append('viewBy', 'DATE');

    let res = await fetch(url.toString(), {
      headers: this.headers,
      next: { revalidate: 3600 }
    });

    if (res.status === 401) {
      await this.getAccessToken(true);
      
      if (this.cachedToken) {
          res = await fetch(url.toString(), {
              headers: this.headers,
              next: { revalidate: 3600 } 
          });
      }
    }

    if (!res.ok) {
      const err = await res.text();
      console.error('Amadeus API Error (Cheapest Dates):', err);
      return [];
    }

    const json = await res.json();
    const destinations: FlightDestination[] = json.data;
    return destinations || [];
  }
}

const amadeusApi = new AmadeusApi();

export {
  amadeusApi,
}
