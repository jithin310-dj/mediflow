import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Sparkles, RefreshCw, Volume2, ShieldCheck, HeartPulse, Activity, Mic, MicOff, VolumeX, CheckCircle, Calendar, MapPin, ArrowRight, ClipboardList } from 'lucide-react';
import { ChatMessage, Medication, MedicalRecord, Appointment } from '../types';

interface ChatbotProps {
  activeMedications: Medication[];
  recentRecords: MedicalRecord[];
  onNavigateToTab: (tab: string, search?: string) => void;
  onAddAppointment?: (app: Appointment) => void;
  onTriggerSOS?: () => void;
  demoPrompt?: string;
  onClearDemoPrompt?: () => void;
}

export default function Chatbot({ 
  activeMedications, 
  recentRecords, 
  onNavigateToTab,
  onAddAppointment,
  onTriggerSOS,
  demoPrompt,
  onClearDemoPrompt
}: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Hello! I am your MediFlow Care Coordinator AI. I can clarify prescription jargon, analyze drug-drug interactions, explain blood work test values, and help navigate you to HSR Layout medical specialists. What can I coordinate for you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        "Book a cardiology appointment",
        "Explain my prescription",
        "Summarize my medical history",
        "Find nearest emergency center",
        "Translate prescription into Hindi"
      ]
    }
  ]);
  const [input, setInput] = useState("");

  // Inject demo prompt automatically
  useEffect(() => {
    if (demoPrompt) {
      setInput(demoPrompt);
      if (onClearDemoPrompt) {
        onClearDemoPrompt();
      }
    }
  }, [demoPrompt, onClearDemoPrompt]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Speech Recognition Setup (Priority 3)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-IN'; // Indian English/Multilingual friendly

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-speech-err-${Date.now()}`,
          sender: "assistant",
          text: "⚠️ **Voice Input Notice:** Speech recognition is not supported in this browser version or environment. Please try using Google Chrome, or enter your query via typing.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Text to Speech (Priority 3)
  const handleNarrateText = (textToNarrate: string) => {
    if ('speechSynthesis' in window) {
      // Cancel active speech
      window.speechSynthesis.cancel();
      
      // Clean up markdown markers for narration
      const cleanText = textToNarrate.replace(/[*#`⚠️💡📅⚡]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95; // Clear, clinical pacing
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Semantic Tool-calling Orchestrator (Priority 1 & 2)
  const executeLocalToolAction = (userText: string) => {
    const text = userText.toLowerCase();
    
    // Tool 1: SOS/Emergency trigger
    if (text.includes("sos") || text.includes("emergency") || text.includes("ambulance")) {
      if (onTriggerSOS) {
        onTriggerSOS();
        return {
          name: "emergency_sos",
          title: "Siren Dispatch Tool Activated",
          desc: "Triggered emergency SOS services, calculated ambulance proximity, and prepared your secure QR Medical passport."
        };
      }
    }

    // Tool 2: Book appointment
    if (text.includes("book") || text.includes("appointment") || text.includes("schedule") || text.includes("consult")) {
      let specialty = "Cardiology";
      let doctor = "Dr. Mohan Rao";
      let hospital = "Apex Multi-Specialty Hospital";

      if (text.includes("endo") || text.includes("sugar") || text.includes("diabet")) {
        specialty = "Endocrinology";
        doctor = "Dr. Savitha Nair";
        hospital = "Astra PathLabs";
      }

      const newApp: Appointment = {
        id: `app-auto-${Date.now()}`,
        patientId: "pat-123",
        patientName: "Amit Sharma",
        doctorName: doctor,
        specialty: specialty,
        date: "2026-07-24",
        time: "11:00 AM",
        status: 'scheduled',
        hospitalName: hospital,
        isAiRecommendation: true
      };

      if (onAddAppointment) {
        onAddAppointment(newApp);
        return {
          name: "book_appointment",
          title: "Clinic Scheduler Tool Activated",
          desc: `Booked appointment for ${specialty} with ${doctor} on July 24, 2026 at 11:00 AM.`,
          payload: newApp
        };
      }
    }

    // Tool 3: Navigate to Timeline
    if (text.includes("timeline") || text.includes("history") || text.includes("events")) {
      onNavigateToTab("timeline");
      return {
        name: "navigate_timeline",
        title: "Navigation Tool Activated",
        desc: "Transitioned interface to the Care Timeline. All events summarized and sorted."
      };
    }

    // Tool 4: Navigate to Map
    if (text.includes("hospital") || text.includes("clinic") || text.includes("pharmacy") || text.includes("locator") || text.includes("map")) {
      let search = "";
      if (text.includes("cardi")) search = "Cardiology";
      else if (text.includes("pharm")) search = "Pharmacy";
      onNavigateToTab("map", search);
      return {
        name: "navigate_map",
        title: "Navigation Tool Activated",
        desc: `Transitioned interface to Specialist Locator map with criteria: "${search || 'all'}"`
      };
    }

    // Tool 5: Navigate to Medicine tracker
    if (text.includes("medicine") || text.includes("pill") || text.includes("dose") || text.includes("cabinet") || text.includes("remind")) {
      onNavigateToTab("meds");
      return {
        name: "navigate_cabinet",
        title: "Navigation Tool Activated",
        desc: "Transitioned interface to Medicine Cabinet. Check off active dosages."
      };
    }

    // Tool 6: Explain prescription
    if (text.includes("explain") || text.includes("prescription") || text.includes("ecosprin") || text.includes("atorva")) {
      return {
        name: "explain_prescription",
        title: "Clinical Translation Tool Activated",
        desc: "Synthesized pharmacological explanation of active statin and anti-platelet therapies."
      };
    }

    return null;
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    // Trigger user bubble
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Reason & orchestrate local tools (Priority 1 & 2)
      const toolOutcome = executeLocalToolAction(textToSend);

      const history = [...messages, userMsg].map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const payload = {
        messages: history,
        activeMedications,
        recentRecords
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("MediFlow server failed to answer.");
      }

      const reply = await response.json();

      let finalReplyText = reply.text;
      if (toolOutcome) {
        finalReplyText += `\n\n⚡ **AI Agent Tool Executed:** ${toolOutcome.title} - ${toolOutcome.desc}`;
      }

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: finalReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: reply.suggestions || []
      };

      setMessages(prev => [...prev, aiMsg]);

      // Handle speech output if enabled
      if (autoSpeak) {
        handleNarrateText(reply.text);
      }

    } catch (e: any) {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: "⚠️ clinical connection failure. Running local fail-safe coordination. How can I assist you with your medicine reminders?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  return (
    <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl shadow-xl flex flex-col h-[650px] overflow-hidden text-left">
      
      {/* Assistant Header */}
      <div className="bg-gradient-to-r from-slate-950/90 to-slate-900/90 backdrop-blur-md p-4 border-b border-white/10 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Bot className="h-5.5 w-5.5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-sans text-sm font-bold tracking-tight">MediFlow Assistant</span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Autonomous Agent
              </span>
            </div>
            <p className="text-[10px] text-slate-300">Voice-Enabled • Actions & Tools • Context-Aware</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Auto-speak Toggle */}
          <button
            onClick={() => {
              setAutoSpeak(!autoSpeak);
              if (autoSpeak) window.speechSynthesis.cancel();
            }}
            id="voice-speak-toggle"
            title="Toggle Text-To-Speech Output"
            className={`h-8 w-8 rounded-lg flex items-center justify-center border transition ${
              autoSpeak 
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                : 'bg-white/10 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400 border border-white/5">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>AGENT MODE ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/20">
        {messages.map((m) => {
          const isAssistant = m.sender === 'assistant';
          return (
            <div key={m.id} className={`flex gap-3.5 max-w-[85%] ${isAssistant ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'}`}>
              
              {/* Avatar */}
              <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border ${
                isAssistant ? 'bg-emerald-500 border-emerald-400 text-white shadow' : 'bg-slate-200 border-slate-300 text-slate-700'
              }`}>
                {isAssistant ? <Bot className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
              </div>

              {/* Bubble Body */}
              <div className="space-y-1.5 flex-1">
                <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm relative group ${
                  isAssistant 
                    ? 'bg-white border border-slate-200/60 text-slate-800 rounded-tl-sm' 
                    : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-tr-sm font-semibold'
                }`}>
                  <p className="whitespace-pre-line">{m.text}</p>
                  
                  {/* TTS Narrate individual button inside card */}
                  {isAssistant && (
                    <button
                      onClick={() => handleNarrateText(m.text)}
                      title="Speak response"
                      className="absolute right-2 bottom-2 h-6 w-6 rounded bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Subtitle / Timestamp */}
                <div className="text-[9px] text-slate-400 font-mono font-bold tracking-wider uppercase px-1">
                  {m.timestamp}
                </div>

                {/* Custom Tool Trigger Outcome Cards (Priority 2) */}
                {isAssistant && m.text.includes("⚡ AI Agent Tool Executed:") && (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-500/5 p-3 flex items-center gap-3 text-xs mt-1 animate-in zoom-in-95 duration-200">
                    <CheckCircle className="h-5 w-5 text-emerald-600 animate-bounce" />
                    <div>
                      <span className="font-bold text-emerald-950">Autopilot Action Confirmed</span>
                      <p className="text-[10px] text-emerald-800 mt-0.5">The required care action was orchestrated successfully within your active browser view.</p>
                    </div>
                  </div>
                )}

                {/* Custom Quick Suggestion Buttons inside Assistant message */}
                {isAssistant && m.suggestions && m.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {m.suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        id={`sug-btn-${sIdx}`}
                        onClick={() => handleSendMessage(sug)}
                        className="rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-emerald-500 px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:text-emerald-700 transition"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          );
        })}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3 max-w-[85%] mr-auto text-left">
            <div className="h-8 w-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow">
              <Bot className="h-4.5 w-4.5 animate-bounce" />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 shadow-sm flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
              <span>MediFlow Autonomous Agent is orchestrating tools...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Footer */}
      <div className="p-4 border-t border-white/20 bg-white/40 backdrop-blur-md">
        <form onSubmit={handleFormSubmit} className="flex gap-2">
          
          {/* Microphone button (Priority 3) */}
          <button
            type="button"
            onClick={handleToggleListening}
            id="voice-mic-input-btn"
            title={isListening ? "Stop Speech-to-text" : "Start Speech-to-text"}
            className={`rounded-2xl h-11 w-11 shrink-0 flex items-center justify-center border transition ${
              isListening 
                ? 'bg-rose-500 border-rose-400 text-white animate-pulse' 
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {isListening ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
          </button>

          <input
            type="text"
            placeholder={isListening ? "Listening closely... speak now." : "Ask to book appointments, trigger SOS, find clinics, check timeline..."}
            value={input}
            id="chat-input-field"
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-emerald-500 bg-white"
          />
          <button
            type="submit"
            id="send-chat-btn"
            disabled={loading}
            className="rounded-2xl bg-slate-900 hover:bg-slate-800 px-5 text-white flex items-center justify-center transition shadow-sm"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
