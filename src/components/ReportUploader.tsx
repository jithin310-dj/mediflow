import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, RefreshCw, Layers, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { MedicalRecord } from '../types';

interface ReportUploaderProps {
  onRecordAnalyzed: (record: MedicalRecord) => void;
  lastAnalyzed: MedicalRecord | null;
  setLastAnalyzed: (record: MedicalRecord | null) => void;
}

export default function ReportUploader({ onRecordAnalyzed, lastAnalyzed, setLastAnalyzed }: ReportUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'meds' | 'labs'>('summary');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset medical files for instant hackathon evaluation
  const presets = [
    {
      name: "Dr. Rao's Cardiac Prescription.jpg",
      type: "Prescription" as const,
      desc: "Simulate a cardiologist prescribing Ecosprin & Atorva"
    },
    {
      name: "Astra labs blood report.pdf",
      type: "Lab Report" as const,
      desc: "Simulate elevated HbA1c (7.2%) and Cholesterol"
    },
    {
      name: "General Health Summary.pdf",
      type: "Other" as const,
      desc: "Simulate annual health check with blood pressure findings"
    }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const selectPreset = async (presetName: string, presetType: 'Prescription' | 'Lab Report' | 'Other') => {
    setLoading(true);
    setError(null);
    runLoadingAnimation();

    try {
      // For preset simulation, we pass a dummy base64 and let the server return the fully structured mock.
      const payload = {
        fileName: presetName,
        fileType: presetType,
        mimeType: "image/jpeg",
        base64: "dummy_base64_for_preset"
      };

      const response = await fetch("/api/analyze-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Analysis failed on the server.");
      }

      const parsedData = await response.json();
      
      const recordId = `rec-${Date.now()}`;
      const newRecord: MedicalRecord = {
        id: recordId,
        fileName: presetName,
        fileType: presetType,
        uploadDate: new Date().toISOString().split('T')[0],
        patientId: "pat-123",
        extractedData: parsedData
      };

      setLastAnalyzed(newRecord);
      onRecordAnalyzed(newRecord);
      
      // Auto switch tabs based on parsed result
      if (presetType === 'Lab Report') {
        setActiveTab('labs');
      } else if (presetType === 'Prescription') {
        setActiveTab('meds');
      } else {
        setActiveTab('summary');
      }

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during report extraction.");
    } finally {
      setLoading(false);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadstart = () => {
      setLoading(true);
      setError(null);
      runLoadingAnimation();
    };

    reader.onload = async () => {
      const base64String = (reader.result as string).split(',')[1];
      const guessedType: 'Prescription' | 'Lab Report' | 'Other' = 
        file.name.toLowerCase().includes('lab') || file.name.toLowerCase().includes('blood') || file.name.toLowerCase().includes('report') ? 'Lab Report' :
        file.name.toLowerCase().includes('presc') || file.name.toLowerCase().includes('recipe') ? 'Prescription' : 'Other';

      try {
        const payload = {
          fileName: file.name,
          fileType: guessedType,
          mimeType: file.type || "image/jpeg",
          base64: base64String
        };

        const response = await fetch("/api/analyze-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error("OCR extraction failed. Please ensure the file is clean and legible.");
        }

        const parsedData = await response.json();
        
        const recordId = `rec-${Date.now()}`;
        const newRecord: MedicalRecord = {
          id: recordId,
          fileName: file.name,
          fileType: guessedType,
          uploadDate: new Date().toISOString().split('T')[0],
          patientId: "pat-123",
          extractedData: parsedData
        };

        setLastAnalyzed(newRecord);
        onRecordAnalyzed(newRecord);

        if (guessedType === 'Lab Report') {
          setActiveTab('labs');
        } else if (guessedType === 'Prescription') {
          setActiveTab('meds');
        } else {
          setActiveTab('summary');
        }

      } catch (err: any) {
        setError(err.message || "Failed to process the uploaded file.");
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError("Failed to read the file locally.");
      setLoading(false);
    };

    reader.readAsDataURL(file);
  };

  // Fun, descriptive AI steps for human reassurance during parsing
  const runLoadingAnimation = () => {
    const phases = [
      "Initializing MediFlow OCR extraction engine...",
      "Performing deep optical character recognition...",
      "Analyzing active pharmaceutical compounds & dosages...",
      "Cross-referencing medical terminology dictionaries...",
      "Translating clinical abbreviations & Latin descriptors...",
      "Validating lab biomarkers and healthy reference thresholds...",
      "Synthesizing simple-language patient guidance summary..."
    ];
    let i = 0;
    setLoadingPhase(phases[0]);
    const timer = setInterval(() => {
      i++;
      if (i < phases.length) {
        setLoadingPhase(phases[i]);
      } else {
        clearInterval(timer);
      }
    }, 1400);
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone & Presets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload File Zone */}
        <div className="lg:col-span-2">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center cursor-pointer transition-all h-[240px] ${
              isDragActive 
                ? 'border-emerald-400 bg-emerald-50/20 shadow-inner' 
                : 'border-white/30 bg-white/20 hover:bg-white/30'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              accept="image/*,application/pdf"
              className="hidden"
            />
            
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-md text-emerald-500 mb-4 transition group-hover:scale-105">
              <Upload className="h-6 w-6" />
            </div>
            
            <span className="font-sans text-sm font-bold text-slate-800">
              Upload Medical Document
            </span>
            <p className="mt-1 text-xs text-slate-400 max-w-sm">
              Drag & drop or tap to select prescriptions, lab sheets, or summaries (supports PDF, PNG, JPEG).
            </p>
            <div className="mt-4 flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wide">
              <ShieldCheck className="h-3 w-3" />
              <span>Secure OCR • HIPAA Compliant</span>
            </div>
          </div>
        </div>

        {/* Presets List */}
        <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <span className="font-sans text-sm font-bold text-slate-800">Evaluation Presets</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
              No medical files handy? Instantly evaluate MediFlow's AI extraction and summary engine using these standard clinical scenarios.
            </p>
          </div>

          <div className="space-y-2">
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => selectPreset(preset.name, preset.type)}
                className="w-full rounded-xl border border-slate-100 p-2.5 text-left transition hover:border-emerald-200 hover:bg-slate-50 flex items-start gap-2.5"
              >
                <div className={`mt-0.5 rounded-lg p-1.5 ${
                  preset.type === 'Prescription' ? 'bg-emerald-50 text-emerald-600' :
                  preset.type === 'Lab Report' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'
                }`}>
                  <FileText className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-800 truncate">{preset.name}</div>
                  <div className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{preset.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading HUD Screen */}
      {loading && (
        <div className="rounded-3xl border border-slate-200/50 bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 p-8 text-center text-white relative overflow-hidden shadow-xl animate-pulse">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-teal-500/10 blur-3xl" />
          <div className="flex flex-col items-center justify-center max-w-lg mx-auto py-6">
            <RefreshCw className="h-10 w-10 text-emerald-400 animate-spin mb-4" />
            <h4 className="font-sans text-base font-bold tracking-tight text-white mb-1">
              Analyzing Record with Gemini AI
            </h4>
            <p className="text-xs text-emerald-300/80 font-mono italic animate-bounce mb-4 h-5">
              {loadingPhase}
            </p>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full rounded-full w-2/3 animate-infinite" />
            </div>
            <p className="mt-4 text-[10px] text-slate-400 leading-normal">
              MediFlow is reading raw values, cataloging active substances, checking for duplication, and framing simple layman language definitions.
            </p>
          </div>
        </div>
      )}

      {/* Errors container */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 text-left flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5" />
          <div>
            <div className="font-semibold text-sm text-rose-800">Extraction Unsuccessful</div>
            <div className="text-xs text-rose-600 mt-1">{error}</div>
          </div>
        </div>
      )}

      {/* Structured Output Grid */}
      {lastAnalyzed && !loading && (
        <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl shadow-xl overflow-hidden text-left animate-in fade-in duration-300">
          
          {/* Output Header */}
          <div className="bg-white/40 border-b border-white/20 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 font-mono uppercase">OCR Extracted Document</span>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800 uppercase">{lastAnalyzed.fileType}</span>
                </div>
                <h4 className="font-sans text-sm font-bold text-slate-800 truncate max-w-md">{lastAnalyzed.fileName}</h4>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('summary')}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  activeTab === 'summary' ? 'bg-white shadow-sm border border-slate-200/50 text-slate-900' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                AI Explanation
              </button>
              {lastAnalyzed.extractedData.medications && lastAnalyzed.extractedData.medications.length > 0 && (
                <button
                  id="tab-extracted-meds"
                  onClick={() => setActiveTab('meds')}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    activeTab === 'meds' ? 'bg-white shadow-sm border border-slate-200/50 text-slate-900' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Medications ({lastAnalyzed.extractedData.medications.length})
                </button>
              )}
              {lastAnalyzed.extractedData.labResults && lastAnalyzed.extractedData.labResults.length > 0 && (
                <button
                  id="tab-extracted-labs"
                  onClick={() => setActiveTab('labs')}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    activeTab === 'labs' ? 'bg-white shadow-sm border border-slate-200/50 text-slate-900' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Biomarkers ({lastAnalyzed.extractedData.labResults.length})
                </button>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            
            {/* Tab 1: AI Summary & Simple Explanation */}
            {activeTab === 'summary' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Clinical Metadata & Summary */}
                <div className="lg:col-span-2 space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Patient Name</span>
                      <span className="text-xs font-bold text-slate-800">{lastAnalyzed.extractedData.patientName || "Amit Sharma"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Consultant Physician</span>
                      <span className="text-xs font-bold text-slate-800">{lastAnalyzed.extractedData.doctorName || "Dr. Savitha Nair"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Clinical Center</span>
                      <span className="text-xs font-bold text-slate-800">{lastAnalyzed.extractedData.hospitalName || "Apollo Partner Clinic"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Record Date</span>
                      <span className="text-xs font-bold text-slate-800">{lastAnalyzed.extractedData.date || lastAnalyzed.uploadDate}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Executive Health Summary</span>
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/30 rounded-2xl p-4 border border-slate-100/50">
                      {lastAnalyzed.extractedData.summary}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                      <Heart className="h-3.5 w-3.5 text-rose-500" />
                      <span>Jargon Simplified (Layman Translation)</span>
                    </h5>
                    <div className="bg-emerald-50/20 border border-emerald-100 rounded-2xl p-4 text-slate-700 space-y-3">
                      <p className="text-xs whitespace-pre-line leading-relaxed">
                        {lastAnalyzed.extractedData.explanationSimple}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Next Steps & Speciality Routing panel */}
                <div className="space-y-5">
                  <div className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/40 to-white p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold">1</span>
                      <span className="font-sans text-xs font-bold text-indigo-900 uppercase">Specialist Router</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Recommended Specialist</span>
                      <span className="text-sm font-extrabold text-indigo-950 mt-0.5 block">{lastAnalyzed.extractedData.specialistRecommendation || "General Physician"}</span>
                      <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                        MediFlow suggests checking in with this specific medical discipline to discuss current findings and maintain continuity of care.
                      </p>
                    </div>
                  </div>

                  {lastAnalyzed.extractedData.timelineEvent && (
                    <div className="rounded-2xl border border-emerald-100 bg-gradient-to-b from-emerald-50/30 to-white p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">2</span>
                          <span className="font-sans text-xs font-bold text-emerald-900 uppercase">Timeline milestone</span>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                          lastAnalyzed.extractedData.timelineEvent.urgency === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {lastAnalyzed.extractedData.timelineEvent.urgency} priority
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-800">{lastAnalyzed.extractedData.timelineEvent.title}</span>
                        <p className="text-[11px] text-slate-500 leading-normal">
                          {lastAnalyzed.extractedData.timelineEvent.description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Tab 2: Medications Table */}
            {activeTab === 'meds' && lastAnalyzed.extractedData.medications && (
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100 uppercase text-[10px] tracking-wider">
                      <th className="p-4">Medicine Name</th>
                      <th className="p-4">Dosage</th>
                      <th className="p-4">Frequency</th>
                      <th className="p-4">Course Duration</th>
                      <th className="p-4">Pharmacist Directions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {lastAnalyzed.extractedData.medications.map((med, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 font-bold text-slate-800">{med.name}</td>
                        <td className="p-4 text-emerald-600">{med.dosage}</td>
                        <td className="p-4">{med.frequency}</td>
                        <td className="p-4 text-slate-500">{med.duration || "Continuous"}</td>
                        <td className="p-4 text-slate-500 italic max-w-sm">{med.instructions || "None"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 3: Lab Results Panel */}
            {activeTab === 'labs' && lastAnalyzed.extractedData.labResults && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lastAnalyzed.extractedData.labResults.map((res, index) => {
                  const isHigh = res.status === 'High' || res.status === 'Critical';
                  const isLow = res.status === 'Low';
                  
                  return (
                    <div
                      key={index}
                      className={`rounded-2xl border p-4 flex flex-col justify-between ${
                        isHigh ? 'border-rose-100 bg-rose-50/5/30' : isLow ? 'border-blue-100 bg-blue-50/5/30' : 'border-slate-100 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold uppercase">Marker</span>
                          <span className="text-xs font-bold text-slate-800">{res.testName}</span>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                          isHigh ? 'bg-rose-100 text-rose-700' : isLow ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {res.status || "Normal"}
                        </span>
                      </div>

                      <div className="mt-4 flex items-baseline gap-1">
                        <span className={`text-2xl font-extrabold ${isHigh ? 'text-rose-600' : isLow ? 'text-blue-600' : 'text-slate-800'}`}>
                          {res.result}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">{res.unit}</span>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100/50 flex justify-between text-[10px] text-slate-400 font-semibold font-mono">
                        <span>NORMAL THRESHOLD:</span>
                        <span className="text-slate-600">{res.normalRange || "N/A"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
