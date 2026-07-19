import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  FileText, 
  Calendar, 
  MapPin, 
  Bot, 
  Briefcase, 
  Building, 
  Heart, 
  Sparkles, 
  ListTodo, 
  ShieldCheck 
} from 'lucide-react';

import Header from './components/Header';
import DashboardPatient from './components/DashboardPatient';
import DashboardDoctor from './components/DashboardDoctor';
import DashboardAdmin from './components/DashboardAdmin';
import TimelineView from './components/TimelineView';
import ReportUploader from './components/ReportUploader';
import MedicineTracker from './components/MedicineTracker';
import HospitalMap from './components/HospitalMap';
import Chatbot from './components/Chatbot';
import AIInsightsPanel from './components/AIInsightsPanel';
import EmergencySOS from './components/EmergencySOS';
import DocumentAISearch from './components/DocumentAISearch';
import JudgeDemoCompanion from './components/JudgeDemoCompanion';

import { UserRole, MedicalRecord, Medication, Appointment, SystemNotification, MapLocation } from './types';

export default function App() {
  const [role, setRole] = useState<UserRole>('patient');
  const [patientTab, setPatientTab] = useState<string>('dashboard');
  const [lastAnalyzed, setLastAnalyzed] = useState<MedicalRecord | null>(null);
  const [demoChatPrompt, setDemoChatPrompt] = useState<string>("");

  const activeUser = {
    id: "pat-123",
    name: "Amit Sharma",
    email: "amit.sharma@hsrmail.com",
    role: "patient" as const,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150",
    phone: "+91 98450 11223",
    age: 45,
    gender: "Male",
    bloodGroup: "O Positive"
  };

  // ==========================================
  // PRE-SEEDED INTUITIVE HACKATHON DATA
  // ==========================================

  // 1. Seeded EHR Medical Records (Prescription & Blood Lab panels)
  const [records, setRecords] = useState<MedicalRecord[]>([
    {
      id: "rec-seed-1",
      fileName: "Cardiologist Prescription.jpg",
      fileType: "Prescription",
      uploadDate: "2026-07-15",
      patientId: "pat-123",
      extractedData: {
        patientName: "Amit Sharma",
        doctorName: "Dr. K. V. Mohan Rao, DM",
        hospitalName: "Apollo Cardiac Centre",
        date: "2026-07-15",
        summary: "Patient presents with mild essential hypertension and high low-density lipoprotein (LDL) cholesterol. Advised daily anticoagulants and lipid-regulating statins.",
        explanationSimple: "यह पर्चा दिल की देखभाल के लिए है:\n- **Ecosprin 75mg**: खून पतला करने की दवा, दिल के दौरे से बचाव के लिए। दोपहर के भोजन के बाद लें।\n- **Atorva 20mg**: शरीर में खराब कोलेस्ट्रॉल को कम करने के लिए। रोज रात को सोने से पहले एक गोली लें।\n- **Dolo 650mg**: सामान्य दर्द या बुखार होने पर ही लें।",
        specialistRecommendation: "Cardiologist",
        medications: [
          {
            name: "Ecosprin 75mg",
            dosage: "1 tablet",
            frequency: "Once Daily (QD) - Post Lunch",
            duration: "3 Months",
            instructions: "Take with food. Do not skip."
          },
          {
            name: "Atorva 20mg",
            dosage: "1 tablet",
            frequency: "Once Daily (QD) - Night",
            duration: "3 Months",
            instructions: "Avoid grapefruit juice."
          }
        ],
        timelineEvent: {
          title: "Cardiology Prescription Begun",
          description: "Initiated Ecosprin and Atorva cardiovascular regulatory therapies. Scheduled routine check in 6 weeks.",
          urgency: "medium"
        }
      }
    },
    {
      id: "rec-seed-2",
      fileName: "Lab Report Fasting Panel.pdf",
      fileType: "Lab Report",
      uploadDate: "2026-07-16",
      patientId: "pat-123",
      extractedData: {
        patientName: "Amit Sharma",
        doctorName: "Dr. Savitha Nair",
        hospitalName: "Astra PathLabs",
        date: "2026-07-16",
        summary: "Routine fasting panel indicates elevated metabolic risk with Glycated Haemoglobin (HbA1c) recorded at 7.2% and elevated Fasting Blood Glucose of 128 mg/dL.",
        explanationSimple: "आपकी ब्लड रिपोर्ट के मुख्य बिंदु:\n- **HbA1c (7.2%)**: यह दर्शाता है कि आपकी ब्लड शुगर औसत से अधिक है (प्री-डायबिटिक रेंज)। मीठे से परहेज करें।\n- **Fasting Glucose (128 mg/dL)**: खाली पेट की शुगर बढ़ी हुई है। खान-पान में बदलाव करें।",
        specialistRecommendation: "Endocrinologist",
        medications: [],
        labResults: [
          {
            testName: "HbA1c (Glycated Haemoglobin)",
            result: "7.2",
            normalRange: "4.0 - 5.6",
            unit: "%",
            status: "High"
          },
          {
            testName: "Fasting Blood Sugar",
            result: "128",
            normalRange: "70 - 100",
            unit: "mg/dL",
            status: "High"
          }
        ],
        timelineEvent: {
          title: "Metabolic Lab Panel Analyzed",
          description: "Blood markers show HbA1c at 7.2%. Requires lifestyle audit and metabolic consult.",
          urgency: "high"
        }
      }
    }
  ]);

  // 2. Active Medications Cabinet (Synched with checklist logs)
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: "med-seed-1",
      name: "Ecosprin 75mg",
      dosage: "1 tablet",
      frequency: "Once Daily (QD)",
      duration: "3 Months",
      instructions: "Take post-meal with water",
      startDate: "2026-07-15",
      status: 'active',
      explanationSimple: "Blood thinner prescribed to prevent arterial clots. Protects cardiovascular flow.",
      reminderTimes: ["08:00 AM"],
      takenHistory: {
        "2026-07-18_08:00 AM": true
      }
    },
    {
      id: "med-seed-2",
      name: "Atorva 20mg",
      dosage: "1 tablet",
      frequency: "Once Daily (QD)",
      duration: "3 Months",
      instructions: "Take at bedtime",
      startDate: "2026-07-15",
      status: 'active',
      explanationSimple: "Statin class medicine formulated to lower low-density lipoprotein (LDL) cholesterol.",
      reminderTimes: ["08:00 PM"],
      takenHistory: {}
    }
  ]);

  // 3. Clinic Appointments List
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "app-seed-1",
      patientId: "pat-123",
      patientName: "Amit Sharma",
      patientAge: 45,
      patientGender: "Male",
      doctorName: "Dr. Mohan Rao",
      specialty: "Cardiology",
      date: "2026-07-20",
      time: "10:30 AM",
      status: 'scheduled',
      hospitalName: "Apex Multi-Specialty Hospital",
      isAiRecommendation: false
    }
  ]);

  // 4. Notification Center Messages
  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: "notif-1",
      title: "Medication Warning",
      message: "Atorva 20mg dose scheduled tonight at 08:00 PM.",
      type: "medication",
      timestamp: "Today, 08:00 AM",
      read: false
    },
    {
      id: "notif-2",
      title: "Upcoming Consultation",
      message: "Appointment with Dr. Mohan Rao (Cardiologist) scheduled for Monday, 10:30 AM.",
      type: "appointment",
      timestamp: "Yesterday",
      read: false
    }
  ]);

  // ==========================================
  // CORE COMPONENT HANDLERS
  // ==========================================

  // 1. Append newly parsed medical record from OCR uploader
  const handleRecordAnalyzed = (newRecord: MedicalRecord) => {
    setRecords(prev => [newRecord, ...prev]);

    // Check if there are medications inside to automatically import into medicine cabinet
    if (newRecord.extractedData.medications && newRecord.extractedData.medications.length > 0) {
      const addedMeds: Medication[] = newRecord.extractedData.medications.map((med, index) => ({
        id: `med-extracted-${Date.now()}-${index}`,
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration || "Continuous",
        instructions: med.instructions || "Take as instructed.",
        startDate: new Date().toISOString().split('T')[0],
        status: 'active',
        explanationSimple: `Extracted from "${newRecord.fileName}". Prescribed by ${newRecord.extractedData.doctorName || 'Physician'}.`,
        reminderTimes: ["08:00 AM"],
        takenHistory: {}
      }));

      setMedications(prev => {
        // Filter out items with identical names to avoid duplicate duplicates
        const filtered = prev.filter(p => !addedMeds.some(a => a.name.toLowerCase() === p.name.toLowerCase()));
        return [...filtered, ...addedMeds];
      });
    }

    // Trigger congratulations notification
    const alertMsg: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: "OCR Sync Completed",
      message: `Extracted ${newRecord.fileType}: "${newRecord.fileName}" safely using Gemini AI OCR.`,
      type: "general",
      timestamp: "Just now",
      read: false
    };
    setNotifications(prev => [alertMsg, ...prev]);
  };

  // 2. Add custom medication from patient cabinet form
  const handleAddMedication = (newMed: Medication) => {
    setMedications(prev => [...prev, newMed]);

    const notif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: "Prescription Added",
      message: `${newMed.name} added to schedule. Real-time interaction audit triggered.`,
      type: "medication",
      timestamp: "Just now",
      read: false
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // 3. Delete medication from cabinet
  const handleDeleteMedication = (id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
  };

  // 4. Toggle medication course active / paused
  const handleToggleMedStatus = (id: string) => {
    setMedications(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, status: m.status === 'active' ? 'paused' : 'active' };
      }
      return m;
    }));
  };

  // 5. Check off dose checklists (updates compliance)
  const handleUpdateMedHistory = (medId: string, dateTimeKey: string, taken: boolean) => {
    setMedications(prev => prev.map(m => {
      if (m.id === medId) {
        const nextHist = { ...m.takenHistory, [dateTimeKey]: taken };
        return { ...m, takenHistory: nextHist };
      }
      return m;
    }));
  };

  // 6. Doctor Dashboard: Append digital prescription back into active patient EHR
  const handleDoctorPrescription = (patientName: string, medInfo: { name: string; dosage: string; frequency: string; instructions: string; duration: string }) => {
    // Generate mock record
    const mockRecordId = `rec-doc-${Date.now()}`;
    const newRecord: MedicalRecord = {
      id: mockRecordId,
      fileName: `Doctor Prescribed: ${medInfo.name}.pdf`,
      fileType: "Prescription",
      uploadDate: new Date().toISOString().split('T')[0],
      patientId: "pat-123",
      extractedData: {
        patientName: patientName,
        doctorName: "Dr. K. V. Mohan Rao",
        hospitalName: "Apex Multi-Specialty Hospital",
        date: new Date().toISOString().split('T')[0],
        summary: `Prescribed ${medInfo.name} during specialty clinical consult.`,
        explanationSimple: `यह दवा डॉक्टर मोहन राव द्वारा बताई गयी है। \n- **${medInfo.name}**: ${medInfo.instructions}`,
        specialistRecommendation: "Cardiologist",
        medications: [{
          name: medInfo.name,
          dosage: medInfo.dosage,
          frequency: medInfo.frequency,
          duration: medInfo.duration,
          instructions: medInfo.instructions
        }],
        timelineEvent: {
          title: `Prescribed ${medInfo.name}`,
          description: `Began course of ${medInfo.name} prescribed directly by cardiology team.`,
          urgency: "low"
        }
      }
    };

    handleRecordAnalyzed(newRecord);
  };

  // 7. Patient Dashboard: Book direct demo consult
  const handleBookDemoAppointment = () => {
    const newApp: Appointment = {
      id: `app-demo-${Date.now()}`,
      patientId: "pat-123",
      patientName: "Amit Sharma",
      doctorName: "Dr. Savitha Nair",
      specialty: "Endocrinology",
      date: "2026-07-25",
      time: "02:15 PM",
      status: 'scheduled',
      hospitalName: "Apex Multi-Specialty Hospital",
      isAiRecommendation: true
    };

    setAppointments(prev => [...prev, newApp]);

    const notif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: "Consultation Booked",
      message: "Endocrinology appointment confirmed for July 25th at 02:15 PM.",
      type: "appointment",
      timestamp: "Just now",
      read: false
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const [locations, setLocations] = useState<MapLocation[]>([]);
  const alertedDosesRef = React.useRef<Record<string, boolean>>({});
  const [activeToasts, setActiveToasts] = useState<Array<{ id: string; title: string; message: string; type: string }>>([]);

  // Dismiss toast
  const dismissToast = (id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  };

  // Helper to trigger a notification (both standard push and in-app banner)
  const triggerPushNotification = (medName: string, dosage: string, instructions: string) => {
    const title = "💊 MediFlow Medication Reminder";
    const message = `It is time to take your dose of ${medName} (${dosage}). Instructions: ${instructions}`;
    
    // 1. Native HTML5 Notification
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body: message,
          });
        } catch (e) {
          console.error("Native push trigger failed:", e);
        }
      } else if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    // 2. Add to internal Notification List
    const newSystemNotif: SystemNotification = {
      id: `notif-time-${Date.now()}`,
      title: "Dose Reminder",
      message: `Scheduled dose for ${medName} (${dosage}) is due now.`,
      type: "medication",
      timestamp: "Just now",
      read: false
    };
    setNotifications(prev => [newSystemNotif, ...prev]);

    // 3. Show visually stunning floating in-app browser toast card
    const newToast = {
      id: `toast-${Date.now()}`,
      title,
      message,
      type: "medication"
    };
    setActiveToasts(prev => [...prev, newToast]);

    // Auto dismiss toast after 8 seconds
    setTimeout(() => {
      dismissToast(newToast.id);
    }, 8000);
  };

  // Active checking loop for medication scheduled times
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // hour '0' -> '12'
      const strHours = hours < 10 ? '0' + hours : hours;
      const strMinutes = minutes < 10 ? '0' + minutes : minutes;
      const currentTimeStr = `${strHours}:${strMinutes} ${ampm}`;

      medications.forEach(med => {
        if (med.status === 'active') {
          med.reminderTimes.forEach(reminderTime => {
            if (reminderTime.trim().toUpperCase() === currentTimeStr) {
              const alertKey = `${med.id}_${today}_${reminderTime}`;
              if (!alertedDosesRef.current[alertKey]) {
                alertedDosesRef.current[alertKey] = true;
                triggerPushNotification(med.name, med.dosage, med.instructions);
              }
            }
          });
        }
      });
    };

    // Run immediately on load and then check every 15 seconds
    checkSchedule();
    const interval = setInterval(checkSchedule, 15000);
    return () => clearInterval(interval);
  }, [medications]);

  useEffect(() => {
    fetch("/api/locations")
      .then(res => res.json())
      .then(data => setLocations(data))
      .catch(err => console.warn("Could not retrieve location indices:", err));
  }, []);

  // Request native permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  // Initialize lastAnalyzed with the first record on load
  useEffect(() => {
    if (records.length > 0 && !lastAnalyzed) {
      setLastAnalyzed(records[0]);
    }
  }, [records, lastAnalyzed]);

  const handleTriggerPresetOcr = () => {
    if (records.length > 0) {
      setLastAnalyzed(records[0]);
    }
  };

  const handleResetData = () => {
    setRole('patient');
    setPatientTab('dashboard');
    setRecords([
      {
        id: "rec-seed-1",
        fileName: "Cardiologist Prescription.jpg",
        fileType: "Prescription",
        uploadDate: "2026-07-15",
        patientId: "pat-123",
        extractedData: {
          patientName: "Amit Sharma",
          doctorName: "Dr. K. V. Mohan Rao, DM",
          hospitalName: "Apollo Cardiac Centre",
          date: "2026-07-15",
          summary: "Patient presents with mild essential hypertension and high low-density lipoprotein (LDL) cholesterol. Advised daily anticoagulants and lipid-regulating statins.",
          explanationSimple: "यह पर्चा दिल की देखभाल के लिए है:\n- **Ecosprin 75mg**: खून पतला करने की दवा, दिल के दौरे से बचाव के लिए। दोपहर के भोजन के बाद लें।\n- **Atorva 20mg**: शरीर में खराब कोलेस्ट्रॉल को कम करने के लिए। रोज रात को सोने से पहले एक गोली लें।\n- **Dolo 650mg**: सामान्य दर्द या बुखार होने पर ही लें।",
          specialistRecommendation: "Cardiologist",
          medications: [
            {
              name: "Ecosprin 75mg",
              dosage: "1 tablet",
              frequency: "Once Daily (QD) - Post Lunch",
              duration: "3 Months",
              instructions: "Take with food. Do not skip."
            },
            {
              name: "Atorva 20mg",
              dosage: "1 tablet",
              frequency: "Once Daily (QD) - Night",
              duration: "3 Months",
              instructions: "Avoid grapefruit juice."
            }
          ],
          timelineEvent: {
            title: "Cardiology Prescription Begun",
            description: "Initiated Ecosprin and Atorva cardiovascular regulatory therapies. Scheduled routine check in 6 weeks.",
            urgency: "medium"
          }
        }
      },
      {
        id: "rec-seed-2",
        fileName: "Lab Report Fasting Panel.pdf",
        fileType: "Lab Report",
        uploadDate: "2026-07-16",
        patientId: "pat-123",
        extractedData: {
          patientName: "Amit Sharma",
          doctorName: "Dr. Savitha Nair",
          hospitalName: "Astra PathLabs",
          date: "2026-07-16",
          summary: "Routine fasting panel indicates elevated metabolic risk with Glycated Haemoglobin (HbA1c) recorded at 7.2% and elevated Fasting Blood Glucose of 128 mg/dL.",
          explanationSimple: "आपकी ब्लड रिपोर्ट के मुख्य बिंदु:\n- **HbA1c (7.2%)**: यह दर्शाता है कि आपकी ब्लड शुगर औसत से अधिक है (प्री-डायबिटिक रेंज)। मीठे से परहेज करें।\n- **Fasting Glucose (128 mg/dL)**: खाली पेट की शुगर बढ़ी हुई है। खान-पान में बदलाव करें।",
          specialistRecommendation: "Endocrinologist",
          medications: [],
          labResults: [
            {
              testName: "HbA1c (Glycated Haemoglobin)",
              result: "7.2",
              normalRange: "4.0 - 5.6",
              unit: "%",
              status: "High"
            },
            {
              testName: "Fasting Blood Sugar",
              result: "128",
              normalRange: "70 - 100",
              unit: "mg/dL",
              status: "High"
            }
          ],
          timelineEvent: {
            title: "Metabolic Lab Panel Analyzed",
            description: "Blood markers show HbA1c at 7.2%. Requires lifestyle audit and metabolic consult.",
            urgency: "high"
          }
        }
      }
    ]);
    setMedications([
      {
        id: "med-seed-1",
        name: "Ecosprin 75mg",
        dosage: "1 tablet",
        frequency: "Once Daily (QD)",
        duration: "3 Months",
        instructions: "Take post-meal with water",
        startDate: "2026-07-15",
        status: 'active',
        explanationSimple: "Blood thinner prescribed to prevent arterial clots. Protects cardiovascular flow.",
        reminderTimes: ["08:00 AM"],
        takenHistory: {
          "2026-07-18_08:00 AM": true
        }
      },
      {
        id: "med-seed-2",
        name: "Atorva 20mg",
        dosage: "1 tablet",
        frequency: "Once Daily (QD)",
        duration: "3 Months",
        instructions: "Take at bedtime",
        startDate: "2026-07-15",
        status: 'active',
        explanationSimple: "Statin class medicine formulated to lower low-density lipoprotein (LDL) cholesterol.",
        reminderTimes: ["08:00 PM"],
        takenHistory: {}
      }
    ]);
    setAppointments([
      {
        id: "app-seed-1",
        patientId: "pat-123",
        patientName: "Amit Sharma",
        patientAge: 45,
        patientGender: "Male",
        doctorName: "Dr. Mohan Rao",
        specialty: "Cardiology",
        date: "2026-07-20",
        time: "10:30 AM",
        status: 'scheduled',
        hospitalName: "Apex Multi-Specialty Hospital",
        isAiRecommendation: false
      }
    ]);
    setNotifications([
      {
        id: "notif-1",
        title: "Medication Warning",
        message: "Atorva 20mg dose scheduled tonight at 08:00 PM.",
        type: "medication",
        timestamp: "Today, 08:00 AM",
        read: false
      },
      {
        id: "notif-2",
        title: "Upcoming Consultation",
        message: "Appointment with Dr. Mohan Rao (Cardiologist) scheduled for Monday, 10:30 AM.",
        type: "appointment",
        timestamp: "Yesterday",
        read: false
      }
    ]);
    setDemoChatPrompt("");
  };

  // 8. Notification read/clear handlers
  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] font-sans antialiased text-slate-800 relative overflow-x-hidden">
      
      {/* Mesh Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-200/40 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-100/40 blur-[150px]" />
        <div className="absolute top-[40%] right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-100/30 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Universal Header Shell */}
        <Header
          currentRole={role}
          onRoleChange={setRole}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onClearNotifications={handleClearNotifications}
        />

        {/* Main layout frame */}
        <main className="flex-grow mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          
          {/* Render Patient Portal */}
          {role === 'patient' && (
            <div className="space-y-6">
              
              {/* Horizontal Navigation tabs */}
              <div className="flex border-b border-white/20 overflow-x-auto no-scrollbar py-1">
                <div className="flex gap-1 bg-white/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/30 shadow-sm">
                  {[
                    { id: 'dashboard', label: 'Overview', icon: Activity },
                    { id: 'ocr', label: 'AI OCR Upload', icon: FileText },
                    { id: 'timeline', label: 'EHR Care Timeline', icon: Calendar },
                    { id: 'meds', label: 'Cabinet & Scheduler', icon: ListTodo },
                    { id: 'insights', label: 'AI Care Insights', icon: Sparkles },
                    { id: 'emergency', label: 'Emergency SOS', icon: Heart },
                    { id: 'map', label: 'Specialist Locator', icon: MapPin },
                    { id: 'assistant', label: 'AI Assistant', icon: Bot },
                  ].map((tab) => {
                    const TabIcon = tab.icon;
                    const isSelected = patientTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        id={`tab-btn-${tab.id}`}
                        onClick={() => setPatientTab(tab.id)}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                          isSelected 
                            ? 'bg-white/80 text-slate-900 shadow-sm border border-white/40' 
                            : 'text-slate-500 hover:text-slate-900 hover:bg-white/20'
                        }`}
                      >
                        <TabIcon className={`h-4 w-4 ${isSelected ? 'text-emerald-500' : 'text-slate-400'}`} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            {/* Tab Views */}
            <div className="min-h-[500px]">
              {patientTab === 'dashboard' && (
                <DashboardPatient
                  records={records}
                  appointments={appointments}
                  medications={medications}
                  onNavigateToTab={setPatientTab}
                  onBookDemoAppointment={handleBookDemoAppointment}
                />
              )}

              {patientTab === 'ocr' && (
                <div className="space-y-6">
                  <ReportUploader
                    onRecordAnalyzed={handleRecordAnalyzed}
                    lastAnalyzed={lastAnalyzed}
                    setLastAnalyzed={setLastAnalyzed}
                  />
                  <DocumentAISearch records={records} onSelectRecord={(id) => {
                    setPatientTab('timeline');
                  }} />
                </div>
              )}

              {patientTab === 'timeline' && (
                <TimelineView
                  records={records}
                  appointments={appointments}
                  onSelectEvent={(type, id) => {
                    if (type === 'record') {
                      setPatientTab('ocr');
                    } else {
                      setPatientTab('dashboard');
                    }
                  }}
                />
              )}

              {patientTab === 'meds' && (
                <MedicineTracker
                  medications={medications}
                  onAddMedication={handleAddMedication}
                  onDeleteMedication={handleDeleteMedication}
                  onToggleStatus={handleToggleMedStatus}
                  onUpdateMedicationHistory={handleUpdateMedHistory}
                  onTriggerTestNotification={(medName) => {
                    const med = medications.find(m => m.name === medName) || medications[0];
                    if (med) {
                      triggerPushNotification(med.name, med.dosage, med.instructions);
                    } else {
                      triggerPushNotification("Ecosprin 75mg", "1 tablet", "Take post-meal with water (Demo Instant Trigger)");
                    }
                  }}
                />
              )}

              {patientTab === 'insights' && (
                <AIInsightsPanel
                  medications={medications}
                  records={records}
                  appointments={appointments}
                />
              )}

              {patientTab === 'emergency' && (
                <EmergencySOS
                  user={activeUser}
                  locations={locations}
                />
              )}

              {patientTab === 'map' && (
                <HospitalMap />
              )}

              {patientTab === 'assistant' && (
                <Chatbot
                  activeMedications={medications}
                  recentRecords={records}
                  onNavigateToTab={setPatientTab}
                  onAddAppointment={(app) => setAppointments(prev => [...prev, app])}
                  onTriggerSOS={() => setPatientTab('emergency')}
                  demoPrompt={demoChatPrompt}
                  onClearDemoPrompt={() => setDemoChatPrompt("")}
                />
              )}
            </div>

          </div>
        )}

        {/* Render Doctor Portal */}
        {role === 'doctor' && (
          <DashboardDoctor
            appointments={appointments}
            records={records}
            onAddPrescription={handleDoctorPrescription}
          />
        )}

        {/* Render Admin Terminal */}
        {role === 'admin' && (
          <DashboardAdmin
            appointments={appointments}
            records={records}
          />
        )}

      </main>

      {/* Elegant Hackathon Footer */}
      <footer className="bg-white/30 backdrop-blur-md border-t border-white/20 py-8 mt-20 text-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
            <span className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-widest">MediFlow Clinical Framework</span>
          </div>
          <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
            MediFlow uses AI to optimize care pathways, clarify clinical abbreviations, and detect ingredient overlaps. This is a hackathon prototype and is strictly formulated for navigation; it does not substitute professional diagnostic opinion.
          </p>
          <div className="text-[10px] text-slate-300 font-mono font-bold uppercase tracking-wider">
            AI Agent Hackathon 2026 • Port 3000 Ingress Secure
          </div>
        </div>
      </footer>

      {/* Floating Browser Push Notification Toast Stack */}
      <div className="fixed bottom-6 right-6 left-6 sm:left-auto z-50 flex flex-col gap-3 max-w-sm w-auto pointer-events-none">
        {activeToasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex flex-col p-4 bg-slate-900/95 backdrop-blur-md text-white border border-emerald-500/30 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-right duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-emerald-400 to-teal-500" />
            <div className="flex items-start justify-between gap-3 pl-2">
              <div className="space-y-1">
                <div className="text-[10px] font-extrabold tracking-wider text-emerald-400 uppercase flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  {toast.title}
                </div>
                <p className="text-xs text-slate-200 font-medium leading-relaxed">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 hover:text-white font-bold text-sm leading-none p-1 shrink-0 transition"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <JudgeDemoCompanion
        currentRole={role}
        onRoleChange={setRole}
        patientTab={patientTab}
        onPatientTabChange={setPatientTab}
        medications={medications}
        onAddMedication={(med) => setMedications(prev => [...prev, med])}
        onResetData={handleResetData}
        onTriggerNotification={triggerPushNotification}
        onInjectLabRecord={() => {
          if (records.length > 1) {
            setLastAnalyzed(records[1]);
          }
        }}
        onTriggerPresetOcr={handleTriggerPresetOcr}
        onInjectChatPrompt={(prompt) => {
          setDemoChatPrompt(prompt);
        }}
      />

      </div>
    </div>
  );
}
