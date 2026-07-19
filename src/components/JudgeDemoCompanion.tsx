import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Play, 
  Square, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Activity, 
  FileText, 
  AlertTriangle, 
  Bot, 
  Calendar, 
  Bell, 
  ShieldAlert, 
  QrCode, 
  User, 
  Settings, 
  Zap, 
  RotateCcw, 
  Info,
  Clock
} from 'lucide-react';
import { Medication, MedicalRecord, Appointment } from '../types';

interface JudgeDemoCompanionProps {
  currentRole: 'patient' | 'doctor' | 'admin';
  onRoleChange: (role: 'patient' | 'doctor' | 'admin') => void;
  patientTab: string;
  onPatientTabChange: (tab: string) => void;
  medications: Medication[];
  onAddMedication: (med: Medication) => void;
  onResetData: () => void;
  onTriggerNotification: (medName: string, dosage: string, instructions: string) => void;
  onInjectLabRecord: () => void;
  onTriggerPresetOcr: () => void;
  onInjectChatPrompt: (prompt: string) => void;
}

interface DemoStep {
  title: string;
  badge: string;
  description: string;
  actionDesc: string;
  highlightText: string;
  execute: () => void;
}

export default function JudgeDemoCompanion({
  currentRole,
  onRoleChange,
  patientTab,
  onPatientTabChange,
  medications,
  onAddMedication,
  onResetData,
  onTriggerNotification,
  onInjectLabRecord,
  onTriggerPresetOcr,
  onInjectChatPrompt
}: JudgeDemoCompanionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoTimer, setAutoTimer] = useState<number>(10); // 10 seconds per step for comfortable reading

  const steps: DemoStep[] = [
    {
      title: "Interactive EHR Overview",
      badge: "Patient Dashboard",
      description: "Welcome to MediFlow! This overview dashboard instantly aggregates clinical trends, medication adherence stats, and predictive risk indicators.",
      actionDesc: "Switching to Patient Overview tab, displaying active care pathways and booking integrations.",
      highlightText: "Wow the judge with calculated adherence tracking, custom risk indicators, and 2-click appointments.",
      execute: () => {
        onRoleChange('patient');
        onPatientTabChange('dashboard');
      }
    },
    {
      title: "AI OCR Jargon Simplified",
      badge: "Gemini OCR Extraction",
      description: "Simulate scanning a real cardiologist prescription. Watch the Gemini-powered OCR extract structured data and instantly translate complex clinical terminology into simple layman English/Hindi.",
      actionDesc: "Switching to AI OCR Upload page, showcasing Secure OCR compliance standards and pre-seeded presets.",
      highlightText: "Shows instant clinical extraction and patient-friendly Hindi translations side-by-side.",
      execute: () => {
        onRoleChange('patient');
        onPatientTabChange('ocr');
        onTriggerPresetOcr();
      }
    },
    {
      title: "Smart Ingredient Overlap Alert",
      badge: "Drug-Drug interactions",
      description: "Watch MediFlow's pharmacological engine analyze medications in real-time. We will inject a conflicting drug (Crocin) when the patient already takes Dolo 650mg.",
      actionDesc: "Switches to Care Insights. Automatically adds Crocin and triggers a high-priority hepatic clash warning.",
      highlightText: "Demonstrates real-time pharmacological auditing to prevent severe drug duplication hazards.",
      execute: () => {
        onRoleChange('patient');
        onPatientTabChange('insights');
        
        // Dynamically inject clashing drug Crocin if not present
        const hasCrocin = medications.some(m => m.name.toLowerCase().includes('crocin'));
        if (!hasCrocin) {
          onAddMedication({
            id: `med-clash-${Date.now()}`,
            name: "Crocin 500mg",
            dosage: "1 tablet",
            frequency: "As needed (PRN)",
            duration: "3 days",
            instructions: "Take for mild headaches.",
            startDate: new Date().toISOString().split('T')[0],
            status: 'active',
            explanationSimple: "Paracetamol painkiller. Duplicate ingredient hazard with Dolo.",
            reminderTimes: ["02:00 PM"]
          });
        }
      }
    },
    {
      title: "AI Clinical Assistant",
      badge: "Gemini Conversational Chat",
      description: "Ask the built-in AI assistant to interpret medical records, summarize diagnostic logs, or give lifestyle advice. Speech recognition and synthesis are active.",
      actionDesc: "Switches to AI Assistant and pre-populates a smart metabolic blood glucose query.",
      highlightText: "Enables voice dictation & text-to-speech feedback for fully accessible clinical coordinate summaries.",
      execute: () => {
        onRoleChange('patient');
        onPatientTabChange('assistant');
        onInjectChatPrompt("Explain what my HbA1c 7.2% means in my fasting blood test report and suggest some dietary guidelines.");
      }
    },
    {
      title: "EHR Care Timeline",
      badge: "Chronological Logs",
      description: "See how all appointments, prescribed therapies, and lab biomarkers are mapped into a unified Care Journey. It eliminates fragmented patient file folders.",
      actionDesc: "Switching to EHR Care Timeline tab. Chronologically structures all clinic visits and records.",
      highlightText: "Visually maps clinical milestones to easily track the continuous path of treatment over time.",
      execute: () => {
        onRoleChange('patient');
        onPatientTabChange('timeline');
      }
    },
    {
      title: "Real-time Reminders & Push",
      badge: "Push Notifications",
      description: "MediFlow guarantees medication adherence. It triggers live desktop push notifications and high-contrast browser alerts at the patient's scheduled times.",
      actionDesc: "Fires a live simulated medication alert showing the exact native browser prompt & toast layout.",
      highlightText: "Keeps patients safe with real-time push alerts that trigger even when browsing elsewhere.",
      execute: () => {
        onRoleChange('patient');
        onPatientTabChange('meds');
        onTriggerNotification("Ecosprin 75mg", "1 tablet", "Take post-meal with water (Demo Instant Trigger)");
      }
    },
    {
      title: "Emergency SOS & QR Card",
      badge: "Emergency Dispatch",
      description: "In crises, the client-authoritative SOS broadcasts coordinates, details emergency trauma dispatcher routes, and activates a high-contrast clinical QR wallet pass.",
      actionDesc: "Switches to Emergency SOS tab, triggers dispatch tracker, and displays the scannable QR Pass.",
      highlightText: "Offers 1-tap critical dispatch paired with a scannable QR medical passport for first responders.",
      execute: () => {
        onRoleChange('patient');
        onPatientTabChange('emergency');
      }
    },
    {
      title: "Doctor's Clinical Hub",
      badge: "Provider Portal",
      description: "Step into the shoes of Dr. Mohan Rao. See telemedicine bookings, synchronized patient charts, and compile structured prescriptions with the digital pad.",
      actionDesc: "Switches active role to Doctor, showcasing digital EHR consult pipelines and active queue lists.",
      highlightText: "Synchronizes patient logs instantly with doctor pads to eliminate manual administrative delays.",
      execute: () => {
        onRoleChange('doctor');
      }
    },
    {
      title: "Admin Executive Center",
      badge: "Facility Analytics",
      description: "Switch to executive view. Review regional admittance statistics, specialty workloads, and trigger an automated AI briefing summarizing resources.",
      actionDesc: "Switches role to Admin, rendering performance charts and AI clinic saturation metrics.",
      highlightText: "Saves clinical administrators hours with 1-click AI executive summary generation.",
      execute: () => {
        onRoleChange('admin');
      }
    }
  ];

  // Auto-play tour effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      if (autoTimer <= 1) {
        // Go to next step
        const next = (currentStep + 1) % steps.length;
        setCurrentStep(next);
        steps[next].execute();
        setAutoTimer(10);
      } else {
        timer = setTimeout(() => {
          setAutoTimer(prev => prev - 1);
        }, 1000);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, autoTimer, currentStep]);

  // Handle step selection manually
  const selectStep = (index: number) => {
    setIsPlaying(false);
    setCurrentStep(index);
    steps[index].execute();
  };

  const togglePlay = () => {
    if (!isPlaying) {
      // Execute current step immediately upon play
      steps[currentStep].execute();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setIsPlaying(false);
    const next = (currentStep + 1) % steps.length;
    setCurrentStep(next);
    steps[next].execute();
  };

  const handlePrev = () => {
    setIsPlaying(false);
    const prev = (currentStep - 1 + steps.length) % steps.length;
    setCurrentStep(prev);
    steps[prev].execute();
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    onResetData();
    steps[0].execute();
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-slate-900 to-indigo-950 text-white font-bold text-xs px-4 py-3 rounded-2xl border border-indigo-500/30 flex items-center gap-2 shadow-2xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition cursor-pointer"
      >
        <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
        <span>🏆 SHOW JUDGE COMPANION</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 right-6 sm:right-auto sm:max-w-md z-50 rounded-3xl border border-slate-800 bg-slate-950/95 backdrop-blur-md text-slate-100 shadow-2xl shadow-black/50 overflow-hidden text-left transition-all animate-in slide-in-from-bottom duration-300">
      {/* Top Banner Accent */}
      <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-600 w-full" />
      
      <div className="p-4 space-y-3.5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-sans text-xs font-black uppercase tracking-wider text-white">🏆 JURY LIVE DEMO CENTER</h4>
              <p className="text-[9px] text-slate-400 font-medium">Click steps to live-demo critical EHR features instantly.</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white text-xs font-bold px-2 py-0.5 rounded-lg hover:bg-white/10 transition"
          >
            Hide
          </button>
        </div>

        {/* Guided Tour Controls */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className={`h-9 w-9 rounded-xl flex items-center justify-center transition cursor-pointer ${
                isPlaying 
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-600' 
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-600'
              }`}
            >
              {isPlaying ? <Square className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
            </button>
            <div>
              <span className="text-[10px] text-white font-extrabold uppercase block tracking-wider">
                {isPlaying ? "AUTO-PLAYING DEMO TOUR" : "GUIDED DEMO TOUR"}
              </span>
              <span className="text-[9px] text-slate-400 block font-mono">
                {isPlaying ? `Advancing step in ${autoTimer}s...` : "Automated walk-through sequence"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button 
              onClick={handlePrev}
              className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-[10px] font-mono font-bold text-slate-300 bg-white/5 px-2 py-1 rounded border border-white/10">
              {currentStep + 1}/{steps.length}
            </span>
            <button 
              onClick={handleNext}
              className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Current Step Spotlight Card */}
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-3.5 space-y-2 relative overflow-hidden">
          <div className="absolute top-2 right-2 flex gap-1">
            <span className="text-[8px] font-mono font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {steps[currentStep].badge}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">STEP {currentStep + 1}</span>
            <h5 className="font-sans text-xs font-bold text-white uppercase tracking-wider">{steps[currentStep].title}</h5>
            <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
              {steps[currentStep].description}
            </p>
          </div>

          {/* Action indicator */}
          <div className="bg-slate-950 rounded-xl p-2 border border-white/5 text-[9px] font-mono flex items-start gap-1.5 text-slate-400">
            <Zap className="h-3 w-3 text-indigo-400 shrink-0 mt-0.5" />
            <span>{steps[currentStep].actionDesc}</span>
          </div>

          {/* Core wow factor */}
          <div className="text-[9px] font-bold text-emerald-400 bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/10 flex items-start gap-1.5 leading-normal">
            <Info className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />
            <span>💡 {steps[currentStep].highlightText}</span>
          </div>
        </div>

        {/* Quick Stepper Index Icons (Interactive Dot Indicators) */}
        <div className="flex justify-between items-center gap-1.5 py-1 border-t border-b border-white/5">
          {steps.map((step, idx) => {
            const isCurrent = currentStep === idx;
            return (
              <button
                key={idx}
                title={step.title}
                onClick={() => selectStep(idx)}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  isCurrent 
                    ? 'bg-gradient-to-r from-emerald-400 to-indigo-400 shadow-sm' 
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              />
            );
          })}
        </div>

        {/* Manual Reset & Direct Role Switches */}
        <div className="flex justify-between items-center gap-2">
          <button
            onClick={handleReset}
            className="rounded-xl border border-white/10 hover:bg-white/5 px-2.5 py-2 text-[10px] font-bold text-slate-400 flex items-center gap-1 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Demo State</span>
          </button>

          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
            {[
              { id: 'patient', label: 'Patient' },
              { id: 'doctor', label: 'Doctor' },
              { id: 'admin', label: 'Admin' }
            ].map((roleOption) => {
              const isActive = currentRole === roleOption.id;
              return (
                <button
                  key={roleOption.id}
                  onClick={() => {
                    setIsPlaying(false);
                    onRoleChange(roleOption.id as any);
                    if (roleOption.id === 'patient') {
                      onPatientTabChange('dashboard');
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition ${
                    isActive 
                      ? 'bg-indigo-500 text-white shadow' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {roleOption.label}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
