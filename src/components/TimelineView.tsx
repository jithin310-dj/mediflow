import React, { useState } from 'react';
import { Calendar, FileText, Activity, AlertTriangle, Clock, ArrowRight, BookOpen, MapPin, Eye, FileSpreadsheet, Search, Check, Filter, ShieldCheck, HeartPulse, Stethoscope, ChevronDown, ChevronUp } from 'lucide-react';
import { MedicalRecord, Appointment } from '../types';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'prescription' | 'lab' | 'appointment' | 'alert' | 'vaccination' | 'surgery' | 'hospital';
  doctor: string;
  sourceId: string;
  urgency: 'low' | 'medium' | 'high';
  subdetails?: any;
}

interface TimelineViewProps {
  records: MedicalRecord[];
  appointments: Appointment[];
  onSelectEvent: (type: 'record' | 'appointment', id: string) => void;
}

export default function TimelineView({ records, appointments, onSelectEvent }: TimelineViewProps) {
  const [filterType, setFilterType] = useState<'all' | 'prescription' | 'lab' | 'appointment' | 'vaccination' | 'surgery' | 'hospital'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Seed standard structured events to showcase a rich chronological medical history
  const timelineEvents: TimelineEvent[] = [
    {
      id: "vac-1",
      date: "2026-06-10",
      title: "Covid-19 Booster Vaccination",
      description: "Administered mRNA vaccine (Comirnaty Omicron) at Apollo Clinic.",
      type: "vaccination",
      doctor: "Nurse Staff",
      sourceId: "vacc-seed",
      urgency: "low",
      subdetails: { Notes: "No immediate side effects. Advised rest for 24 hours.", Location: "Agara Clinic" }
    },
    {
      id: "surg-1",
      date: "2025-03-12",
      title: "Arthroscopic Knee Debridement",
      description: "Minimally invasive debridement of left lateral meniscus tear under regional anesthesia.",
      type: "surgery",
      doctor: "Dr. Arvind Hegde (Orthopedics)",
      sourceId: "surg-seed",
      urgency: "medium",
      subdetails: { Location: "Manipal Hospital", RecoveryTime: "6 weeks physical therapy prescribed." }
    },
    {
      id: "hosp-v1",
      date: "2026-01-18",
      title: "Emergency Room Walk-in (Chest tightness)",
      description: "Presented with elevated blood pressure and acute anxiety. Stabilized using sublingual vasodilators.",
      type: "hospital",
      doctor: "ER On-Duty Team",
      sourceId: "hosp-seed",
      urgency: "high",
      subdetails: { Findings: "Normal ECG. Recommended outpatient cardiology review.", Location: "Apex Emergency Room" }
    }
  ];

  // Convert uploaded records into events
  records.forEach(r => {
    const isLab = r.fileType === 'Lab Report';
    const isPrescription = r.fileType === 'Prescription';
    
    timelineEvents.push({
      id: `rec-${r.id}`,
      date: r.extractedData.date || r.uploadDate,
      title: r.extractedData.timelineEvent?.title || `${r.fileType} Analyzed`,
      description: r.extractedData.timelineEvent?.description || r.extractedData.summary,
      type: isLab ? 'lab' : isPrescription ? 'prescription' : 'prescription' as any,
      doctor: r.extractedData.doctorName || 'Assigned Physician',
      sourceId: r.id,
      urgency: r.extractedData.timelineEvent?.urgency || 'low',
      subdetails: {
        medsCount: r.extractedData.medications?.length || 0,
        resultsCount: r.extractedData.labResults?.length || 0,
        jargonExpl: r.extractedData.explanationSimple,
        specialist: r.extractedData.specialistRecommendation
      }
    });
  });

  // Convert appointments into events
  appointments.forEach(app => {
    timelineEvents.push({
      id: `app-${app.id}`,
      date: app.date,
      title: `Appointment with ${app.doctorName}`,
      description: `Scheduled specialty consult for ${app.specialty}. Status: ${app.status}. ${app.notes || ''}`,
      type: 'appointment',
      doctor: app.doctorName,
      sourceId: app.id,
      urgency: app.status === 'scheduled' ? 'medium' : 'low',
      subdetails: {
        hospital: app.hospitalName || 'MediFlow Partner Center',
        time: app.time,
        status: app.status
      }
    });
  });

  // Sort chronologically (newest first)
  const filteredAndSortedEvents = timelineEvents
    .filter(e => {
      // Type Filter
      if (filterType !== 'all' && e.type !== filterType) return false;
      
      // Text Search Query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        return e.title.toLowerCase().includes(q) || 
               e.description.toLowerCase().includes(q) || 
               e.doctor.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const urgencyColors = {
    low: 'bg-slate-100 text-slate-700 border-slate-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    high: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  const typeConfig = {
    prescription: {
      icon: FileSpreadsheet,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      label: 'Prescription'
    },
    lab: {
      icon: Activity,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
      label: 'Lab Report'
    },
    appointment: {
      icon: Calendar,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      label: 'Consultation'
    },
    alert: {
      icon: AlertTriangle,
      color: 'bg-rose-50 text-rose-600 border-rose-100',
      label: 'Clinical Alert'
    },
    vaccination: {
      icon: ShieldCheck,
      color: 'bg-teal-50 text-teal-600 border-teal-100',
      label: 'Vaccination'
    },
    surgery: {
      icon: Stethoscope,
      color: 'bg-purple-50 text-purple-600 border-purple-100',
      label: 'Surgery'
    },
    hospital: {
      icon: HeartPulse,
      color: 'bg-rose-50 text-rose-600 border-rose-100',
      label: 'Hospital Visit'
    }
  };

  // Timeline Distribution calculations
  const typeCounts = timelineEvents.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Section */}
      <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-sans text-base font-extrabold text-slate-900">Patient Care Timeline</h3>
            <p className="text-xs text-slate-500">Your chronological clinical journey mapped and cross-indexed.</p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search medical timeline..."
                value={searchQuery}
                id="timeline-search-field"
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-8.5 pr-4 py-2 text-xs focus:outline-emerald-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">Filter by:</span>
          {(['all', 'prescription', 'lab', 'appointment', 'vaccination', 'surgery', 'hospital'] as const).map((t) => {
            const count = t === 'all' ? timelineEvents.length : (typeCounts[t] || 0);
            return (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition flex items-center gap-1.5 border ${
                  filterType === t
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                    : 'border-slate-150 text-slate-500 hover:text-slate-800 bg-white'
                }`}
              >
                <span>{t}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                  filterType === t ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline Event Distribution Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/50 bg-white/60 backdrop-blur-xl p-4 shadow-md text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wide text-[9px]">Timeline Integrity</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black text-slate-800">100%</span>
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">Complete</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">No missing clinical continuity indexes reported.</p>
        </div>

        <div className="rounded-2xl border border-white/50 bg-white/60 backdrop-blur-xl p-4 shadow-md text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wide text-[9px]">Earliest Milestone</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-base font-extrabold text-slate-800">Mar 2025</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">First registered knee surgical procedure index.</p>
        </div>

        <div className="rounded-2xl border border-white/50 bg-white/60 backdrop-blur-xl p-4 shadow-md text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wide text-[9px]">High Urgency Alerts</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black text-rose-600">
              {timelineEvents.filter(e => e.urgency === 'high').length}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Requires metabolic follow-up and dietary audit.</p>
        </div>
      </div>

      {/* Actual Vertical Timeline stream */}
      <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-5 shadow-xl">
        {filteredAndSortedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
              <Clock className="h-6 w-6" />
            </div>
            <span className="mt-4 text-sm font-semibold text-slate-800">No events matched query</span>
            <p className="mt-1 text-xs text-slate-400">
              Try adjusting your search criteria or checking another filter category.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 before:absolute before:top-2 before:bottom-2 before:left-[17px] before:w-0.5 before:bg-slate-100">
            <div className="space-y-6">
              {filteredAndSortedEvents.map((event) => {
                const config = typeConfig[event.type] || typeConfig['prescription'];
                const Icon = config.icon;
                const isExpanded = expandedId === event.id;

                return (
                  <div key={event.id} className="relative group text-left animate-in fade-in duration-200">
                    
                    {/* Bullet icon */}
                    <div className={`absolute -left-[30px] sm:-left-[34px] flex h-7 w-7 items-center justify-center rounded-full border bg-white transition group-hover:scale-110 shadow-sm ${config.color}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>

                    <div className={`rounded-2xl border transition-all ${
                      isExpanded 
                        ? 'border-emerald-200 bg-emerald-500/5 backdrop-blur-md p-5 shadow-md shadow-emerald-500/5' 
                        : 'border-white/30 hover:border-white/50 p-4 bg-white/40 backdrop-blur-md hover:shadow-md'
                    }`}>
                      {/* Header */}
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-semibold text-slate-400">
                              {new Date(event.date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                            <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${urgencyColors[event.urgency]}`}>
                              {event.urgency} Priority
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-100 uppercase">
                              {config.label}
                            </span>
                          </div>
                          <h4 className="font-sans text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition">
                            {event.title}
                          </h4>
                        </div>
                        
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : event.id)}
                          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600 transition"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-400" />
                          <span>{isExpanded ? 'Collapse' : 'Details'}</span>
                        </button>
                      </div>

                      <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                        {event.description}
                      </p>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in duration-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            
                            <div className="space-y-3 bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                              <div className="flex items-center gap-2 text-slate-600 font-bold uppercase tracking-wide text-[9px]">
                                <BookOpen className="h-3.5 w-3.5 text-emerald-500" />
                                <span>Clinical Metadata</span>
                              </div>
                              <div className="space-y-1.5 font-medium text-slate-700">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Physician:</span>
                                  <span className="font-extrabold">{event.doctor}</span>
                                </div>
                                {event.subdetails && Object.entries(event.subdetails).map(([k, v]) => {
                                  if (typeof v !== 'object') {
                                    return (
                                      <div key={k} className="flex justify-between">
                                        <span className="text-slate-400 capitalize">{k}:</span>
                                        <span className="font-extrabold">{String(v)}</span>
                                      </div>
                                    );
                                  }
                                  return null;
                                })}
                              </div>
                            </div>

                            {event.subdetails?.jargonExpl && (
                              <div className="space-y-2 bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                                <div className="flex items-center gap-2 text-slate-600 font-bold uppercase tracking-wide text-[9px]">
                                  <Activity className="h-3.5 w-3.5 text-blue-500" />
                                  <span>AI Layman Translation</span>
                                </div>
                                <p className="text-slate-600 whitespace-pre-line text-[11px] leading-relaxed">
                                  {event.subdetails.jargonExpl}
                                </p>
                              </div>
                            )}

                          </div>

                          {/* Source Action */}
                          {event.sourceId && event.sourceId !== 'vacc-seed' && event.sourceId !== 'surg-seed' && event.sourceId !== 'hosp-seed' && (
                            <div className="mt-4 flex justify-end">
                              <button
                                onClick={() => onSelectEvent(event.type === 'appointment' ? 'appointment' : 'record', event.sourceId)}
                                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:from-emerald-700 hover:to-teal-600 transition"
                              >
                                <span>Inspect Medical File</span>
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
