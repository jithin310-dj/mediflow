import React, { useState, useEffect } from 'react';
import { MapPin, Search, Phone, Star, Shield, Navigation, Crosshair, ArrowUpRight, Activity } from 'lucide-react';
import { MapLocation } from '../types';

export default function HospitalMap() {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [routeNotice, setRouteNotice] = useState<string | null>(null);

  useEffect(() => {
    if (routeNotice) {
      const timer = setTimeout(() => setRouteNotice(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [routeNotice]);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const url = `/api/locations?type=${filterType}&query=${encodeURIComponent(searchQuery)}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
        if (data.length > 0 && !selectedLocation) {
          setSelectedLocation(data[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load map locations:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [filterType, searchQuery]);

  const typeLabels: Record<string, { label: string; color: string }> = {
    hospital: { label: "Hospital", color: "bg-emerald-500 text-white" },
    pharmacy: { label: "Pharmacy", color: "bg-amber-500 text-white" },
    diagnostic: { label: "Diagnostic Lab", color: "bg-blue-500 text-white" },
    emergency: { label: "Emergency Service", color: "bg-rose-500 text-white" }
  };

  return (
    <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl shadow-xl overflow-hidden text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 h-[600px]">
        
        {/* Left Side: Directory Search & List */}
        <div className="lg:col-span-5 flex flex-col h-full border-r border-white/20">
          {/* Header & Controls */}
          <div className="p-4 border-b border-white/20 space-y-3 bg-white/20">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">HSR Layout, Bengaluru</span>
              <h3 className="font-sans text-base font-bold text-slate-800">Healthcare Service Directory</h3>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search hospitals, diagnostic scans..."
                value={searchQuery}
                id="search-locations-input"
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-emerald-500"
              />
            </div>

            {/* Quick Type Filter Tabs */}
            <div className="flex flex-wrap gap-1">
              {['all', 'hospital', 'pharmacy', 'diagnostic', 'emergency'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition ${
                    filterType === type 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Directory Listings */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
            {loading ? (
              <div className="py-20 text-center text-xs text-slate-400 animate-pulse">
                Locating medical clinics...
              </div>
            ) : locations.length === 0 ? (
              <div className="py-20 text-center text-xs text-slate-400">
                No healthcare facilities match your filters.
              </div>
            ) : (
              locations.map((loc) => {
                const isSelected = selectedLocation?.id === loc.id;
                return (
                  <div
                    key={loc.id}
                    id={`map-loc-item-${loc.id}`}
                    onClick={() => setSelectedLocation(loc)}
                    className={`rounded-xl p-3 cursor-pointer text-left transition flex gap-3 ${
                      isSelected ? 'bg-emerald-50/30 border border-emerald-100' : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className={`mt-0.5 h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      loc.type === 'hospital' ? 'bg-emerald-100 text-emerald-700' :
                      loc.type === 'pharmacy' ? 'bg-amber-100 text-amber-700' :
                      loc.type === 'diagnostic' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      <MapPin className="h-4 w-4" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-slate-800 line-clamp-1">{loc.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 font-bold shrink-0">{loc.distance}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{loc.address}</p>
                      
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {loc.services?.slice(0, 2).map((s, sIdx) => (
                          <span key={sIdx} className="bg-slate-100 text-slate-500 rounded text-[9px] px-1 py-0.5">
                            {s}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 pt-2 text-[10px] font-semibold text-slate-500">
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span>{loc.rating}</span>
                        </span>
                        {loc.openNow && (
                          <span className="text-emerald-600 font-bold uppercase tracking-wider text-[9px]">Open 24/7</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Visual Mock Map & Directions Panel */}
        <div className="lg:col-span-7 flex flex-col h-full bg-white/10 backdrop-blur-md relative overflow-hidden">
          
          {/* Vector Map Canvas Grid (Simulated high-end GIS layout) */}
          <div className="flex-1 relative p-6 flex items-center justify-center bg-white/20 border-b border-white/20 overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
            
            {/* Custom Interactive Vector Drawing */}
            <div className="relative w-[480px] h-[280px] bg-white/70 rounded-3xl border border-white/40 backdrop-blur-md shadow-inner flex flex-col p-4 overflow-hidden select-none">
              <span className="text-[9px] font-mono font-semibold tracking-widest text-slate-300 uppercase absolute top-3 left-4">VECTOR LOCATOR ENGINE</span>
              
              {/* Simulated streets lines */}
              <div className="absolute top-1/2 left-0 right-0 h-4 bg-slate-100/80 -translate-y-1/2" /> {/* Outer Ring Road */}
              <div className="absolute top-0 bottom-0 left-1/3 w-4 bg-slate-100/80" /> {/* 24th Main Road */}
              <div className="absolute top-0 bottom-0 left-2/3 w-3 bg-slate-100/80 rotate-12" /> {/* 17th Cross */}

              {/* Grid block names */}
              <div className="absolute top-8 left-8 text-[9px] font-bold font-mono text-slate-400">SECTOR 3</div>
              <div className="absolute bottom-8 left-8 text-[9px] font-bold font-mono text-slate-400">SECTOR 6</div>
              <div className="absolute bottom-12 right-12 text-[9px] font-bold font-mono text-slate-400">HSR SECTOR 5</div>

              {/* Draw Pins on map */}
              {locations.map((loc) => {
                const isSelected = selectedLocation?.id === loc.id;
                
                // Deterministic map positions based on lat/lng differences
                const topPercent = 30 + (12.9205 - loc.latitude) * 12000;
                const leftPercent = 30 + (loc.longitude - 77.6250) * 1500;

                return (
                  <button
                    key={loc.id}
                    id={`map-pin-${loc.id}`}
                    onClick={() => setSelectedLocation(loc)}
                    className="absolute transition-all transform -translate-x-1/2 -translate-y-1/2 focus:outline-none flex flex-col items-center z-10"
                    style={{ top: `${Math.min(90, Math.max(10, topPercent))}%`, left: `${Math.min(90, Math.max(10, leftPercent))}%` }}
                  >
                    <div className={`rounded-xl p-1.5 shadow-md flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'bg-slate-900 text-white scale-125 ring-4 ring-emerald-500/20 z-20' 
                        : 'bg-white border border-slate-200 text-emerald-600 scale-100 hover:scale-110'
                    }`}>
                      <MapPin className="h-4.5 w-4.5" />
                    </div>
                    {isSelected && (
                      <div className="bg-slate-900 text-white text-[9px] font-bold font-mono px-1.5 py-0.5 rounded shadow mt-1 animate-bounce">
                        {loc.name.split(" ")[0]}
                      </div>
                    )}
                  </button>
                );
              })}

              {/* Active navigation vector lines */}
              {selectedLocation && (
                <div className="absolute top-[48%] left-[34%] z-0 flex items-center gap-1 text-slate-400 opacity-60 animate-pulse">
                  <div className="h-0.5 w-24 bg-dashed bg-gradient-to-r from-emerald-500 to-transparent border-t border-dashed border-emerald-500" />
                </div>
              )}
            </div>
          </div>

          {/* Detailed Selected Facility Overlay card */}
          {selectedLocation && (
            <div className="p-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5 text-left">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                    selectedLocation.type === 'hospital' ? 'bg-emerald-100 text-emerald-800' :
                    selectedLocation.type === 'pharmacy' ? 'bg-amber-100 text-amber-800' :
                    selectedLocation.type === 'diagnostic' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {selectedLocation.type}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold flex items-center gap-1">
                    <Crosshair className="h-3.5 w-3.5 text-slate-300" />
                    <span>Lat: {selectedLocation.latitude.toFixed(4)}° • Long: {selectedLocation.longitude.toFixed(4)}°</span>
                  </span>
                </div>
                
                <h4 className="font-sans text-sm font-bold text-slate-900">{selectedLocation.name}</h4>
                <p className="text-xs text-slate-500 leading-normal">{selectedLocation.address}</p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {selectedLocation.services?.map((s, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-600 rounded text-[9px] px-2 py-0.5 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0">
                <a
                  href={`tel:${selectedLocation.phone}`}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>Call Staff</span>
                </a>
                <button
                  onClick={() => setRouteNotice(`Route map and emergency protocols generated for ${selectedLocation.name} (${selectedLocation.distance} away). Safe travels!`)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 px-3.5 py-2 text-xs font-bold text-white shadow-sm"
                >
                  <Navigation className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Route Me</span>
                </button>
              </div>
            </div>
          )}

          {/* Detailed Selected Facility Overlay card */}
          {routeNotice && (
            <div className="absolute bottom-24 left-4 right-4 p-3.5 bg-slate-900/95 backdrop-blur-md text-emerald-400 border border-emerald-500/20 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-bottom duration-300 z-50">
              <span className="flex items-center gap-2">
                <Navigation className="h-4 w-4 animate-bounce text-emerald-400 shrink-0" />
                <span>{routeNotice}</span>
              </span>
              <button onClick={() => setRouteNotice(null)} className="text-slate-400 hover:text-white text-sm font-bold ml-3 px-1.5 py-0.5">✕</button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
