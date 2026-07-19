import React, { useState } from 'react';
import { Calendar, User, FileText, Activity, AlertTriangle, ArrowRight, CheckCircle, ShieldAlert, BookOpen, Plus, Heart } from 'lucide-react';
import { Appointment, MedicalRecord, Medication } from '../types';

interface DashboardDoctorProps {
  appointments: Appointment[];
  records: MedicalRecord[];
  onAddPrescription: (patientName: string, medicine: { name: string; dosage: string; frequency: string; instructions: string; duration: string }) => void;
}

export default function DashboardDoctor({ appointments, records, onAddPrescription }: DashboardDoctorProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>("pat-123");
  
  // Custom prescription builder form state
  const [medName, setMedName] = useState("");
  const [medDosage, setMedDosage] = useState("1 tablet");
  const [medFrequency, setMedFrequency] = useState("Once Daily (QD)");
  const [medInstructions, setMedInstructions] = useState("Take after food");
  const [medDuration, setMedDuration] = useState("3 Months");
  const [prescSuccess, setPrescSuccess] = useState(false);

  // Filter appointments for today
  const doctorAppointments = appointments;

  const selectedPatient = {
    name: "Amit Sharma",
    age: 45,
    gender: "Male",
    bloodGroup: "O+",
    phone: "+91 98860 99887",
    recentSummary: records[0]?.extractedData.summary || "No prior summaries on record. Please compile a prescription or lab panel.",
    jargonExpl: records[0]?.extractedData.explanationSimple || "No clinical files compiled yet."
  };

  // Find all records belonging to this selected patient
  const patientRecords = records;

  const handleSubmitPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) return;

    onAddPrescription(selectedPatient.name, {
      name: medName.trim(),
      dosage: medDosage,
      frequency: medFrequency,
      instructions: medInstructions,
      duration: medDuration
    });

    setPrescSuccess(true);
    setMedName("");
    setMedInstructions("Take after food");
    
    setTimeout(() => {
      setPrescSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-sans text-lg font-bold text-slate-900">Dr. Mohan Rao's Clinical Portal</h3>
          <p className="text-sm text-slate-500">Chief of Cardiology • 14 Appointments Scheduled Today</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700">
          <CheckCircle className="h-4 w-4" />
          <span>EHR Connected • Active Session</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Today's Patient Queue */}
        <div className="lg:col-span-4 rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-5 shadow-xl flex flex-col h-[650px] overflow-hidden">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <span className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider">Today's Queue</span>
            <p className="text-[10px] text-slate-400 mt-0.5">Click a patient to open clinical charts.</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {doctorAppointments.map((app) => {
              const isSelected = selectedPatientId === app.patientId;
              return (
                <div
                  key={app.id}
                  id={`doctor-queue-item-${app.id}`}
                  onClick={() => setSelectedPatientId(app.patientId)}
                  className={`rounded-2xl p-3.5 cursor-pointer text-left border transition ${
                    isSelected 
                      ? 'border-blue-200 bg-blue-500/5 backdrop-blur-sm shadow-sm' 
                      : 'border-white/20 hover:border-white/40 bg-white/40 backdrop-blur-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
                        {app.patientName.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{app.patientName}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase">Consult • {app.specialty}</div>
                      </div>
                    </div>
                    <div className="text-right text-[10px] font-mono font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100 uppercase shrink-0">
                      {app.time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Patient EHR Chart & Interactive Prescription Builder */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Patient Card Header */}
          <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-5 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 text-left space-y-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Clinical Chart</span>
              <h4 className="font-sans text-base font-extrabold text-slate-900">{selectedPatient.name}</h4>
              <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-slate-500 font-mono">
                <span>AGE: {selectedPatient.age}</span>
                <span>•</span>
                <span>GENDER: {selectedPatient.gender}</span>
                <span>•</span>
                <span>BLOOD: {selectedPatient.bloodGroup}</span>
                <span>•</span>
                <span>PH: {selectedPatient.phone}</span>
              </div>
            </div>

            <div className="rounded-xl bg-blue-50/30 border border-blue-100 p-2.5 text-xs text-blue-900 font-medium">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Primary Symptom Routing</span>
              <span className="font-bold">Cardiology Maintenance</span>
            </div>
          </div>

          {/* Tabular summary & timelines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* AI Clinical Journey Insights */}
            <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-5 shadow-lg space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5 text-blue-500" />
                <span className="font-sans text-xs font-bold text-slate-800 uppercase tracking-wider">AI Copilot Chart Summary</span>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                <p className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                  {selectedPatient.recentSummary}
                </p>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/20 p-3">
                  <span className="text-[10px] text-emerald-800 block font-bold uppercase tracking-wide">Patient Explanation Jargon</span>
                  <p className="text-[11px] text-slate-700 mt-1 whitespace-pre-line leading-relaxed">
                    {selectedPatient.jargonExpl.slice(0, 300)}...
                  </p>
                </div>
              </div>
            </div>

            {/* Doctor's Electronic Prescription Form (Instant EHR append) */}
            <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-5 shadow-lg space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <Plus className="h-4.5 w-4.5 text-emerald-500" />
                <span className="font-sans text-xs font-bold text-slate-800 uppercase tracking-wider">Write Digital Prescription</span>
              </div>

              {prescSuccess && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800 font-bold flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Prescription appended to Amit's EHR!</span>
                </div>
              )}

              <form onSubmit={handleSubmitPrescription} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Medicine Name</label>
                  <input
                    type="text"
                    required
                    id="input-doc-med-name"
                    placeholder="e.g. Lipitor 20mg, Metformin"
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Dosage</label>
                    <select
                      value={medDosage}
                      id="select-doc-med-dosage"
                      onChange={(e) => setMedDosage(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-blue-500"
                    >
                      <option value="1 tablet">1 Tablet</option>
                      <option value="2 tablets">2 Tablets</option>
                      <option value="1/2 tablet">1/2 Tablet</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Frequency</label>
                    <select
                      value={medFrequency}
                      id="select-doc-med-freq"
                      onChange={(e) => setMedFrequency(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-blue-500"
                    >
                      <option value="Once Daily (QD)">Once Daily (QD)</option>
                      <option value="Twice Daily (BID)">Twice Daily (BID)</option>
                      <option value="Three Times (TID)">Three Times (TID)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Instructions</label>
                    <input
                      type="text"
                      value={medInstructions}
                      onChange={(e) => setMedInstructions(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Duration</label>
                    <input
                      type="text"
                      value={medDuration}
                      onChange={(e) => setMedDuration(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="submit-doc-presc-btn"
                  className="w-full rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow hover:bg-slate-800 transition"
                >
                  Append EHR Prescription
                </button>
              </form>
            </div>

          </div>

          {/* Historical timeline list for Doctor */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 text-left">
            <div className="border-b border-slate-100 pb-3">
              <span className="font-sans text-xs font-bold text-slate-800 uppercase tracking-wider">Patient Clinical Record Log</span>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Historical timeline events available in current database.</p>
            </div>

            <div className="space-y-2.5 max-h-[200px] overflow-y-auto">
              {patientRecords.map((rec) => (
                <div key={rec.id} className="rounded-2xl border border-slate-100 p-3.5 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-slate-800 capitalize">{rec.fileName}</span>
                      <span className="rounded bg-blue-100 text-[9px] font-bold text-blue-800 px-1.5 py-0.5 uppercase">{rec.fileType}</span>
                    </div>
                    <p className="text-slate-500 leading-normal mt-1 line-clamp-1">{rec.extractedData.summary}</p>
                  </div>
                  <span className="text-[10px] font-bold font-mono text-slate-400 uppercase">{rec.uploadDate}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
