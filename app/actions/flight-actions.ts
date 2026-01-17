'use server';

import { amadeusApi } from "@/app/api/amadeus";
import { Airport } from "@/types/amadeus.types";

export const searchAirportsAction = async (query: string): Promise<Airport[]> => {
  if (!query || query.length < 3) {
    return [];
  }

  try {
    const response = await amadeusApi.searchAirport(query);
    console.log('query', query);
    console.log('response', response);
    
    return response;
  } catch (error) {
    console.error("Error searching airports:", error);
    return [];
  }
} 
