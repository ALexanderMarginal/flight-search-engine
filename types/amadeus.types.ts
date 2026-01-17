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
  departure: {
    iataCode: string;
    at: string; // ISO 8601
  };
  arrival: {
    iataCode: string;
    at: string;
  };
  carrierCode: string; // e.g. 'AA'
  number: string; // e.g. '100'
  duration: string; // PT2H30M
  aircraft: {
    code: string;
  };
  numberOfStops: number;
}

export interface TransformedFlight {
  id: string;
  amount: number;
  currency: string;
  airline: string; // Main airline name
  airlineCode: string;
  departureTime: string; // ISO
  arrivalTime: string; // ISO
  originCode: string;
  destinationCode: string;
  duration: string;
  stops: number;
  segments: Segment[];
}

export interface FlightOffer {
  id: string;
  price: {
    currency: string;
    total: string;
    grandTotal: string;
  };
  itineraries: {
    duration: string;
    segments: Segment[];
  }[];
  numberOfBookableSeats: number;
  validatingAirlineCodes: string[];
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
