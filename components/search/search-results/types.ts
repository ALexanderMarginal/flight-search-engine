export enum StopsFilter {
    All = 'all',
    Zero = '0',
    One = '1',
    TwoPlus = '2+'
}

export interface SearchSidebarProps {
    setStopsFilter: (filter: StopsFilter) => void;
    setMaxPrice: (value: number) => void;
    setSelectedAirlines: (value: string[]) => void;
    selectedAirlines: string[];
    maxPrice: number;
    maxFlightPrice: number;
    stopsFilter: StopsFilter;
    uniqueAirlines: string[];
}
