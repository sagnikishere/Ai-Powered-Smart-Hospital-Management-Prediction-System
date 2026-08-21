# MedCore Health — Hospital Stress Early Warning System

An AI-powered hospital capacity management and early warning platform that predicts potential hospital stress and capacity crises up to **7 days in advance**.

The system analyzes historical hospital data, patient admissions, bed occupancy, staffing levels, seasonal patterns, and departmental metrics to forecast upcoming risks and provide actionable recommendations before critical situations occur.

> **Predict hospital stress before it happens — so healthcare teams can act before patients are affected.**

---

## 🌟 Overview & System Highlights

* **Dual-Portal Ecosystem**: Specialized administrative dashboard for hospital operations + dedicated patient portal for hospital discovery and live status.
* **7-Day Predictive Intelligence**: AI/ML-driven bed demand and nurse-to-patient stress forecasting with confidence scoring.
* **What-If Scenario Simulator**: Real-time simulation of admission surges, staff sickness rates, and emergency bed additions.
* **Intelligent Recommendations**: Ranked mitigation strategies with impact scoring, cost estimates, and implementation timeframes.
* **Multi-Channel Alert Dispatch**: Configurable threshold-based alerting via Email (SendGrid) and Slack Webhooks with lifecycle tracking.
* **Natural-Language AI Assistant**: Interactive conversational AI for real-time querying of hospital occupancy and capacity trends.
* **Multi-Hospital Profile Management**: End-to-end hospital configuration wizard (ICU beds, emergency beds, departments, services, operating hours).

---

## 🏗️ System Architecture

```text
                               ┌─────────────────────────────────────────┐
                               │         Hospital Data Sources           │
                               │  (Admissions, Beds, Staffing, History)  │
                               └────────────────────┬────────────────────┘
                                                    │
                                                    ▼
                               ┌─────────────────────────────────────────┐
                               │          Google Cloud BigQuery          │
                               │        (Enterprise Data Storage)        │
                               └────────────────────┬────────────────────┘
                                                    │
                                                    ▼
                               ┌─────────────────────────────────────────┐
                               │             FastAPI Backend             │
                               │   - Prediction Engine (7-Day Forecast)  │
                               │   - Scenario Simulator & Stress Calc    │
                               │   - Multi-Hospital Store & Alert Engine │
                               └─────────┬─────────────────────┬─────────┘
                                         │                     │
                     ┌───────────────────┴──────┐       ┌──────┴──────────────────┐
                     ▼                          ▼       ▼                         ▼
          ┌───────────────────────┐ ┌───────────────┐ ┌───────────────────┐ ┌─────────────┐
          │ Google Cloud Vertex AI│ │  Redis Cache  │ │  SendGrid Email   │ │Slack Webhook│
          │   Gemini 1.5 Pro      │ │  (Real-Time)  │ │   Notifications   │ │   Alerts    │
          └───────────────────────┘ └───────┬───────┘ └───────────────────┘ └─────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────────────────────┐
                               │            Next.js 15 Frontend          │
                               │        (React 18 + TypeScript + CVA)    │
                               └────────────┬────────────────────────────┘
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     ▼                                             ▼
       ┌───────────────────────────┐                 ┌───────────────────────────┐
       │   Hospital Admin Portal   │                 │   Patient & Public Portal │
       │  - Real-Time KPI Monitor  │                 │  - Hospital Directory     │
       │  - Bed & Staff Forecasts  │                 │  - Live Status & Helplines│
       │  - Scenario Simulator     │                 │  - Hospital Selection     │
       │  - Smart Alert Management │                 │  - Patient Profile        │
       │  - AI Healthcare Chat     │                 │  - Emergency 112/108 Info │
       │  - Profile & Capacity Init│                 │                           │
       └───────────────────────────┘                 └───────────────────────────┘
```

---

## 🛠️ Technology Stack

### Backend
* **Runtime & Framework**: Python 3.11+ / FastAPI
* **Server**: Uvicorn (ASGI)
* **Data Validation**: Pydantic v2
* **Data Warehouse**: Google Cloud BigQuery
* **AI & LLM**: Google Cloud Vertex AI / Gemini 1.5 Pro
* **Caching**: Redis (with memory fallback)
* **Testing**: Pytest, Hypothesis (Property-Based Testing), AnyIO

### Frontend
* **Framework**: Next.js 15 (App Router, Server & Client Components)
* **Core**: React 18, TypeScript 5
* **Styling**: Tailwind CSS, Tailwind Animate, PostCSS
* **UI Components**: Radix UI Primitives (Dialog, Dropdown, Slider, Tabs, Progress), Lucide Icons
* **Charts**: Recharts
* **Authentication**: NextAuth.js (Google OAuth & Credentials)
* **Theme**: Next-Themes (Light/Dark mode)
* **Testing**: Vitest, Fast-Check

### DevOps & Infrastructure
* **Backend Deployment**: Google Cloud Run / Docker
* **Frontend Deployment**: Vercel
* **Development Automation**: PowerShell & Bash start scripts

---

## 🚀 Key Features

### 1. 🏥 Hospital Management & Predictive Dashboard
* **Real-Time KPIs**: Live monitoring of bed occupancy, staff on duty, stress percentage, and admission velocity.
* **7-Day Forward Forecasting**: Predicts daily bed demand, stress ratios, and automatically flags high-risk days (> 85% bed stress).
* **Staff Overload Risk**: Evaluates nurse-to-patient ratios and calculates risk score (0–100) with critical threshold detection (> 75%).
* **What-If Scenario Simulator**: Test operational variables:
  * Admission Surge (-30% to +100%)
  * Staff Sickness/Absenteeism Rate (0% to 50%)
  * Additional Emergency Beds
  * Instant recalculation of stress levels, budget impacts, and risk status.
* **Smart Recommendations**: Algorithmic prioritization of mitigation actions ranked by impact score, cost estimate, and time-to-implement.
* **AI Assistant**: Natural-language conversational interface to query hospital status, trends, and mitigation plans.
* **Data Management**: CSV upload with schema validation, format checking, and automated BigQuery persistence.
* **Hospital Profile & Capacity Wizard**: 5-step onboarding and setup for total beds, ICU beds, emergency beds, departments, facilities, and contact points.

### 2. 👥 Patient & Public Portal
* **Hospital Directory**: Browse and filter registered hospitals by location, departments, facilities, and emergency availability.
* **Hospital Detail Views**: Inspect real-time public capacity status (`Normal`, `Busy`, `High Demand`), available ICU/emergency beds, address, and operating hours.
* **Patient Dashboard**: Set and view your preferred hospital with direct emergency calling integration (112, 108) and wellness guidance.
* **Patient Authentication**: Seamless login and registration tailored for patients and family members.
* **Patient Profile**: Manage personal contact details and emergency medical preferences.

### 3. 🚨 Alerting & Escalation System
* Automated multi-recipient email alerts with diagnostic details.
* Slack webhook notifications with severity categorization.
* Alert lifecycle management: `New` ➔ `Acknowledged` ➔ `Resolved`.

---

## 📁 Project Structure

```text
Hospital-management/
│
├── backend/
│   ├── app/
│   │   ├── db/                     # BigQuery, Vertex AI, and Redis clients
│   │   ├── services/               # Prediction engine, alert service, upload handler
│   │   ├── models.py               # Pydantic data schemas
│   │   ├── config.py               # App configuration & environment parsing
│   │   └── main.py                 # FastAPI application routes & endpoints
│   ├── tests/                      # Pytest unit & property-based tests
│   ├── config/                     # BigQuery SQL setup & schemas
│   ├── Dockerfile                  # Container definition for Cloud Run
│   ├── requirements.txt            # Python dependencies
│   └── .env.example                # Backend environment template
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (authenticated)/    # Hospital admin routes (dashboard, simulator, alerts, chat, hospital setup)
│   │   │   ├── patient/            # Patient portal routes (auth, hospitals, dashboard, profile)
│   │   │   ├── onboarding/         # Hospital onboarding wizard
│   │   │   ├── auth/               # NextAuth sign-in and error handlers
│   │   │   ├── layout.tsx          # Root layout with metadata & viewport
│   │   │   └── page.tsx            # Main landing page
│   │   ├── components/             # Reusable UI primitives & navigation
│   │   └── lib/                    # Storage helpers, utils, and API clients
│   ├── public/                     # Static assets & icons
│   ├── package.json                # Node dependencies & scripts
│   └── .env.example                # Frontend environment template
│
├── scripts/
│   ├── start-dev.ps1               # PowerShell one-click startup script
│   ├── start-dev.sh                # Bash one-click startup script
│   ├── setup.ps1                   # PowerShell setup & dependency installer
│   └── setup.sh                    # Bash setup & dependency installer
│
├── SETUP.md                        # Detailed setup & GCP configuration guide
└── README.md                       # Main documentation
```

---

## ⚡ Quick Start Guide

### Prerequisites
* **Python 3.11+**
* **Node.js 18+**
* **Google Cloud SDK** (optional for local mock mode, required for full cloud services)
* **Redis** (optional, fallback in-memory cache included)

---

### 1. Clone the Repository
```bash
git clone https://github.com/Dakshmulundkar/Hospital-management.git
cd Hospital-management
```

---

### 2. Automated Startup (Recommended)

#### On Windows (PowerShell):
```powershell
.\scripts\start-dev.ps1
```

#### On macOS / Linux (Bash):
```bash
chmod +x ./scripts/start-dev.sh
./scripts/start-dev.sh
```

---

### 3. Manual Startup

#### Backend Setup
```bash
cd backend
python -m venv venv

# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Run FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

#### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local

# Start Next.js development server
npm run dev
```

---

## 🌐 Endpoints & URLs

| Service | URL | Description |
| :--- | :--- | :--- |
| **Landing Page** | `http://localhost:3000` | Platform homepage & portal selector |
| **Hospital Admin Dashboard** | `http://localhost:3000/dashboard` | Main hospital operations & forecast monitor |
| **Capacity Simulator** | `http://localhost:3000/simulator` | What-If stress & cost simulation engine |
| **Hospital Setup Wizard** | `http://localhost:3000/hospital/setup` | Multi-step bed capacity and profile setup |
| **Patient Portal** | `http://localhost:3000/patient/auth/login` | Patient login, registration & hospital directory |
| **Backend API Docs (Swagger)**| `http://localhost:8080/docs` | Interactive OpenAPI documentation |
| **Backend Health Check** | `http://localhost:8080/health` | Service status check |

---

## 🧪 Testing

### Backend Tests (Pytest + Hypothesis Property Testing)
```bash
cd backend
pytest
```

### Frontend Tests (Vitest + Fast-Check)
```bash
cd frontend
npm test
```

### Frontend Build Verification
```bash
cd frontend
npm run build
```

---

## 🔒 Security & Privacy

* **Authentication**: NextAuth.js session handling with Google OAuth 2.0 and Credentials provider.
* **Environment Protection**: All API keys, database credentials, and secrets isolated in `.env` configurations.
* **Data Sanitization**: CSV validation on ingestion to guard against malformed data and injection attacks.
* **Graceful Degradation**: Built-in fallback mechanisms for BigQuery, Vertex AI, and Redis when operating in offline/development modes.

> *Disclaimer: MedCore Health is an early warning decision-support system designed for capacity planning and operational management.*

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).