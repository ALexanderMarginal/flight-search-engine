"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plane, Calendar, Search } from "lucide-react";

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [origin, setOrigin] = useState(searchParams.get("origin") || "MAD");
  const [destination, setDestination] = useState(searchParams.get("destination") || "BCN");
  const [date, setDate] = useState(searchParams.get("date") || "2025-06-01");
  const [loading, setLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const params = new URLSearchParams();
    if (origin) params.set("origin", origin.toUpperCase());
    if (destination) params.set("destination", destination.toUpperCase());
    if (date) params.set("date", date);
    
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-4xl mx-auto">
      <div className="bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row gap-2 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 dark:bg-slate-900">
        
        <div className="flex-1 relative group">
          <Plane className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <Input 
            placeholder="From (e.g. LHR)" 
            className="pl-10 border-0 shadow-none focus:ring-0 rounded-xl bg-slate-50 focus:bg-white"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            required
          />
        </div>

        <div className="flex-1 relative group">
          <Plane className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors rotate-90" />
          <Input 
            placeholder="To (e.g. JFK)" 
            className="pl-10 border-0 shadow-none focus:ring-0 rounded-xl bg-slate-50 focus:bg-white"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          />
        </div>

        <div className="flex-1 relative group">
          <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <Input 
            type="date"
            className="pl-10 border-0 shadow-none focus:ring-0 rounded-xl bg-slate-50 focus:bg-white"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <Button size="lg" type="submit" className="md:w-auto w-full h-11 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95" isLoading={loading}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>
    </form>
  );
}
