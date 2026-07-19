import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, LineChart, Line, AreaChart, Area } from 'recharts';
import { ShieldCheck, Activity, Users, FileText, CheckCircle, BarChart3, TrendingUp, Sparkles, Building, Briefcase, Plus, HeartPulse, RefreshCw, Zap, TrendingDown } from 'lucide-react';
import { Appointment, MedicalRecord } from '../types';

interface DashboardAdminProps {
  appointments: Appointment[];
  records: MedicalRecord[];
}

export default function DashboardAdmin({ appointments, records }: DashboardAdminProps) {
  const [generatingReport, setGeneratingReport] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  // Hospital performance datasets for Recharts
  const dailyAdmittanceData = [
    { day: "Mon", Emergency: 14, Outpatient: 45, ICU: 2, Predicted: 15 },
    { day: "Tue", Emergency: 18, Outpatient: 52, ICU: 4, Predicted: 20 },
    { day: "Wed", Emergency: 11, Outpatient: 38, ICU: 1, Predicted: 13 },
    { day: "Thu", Emergency: 21, Outpatient: 60, ICU: 5, Predicted: 22 },
    { day: "Fri", Emergency: 15, Outpatient: 48, ICU: 3, Predicted: 18 },
    { day: "Sat", Emergency: 9, Outpatient: 32, ICU: 2, Predicted: 10 },
    { day: "Sun", Emergency: 8, Outpatient: 25, ICU: 1, Predicted: 9 }
  ];

  const specialtyLoadData = [
    { specialty: "Cardiology", Load: 45, Staff: 8, Efficiency: 94 },
    { specialty: "Endocrinology", Load: 28, Staff: 4, Efficiency: 88 },
    { specialty: "Orthopedics", Load: 35, Staff: 6, Efficiency: 91 },
    { specialty: "Neurology", Load: 15, Staff: 3, Efficiency: 82 },
    { specialty: "Radiology", Load: 40, Staff: 5, Efficiency: 96 },
    { specialty: "General Med", Load: 62, Staff: 12, Efficiency: 95 }
  ];

  const totalPatients = 1420;
  const staffActive = 42;

  const triggerAiExecutiveSummary = () => {
    setGeneratingReport(true);
    setAiReport(null);

    // Simulate sophisticated clinical LLM metrics synthesis
    setTimeout(() => {
      setAiReport(`
📋 **MEDIFLOW REGION SOUTH EXECUTIVE AI BRIEFING**
*Generated on 2026-07-18 at 18:37 UTC using Claude/Gemini-3.5-Flash Core*

1. **Hospital Resource load & Saturation Alert**:
   - **General Medicine** remains at peak saturation (**62 weekly slots occupied**), indicating a need to reallocate 2 general practice interns from Radiology by Monday.
   - **Cardiology** holds a stable high efficiency score (**94%**) but is operating at **85% capacity limits**.

2. **EHR OCR Pipeline Compliance Audit**:
   - Analyzed and indexed **${records.length + 86} electronic records** today with **98.2% compliance rate**. Zero critical structural discrepancies or missing signature indices.
   - Duplicate drug detection engine actively blocked a paracetamol hepatic hazard warning (Amit Sharma).

3. **Predictive Outpatient Ingress Trends**:
   - Weekend emergency admissions are predicted to decrease by **12%**, permitting a voluntary stand-down for 2 emergency response physicians to optimize roster burnout scores.
   - Next Monday's Outpatient load is modeled to surge by **18%** in Endocrinology due to recurring metabolic panels.
      `.trim());
      setGeneratingReport(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      
      {/* Admin Title */}
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-sans text-lg font-bold text-slate-900">MediFlow Administrator Command</h3>
          <p className="text-sm text-slate-500">Resource load auditing and clinical coordinate indexes for Bangalore South region.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={triggerAiExecutiveSummary}
            disabled={generatingReport}
            id="admin-ai-report-btn"
            className="rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold px-4 py-2 text-xs flex items-center gap-1.5 transition shadow-md shadow-indigo-500/15"
          >
            {generatingReport ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Analyzing clinic loads...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 animate-pulse" />
                <span>Generate AI Executive Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Briefing Output Display */}
      {aiReport && (
        <div className="rounded-3xl border border-purple-100 bg-purple-500/5 p-5 shadow-lg relative overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl" />
          <div className="flex items-center justify-between border-b border-purple-100 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4.5 w-4.5 text-purple-600 animate-pulse" />
              <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">AI Clinical Operations briefing</span>
            </div>
            <button 
              onClick={() => setAiReport(null)}
              className="text-[10px] text-purple-500 hover:text-purple-700 font-bold uppercase tracking-wider"
            >
              Dismiss
            </button>
          </div>
          <p className="text-xs text-purple-950 leading-relaxed whitespace-pre-line font-medium">
            {aiReport}
          </p>
        </div>
      )}

      {/* KPI Bento Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="rounded-2xl border border-white/50 bg-white/60 backdrop-blur-xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hospital Compliance Rating</span>
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-800">98.2%</span>
            <p className="text-[10px] text-slate-400 mt-1">Passed clinical coordination standard audits.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/50 bg-white/60 backdrop-blur-xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Patients Registered</span>
            <Users className="h-4.5 w-4.5 text-blue-500" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-800">{totalPatients}</span>
            <p className="text-[10px] text-slate-400 mt-1">Unified medical accounts across HSR Layout.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/50 bg-white/60 backdrop-blur-xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">EHR Records Indexed</span>
            <FileText className="h-4.5 w-4.5 text-purple-500" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-800">{records.length + 86} records</span>
            <p className="text-[10px] text-slate-400 mt-1">Processed via AI OCR parser pipeline.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/50 bg-white/60 backdrop-blur-xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Physician Staff active</span>
            <Activity className="h-4.5 w-4.5 text-rose-500" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-800">{staffActive} clinicians</span>
            <p className="text-[10px] text-slate-400 mt-1">On-duty across all specialties today.</p>
          </div>
        </div>

      </div>

      {/* Hospital Metrics Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Admittances chart */}
        <div className="lg:col-span-8 rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-sans text-xs font-bold text-slate-800 uppercase tracking-wider">Emergency Admittance Trends & Predictive Modeling</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Monitored emergency, outpatient, and AI-predicted ingress levels.</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              <TrendingUp className="h-3 w-3" />
              <span>Ingress stabilized</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyAdmittanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEmerg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Area name="Emergency" type="monotone" dataKey="Emergency" stroke="#f43f5e" fillOpacity={1} fill="url(#colorEmerg)" strokeWidth={2} />
                <Area name="Outpatient" type="monotone" dataKey="Outpatient" stroke="#10b981" fillOpacity={1} fill="url(#colorOut)" strokeWidth={2} />
                <Area name="AI Predicted" type="monotone" dataKey="Predicted" stroke="#a855f7" strokeDasharray="4 4" fillOpacity={1} fill="url(#colorPred)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Specialty departmental loads */}
        <div className="lg:col-span-4 rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <span className="font-sans text-xs font-bold text-slate-800 uppercase tracking-wider">Specialty Utilization</span>
            <p className="text-[10px] text-slate-400 mt-0.5">Average weekly slot allocations and clinician team counts.</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={specialtyLoadData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="specialty" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                <Bar name="Occupied Slots" dataKey="Load" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar name="Clinician Team" dataKey="Staff" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <span className="text-[10px] text-slate-400 font-bold block text-center uppercase tracking-wide">
            General Medicine holds maximum outpatient congestion.
          </span>
        </div>

      </div>

      {/* Directory log listings */}
      <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-5 shadow-xl space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <span className="font-sans text-xs font-bold text-slate-800 uppercase tracking-wider">Clinical Compliance Logs (System Audit)</span>
          <p className="text-[10px] text-slate-400 mt-0.5">EHR indexing audit actions processed locally today.</p>
        </div>

        <div className="space-y-2">
          <div className="rounded-xl border border-slate-100 p-3.5 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 text-xs text-left">
            <div>
              <span className="font-bold text-slate-800">[EHR-OCR-99] Prescription Extracted</span>
              <p className="text-slate-400 text-[10px] mt-0.5">Amit Sharma's Cardiology prescription safely transcribed to structural medications array.</p>
            </div>
            <span className="text-[10px] font-bold font-mono text-emerald-600 uppercase bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">Success</span>
          </div>

          <div className="rounded-xl border border-slate-100 p-3.5 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 text-xs text-left">
            <div>
              <span className="font-bold text-slate-800">[EHR-ALERT-01] Duplicate Drug Blocked</span>
              <p className="text-slate-400 text-[10px] mt-0.5">Duplicate paracetamol molecule detected across concurrent Amit Sharma prescription courses.</p>
            </div>
            <span className="text-[10px] font-bold font-mono text-amber-600 uppercase bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">Action Logged</span>
          </div>

          <div className="rounded-xl border border-slate-100 p-3.5 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 text-xs text-left">
            <div>
              <span className="font-bold text-slate-800">[EHR-ROUT-45] Specialist Consult Auto-scheduled</span>
              <p className="text-slate-400 text-[10px] mt-0.5">Endocrinologist specialty consult recommendation triggered based on HbA1c lab report flags.</p>
            </div>
            <span className="text-[10px] font-bold font-mono text-blue-600 uppercase bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">Triggered</span>
          </div>
        </div>
      </div>

    </div>
  );
}
