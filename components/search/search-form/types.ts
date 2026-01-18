export interface SearchFormState {
  origin: string;
  destination: string;
  date: string;
  returnDate: string;
  adults: string;
}

export interface PriceData {
  date: string;
  price: number;
  currency: string;
}

export interface PriceCalendarProps {
  value: string;
  change: (date: string) => void;
  close: () => void;
  origin: string;
  destination: string;
  placeholder: string;
  minDate?: Date;
  maxDate?: Date;
}

export interface PriceCalendarMonthProps {
  date: Date;
  prices: PriceData[];
  value: string;
  change: (date: string) => void;
  close: () => void;
  minDate?: Date;
  maxDate?: Date;
}
