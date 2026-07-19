export type UserRole = 'patient' | 'doctor' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
}

export interface MedicalRecord {
  id: string;
  fileName: string;
  fileType: 'Prescription' | 'Lab Report' | 'Discharge Summary' | 'Other';
  uploadDate: string;
  patientId: string;
  extractedData: {
    patientName?: string;
    doctorName?: string;
    hospitalName?: string;
    date?: string;
    medications?: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration?: string;
      instructions?: string;
    }>;
    diagnoses?: string[];
    labResults?: Array<{
      testName: string;
      result: string;
      normalRange?: string;
      unit?: string;
      status?: 'Normal' | 'High' | 'Low' | 'Critical';
    }>;
    summary: string;
    explanationSimple: string;
    specialistRecommendation?: string;
    timelineEvent?: {
      title: string;
      description: string;
      urgency: 'low' | 'medium' | 'high';
    };
  };
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'paused' | 'completed';
  explanationSimple: string;
  isDuplicate?: boolean;
  duplicateWith?: string;
  interactionWarning?: string;
  reminderTimes: string[]; // e.g. ["08:00 AM", "02:00 PM", "08:00 PM"]
  takenHistory?: Record<string, boolean>; // date_time -> boolean
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  doctorName: string;
  specialty: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  hospitalName?: string;
  isAiRecommendation?: boolean;
}

export interface HealthMetric {
  date: string;
  bloodPressureSys: number;
  bloodPressureDia: number;
  bloodSugar: number; // mg/dL
  heartRate: number; // bpm
  complianceScore: number; // percentage of medicines taken
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  fileAttachment?: {
    name: string;
    type: string;
    base64: string;
  };
  suggestions?: string[];
}

export interface MapLocation {
  id: string;
  name: string;
  type: 'hospital' | 'pharmacy' | 'diagnostic' | 'emergency';
  address: string;
  phone: string;
  distance: string; // e.g. "1.2 km"
  latitude: number;
  longitude: number;
  services?: string[];
  rating?: number;
  openNow?: boolean;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'medication' | 'appointment' | 'alert' | 'general';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}
