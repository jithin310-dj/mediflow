import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { Calendar, Clock, Activity, ArrowUpRight, TrendingUp, CheckCircle, Shield, AlertCircle, Heart, User, Sparkles } from 'lucide-react';
import { MedicalRecord, Appointment, Medication } from '../types';

interface DashboardPatientProps {
  records: MedicalRecord[];
  appointments: Appointment[];
  medications: Medication[];
  onNavigateToTab: (tab: string) => void;
  onBookDemoAppointment: () => void;
}

export default function DashboardPatient({
  records,
  appointments,
  medications,
  onNavigateToTab,
  onBookDemoAppointment
}: DashboardPatientProps) {
  
  // Health metrics data for beautiful charts (Recharts)
  const healthMetricsData = [
    { day: "Mon", bpSys: 135, bpDia: 85, sugar: 124, hr: 72, compliance: 80 },
    { day: "Tue", bpSys: 132, bpDia: 84, sugar: 130, hr: 75, compliance: 100 },
    { day: "Wed", bpSys: 138, bpDia: 88, sugar: 128, hr: 70, compliance: 66 },
    { day: "Thu", bpSys: 129, bpDia: 82, sugar: 118, hr: 68, compliance: 100 },
    { day: "Fri", bpSys: 125, bpDia: 80, sugar: 112, hr: 71, compliance: 100 },
    { day: "Sat", bpSys: 124, bpDia: 79, sugar: 109, hr: 74, compliance: 100 },
    { day: "Sun", bpSys: 122, bpDia: 78, sugar: 105, hr: 73, compliance: 100 }
  ];

  // Derive compliance score based on medicines completed
  const totalDoses = medications.filter(m => m.status === 'active').length * 2; // Assume twice daily overall schedule
  const takenCount = medications.filter(m => m.status === 'active').reduce((acc, m) => {
    const today = new Date().toISOString().split('T')[0];
    const takenAm = m.takenHistory?.[`${today}_08:00 AM`] ? 1 : 0;
    const takenPm = m.takenHistory?.[`${today}_08:00 PM`] ? 1 : 0;
    return acc + takenAm + takenPm;
  }, 0);

  const compliancePercentage = totalDoses > 0 ? Math.round((takenCount / totalDoses) * 100) : 100;

  const upcomingAppointments = appointments.filter(a => a.status === 'scheduled');
  const activeMedsCount = medications.filter(m => m.status === 'active').length;

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      
      {/* Patient Welcome Hero Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Welcome message card */}
        <div className="md:col-span-2 rounded-3xl border border-white/20 bg-gradient-to-tr from-slate-950/80 via-slate-900/80 to-slate-950/80 backdrop-blur-xl p-6 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="flex flex-col h-full justify-between space-y-4">
            <div>
              <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 w-max uppercase tracking-wider">
                <Sparkles className="h-3 w-3 animate-pulse" />
                <span>AI Clinical Summary • Active</span>
              </div>
              <h2 className="font-sans text-xl font-bold tracking-tight mt-3">Welcome Back, Amit Sharma</h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-lg">
                Your cardiology records have been compiled. We've detected no pharmaceutical cross-interactions. To support clinical continuity, a follow-up consultation with your **Cardiologist** is recommended.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                id="hero-upload-btn"
                onClick={() => onNavigateToTab('ocr')}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 shadow-md shadow-emerald-500/10 transition"
              >
                Upload Prescription
              </button>
              <button
                id="hero-assistant-btn"
                onClick={() => onNavigateToTab('assistant')}
                className="rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 font-bold text-xs px-4 py-2.5 transition"
              >
                Ask Assistant
              </button>
            </div>
          </div>
        </div>

        {/* Quick Vitals Snapshot bento */}
        <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider">Current Vitals</span>
            <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
          </div>

          <div className="grid grid-cols-2 gap-4 my-2">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Blood Sugar</span>
              <span className="text-lg font-extrabold text-slate-800">105 <span className="text-[10px] text-slate-400 font-medium">mg/dL</span></span>
              <span className="text-[9px] text-emerald-600 block mt-0.5 font-bold uppercase tracking-wide">● Normal (Fasting)</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Blood Pressure</span>
              <span className="text-lg font-extrabold text-slate-800">122/78 <span className="text-[10px] text-slate-400 font-medium">mmHg</span></span>
              <span className="text-[9px] text-emerald-600 block mt-0.5 font-bold uppercase tracking-wide">● Normal Range</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 text-slate-700">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <span className="text-[10px] font-semibold leading-snug">Vitals show a 12% stabilization trend following Atorva prescription compliance.</span>
          </div>
        </div>

      </div>

      {/* Recharts Analytics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Blood Pressure and Blood Sugar trends chart */}
        <div className="md:col-span-8 rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <span className="font-sans text-xs font-bold text-slate-800 uppercase tracking-wider">Clinical Trends (Past 7 Days)</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Continuous blood pressure and sugar profiles.</p>
            </div>
            <div className="flex gap-3 text-[10px] font-bold font-mono">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> SYS BP
              </span>
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="h-2 w-2 rounded-full bg-blue-500" /> BLOOD SUGAR
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={healthMetricsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSugar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[60, 150]} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                <Area type="monotone" dataKey="bpSys" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBp)" name="Systolic BP" />
                <Area type="monotone" dataKey="sugar" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSugar)" name="Blood Sugar (mg/dL)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Medication Compliance chart bento */}
        <div className="md:col-span-4 rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-3 mb-4">
              <span className="font-sans text-xs font-bold text-slate-800 uppercase tracking-wider">Compliance Score</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Your prescription taking percentage.</p>
            </div>

            {/* Huge radial graphic or percentage */}
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-8 border-slate-100">
                {/* Simulated circle border based on value */}
                <div className="absolute inset-0 rounded-full border-8 border-emerald-500 border-t-transparent animate-spin-slow" />
                <div className="text-center">
                  <span className="text-2xl font-extrabold text-slate-800">{compliancePercentage}%</span>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Adherence</p>
                </div>
              </div>

              <div className="mt-4 text-center">
                <span className="text-xs font-extrabold text-slate-700">{activeMedsCount} Active Prescriptions</span>
                <p className="text-[10px] text-slate-400 mt-0.5">{takenCount} of {totalDoses} doses logged today.</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('meds')}
            className="w-full text-center rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 py-2.5 text-xs font-bold text-slate-700 transition"
          >
            Manage Medicines
          </button>
        </div>

      </div>

      {/* Bottom Row: Upcoming Schedules & Quick Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Next Appointments */}
        <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="font-sans text-xs font-bold text-slate-800 uppercase tracking-wider">Upcoming Scheduled Consultations</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Verified appointments with clinic staff.</p>
            </div>
            <button
              onClick={onBookDemoAppointment}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              + Book Consult
            </button>
          </div>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {upcomingAppointments.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                No upcoming consultations scheduled.
              </div>
            ) : (
              upcomingAppointments.map((app) => (
                <div key={app.id} className="rounded-2xl border border-slate-100 p-3.5 bg-slate-50/50 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-800">{app.doctorName}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase">{app.specialty} • {app.hospitalName || "Partner Hospital"}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-extrabold text-slate-800">{app.date}</div>
                    <div className="text-[10px] text-slate-400 font-mono font-bold uppercase mt-0.5">{app.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Health Journey checklist / checklist tips */}
        <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-5 shadow-lg space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="font-sans text-xs font-bold text-slate-800 uppercase tracking-wider">Clinical Care Roadmap</span>
            <p className="text-[10px] text-slate-400 mt-0.5">Sequential milestones suggested by your care coordinator.</p>
          </div>

          <div className="space-y-2">
            <div className="rounded-2xl border border-white/30 p-3 flex items-start gap-3 bg-white/50 backdrop-blur-sm">
              <div className="rounded-lg p-1 bg-emerald-50 text-emerald-600 mt-0.5 shrink-0">
                <CheckCircle className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800">Cardiology EHR Compiled</span>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                  Your uploaded prescription has been analyzed. Daily Ecosprin & Atorva courses are set.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-100 p-3 flex items-start gap-3 bg-indigo-50/10">
              <div className="rounded-lg p-1 bg-indigo-50 text-indigo-600 mt-0.5 shrink-0 animate-pulse">
                <Clock className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-950">Specialist Follow-up Needed</span>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                  Book a consultation with a Endocrinologist to review HbA1c blood marker (7.2%).
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-100 p-3 flex items-start gap-3 bg-amber-50/10">
              <div className="rounded-lg p-1 bg-amber-50 text-amber-600 mt-0.5 shrink-0">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-950">Audit lipid profile</span>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                  Schedule diagnostic blood panel 6 weeks after taking daily Atorva.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
