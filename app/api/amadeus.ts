
import { SearchParams } from "@/types/search.types";
import { AmadeusTokenResponse, TransformedFlight, FlightOffer } from "../../types/amadeus.types";

const AMADEUS_BASE_URL = "https://test.api.amadeus.com/v2";

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

const getAccessToken = async (forceRefresh: boolean = false): Promise<string | null> => {
  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;
  

  if (!clientId || !clientSecret) {
    console.warn("Using Mock Data: Missing Amadeus API Credentials");
    return null;
  }

  if (!forceRefresh && cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);

  try {
    const res = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
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
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000) - 30000; 

    return cachedToken;
  } catch (error) {
    console.error("Auth Error:", error);
    return null;
  }
}

export const fetchFlights = async (params: SearchParams): Promise<TransformedFlight[]> => {
  let token = await getAccessToken();
  
  const url = new URL(`${AMADEUS_BASE_URL}/shopping/flight-offers`);
  url.searchParams.append("originLocationCode", params.origin);
  url.searchParams.append("destinationLocationCode", params.destination);
  url.searchParams.append("departureDate", params.date);
  url.searchParams.append("adults", params.adults);
  
  if (params.returnDate) {
    url.searchParams.append("returnDate", params.returnDate);
  }
  
  url.searchParams.append("max", params.max || "20");
  url.searchParams.append("currencyCode", "EUR");

  console.log(`Fetching flights: ${url.toString()}`);

  let res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    next: { revalidate: 300 } 
  });

  // Handle Token Expiry
  if (res.status === 401) {
    console.log("Access token expired. Refreshing token...");
    token = await getAccessToken(true);
    
    if (token) {
        res = await fetch(url.toString(), {
            headers: {
              Authorization: `Bearer ${token}`,
            },
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

  // Transform internal raw data to convenient UI model
  return offers.map(offer => {
    const firstItinerary = offer.itineraries[0];
    const firstSegment = firstItinerary.segments[0];
    const lastSegment = firstItinerary.segments[firstItinerary.segments.length - 1];
    
    // Resolve airline name
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
