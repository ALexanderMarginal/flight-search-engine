export interface SearchParams {
  origin: string;
  destination: string;
  date: string;
  returnDate?: string; // Optional
  adults: string;
  max?: string;
}

export interface Airline {
  iata: string;
  name: string;
}

export interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
}

