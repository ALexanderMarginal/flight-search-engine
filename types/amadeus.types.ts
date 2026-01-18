export enum AmadeusTokenState {
  APPROVED = 'approved',
}

export enum AmadeusTokenType {
  BEARER = 'Bearer',
}

export interface AmadeusTokenResponse {
  type: string;
  username: string;
  application_name: string;
  client_id: string;
  token_type: AmadeusTokenType;
  access_token: string;
  expires_in: number;
  state: AmadeusTokenState,
  scope: string
}

export interface Segment {
  id: string;
  departure: {
    iataCode: string;
    terminal?: string;
    at: string; // ISO 8601
  };
  arrival: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  carrierCode: string; // e.g. 'AA'
  number: string; // e.g. '100'
  duration: string; // PT2H30M
  aircraft: {
    code: string;
    name?: string;
  };
  operating?: {
    carrierCode: string;
  };
  numberOfStops: number;
  blacklistedInEU?: boolean;
}

export interface FareDetails {
  segmentId: string;
  cabin: string;
  fareBasis?: string;
  brandedFare?: string;
  class: string;
  includedCheckedBags?: {
    quantity?: number;
    weight?: number;
    weightUnit?: string;
  };
  amenities?: {
    description: string;
    isChargeable: boolean;
    amenityType: string;
  }[];
}

export interface FlightItinerary {
  duration: string;
  segments: Segment[];
  stops: number;
  airline: string;
  airlineCode: string;
  departureTime: string;
  arrivalTime: string;
  originCode: string;
  destinationCode: string;
  cabin?: string;
  class?: string;
  fareDetails?: FareDetails[];
}

export interface PriceBreakdown {
  base: string;
  total: string;
  grandTotal: string;
  currency: string;
  fees?: {
    amount: string;
    type: string;
  }[];
}

export interface TransformedFlight {
  id: string;
  amount: number;
  currency: string;
  itineraries: FlightItinerary[];
  // Additional flight info
  numberOfBookableSeats?: number;
  validatingAirlineCodes?: string[];
  lastTicketingDate?: string;
  priceBreakdown?: PriceBreakdown;
  instantTicketingRequired?: boolean;
  nonHomogeneous?: boolean;
  oneWay?: boolean;
  isUpsellOffer?: boolean;
}

export interface FlightOffer {
  id: string;
  source?: string;
  instantTicketingRequired?: boolean;
  nonHomogeneous?: boolean;
  oneWay?: boolean;
  lastTicketingDate?: string;
  numberOfBookableSeats?: number;
  price: {
    currency: string;
    total: string;
    base: string;
    grandTotal: string;
    fees?: {
      amount: string;
      type: string;
    }[];
  };
  pricingOptions?: {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
  };
  itineraries: {
    duration: string;
    segments: Segment[];
  }[];
  validatingAirlineCodes: string[];
  travelerPricings: {
    travelerId: string;
    fareOption: string;
    travelerType: string;
    price: {
      currency: string;
      total: string;
      base: string;
    };
    fareDetailsBySegment: FareDetails[];
  }[];
}

export interface SearchParams {
  origin: string;
  destination: string;
  date: string;
  adults: string;
  returnDate?: string;
  max?: string;
}

export interface Airport {
  type: string,
  subType: string,
  name: string,
  detailedName: string,
  id: string,
  self: {
    href: string,
    methods: string[]
  },
  timeZoneOffset: string,
  iataCode: string,
  geoCode: {
    latitude: number,
    longitude: number
  },
  address: {
    cityName: string,
    cityCode: string,
    countryName: string,
    countryCode: string,
    regionCode: string
      },
  analytics: {
    travelers: {
      score: number
    }
  }
}

export interface AirportResponse {
  meta: {
    count: number;
    links: {
      self: string;
    };
  };
  data: Airport[];
}

export interface FlightDestination {
  type: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  price: {
    total: string;
  };
  links: {
    flightDates: string;
    flightOffers: string;
  };
}
