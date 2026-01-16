"use server";

import { fetchFlights } from "@/app/api/amadeus";
import { SearchParams } from "@/lib/types";

export async function searchFlightsAction(params: SearchParams) {
  try {
    const data = await fetchFlights(params);
    return { success: true, data };
  } catch (error) {
    console.error("Search Action Error:", error);
    return { success: false, error: "Failed to fetch flights" };
  }
}
