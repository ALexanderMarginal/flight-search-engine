
import { 
  AmadeusTokenResponse, 
  TransformedFlight, 
  FlightOffer, 
  SearchParams,
  Airport
} from "@/types/amadeus.types";

class AmadeusApi {
  private v1Url: string = 'https://test.api.amadeus.com/v1';
  private v2Url: string = 'https://test.api.amadeus.com/v2';
  private clientId: string | undefined = process.env.AMADEUS_CLIENT_ID;
  private clientSecret: string | undefined = process.env.AMADEUS_CLIENT_SECRET;
  private cachedToken: string | null = null;
  private tokenExpiry: number = 0;

  private async getAccessToken(forceRefresh: boolean = false): Promise<string | null> {
    if (!this.clientId || !this.clientSecret) {
      console.warn("Using Mock Data: Missing Amadeus API Credentials");
      return null;
    }

    if (!forceRefresh && this.cachedToken && Date.now() < this.tokenExpiry) {
      return this.cachedToken;
    }

    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", this.clientId);
    params.append("client_secret", this.clientSecret);

    try {
    const res = await fetch(`${this.v1Url}/security/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
      cache: 'no-store'
    });
    

    if (!res.ok) {
      const error = await res.text();
      console.error("Amadeus Token Error:", error);
      return null;
    }

    const data: AmadeusTokenResponse = await res.json();
    this.cachedToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 30000; 

    return this.cachedToken;
    } catch (error) {
      console.error("Auth Error:", error);
      return null;
    }
  }

  private get headers(): Record<string, string> {
    return {
      "Authorization": `Bearer ${this.cachedToken}`,
      "Content-Type": "application/json",
    };
  }

  async fetchFlights(params: SearchParams): Promise<TransformedFlight[]> {
    const url = new URL(`${this.v2Url}/shopping/flight-offers`);
    url.searchParams.append("originLocationCode", params.origin);
    url.searchParams.append("destinationLocationCode", params.destination);
    url.searchParams.append("departureDate", params.date);
    url.searchParams.append("adults", params.adults);
  
  if (params.returnDate) {
    url.searchParams.append("returnDate", params.returnDate);
  }
  
  url.searchParams.append("max", params.max || "20");
  url.searchParams.append("currencyCode", "EUR");

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
    console.error("Amadeus API Error:", err);
    return [];
  }

  const json = await res.json();
  const offers: FlightOffer[] = json.data;
  const dictionaries = json.dictionaries;

  if (!offers || offers.length === 0) return [];

  return offers.map(offer => {
    const firstItinerary = offer.itineraries[0];
    const firstSegment = firstItinerary.segments[0];
    const lastSegment = firstItinerary.segments[firstItinerary.segments.length - 1];
    
    const carrierCode = firstSegment.carrierCode;
    const airlineName = dictionaries?.carriers?.[carrierCode] || carrierCode;
    
    return {
      id: offer.id,
      amount: parseFloat(offer.price.grandTotal),
      currency: offer.price.currency,
      airline: airlineName,
      airlineCode: carrierCode,
      departureTime: firstSegment.departure.at,
      arrivalTime: lastSegment.arrival.at,
      originCode: firstSegment.departure.iataCode,
      destinationCode: lastSegment.arrival.iataCode,
      duration: firstItinerary.duration,
      stops: firstItinerary.segments.length - 1,
      segments: firstItinerary.segments
    };
  });
  }

  async searchAirport(query: string): Promise<Airport[]> {
    const url = new URL(`${this.v1Url}/reference-data/locations`);
    url.searchParams.append("subType", "CITY");
    url.searchParams.append("keyword", query);

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
      console.error("Amadeus API Error:", err);
      return [];
    }

    const json = await res.json();
    const airports: Airport[] = json.data;
    return airports;
  } 
}

const amadeusApi = new AmadeusApi();

export {
  amadeusApi,
}
