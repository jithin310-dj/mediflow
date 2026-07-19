# 🩺 MediFlow: Full-Stack AI Care Coordination Platform

MediFlow is a professional full-stack healthcare companion and care coordination application. It integrates advanced server-side AI assistance, patient-doctor portal simulations, clinical audits, medication interaction checkers, and real-time offline-state monitoring into an elegant, high-performance interface.

---

## 🏗️ Architectural Overview

MediFlow is engineered with a **hybrid full-stack architecture** optimized for security, performance, and seamless offline-capabilities.

```
                  ┌──────────────────────────────┐
                  │      React 19 Frontend       │
                  │   (Vite, Tailwind, Motion)   │
                  └──────────────┬───────────────┘
                                 │
                   JSON REST APIs│  Static Assets
                   & WebSocket   │  & Page Routing
                                 ▼
                  ┌──────────────────────────────┐
                  │       Express Backend        │
                  │         (TypeScript)         │
                  └──────────────┬───────────────┘
                                 │
               Google Gen AI SDK │ Server-Side Proxy
                                 ▼
                  ┌──────────────────────────────┐
                  │   Gemini 3.5 Flash Model     │
                  │    (Secured API Calls)       │
                  └──────────────────────────────┘
```

### 1. Unified Express + Vite Integration
* **Development Mode:** The Express backend (`server.ts`) boots using `tsx` and serves as a developer-friendly entry point. It dynamically integrates Vite in middleware mode to run Hot Module Replacement (HMR) and assets compilation smoothly.
* **Production Mode:** Express serves highly optimized static production files compiled inside the `/dist` directory. Wildcard client routing resolves back to single-page application (SPA) paths natively.

### 2. Secure Server-Side Gemini API Proxying
To prevent the leakage of sensitive API keys to browser clients, all AI logic (including health report analysis, medication checking, and assistant chat) is handled strictly on the server-side. The Express backend integrates the official `@google/genai` TypeScript SDK securely.

### 3. Graceful Offline Fallback Engine
When the Gemini API quota is exceeded (e.g., standard `RESOURCE_EXHAUSTED` rate limit states) or when the network connection is dropped, MediFlow's server-side routes automatically pivot to a **Graceful Local Fallback Engine**. This utilizes rule-based clinical analysis and structured safety patterns to continue offering critical functionality without crashing.

### 4. Real-Time Network & Cache State Indicators
The client application features a real-time connection monitor. It listens for `online` and `offline` events on the browser window, updating a visual state badge to show if the system is fully online or operating on offline-cached medical databases.

---

## 🛠️ Key Features

* **📑 Medical Report Analyzer:** Uploads reports and extracts key observations, lab benchmarks, and dynamic summaries.
* **💊 Medication interaction & Duplicate Auditor:** Monitors daily doses and audits potential contraindications or duplicates.
* **💬 Care Coordinator AI Assistant:** Conversational agent providing clarification on medical jargon and care routines.
* **📍 Hospital Locator Map:** Interactive coordinate-based mapping system for emergency rooms and facilities.
* **🚨 Emergency SOS System:** Responsive panic trigger to instantly send SOS alerts with location logs.

---

## 📁 Folder Structure

```
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI pipeline configuration
├── public/                    # Static assets served directly by the server
├── src/                       # Frontend React 19 application
│   ├── components/            # Reusable UI components
│   │   ├── AIInsightsPanel.tsx   # AI-powered insights display
│   │   ├── Chatbot.tsx           # Health Assistant Chat interface
│   │   ├── DashboardAdmin.tsx    # Administrator management dashboard
│   │   ├── DashboardDoctor.tsx   # Doctor portal with clinical overview
│   │   ├── DashboardPatient.tsx  # Patient treatment & appointment portal
│   │   ├── DocumentAISearch.tsx  # Document intelligence searching panel
│   │   ├── EmergencySOS.tsx      # Immediate location-aware panic trigger
│   │   ├── Header.tsx            # App navigation with Network status indicator
│   │   ├── HospitalMap.tsx       # Geolocation and hospital map locator
│   │   ├── JudgeDemoCompanion.tsx# Demo assistant for scenario navigation
│   │   ├── MedicineTracker.tsx   # Smart daily medicine tracking & logging
│   │   ├── ReportUploader.tsx    # PDF/Document uploader & secure proxy
│   │   └── TimelineView.tsx      # Historical health activity logs timeline
│   ├── App.tsx                # Main entry React component & routing state
│   ├── index.css              # Global styles integrated with Tailwind CSS
│   ├── main.tsx               # Frontend client-side entry-point
│   └── types.ts               # Centralized TypeScript interfaces & enums
├── .env.example               # Template for required environment variables
├── index.html                 # Main HTML template shell
├── package.json               # Dependencies and command execution scripts
├── server.ts                  # Secured full-stack Express server with Vite integration
├── tsconfig.json              # TypeScript engine compiler rules
└── vite.config.ts             # Vite modulebundler configuration
```

---

## ⚙️ Environment Configuration

Define the following environment variables in a `.env` file at the project root:

```bash
# GEMINI_API_KEY: Secured key for server-side Google GenAI model interactions
GEMINI_API_KEY="your_gemini_api_key_here"

# APP_URL: Self-referential application URL for asset pathing and routes
APP_URL="http://localhost:3000"
```

A template for these variables can be found in `.env.example`.

---

## 🚀 Getting Started & Local Development

### Prerequisites
* **Node.js** (v18.x or v20.x recommended)
* **npm** or similar package manager

### 1. Installation
Clone the repository and install the development dependencies:
```bash
npm install
```

### 2. Run the Development Server
Launches the full-stack server using dynamic TypeScript execution. The client bundle will compile and run on the same port:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build Pipeline
The build pipeline compiles both the React frontend and the Express backend into a consolidated production bundle:
```bash
npm run build
```
This script performs two major actions:
1. Compiles the React single-page app via Vite into raw static files inside `/dist`.
2. Bundles the backend TypeScript (`server.ts`) into a single, self-contained CommonJS target (`dist/server.cjs`) using `esbuild`. This encapsulates all relative paths, yielding cold-start improvements and resilient deployments.

### 4. Run Production Server
Launches the compiled production package:
```bash
npm run start
```

### 5. Cleaning Artifacts
To wipe the built binaries and clear intermediate workspaces:
```bash
npm run clean
```

---

## 🧪 CI/CD Quality Assurance

MediFlow uses GitHub Actions for continuous integration. A workflow configuration (`.github/workflows/ci.yml`) is set up to automate builds and code-quality checks on every push or pull request to the `main` branch.

### Automated Checks Included:
* **Linting & Code Auditing:** Validates that there are no type discrepancies or syntax bugs via `npm run lint`.
* **Compilation Verification:** Triggers the compilation pipeline via `npm run build` to ensure production-readiness before merges.
#   m e d i f l o w  
 