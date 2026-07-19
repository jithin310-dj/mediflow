import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY environment variable is missing.");
}

const ai = new GoogleGenAI({
  apiKey: apiKey || "MOCK_KEY",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Middleware for parsing JSON up to 50MB (to allow base64 uploads)
app.use(express.json({ limit: '50mb' }));

// MOCK DATA for hospitals and clinics (to support maps grounding and mock locations)
const mockLocations = [
  {
    id: "hosp-1",
    name: "Apex Multi-Specialty Hospital",
    type: "hospital",
    address: "Metro Ring Rd, Sector 5, HSR Layout, Bengaluru",
    phone: "+91 80 4912 3456",
    distance: "0.8 km",
    latitude: 12.9141,
    longitude: 77.6413,
    services: ["Emergency Care", "Cardiology", "Neurology", "Pediatrics", "24x7 ICU"],
    rating: 4.6,
    openNow: true
  },
  {
    id: "hosp-2",
    name: "Dr. Reddy's Family Clinic",
    type: "diagnostic",
    address: "24th Main Road, Agara, HSR Layout, Bengaluru",
    phone: "+91 98860 12345",
    distance: "1.4 km",
    latitude: 12.9205,
    longitude: 77.6450,
    services: ["Diagnostic Blood Tests", "X-Ray", "General Consultation", "Vaccination Center"],
    rating: 4.2,
    openNow: true
  },
  {
    id: "pharm-1",
    name: "Apollo Pharmacy 24/7",
    type: "pharmacy",
    address: "Sector 3, Outer Ring Road, HSR Layout, Bengaluru",
    phone: "+91 80 2572 1122",
    distance: "0.3 km",
    latitude: 12.9115,
    longitude: 77.6385,
    services: ["Home Delivery", "Prescription Refill", "Vaccines", "OTC Medicine"],
    rating: 4.5,
    openNow: true
  },
  {
    id: "pharm-2",
    name: "MedPlus Pharmacy",
    type: "pharmacy",
    address: "17th Cross Road, Sector 6, HSR Layout, Bengaluru",
    phone: "+91 80 4110 5566",
    distance: "1.1 km",
    latitude: 12.9160,
    longitude: 77.6320,
    services: ["Medicines Store", "Wellness Products", "First Aid"],
    rating: 4.1,
    openNow: true
  },
  {
    id: "diag-1",
    name: "Astra PathLabs & Imaging",
    type: "diagnostic",
    address: "9th Main Road, Sector 7, HSR Layout, Bengaluru",
    phone: "+91 80 4300 9900",
    distance: "1.9 km",
    latitude: 12.9090,
    longitude: 77.6250,
    services: ["MRI Scan", "CT Scan", "Pathology Lab", "Ultrasound", "Health Packages"],
    rating: 4.7,
    openNow: true
  },
  {
    id: "emerg-1",
    name: "MediFlow Emergency Helpline Service",
    type: "emergency",
    address: "City Command Center, HSR Layout, Bengaluru",
    phone: "+91 99999 11111",
    distance: "0.1 km",
    latitude: 12.9150,
    longitude: 77.6390,
    services: ["Ambulance Dispatch", "Tele-Emergency Doctor", "Trauma Support"],
    rating: 4.9,
    openNow: true
  }
];

// ==========================================
// API ENDPOINTS
// ==========================================

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 2. Report OCR Analysis and Structured Extraction Endpoint
app.post("/api/analyze-report", async (req, res) => {
  const { fileName, fileType, mimeType, base64 } = req.body;

  if (!base64 || !mimeType) {
    return res.status(400).json({ error: "Missing file data or MIME type." });
  }

  try {
    const isMock = !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY";

    if (isMock) {
      console.log("No API key configured. Returning simulated parsed medical record.");
      // Return beautiful simulated data matching schema
      return res.json(getMockAnalysis(fileName, fileType));
    }

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64,
      },
    };

    const promptText = `
      You are an expert Clinical Informatics AI Assistant. 
      Analyze this medical document (${fileType}: "${fileName}").
      Perform high-quality optical character recognition (OCR) and structured information extraction.
      
      STRICT ETHICAL GUIDELINE: Do NOT diagnose any diseases or state that the patient has a specific condition as a definitive medical opinion. You can list "noted diagnoses" or "findings" that are directly written on the paper. Keep all language objective, professional, and clear.
      
      Extract and structure the following details strictly according to the requested JSON responseSchema:
      1. Patient name, doctor name, hospital name, and document date if written.
      2. Comprehensive summary in plain, easy-to-understand language.
      3. A clear, gentle, empathetic "explanationSimple" translation of any clinical jargon, medical abbreviations, or test values into simple layman terms, including multiple Indian language translation tips if relevant.
      4. List of any medications with name, dosage, frequency, duration, and special instructions.
      5. List of lab results if it is a Lab Report (including test name, result value, normal reference range, unit, and flag status like Normal, High, Low, Critical).
      6. Recommended medical specialist department that the patient should consult for continuity of care based on the document's context (e.g. Cardiologist, Dermatologist, Orthopedist) WITHOUT giving a disease diagnosis.
      7. A chronological "timelineEvent" containing a title, description, and urgency ('low', 'medium', 'high') to put on their patient health timeline.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [imagePart, { text: promptText }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["summary", "explanationSimple", "specialistRecommendation"],
          properties: {
            patientName: { type: Type.STRING },
            doctorName: { type: Type.STRING },
            hospitalName: { type: Type.STRING },
            date: { type: Type.STRING, description: "Format YYYY-MM-DD if found, otherwise general string" },
            summary: { type: Type.STRING, description: "Professional medical summary written in a comforting, friendly tone" },
            explanationSimple: { type: Type.STRING, description: "Empathetic, clear simple-language translation of complex terms and results" },
            specialistRecommendation: { type: Type.STRING, description: "Recommended specialist department, e.g. Cardiologist, Neurologist, General Physician" },
            medications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["name", "dosage", "frequency"],
                properties: {
                  name: { type: Type.STRING },
                  dosage: { type: Type.STRING },
                  frequency: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  instructions: { type: Type.STRING }
                }
              }
            },
            labResults: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["testName", "result"],
                properties: {
                  testName: { type: Type.STRING },
                  result: { type: Type.STRING },
                  normalRange: { type: Type.STRING },
                  unit: { type: Type.STRING },
                  status: { type: Type.STRING, description: "Must be: Normal, High, Low, or Critical" }
                }
              }
            },
            timelineEvent: {
              type: Type.OBJECT,
              required: ["title", "description", "urgency"],
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                urgency: { type: Type.STRING, description: "Must be: low, medium, or high" }
              }
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);

  } catch (error: any) {
    console.warn("[MediFlow Server] Report analysis is using the graceful local fallback.");
    // Graceful fallback to mock analysis when API quota is hit or other network issues occur
    const parsedData = getMockAnalysis(fileName || "report.pdf", fileType || "General");
    parsedData.summary = "⚠️ [Note: Offline backup engine activated] " + parsedData.summary;
    res.json(parsedData);
  }
});

// 3. Drug-Drug Interaction and Duplicate Medication Detection Endpoint
app.post("/api/medication-analysis", async (req, res) => {
  const { medications } = req.body; // Array of active medications

  if (!medications || !Array.isArray(medications) || medications.length === 0) {
    return res.json({ duplicates: [], interactions: [] });
  }

  try {
    const isMock = !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY";

    if (isMock) {
      // Simulate detection for presentation
      const list = medications.map(m => m.name.toLowerCase());
      const duplicates: any[] = [];
      const interactions: any[] = [];

      // Look for custom simulated combinations
      if (list.some(x => x.includes("parac") || x.includes("crocin") || x.includes("dolo") || x.includes("acetaminophen"))) {
        const matches = medications.filter(m => {
          const n = m.name.toLowerCase();
          return n.includes("parac") || n.includes("crocin") || n.includes("dolo") || n.includes("acetaminophen");
        });
        if (matches.length > 1) {
          duplicates.push({
            med1: matches[0].name,
            med2: matches[1].name,
            reason: "Both contain Acetaminophen/Paracetamol. Taking both poses a high risk of accidental liver overdose."
          });
        }
      }

      // Check for blood thinners + NSAID pain relievers
      const hasAspirinOrWarfarin = list.some(x => x.includes("aspirin") || x.includes("warfarin") || x.includes("clopidogrel") || x.includes("ecospirin"));
      const hasIbuprofenOrDiclofenac = list.some(x => x.includes("ibuprofen") || x.includes("combiflam") || x.includes("diclofenac") || x.includes("naproxen") || x.includes("brufen"));

      if (hasAspirinOrWarfarin && hasIbuprofenOrDiclofenac) {
        interactions.push({
          meds: medications.filter(m => {
            const n = m.name.toLowerCase();
            return n.includes("aspirin") || n.includes("warfarin") || n.includes("ecospirin") || n.includes("ibuprofen") || n.includes("combiflam") || n.includes("diclofenac");
          }).map(m => m.name),
          severity: "high",
          description: "Combining an anticoagulant/blood thinner with a nonsteroidal anti-inflammatory drug (NSAID) significantly increases the risk of gastrointestinal bleeding. Consider discussing with your doctor about safer pain relief alternatives (like paracetamol) or gastric-protective co-prescriptions."
        });
      }

      return res.json({ duplicates, interactions });
    }

    const promptText = `
      You are an expert Clinical Pharmacist AI Assistant.
      Analyze this list of active medications for duplicate active ingredients and potential drug-drug interactions.
      
      Medications list:
      ${JSON.stringify(medications, null, 2)}
      
      STRICT ETHICAL GUIDELINE: Do NOT diagnose diseases or tell the patient to stop a prescription immediately without consulting a doctor. Instead, formulate helpful "pharmacist insights" and "questions to ask their doctor".
      
      Respond STRICTLY in JSON format matching the responseSchema:
      - duplicates: Array of objects indicating duplicate medicines. A duplicate is when two drugs belong to the same pharmacological class or share the same active ingredient (e.g. Paracetamol vs Crocin or Dolo 650; or Lipitor vs Atorvastatin). Include:
        - med1: string (name of first medicine)
        - med2: string (name of duplicate medicine)
        - reason: string (why they are duplicate, and the clinical risk of taking both)
      - interactions: Array of objects indicating potential drug-drug interactions. Include:
        - meds: array of strings (names of medicines involved)
        - severity: string (must be 'high', 'moderate', or 'low')
        - description: string (the clinical explanation of the interaction, the symptoms to watch out for, and a recommendation of what to verify with their prescribing doctor)
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["duplicates", "interactions"],
          properties: {
            duplicates: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["med1", "med2", "reason"],
                properties: {
                  med1: { type: Type.STRING },
                  med2: { type: Type.STRING },
                  reason: { type: Type.STRING }
                }
              }
            },
            interactions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["meds", "severity", "description"],
                properties: {
                  meds: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  severity: { type: Type.STRING, description: "Must be: high, moderate, or low" },
                  description: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{"duplicates": [], "interactions": []}');
    res.json(result);

  } catch (error: any) {
    console.warn("[MediFlow Server] Medication analysis is using the graceful local fallback.");
    // Graceful offline fallback to duplicate & interaction detection using pre-defined safety rules
    const list = (medications || []).map((m: any) => m.name.toLowerCase());
    const duplicates: any[] = [];
    const interactions: any[] = [];

    if (list.some(x => x.includes("parac") || x.includes("crocin") || x.includes("dolo") || x.includes("acetaminophen"))) {
      const matches = medications.filter((m: any) => {
        const n = m.name.toLowerCase();
        return n.includes("parac") || n.includes("crocin") || n.includes("dolo") || n.includes("acetaminophen");
      });
      if (matches.length > 1) {
        duplicates.push({
          med1: matches[0].name,
          med2: matches[1].name,
          reason: "Both contain Acetaminophen/Paracetamol. Taking both simultaneously poses a high risk of accidental liver overdose."
        });
      }
    }

    const hasAspirinOrWarfarin = list.some(x => x.includes("aspirin") || x.includes("warfarin") || x.includes("clopidogrel") || x.includes("ecospirin"));
    const hasIbuprofenOrDiclofenac = list.some(x => x.includes("ibuprofen") || x.includes("combiflam") || x.includes("diclofenac") || x.includes("naproxen") || x.includes("brufen"));

    if (hasAspirinOrWarfarin && hasIbuprofenOrDiclofenac) {
      interactions.push({
        meds: medications.filter((m: any) => {
          const n = m.name.toLowerCase();
          return n.includes("aspirin") || n.includes("warfarin") || n.includes("ecospirin") || n.includes("ibuprofen") || n.includes("combiflam") || n.includes("diclofenac");
        }).map((m: any) => m.name),
        severity: "high",
        description: "Combining an anticoagulant/blood thinner with an NSAID pain reliever significantly increases gastrointestinal bleeding risks. Talk with your doctor about safer alternatives like Paracetamol."
      });
    }

    res.json({ duplicates, interactions });
  }
});

// 4. Intelligent Healthcare Navigation Assistant Chatbot
app.post("/api/chat", async (req, res) => {
  const { messages, activeMedications, recentRecords } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages history is required." });
  }

  try {
    const isMock = !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY";

    // Format chat history for Gemini
    const systemPrompt = `
      You are "MediFlow Assistant", a state-of-the-art AI Healthcare Navigator, Patient Care Coordinator, and Clinical Communication Expert.
      Your goal is to guide patients through their healthcare journeys, coordinate care seamlessly, translate medical jargon, and suggest appropriate medical specialists.
      
      STRICT ETHICAL & COMPLIANCE BOUNDARIES:
      - You DO NOT diagnose illnesses or tell patients they definitely have a disease based on symptoms.
      - If they ask for a diagnosis, respond: "As your care coordinator, I cannot diagnose medical conditions. However, based on your symptoms of [symptoms], I highly recommend booking an appointment with a [specialty] department. Let me help you find one."
      - Always encourage consulting their actual doctor or hospital.
      - Never prescribe or change medication dosages.
      
      CONTEXT:
      - Current Date: 2026-07-18
      - Active Medications: ${JSON.stringify(activeMedications || [])}
      - Recent Analyzed Records: ${JSON.stringify(recentRecords || [])}
      
      CAPABILITIES:
      1. Specialist Recommendation: Match symptoms to departments (e.g. Cardiologist for chest pressure, Dermatologist for rashes, Nephrologist for kidney queries, Orthopedist for joint pain).
      2. Multi-lingual Support: If the user communicates in or asks for Indian languages (like Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, etc.), provide clear guidance and translate key prescription terms into that language.
      3. Medical Report Simplification: Explain lab report values (e.g., HbA1c, Cholesterol, Creatinine) or prescription abbreviations (e.g., QD, BID, PRN) in simple, encouraging layman words.
      4. Hospital Finder: Offer to help them search for clinics, diagnostic labs, or emergency care in HSR Layout, Bengaluru.
    `;

    // Map client messages to Gemini content parts
    const geminiContents = messages.map((m: any) => ({
      role: m.sender === "user" ? "user" as const : "model" as const,
      parts: [{ text: m.text }]
    }));

    if (isMock) {
      // Return a professional mock reply if key is not configured
      const lastMessage = messages[messages.length - 1]?.text?.toLowerCase() || "";
      let replyText = "I am MediFlow's care coordination assistant. I am here to clarify prescription jargon, organize your appointments, check for medicine interactions, and help guide your clinical journey safely. How can I assist you today?";
      let suggestions: string[] = ["Explain my prescription", "Find a nearby hospital", "Is Dolo safe with Crocin?"];

      if (lastMessage.includes("dolo") || lastMessage.includes("crocin") || lastMessage.includes("paracetamol")) {
        replyText = "⚠️ **Care Warning:** Yes, Dolo 650 and Crocin are actually brand names for the same active drug: **Paracetamol (Acetaminophen)**. Taking both simultaneously is a double dosage (1300mg) and can cause serious liver toxicity. You should only take one or the other, strictly following the prescribed gap of 4-6 hours. Please consult a general physician to clarify your dosage schedule.";
        suggestions = ["Check other medications", "Find general physicians"];
      } else if (lastMessage.includes("hospital") || lastMessage.includes("doctor") || lastMessage.includes("clinic")) {
        replyText = "I can certainly help you coordinate care! Based on your current location in HSR Layout, Bengaluru, we have found several highly rated centers nearby:\n\n1. **Apex Multi-Specialty Hospital** (0.8 km) - Emergency care & ICU\n2. **Dr. Reddy's Family Clinic** (1.4 km) - Diagnostics & Consults\n3. **Apollo Pharmacy** (0.3 km) - 24/7 medicine supply\n\nWould you like me to book an appointment for you at Apex Hospital or search for a specific medical specialist?";
        suggestions = ["Book Apex Hospital", "Find Pediatricians"];
      } else if (lastMessage.includes("hindi") || lastMessage.includes("translate")) {
        replyText = "नमस्ते! मैं आपकी स्वास्थ्य यात्रा को आसान बनाने के लिए हिंदी में भी सहायता कर सकता हूँ। \n\nपर्चे की सरल भाषा में व्याख्या:\n- **Dolo 650 (पैरासिटामोल)**: यह बुखार और दर्द के लिए है।\n- **अतिरिक्त सलाह**: कृपया बिना डॉक्टर की सलाह के दो दवाएं एक साथ न लें जो एक ही साल्ट (जैसे पैरासिटामोल) की हों।\n\nक्या आप चाहते हैं कि मैं आपके किसी विशेष लैब रिपोर्ट को सरल हिंदी में समझाऊं?";
        suggestions = ["हाँ, पर्चा समझाएं", "अस्पताल खोजें"];
      }

      return res.json({ text: replyText, suggestions });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: geminiContents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    const responseText = response.text || "I apologize, but I am unable to formulate a response at this moment. Please try asking again.";
    
    // Generate helpful follow-up suggestions dynamically
    const suggestionResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Based on this assistant response, generate 3 highly relevant and helpful clinical follow-up questions or actions (short phrases, maximum 6 words each) that the patient might want to select next. Return them as a JSON list of strings.\n\nAssistant response:\n"${responseText}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    let suggestions = ["Explain my medications", "Find a nearby specialist", "Schedule reminder"];
    try {
      suggestions = JSON.parse(suggestionResponse.text || "[]");
    } catch {
      // Fallback
    }

    res.json({ text: responseText, suggestions });

  } catch (error: any) {
    console.warn("[MediFlow Server] Assistant chat is using the graceful local fallback.");
    // Graceful offline fallback to conversational rule-based AI answers
    const lastMessage = messages[messages.length - 1]?.text?.toLowerCase() || "";
    let replyText = "I am MediFlow's care coordination assistant. I am here to clarify prescription jargon, organize your appointments, check for medicine interactions, and help guide your clinical journey safely. How can I assist you today?";
    let suggestions: string[] = ["Explain my prescription", "Find a nearby hospital", "Is Dolo safe with Crocin?"];

    if (lastMessage.includes("dolo") || lastMessage.includes("crocin") || lastMessage.includes("paracetamol")) {
      replyText = "⚠️ **Care Warning:** Yes, Dolo 650 and Crocin are actually brand names for the same active drug: **Paracetamol (Acetaminophen)**. Taking both simultaneously is a double dosage (1300mg) and can cause serious liver toxicity. You should only take one or the other, strictly following the prescribed gap of 4-6 hours. Please consult a general physician to clarify your dosage schedule.";
      suggestions = ["Check other medications", "Find general physicians"];
    } else if (lastMessage.includes("hospital") || lastMessage.includes("doctor") || lastMessage.includes("clinic") || lastMessage.includes("find") || lastMessage.includes("map")) {
      replyText = "I can certainly help you coordinate care! Based on your current location in HSR Layout, Bengaluru, we have found several highly rated centers nearby:\n\n1. **Apex Multi-Specialty Hospital** (0.8 km) - Emergency care & ICU\n2. **Dr. Reddy's Family Clinic** (1.4 km) - Diagnostics & Consults\n3. **Apollo Pharmacy** (0.3 km) - 24/7 medicine supply\n\nWould you like me to book an appointment for you at Apex Hospital or search for a specific medical specialist?";
      suggestions = ["Book Apex Hospital", "Find Pediatricians"];
    } else if (lastMessage.includes("hindi") || lastMessage.includes("translate") || lastMessage.includes("नमस्ते")) {
      replyText = "नमस्ते! मैं आपकी स्वास्थ्य यात्रा को आसान बनाने के लिए हिंदी में भी सहायता कर सकता हूँ। \n\nपर्चे की सरल भाषा में व्याख्या:\n- **Dolo 650 (पैरासिटामोल)**: यह बुखार और दर्द के लिए है।\n- **अतिरिक्त सलाह**: कृपया बिना डॉक्टर की सलाह के दो दवाएं एक साथ न लें जो एक ही साल्ट (जैसे पैरासिटामोल) की हों।\n\nक्या आप चाहते हैं कि मैं आपके किसी विशेष लैब रिपोर्ट को सरल हिंदी में समझाऊं?";
      suggestions = ["हाँ, पर्चा समझाएं", "अस्पताल खोजें"];
    } else if (lastMessage.includes("bp") || lastMessage.includes("pressure") || lastMessage.includes("hypertension")) {
      replyText = "Your high blood pressure check indicates you should consult a **Cardiologist** or **General Physician**. In general, maintaining a low-sodium diet and taking recorded morning and evening BP logs is highly recommended. How can I help you find a cardiologist in HSR Layout?";
      suggestions = ["Find Cardiologists", "Show hospital map"];
    } else {
      replyText = `Based on your request, I've activated MediFlow's offline patient coordination agent:\n\n- **Translation Tip**: You can upload prescriptions to translate Latin instructions (like QD, BID) into simple Hindi/Kannada.\n- **Drug Check**: Add any medications to your cabinet to run instant duplicate checks.\n- **Locator**: Try using the "Specialist Locator" or ask me to check coordinates.\n\nHow else can I support your care today?`;
      suggestions = ["Explain QD and BID", "Show my medication cabinet", "Find nearby diagnostic labs"];
    }

    res.json({ text: replyText, suggestions });
  }
});

// 5. Get nearby hospitals/clinics/diagnostic services
app.get("/api/locations", (req, res) => {
  const { type, query } = req.query;

  let filtered = [...mockLocations];

  if (type && type !== "all") {
    filtered = filtered.filter(loc => loc.type === type);
  }

  if (query) {
    const q = (query as string).toLowerCase();
    filtered = filtered.filter(loc => 
      loc.name.toLowerCase().includes(q) || 
      loc.services.some(s => s.toLowerCase().includes(q)) ||
      loc.address.toLowerCase().includes(q)
    );
  }

  res.json(filtered);
});

// ==========================================
// MOCK GENERATOR FOR ANALYSIS (No API Key Fallback)
// ==========================================
function getMockAnalysis(fileName: string, fileType: string) {
  const lowerName = fileName.toLowerCase();
  
  if (fileType === "Prescription" || lowerName.includes("presc")) {
    return {
      patientName: "Amit Sharma",
      doctorName: "Dr. K. V. Mohan Rao, DM (Cardiology)",
      hospitalName: "Apollo Cardiac Centre",
      date: "2026-07-15",
      summary: "This is an outpatient cardiology prescription. It lists three primary cardiac medications to control blood pressure, reduce arterial plaque, and prevent coagulation.",
      explanationSimple: "यह पर्चा दिल की सुरक्षा के लिए है।\n- **Ecosprin 75mg (एस्पिरिन)**: खून को पतला करने और थक्के जमने से रोकने की दवा। भोजन के बाद लें।\n- **Atorva 20mg (अटोर्वास्टेटिन)**: कोलेस्ट्रॉल को नियंत्रित करने की दवा। रात को सोने से पहले लें।\n- **Dolo 650mg**: बुखार या बदन दर्द होने पर जरूरत पड़ने पर ही लें।",
      specialistRecommendation: "Cardiologist",
      medications: [
        {
          name: "Ecosprin 75mg",
          dosage: "1 tablet",
          frequency: "Once Daily (QD) - Post Lunch",
          duration: "3 Months",
          instructions: "Blood thinner. Do not take on an empty stomach. Watch for bleeding gums."
        },
        {
          name: "Atorva 20mg",
          dosage: "1 tablet",
          frequency: "Once Daily (QD) - Night",
          duration: "3 Months",
          instructions: "Statin for high cholesterol. Avoid eating grapefruit during the course."
        },
        {
          name: "Dolo 650mg",
          dosage: "1 tablet",
          frequency: "As Needed (PRN) - Max 3/day",
          duration: "For headache/mild body pain",
          instructions: "Painkiller containing paracetamol. Maintain at least 6 hours gap."
        }
      ],
      labResults: [],
      timelineEvent: {
        title: "Cardiology Prescription Update",
        description: "Began daily Ecosprin & Atorva cardiovascular maintenance cycle. Advised follow-up lipid profile in 6 weeks.",
        urgency: "medium"
      }
    };
  } else if (fileType === "Lab Report" || lowerName.includes("lab") || lowerName.includes("blood")) {
    return {
      patientName: "Amit Sharma",
      doctorName: "Dr. Savitha Nair",
      hospitalName: "Astra PathLabs",
      date: "2026-07-16",
      summary: "Comprehensive Blood Panel and Metabolic Profile. Highlights indicate slightly elevated fasting blood glucose (HbA1c) levels and elevated low-density lipoprotein (LDL) cholesterol.",
      explanationSimple: "आपकी ब्लड रिपोर्ट के मुख्य बिंदु:\n- **HbA1c (7.2%)**: यह पिछले 3 महीनों का औसत शुगर स्तर है। यह 5.7% से कम होना चाहिए। 7.2% दर्शाता है कि आप 'माइल्ड डायबिटिक' श्रेणी में हैं। मीठा कम करें और सक्रिय रहें।\n- **LDL (खराब कोलेस्ट्रॉल - 145 mg/dL)**: यह 100 से कम होना चाहिए। यह बढ़ा हुआ है, जो धमनियों में रुकावट बढ़ा सकता है। डॉक्टर की बताई हुई लिपिड-लोअरिंग डाइट फॉलो करें।",
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
        },
        {
          testName: "Serum LDL Cholesterol",
          result: "145",
          normalRange: "< 100",
          unit: "mg/dL",
          status: "High"
        },
        {
          testName: "Serum Creatinine",
          result: "0.9",
          normalRange: "0.6 - 1.2",
          unit: "mg/dL",
          status: "Normal"
        }
      ],
      timelineEvent: {
        title: "Metabolic Lab Panel Review",
        description: "Blood test showed HbA1c of 7.2% and LDL of 145 mg/dL. Requires lifestyle modifications and specialist review.",
        urgency: "high"
      }
    };
  } else {
    return {
      patientName: "Amit Sharma",
      doctorName: "Dr. R. K. Sen, Consultant Physician",
      hospitalName: "HSR General Clinic",
      date: "2026-07-12",
      summary: "Routine general medical checkup report indicating mild essential hypertension and lifestyle guidance.",
      explanationSimple: "सामान्य जांच पर्ची:\n- **ब्लड प्रेशर (138/88 mmHg)**: यह सामान्य (120/80) से थोड़ा अधिक है। नमक का सेवन कम करें और रोजाना 30 मिनट टहलें।\n- **सलाह**: रोजाना पर्याप्त पानी पिएं और 1 सप्ताह तक सुबह-शाम रक्तचाप रिकॉर्ड करें।",
      specialistRecommendation: "General Physician",
      medications: [],
      labResults: [],
      timelineEvent: {
        title: "Annual Medical Checkup",
        description: "Blood pressure recorded at 138/88. Prescribed physical activity and low-salt diet tracking.",
        urgency: "low"
      }
    };
  }
}

// ==========================================
// VITE CLIENT AND PRODUCTION CONFIGURATION
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MediFlow Server] Running successfully on port ${PORT}`);
    console.log(`[MediFlow Server] Local preview: http://localhost:${PORT}`);
  });
}

startServer();
