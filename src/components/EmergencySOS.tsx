import React, { useState, useEffect } from 'react';
import { AlertOctagon, Phone, MapPin, Navigation, Compass, Share2, QrCode, ShieldAlert, Heart, Siren, Clock, Copy, Check, Star } from 'lucide-react';
import { MapLocation, UserProfile } from '../types';

interface EmergencySOSProps {
  user: UserProfile;
  locations: MapLocation[];
}

export default function EmergencySOS({ user, locations }: EmergencySOSProps) {
  const [sosTriggered, setSosTriggered] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [sosStatus, setSosStatus] = useState<'idle' | 'countdown' | 'broadcasting' | 'dispatched'>('idle');
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [simulatedAmbulanceDistance, setSimulatedAmbulanceDistance] = useState("Calculating...");

  // Mock emergency profile details (Priority 7 & Priority 6)
  const emergencyProfile = {
    bloodGroup: user.bloodGroup || "O Positive",
    allergies: "Penicillin, Sulfa Drugs, Gluten",
    criticalNotes: "History of mild hypertension. Taking daily cardiac medications.",
    emergencyContacts: [
      { name: "Priya Sharma (Spouse)", relation: "Wife", phone: "+91 98450 99887" },
      { name: "Rajesh Sharma (Brother)", relation: "Brother", phone: "+91 91100 22334" }
    ],
    primaryDoctor: "Dr. Mohan Rao (Apex Hospital)",
    activeMeds: "Ecosprin 75mg, Atorva 20mg"
  };

  // Nearby emergency centers filtered from mock locations
  const emergencyHospitals = locations.filter(loc => loc.type === 'hospital' || loc.type === 'emergency');

  // SOS Countdown logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sosStatus === 'countdown') {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setSosStatus('broadcasting');
            clearInterval(interval);
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sosStatus]);

  // Simulate ambulance arrival tracking once broadcasting
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (sosStatus === 'broadcasting') {
      timeout = setTimeout(() => {
        setSosStatus('dispatched');
        setSimulatedAmbulanceDistance("0.9 km (Dispatching from Apex Hospital - Est. 3 mins)");
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [sosStatus]);

  const handleTriggerSOS = () => {
    if (sosStatus === 'idle') {
      setSosStatus('countdown');
      setCountdown(5);
    } else {
      // Cancel SOS
      setSosStatus('idle');
    }
  };

  const handleCopyProfile = () => {
    const summaryText = `
--- MEDIFLOW EMERGENCY PASS CARD ---
Patient Name: ${user.name}
Blood Group: ${emergencyProfile.bloodGroup}
Allergies: ${emergencyProfile.allergies}
Active Medications: ${emergencyProfile.activeMeds}
Primary Doctor: ${emergencyProfile.primaryDoctor}
Emergency Contacts:
1. ${emergencyProfile.emergencyContacts[0].name} (${emergencyProfile.emergencyContacts[0].relation}) - ${emergencyProfile.emergencyContacts[0].phone}
2. ${emergencyProfile.emergencyContacts[1].name} (${emergencyProfile.emergencyContacts[1].relation}) - ${emergencyProfile.emergencyContacts[1].phone}
--- SECURED AT MEDIFLOW ---
    `.trim();

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-left">
      
      {/* Immersive SOS Trigger Section */}
      <div className="rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-50/80 to-red-50/60 backdrop-blur-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-rose-500/10 blur-3xl" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <Siren className="h-6 w-6 text-rose-600 animate-pulse" />
              <span className="font-sans text-xs font-extrabold text-rose-700 uppercase tracking-widest">Active Emergency SOS Hub</span>
            </div>
            <h3 className="font-sans text-2xl font-black text-slate-900 leading-tight">Instant Clinical Dispatch & Profile</h3>
            <p className="text-xs text-slate-600 max-w-md">
              Activating the SOS broadcasts your live coordinates, coordinates emergency ambulance logistics, and shares your clinical QR passport with medical staff.
            </p>
          </div>

          {/* Large SOS Button */}
          <div className="relative shrink-0">
            {sosStatus === 'countdown' && (
              <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
            )}
            <button
              onClick={handleTriggerSOS}
              id="sos-trigger-button"
              className={`h-28 w-28 rounded-full border-4 flex flex-col items-center justify-center font-black tracking-widest text-xs shadow-2xl transition duration-300 transform active:scale-95 cursor-pointer ${
                sosStatus === 'idle' 
                  ? 'bg-rose-600 border-rose-500 text-white hover:bg-rose-700 hover:shadow-rose-500/30' 
                  : sosStatus === 'countdown' 
                    ? 'bg-amber-500 border-amber-400 text-white hover:bg-amber-600'
                    : 'bg-emerald-600 border-emerald-500 text-white animate-pulse'
              }`}
            >
              <ShieldAlert className="h-6 w-6 mb-1" />
              {sosStatus === 'idle' && "SOS"}
              {sosStatus === 'countdown' && `CANCEL (${countdown})`}
              {sosStatus === 'broadcasting' && "BROADCAST"}
              {sosStatus === 'dispatched' && "ARRIVING"}
            </button>
          </div>
        </div>

        {/* SOS Live Broadcaster Status Banner */}
        {sosStatus !== 'idle' && (
          <div className="mt-6 border-t border-rose-500/20 pt-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <span className="font-extrabold text-rose-900 uppercase tracking-wider">
                  {sosStatus === 'countdown' && `Transmitting in ${countdown} seconds...`}
                  {sosStatus === 'broadcasting' && "Broadcasting Location & Health QR Profile to Apex Dispatch..."}
                  {sosStatus === 'dispatched' && "Emergency Responders En-Route!"}
                </span>
              </div>
              <span className="font-mono text-[10px] text-rose-700 bg-white/60 border border-rose-200 px-2.5 py-0.5 rounded-full font-bold">
                LAT: 12.9150, LON: 77.6390
              </span>
            </div>

            {sosStatus !== 'countdown' && (
              <div className="rounded-2xl bg-white p-4 border border-rose-200 shadow-md grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Active Dispatch</span>
                  <span className="font-extrabold text-slate-800">Apollo ALS Ambulance #14</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Ambulance Proximity</span>
                  <span className="font-extrabold text-rose-600 animate-pulse">{simulatedAmbulanceDistance}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">First Aid Advice</span>
                  <span className="font-bold text-slate-600">Rest quietly in a cool area. Drink water. Keep QR Card ready.</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Priority 7: Secure QR Health Passport Wallet Card */}
        <div className="lg:col-span-5 rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-sans text-xs font-bold text-slate-800 uppercase tracking-wider">Secure Health Card</span>
              <QrCode className="h-4.5 w-4.5 text-blue-600" />
            </div>

            {/* Wallet Passport Card Layout */}
            <div className="rounded-2xl border border-slate-900 bg-gradient-to-b from-slate-950 to-slate-900 text-white p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
              <div className="absolute top-0 right-0 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl" />
              
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    MediFlow QR Passport
                  </span>
                  <h4 className="font-sans text-base font-black tracking-tight">{user.name}</h4>
                  <p className="text-[9px] text-slate-400 font-mono">ID: M-SHARMA-123</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Blood Group</span>
                  <span className="text-2xl font-black text-rose-500">{emergencyProfile.bloodGroup}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[10px] border-t border-white/10 pt-3 mt-3">
                <div>
                  <span className="text-slate-400 block text-[8px] uppercase tracking-wider font-bold">Severe Allergies</span>
                  <span className="font-extrabold text-slate-200 line-clamp-1">{emergencyProfile.allergies}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[8px] uppercase tracking-wider font-bold">Active Medication</span>
                  <span className="font-extrabold text-slate-200 line-clamp-1">{emergencyProfile.activeMeds}</span>
                </div>
              </div>

              {/* Show SVG Mock QR or generate standard QR layout */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10 text-[9px] text-slate-400">
                <span>Secure NFC & Scan Enabled</span>
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-2.5 py-1 transition flex items-center gap-1 shrink-0"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>{showQR ? 'Hide QR' : 'Show QR'}</span>
                </button>
              </div>
            </div>

            {/* QR Scanner Display */}
            {showQR && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center animate-in zoom-in-95 duration-200">
                <div className="h-36 w-36 mx-auto bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-center shadow">
                  {/* Elegant generated mock QR using SVG paths */}
                  <svg viewBox="0 0 100 100" className="h-full w-full">
                    <rect width="100" height="100" fill="white" />
                    {/* Corners */}
                    <rect x="5" y="5" width="25" height="25" fill="black" />
                    <rect x="10" y="10" width="15" height="15" fill="white" />
                    <rect x="13" y="13" width="9" height="9" fill="black" />
                    
                    <rect x="70" y="5" width="25" height="25" fill="black" />
                    <rect x="75" y="10" width="15" height="15" fill="white" />
                    <rect x="78" y="13" width="9" height="9" fill="black" />

                    <rect x="5" y="70" width="25" height="25" fill="black" />
                    <rect x="10" y="75" width="15" height="15" fill="white" />
                    <rect x="13" y="78" width="9" height="9" fill="black" />

                    {/* Content bytes */}
                    <rect x="40" y="40" width="20" height="20" fill="black" />
                    <rect x="45" y="45" width="10" height="10" fill="white" />
                    <rect x="48" y="48" width="4" height="4" fill="black" />
                    
                    {/* Noise clusters */}
                    <rect x="35" y="10" width="5" height="15" fill="black" />
                    <rect x="45" y="15" width="15" height="5" fill="black" />
                    <rect x="55" y="25" width="10" height="10" fill="black" />
                    <rect x="15" y="45" width="15" height="10" fill="black" />
                    <rect x="75" y="45" width="10" height="15" fill="black" />
                    <rect x="45" y="75" width="15" height="10" fill="black" />
                    <rect x="75" y="75" width="15" height="5" fill="black" />
                  </svg>
                </div>
                <span className="text-[10px] text-slate-400 mt-2 block">
                  Scannable by emergency responders to instantly access secured EHR.
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2 border-t border-slate-100 pt-3.5 mt-4">
            <button
              onClick={handleCopyProfile}
              className="flex-1 rounded-xl border border-slate-200 hover:bg-slate-50 py-2.5 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy Emergency Profile'}</span>
            </button>
          </div>
        </div>

        {/* Nearby Emergency Centers & Ambulances */}
        <div className="lg:col-span-7 rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-sans text-xs font-bold text-slate-800 uppercase tracking-wider">Nearby Medical Logistics</span>
              <MapPin className="h-4.5 w-4.5 text-rose-500" />
            </div>

            <div className="space-y-2.5">
              {emergencyHospitals.map((loc) => (
                <div key={loc.id} className="rounded-2xl border border-slate-100 p-3.5 bg-white/80 hover:border-rose-100 transition flex items-start gap-3.5">
                  <div className="h-9 w-9 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <Siren className="h-4.5 w-4.5" />
                  </div>

                  <div className="flex-1 space-y-1 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">{loc.name}</span>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-50 border border-slate-100 px-2 rounded-full font-bold">
                        {loc.distance}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[10px]">{loc.address}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {loc.services?.slice(0, 3).map((serv, sIdx) => (
                        <span key={sIdx} className="bg-rose-50 text-rose-700 text-[9px] font-semibold px-2 py-0.5 rounded">
                          {serv}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Contacts */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3 mt-4 text-xs">
              <span className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Emergency Direct Contacts</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a href="tel:102" className="flex items-center justify-between rounded-xl bg-white border border-slate-100 p-3 hover:border-rose-300 transition">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-rose-500" />
                    <span className="font-extrabold text-slate-800">102 Ambulance</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">Call Toll-free</span>
                </a>
                
                <a href="tel:108" className="flex items-center justify-between rounded-xl bg-white border border-slate-100 p-3 hover:border-rose-300 transition">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-rose-500" />
                    <span className="font-extrabold text-slate-800">108 Trauma SOS</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">Call Toll-free</span>
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
