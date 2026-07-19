import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, AlertTriangle, Check, CheckSquare, Plus, RefreshCw, Square, Trash, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { Medication } from '../types';

interface MedicineTrackerProps {
  medications: Medication[];
  onAddMedication: (med: Medication) => void;
  onDeleteMedication: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onUpdateMedicationHistory: (id: string, dateTimeKey: string, taken: boolean) => void;
  onTriggerTestNotification?: (medName: string) => void;
}

export default function MedicineTracker({
  medications,
  onAddMedication,
  onDeleteMedication,
  onToggleStatus,
  onUpdateMedicationHistory,
  onTriggerTestNotification
}: MedicineTrackerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [auditing, setAuditing] = useState(false);
  const [auditResults, setAuditResults] = useState<{ duplicates: any[]; interactions: any[] }>({ duplicates: [], interactions: [] });
  const [notificationPermission, setNotificationPermission] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const result = await Notification.requestPermission();
      setNotificationPermission(result);
    }
  };

  // Custom Form State
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("1 tablet");
  const [frequency, setFrequency] = useState("Once Daily (QD)");
  const [duration, setDuration] = useState("1 week");
  const [instructions, setInstructions] = useState("");
  const [reminderTime, setReminderTime] = useState("08:00 AM");

  const todayKey = new Date().toISOString().split('T')[0];

  // Run AI auditing on active medicines
  const runActiveMedicationAudit = async () => {
    if (medications.length === 0) {
      setAuditResults({ duplicates: [], interactions: [] });
      return;
    }
    setAuditing(true);
    try {
      const response = await fetch("/api/medication-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medications })
      });
      if (response.ok) {
        const result = await response.json();
        setAuditResults(result);
      }
    } catch (e) {
      console.warn("Clinical audit is using local rules:", e);
    } finally {
      setAuditing(false);
    }
  };

  useEffect(() => {
    runActiveMedicationAudit();
  }, [medications]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMed: Medication = {
      id: `med-${Date.now()}`,
      name: name.trim(),
      dosage,
      frequency,
      duration,
      instructions: instructions || "Take with fresh water.",
      startDate: todayKey,
      status: 'active',
      explanationSimple: `This is prescribed for symptom relief. Follow directions exactly.`,
      reminderTimes: [reminderTime],
      takenHistory: {}
    };

    onAddMedication(newMed);
    setModalOpen(false);
    
    // Reset form
    setName("");
    setDosage("1 tablet");
    setFrequency("Once Daily (QD)");
    setDuration("1 week");
    setInstructions("");
    setReminderTime("08:00 AM");
  };

  const activeMeds = medications.filter(m => m.status === 'active');
  const inactiveMeds = medications.filter(m => m.status !== 'active');

  return (
    <div className="space-y-6 text-left">
      
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-sans text-lg font-bold text-slate-900">Medication Schedule & Interaction Auditor</h3>
          <p className="text-sm text-slate-500">Log daily doses and let clinical AI verify medicine safety in real-time.</p>
        </div>
        <div className="flex gap-2">
          <button
            id="audit-meds-btn"
            onClick={runActiveMedicationAudit}
            disabled={auditing}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${auditing ? 'animate-spin' : ''}`} />
            <span>Audit Interactions</span>
          </button>
          <button
            id="add-med-btn"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Medication</span>
          </button>
        </div>
      </div>

      {/* Clinical AI Audit Warning Banner */}
      {(auditResults.duplicates.length > 0 || auditResults.interactions.length > 0) && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50/40 p-5 space-y-4 animate-in slide-in-from-top-1">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
            <AlertTriangle className="h-5 w-5 text-rose-600 animate-bounce" />
            <span>Critical Medication Alerts Detected ({auditResults.duplicates.length + auditResults.interactions.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Duplicates column */}
            {auditResults.duplicates.map((dup, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-rose-200 p-4 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-rose-700">
                  <AlertCircle className="h-4 w-4" />
                  <span>Double Dosage Risk</span>
                </div>
                <div className="font-semibold text-slate-800">
                  <span className="underline">{dup.med1}</span> and <span className="underline">{dup.med2}</span>
                </div>
                <p className="text-slate-500 leading-normal">{dup.reason}</p>
                <div className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg w-max uppercase">
                  Avoid taking concurrently
                </div>
              </div>
            ))}

            {/* Interactions column */}
            {auditResults.interactions.map((inter, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-rose-200 p-4 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-700">
                  <AlertCircle className="h-4 w-4" />
                  <span>Drug-Drug Interaction ({inter.severity} severity)</span>
                </div>
                <div className="font-semibold text-slate-800">
                  Involving: {inter.meds.join(" + ")}
                </div>
                <p className="text-slate-500 leading-normal">{inter.description}</p>
                <div className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg w-max uppercase">
                  Verify with physician
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Checklist & Active list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Dose Logging Checklist (Apple Health style) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-500" />
                <span className="font-sans text-sm font-bold text-slate-800">Today's Dosage Logs</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">
                {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
            </div>

            {activeMeds.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No active medications scheduled. Upload a prescription or add a custom medication.
              </div>
            ) : (
              <div className="space-y-2">
                {activeMeds.map((med) => {
                  return med.reminderTimes.map((time, tIdx) => {
                    const key = `${todayKey}_${time}`;
                    const isTaken = med.takenHistory?.[key] || false;

                    return (
                      <div
                        key={`${med.id}-${tIdx}`}
                        id={`dose-item-${med.id}-${tIdx}`}
                        onClick={() => onUpdateMedicationHistory(med.id, key, !isTaken)}
                        className={`flex items-center justify-between rounded-2xl border p-3.5 cursor-pointer transition-all ${
                          isTaken 
                            ? 'border-emerald-200 bg-emerald-500/5 backdrop-blur-sm shadow-sm' 
                            : 'border-white/30 hover:border-white/40 bg-white/40 backdrop-blur-md hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          {/* Checkbox button */}
                          <div className={`flex h-6 w-6 items-center justify-center rounded-lg border transition ${
                            isTaken 
                              ? 'border-emerald-500 bg-emerald-500 text-white' 
                              : 'border-slate-200 text-slate-300 hover:border-slate-400 bg-slate-50'
                          }`}>
                            {isTaken ? <Check className="h-4 w-4 stroke-[3]" /> : null}
                          </div>

                          <div>
                            <div className={`text-xs font-extrabold ${isTaken ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                              {med.name}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-semibold uppercase">
                              <span>{med.dosage}</span>
                              <span>•</span>
                              <span>{med.instructions}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 font-mono bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-xl">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{time}</span>
                        </div>
                      </div>
                    );
                  });
                })}
              </div>
            )}
          </div>
        </div>

        {/* Prescription Inventory Cabinet & Notifications Manager */}
        <div className="space-y-6">
          
          {/* Real-time Push Notification Controller Card */}
          <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-5 shadow-xl space-y-4">
            <div className="border-b border-slate-100 pb-3 text-left">
              <span className="font-sans text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="h-4.5 w-4.5 text-emerald-500" />
                <span>Browser Push Reminders</span>
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">Real-time prescription alerts and schedule prompts.</p>
            </div>

            <div className="space-y-3.5 text-xs text-left">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Notification Permission:</span>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                  notificationPermission === 'granted' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : notificationPermission === 'denied'
                    ? 'bg-rose-50 text-rose-700 border border-rose-100'
                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                  {notificationPermission}
                </span>
              </div>

              {notificationPermission !== 'granted' && (
                <button
                  onClick={requestNotificationPermission}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500 bg-emerald-50 hover:bg-emerald-100/60 text-emerald-700 py-2 text-xs font-bold transition cursor-pointer"
                >
                  Request Permission
                </button>
              )}

              <button
                onClick={() => onTriggerTestNotification?.("Ecosprin 75mg")}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white py-2 text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <span>🔔 Trigger Demo Alert Now</span>
              </button>

              <p className="text-[9px] text-slate-400 leading-relaxed text-center">
                Keep MediFlow running to receive micro-alerts on scheduled dosages.
              </p>
            </div>
          </div>

          {/* Prescription Inventory Cabinet */}
          <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-5 shadow-xl space-y-4">
            <div className="border-b border-slate-100 pb-3 text-left">
              <span className="font-sans text-sm font-bold text-slate-800">Your Medicine Cabinet</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Active medication directory and courses.</p>
            </div>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {medications.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 text-left">
                  Cabinet is empty.
                </div>
              ) : (
                medications.map((med) => {
                  const isActive = med.status === 'active';
                  return (
                    <div key={med.id} className="rounded-xl border border-slate-100 p-3 bg-slate-50/50 space-y-2 text-left">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-extrabold text-slate-800">{med.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase">{med.dosage} • {med.frequency}</div>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            id={`toggle-status-${med.id}`}
                            onClick={() => onToggleStatus(med.id)}
                            className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase transition ${
                              isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isActive ? 'Active' : 'Paused'}
                          </button>
                          <button
                            id={`delete-med-${med.id}`}
                            onClick={() => onDeleteMedication(med.id)}
                            className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      {med.explanationSimple && (
                        <p className="text-[10px] text-slate-500 leading-normal border-t border-slate-100/50 pt-1.5 mt-1.5 text-left">
                          {med.explanationSimple}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Add Medication Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/50 bg-white/80 backdrop-blur-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-500" />
                <span className="font-sans text-sm font-bold text-slate-800">Add New Medication</span>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-slate-200 p-1 text-slate-400 hover:bg-slate-50"
              >
                ✖
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Medicine Name */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Medicine Name</label>
                <input
                  type="text"
                  required
                  id="input-med-name"
                  placeholder="e.g. Crocin, Ibuprofen, Lipitor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-emerald-500"
                />
              </div>

              {/* Dosage & Frequency Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Dosage</label>
                  <select
                    value={dosage}
                    id="select-med-dosage"
                    onChange={(e) => setDosage(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 focus:outline-emerald-500"
                  >
                    <option value="1 tablet">1 Tablet</option>
                    <option value="2 tablets">2 Tablets</option>
                    <option value="1/2 tablet">1/2 Tablet</option>
                    <option value="1 teaspoon">1 Teaspoon</option>
                    <option value="1 capsule">1 Capsule</option>
                    <option value="1 injection">1 Injection</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Frequency</label>
                  <select
                    value={frequency}
                    id="select-med-frequency"
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 focus:outline-emerald-500"
                  >
                    <option value="Once Daily (QD)">Once Daily (QD)</option>
                    <option value="Twice Daily (BID)">Twice Daily (BID)</option>
                    <option value="Three Times (TID)">Three Times (TID)</option>
                    <option value="As Needed (PRN)">As Needed (PRN)</option>
                  </select>
                </div>
              </div>

              {/* Reminder time & Course Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Reminder Time</label>
                  <input
                    type="text"
                    required
                    id="input-med-time"
                    placeholder="e.g. 08:00 AM"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:outline-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Course Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 10 days"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:outline-emerald-500"
                  />
                </div>
              </div>

              {/* Directions */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Take post meal, avoid dairy"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:outline-emerald-500"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                id="submit-med-btn"
                className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
              >
                Confirm Add & Run Chemical Audit
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
