# NER-LINK AI
### AI-Based Smart Logistics and Accessibility Intelligence Platform for the North Eastern Region (NER)

---

## 1. Problem Statement

The North Eastern Region (NER) of India—comprising Arunachal Pradesh, Assam, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, and Tripura—presents one of the most logistically challenging operating environments in the world.

### Key Regional Challenges:
- **Rugged Mountain Topography**: Steep elevation gradients, narrow single-lane ghat roads, and vulnerable mountain passes create extreme transit friction.
- **Monsoon Cloudbursts & Flooding**: Prolonged torrential rainfall triggers flash floods, submerged riverine valleys (notably the Brahmaputra and Barak basins), and road degradation.
- **Recurring Landslides & Rockfalls**: Critical arterial corridors (such as NH-06 connecting Meghalaya to Mizoram/Tripura, NH-10 into Sikkim, and NH-29 connecting Nagaland and Manipur) are repeatedly severed by slope failures during heavy precipitation.
- **Supply Chain Fragility**: When key arterial highways are blocked, state capitals and remote districts face immediate stockouts of life-saving medical supplies, blood plasma, food grains, fuel, and relief materials.
- **Siloed & Reactive Operations**: Conventional logistics systems rely on post-facto road closure notifications rather than predictive disruption intelligence, leading to stranded vehicle convoys and delayed disaster response.

**Why NER-LINK AI is Required**:
NER-LINK AI bridges this gap by unifying real-time meteorology, terrain elevation analysis, machine-learning disruption forecasting, live field officer reporting, and explainable decision-support AI into a single operational platform.

---

## 2. Solution Overview

**NER-LINK AI** is an AI-powered logistics intelligence and decision-support platform engineered specifically for the North Eastern Region. Rather than claiming autonomous control over physical transport, NER-LINK acts as an **operational co-pilot** for dispatchers, emergency management authorities, civil supplies officers, and fleet operators.

The platform synthesizes nine interconnected intelligence layers:
```
GIS Mapping + Live Weather + ML Risk Engine + Route Intelligence + Fleet Telemetry
     + Field Officer Reports + Real-Time Alerts + Emergency Mode + AI Assistant
                                    ↓
              Actionable Logistics Intelligence & Decision Support
```

- **Proactive Risk Forecasting**: Predicts corridor disruptions before vehicles depart rather than reacting after roads are blocked.
- **Explainable Factor Attribution**: Unpacks risk scores into concrete, physical drivers (rainfall volume, slope gradient, active bottlenecks, pavement condition).
- **Mission Optimization**: Recommends validated bypass corridors with estimated transit delays and terrain-adjusted fuel projections.
- **Grounded AI Interaction**: Enables operators to query platform intelligence in plain English and Hinglish with zero hallucination.

---

## 3. Key Features

### Command Center
- **Executive Telemetry Overview**: Live metrics tracking all 8 NER states, active arterial corridors, synchronized alerts, delayed vehicles, and grounded field reports.
- **Disaster Protocol Controller**: 1-click activation of regional Emergency / Disaster Mode, reprioritizing the dashboard for humanitarian transit.
- **Interactive Drill-Downs**: Every summary card (States Monitored, Critical Corridors, Active Alerts, Delayed Vehicles) functions as a 1-click filter that navigates to detailed subsystem views.
- **Continuous System Clock**: Real-time operational clock displaying standard transit time.

### GIS Intelligence
- **Regional Topological Mapping**: Visualizes all 18 major NER commercial hubs, multimodal junctions, and strategic border transit nodes across dark-mode CartoDB GIS tiles.
- **Layer Toggles**: Real-time overlay of active incidents, live vehicle fleet positions, high-risk arterial corridors, and precipitation heatmaps.
- **Corridor Interactivity**: Clickable transit nodes and road polylines showing elevation, connecting highways, and local weather advisories.

### Route Intelligence
- **Hub-to-Hub Routing**: Calculates primary and alternative corridors between any pair of NER locations using live OSRM routing with seamless fallback to topological highway coordinates.
- **Multi-Route Risk Classification**: Color-codes both the map polylines and route comparison cards using a unified classification standard:
  - 🟢 **LOW / SAFEST** ($\le 35/100$): Normal highway transit; minimal disruption friction.
  - 🟡 **MODERATE RISK** ($36-65/100$): Elevated weather or slope friction; daylight convoy transit advised.
  - 🔴 **HIGH / CRITICAL** ($> 65/100$): Active landslide risk, heavy waterlogging, or physical roadblock; diversion strongly recommended.
- **Multi-Factor Route Comparison**: Compares distance (km), estimated transit time, anticipated delay (minutes), accessibility index (%), and ML disruption probability side-by-side.

### Explainable Risk Breakdown
- **Deterministic Factor Attribution**: Decomposes the overall route risk score into 5 physical contributors:
  1. *Heavy Rainfall & Precipitation* ($+0$ to $+35$)
  2. *Landslide Zone & Slope Gradient* ($+0$ to $+35$)
  3. *Active Roadblocks & Incidents* ($+0$ to $+25$)
  4. *Road & Infrastructure Condition* ($+0$ to $+18$)
  5. *Traffic & Sector Congestion* ($+0$ to $+12$)
- **Visual Progress Bars**: Displays exact point additions that strictly sum to the final ML risk score.
- **Contextual AI Operational Advice**: Delivers tactical advisories explaining the mathematical drivers rather than inventing arbitrary numbers.

### Predictive Disruption Timeline
- **Multi-Hour Risk Trajectory**: Projects risk progression across 3 operational horizons:
  - **NOW**: Measured live status (`LIVE STATUS` badge, 🟢 / 🟡 / 🔴) based on current weather and ground reports.
  - **+2 HOURS**: Near-term projected risk (`PREDICTED RISK` badge) incorporating meteorological rain velocity curves and slope drainage friction.
  - **+5 HOURS**: Extended forecast risk (`PREDICTED RISK` badge) evaluating cumulative soil saturation and high-elevation mudslide susceptibility.
- **Clear Demarcation**: Explicitly labels future predictions as model-derived forecasts to prevent operational confusion.

### Fleet Tracking
- **Vehicle Telemetry**: Tracks vehicle IDs, driver contacts, cargo classifications, origins, destinations, current coordinates, and real-time speeds.
- **Delay Identification**: Flags delayed or halted vehicles with calculated delay minutes and assigned risk levels.
- **Status Filtering**: 1-click status filtering (`ALL`, `IN TRANSIT`, `DELAYED`, `HALTED`, `DELIVERED`).

### Field Reports
- **Ground Officer Intelligence**: Allows field personnel to submit geo-tagged incident reports (landslides, bridge damage, waterlogging, rockfalls) with severity classifications.
- **Offline Draft Persistence**: Caches field reports locally in the browser if internet connectivity is lost in remote mountain sectors.
- **Automatic System Ripple**: Automatically synthesizes submitted field reports into active emergency alerts and recalculates intersecting route risk scores.

### Alert Engine
- **Multi-Tier Categorization**: Organizes alerts into `CRITICAL`, `WARNING`, and `INFO` levels.
- **Multi-Source Ingestion**: Ingests weather warnings (Open-Meteo), incident reports, route blockades, and fleet delivery delays.
- **1-Click Route Inspection**: Direct navigation from alerts to the affected transit corridor on the GIS map.

### Emergency / Disaster Mode
- **Critical Corridors Prioritization**: Elevates disrupted sectors (e.g. Silchar ↔ Aizawl, Guwahati ↔ Shillong) for instant monitoring.
- **Priority Cargo Routing**: Calculates dedicated green corridors for essential commodities (blood plasma, oxygen cylinders, food grains).
- **Disruption Impact Matrix**: Highlights isolated districts and recommends alternate military/border roads for humanitarian convoys.

### AI Assistant ("NIRA")
- **Grounded Platform Intelligence**: Natural-language operational assistant connected directly to live platform context.
- **Bilingual Query Support**: Understands both English and Hinglish corridor queries (e.g., *"Kohima se Imphal jaana hai. Safest route kaunsa hai?"*).
- **Structured Response Format**: Answers corridor questions with an exact, concise structure:
  - **Recommended Route**
  - **Risk** (LOW / MODERATE / HIGH / CRITICAL)
  - **Weather**
  - **Road Disruption**
  - **ETA**
  - **Alternative**
  - **Reason**
- **Interactive Deep-Link**: Embeds an interactive `[📍 Open in Route Intelligence]` button in responses mentioning routes, allowing 1-click navigation to the GIS map with origin and destination pre-selected.
- **Regional Boundary Guard**: Refuses to hallucinate out-of-scope queries (e.g. Mumbai to Pune) and clearly states platform boundary limits.

### Logistics Mission Simulation
- **Mission Planner**: Workflow to configure high-priority cargo runs selecting Commodity, Origin, Destination, Cargo Weight (tons), Priority, and assigned Fleet Vehicle.
- **Deterministic Fuel Consumption Formula**:
  $$\text{Fuel (Litres)} = \text{Distance (km)} \times \left(0.28 + \text{Weight (T)} \times 0.035\right) \times \left(1 + \frac{\text{AverageElevation (m)}}{3000} \times 0.25\right)$$
- **Instant Mission Summary**: Generates recommended routes, risk classification, travel time, fuel estimate (marked `ESTIMATED (PROTOTYPE FORMULA)`), corridor checkpoints, and justification.
- **Fleet & Alert Ripple**: Automatically sets assigned vehicles to `IN TRANSIT` and generates caution alerts for critical-priority runs.

### Analytics & Operational Intelligence
- **Dual-Mode Metric Toggle**:
  - `[🟢 LIVE PLATFORM DATA]`: Evaluates real-time session operations, active hazard counts, delayed vehicles, and registered logistics missions.
  - `[⚡ PROTOTYPE SIMULATION]`: Illustrates regional enterprise-scale metrics (1,284 routes analyzed, 327 risks detected, 184 hrs delay avoided) with a prominent disclaimer badge: *"Illustrative prototype metrics — not live regional statistics."*
- **Clickable Metric Drill-Downs**: Direct navigation from impact cards to Route Intelligence, Alerts, Supply Chain, and Fleet subsystems.

---

## 4. System Architecture

```
                                  USER (Browser)
                                        │
                         React 19 Frontend (Vite @ Port 3000)
             ┌──────────────────────────┴──────────────────────────┐
             │ UI Pages: CommandCenter, RouteIntel, GIS, Fleet,    │
             │   SupplyChain, Alerts, FieldReports, Analytics, AI  │
             └──────────────────────────┬──────────────────────────┘
                                        │ HTTP / REST (Vite Proxy)
                                        ▼
                       Express 4 Backend (Node.js @ Port 5000)
    ┌───────────────────────────────────┼───────────────────────────────────┐
    │                                   │                                   │
    ▼                                   ▼                                   ▼
Routing Service                 Weather Service                     ML Risk Service
- OSRM Live API                 - Open-Meteo Live API               - 12-Feature Ensemble
- Topological Fallback          - 10-Min Cache & Fallback           - Factor Attribution
- Multi-Route Generation        - Geo-hazard Indicators             - Predictive Timeline
    │                                   │                                   │
    └───────────────────────────────────┼───────────────────────────────────┘
                                        ▼
                                AI Intelligence Core
                   ┌────────────────────┴────────────────────┐
                   ▼                                         ▼
         Gemini 2.0 Flash SDK                   Grounded Platform Reasoner
      (When API Key is Provided)                   (Zero-Dep Fallback)
                   └────────────────────┬────────────────────┘
                                        │ Grounded Answers + Deep Links
                                        ▼
                        Persistent JSON Document Store
                          (server/data/nerlink_db.json)
```

---

## 5. Technology Stack

### Frontend
- **Framework**: React `19.0.1` with TypeScript `~5.8.2`
- **Build Tool**: Vite `6.2.3` with `@vitejs/plugin-react`
- **Styling**: Tailwind CSS `v4.1.14` with `@tailwindcss/vite`
- **Mapping & GIS**: Leaflet `1.9.4` and React-Leaflet `5.0.0`
- **Charts & Data Viz**: Recharts `3.10.1`
- **Animations & Motion**: Motion `12.23.24` (framer-motion successor)
- **Icons**: Lucide React `0.546.0`
- **Routing**: React Router DOM `7.18.2`

### Backend
- **Runtime**: Node.js (`>= 18.0.0`)
- **Server Framework**: Express `4.21.2`
- **TypeScript Runner**: TSX `4.21.0` (with hot reload via `tsx watch`)
- **Concurrency**: Concurrently `10.0.5`
- **CORS & Middleware**: `cors 2.8.6`, `dotenv 17.2.3`

### External Services & APIs
- **Routing**: OSRM (Open Source Routing Machine) Public Driving API
- **Weather**: Open-Meteo Global Weather Forecast API (WMO Weather interpretation)
- **Map Tiles**: CartoDB Dark Matter Web Map Service
- **Generative AI**: `@google/genai 2.4.0` (Gemini 2.0 Flash)

### Database & Storage
- **Primary Store**: Persistent JSON Document Store (`server/data/nerlink_db.json`) utilizing atomic filesystem operations.
- **Client Cache**: Browser `localStorage` for UI preferences and offline report drafts.

---

## 6. APIs & External Services

| Service | Purpose | Integration Type | Fallback Behavior |
| :--- | :--- | :--- | :--- |
| **OSRM Routing API** | Turn-by-turn road geometry, road distances, and durations | Live HTTPS (`router.project-osrm.org`) | Seamlessly switches to NER Topological Highway Graph with Haversine distance scaling. |
| **Open-Meteo Forecast API** | Real-time precipitation, temperature, wind speed, and weather codes | Live HTTPS (`api.open-meteo.com`) | In-memory 10-minute cache; switches to regional elevation-precipitation meteorological model. |
| **CartoDB Dark Matter** | High-contrast dark GIS map tiles for Leaflet canvas | Live HTTPS tile provider | Standard OpenStreetMap fallback tiles. |
| **Google Gemini API** | Natural language synthesis for the AI Assistant | Live HTTPS (`@google/genai` SDK) | Grounded Platform Reasoner runs locally with zero external dependencies when API key is missing. |

> [!NOTE]
> **API Key Safety**: No API keys or credentials are hardcoded in source files. External keys are loaded strictly via environment variables.

---

## 7. Data Classification

To maintain scientific integrity and transparency for judges, operators, and developers, data displayed across NER-LINK AI is strictly categorized into four tiers:

| Data Classification Tier | Definition | Examples in Platform |
| :--- | :--- | :--- |
| **LIVE DATA** | Real-time values fetched from active external network services or ground inputs. | Open-Meteo precipitation, OSRM road coordinates, active incident reports, registered fleet telemetry. |
| **MODEL PREDICTION** | Mathematical outputs derived from the 12-feature ML disruption risk ensemble. | Disruption probability (%), corridor risk score (0–100), predictive disruption timeline (+2H, +5H). |
| **ESTIMATED** | Values calculated using documented deterministic engineering formulas. | Mission fuel consumption formula, estimated transit delay minutes, accessibility index. |
| **DEMO / SIMULATED** | Illustrative sample metrics used to demonstrate enterprise behavior where regional production history is unavailable. | Prototype Simulation metrics in Analytics (e.g. 1,284 routes analyzed, 184 hrs delay avoided). |

---

## 8. Project Structure

```
sih/
├── ml/                                 # Machine Learning Artifacts
│   └── models/
│       └── ner_risk_model.json         # Normalized weights for 12 disruption features
├── server/                             # Express REST API Backend
│   ├── data/
│   │   └── nerlink_db.json             # Persistent JSON document store
│   ├── db/
│   │   └── database.ts                 # Database controller and CRUD operations
│   ├── routes/                         # Express API route controllers
│   │   ├── activities.ts               # Audit log & user activity feed
│   │   ├── ai.ts                       # AI Assistant endpoint (/api/v1/ai/chat)
│   │   ├── emergency.ts                # Emergency corridors & recommendations
│   │   ├── health.ts                   # System health check endpoint
│   │   ├── incidents.ts                # Alerts & active incident management
│   │   ├── missions.ts                 # Logistics Mission Simulation endpoints
│   │   ├── ml.ts                       # Direct ML risk prediction endpoint
│   │   ├── notifications.ts            # System broadcast notifications
│   │   ├── reports.ts                  # Field officer ground report endpoints
│   │   ├── routes.ts                   # Route calculation & corridor endpoints
│   │   ├── shipments.ts                # Standard cargo shipments CRUD
│   │   ├── states.ts                   # State-wise connectivity metrics
│   │   ├── vehicles.ts                 # Fleet telemetry and GPS status
│   │   └── weather.ts                  # Open-Meteo integration & caching
│   ├── services/                       # Core Backend Services
│   │   ├── aiService.ts                # Intent detection, context grounding & Gemini
│   │   ├── emergencyService.ts         # Critical corridor & emergency route engine
│   │   ├── mlRiskService.ts            # 12-feature risk model & factor attribution
│   │   ├── routingService.ts           # OSRM routing, topological fallback & timeline
│   │   └── weatherService.ts           # Open-Meteo weather fetcher & geo-hazard indices
│   └── index.ts                        # Express server entrypoint (Port 5000)
├── src/                                # React 19 Frontend
│   ├── components/                     # Reusable UI & Layout Components
│   │   ├── layout/                     # Sidebar, Navigation, Header, Clock
│   │   └── ui/                         # Card, Badge, Modal, AnimatedCounter
│   ├── contexts/                       # React Context Providers
│   │   └── DataContext.tsx             # Shared state for vehicles, alerts, shipments
│   ├── data/                           # Static Reference Datasets
│   │   └── nerLocations.ts             # 18 NER hubs with coordinates and elevation
│   ├── pages/                          # Application Screen Views
│   │   ├── AiAssistant.tsx             # Grounded AI Chat with deep links
│   │   ├── Alerts.tsx                  # Hazard alerts & incident filters
│   │   ├── Analytics.tsx               # Live vs. Prototype Impact Analytics
│   │   ├── CommandCenter.tsx           # Primary operational command dashboard
│   │   ├── Districts.tsx               # District accessibility status
│   │   ├── FieldReports.tsx            # Officer report drafting & synchronization
│   │   ├── FleetTracking.tsx           # Fleet GPS status and delay monitoring
│   │   ├── MapPage.tsx                 # Fullscreen GIS map intelligence
│   │   ├── RouteIntelligence.tsx       # Route calculation, breakdown & timeline
│   │   ├── Settings.tsx                # Theme (Dark/Light/System) & configs
│   │   └── SupplyChain.tsx             # Logistics Mission Simulation & shipments
│   ├── services/
│   │   └── api.ts                      # Frontend API client with fallback handling
│   ├── types.ts                        # TypeScript interfaces across platform
│   ├── App.tsx                         # Router configuration & providers
│   └── main.tsx                        # Application DOM mount
├── package.json                        # Project dependencies and run scripts
├── vite.config.ts                      # Vite configuration with proxy to port 5000
└── README.md                           # Master project documentation
```

---

## 9. Local Development

### Prerequisites
- **Node.js**: `v18.0.0` or higher (tested on Node `v20.x` and `v24.x`)
- **npm**: `v9.0.0` or higher

### Installation
Clone the repository and install all required frontend and backend dependencies:
```bash
git clone https://github.com/shivamkr0271-ai/SIH-26002.git
cd sih
npm install
```

### Environment Variables
Create an `.env` file in the project root (optional for basic operation):
```env
# Optional: Set your Gemini API Key for LLM-powered natural language synthesis.
# If omitted, the platform automatically utilizes its built-in Grounded Platform Reasoner.
GEMINI_API_KEY=your_gemini_api_key_here

# Server Port (Default: 5000)
PORT=5000
```
> [!IMPORTANT]
> Never commit `.env` files containing real API credentials to public repositories.

### Run Development Environment
Start both the Express backend and the Vite frontend simultaneously with a single command:
```bash
npm run dev:all
```
This launches:
- **Express API Backend**: `http://localhost:5000` (Direct REST API)
- **Vite React Frontend**: `http://localhost:3000` (Application Web UI with `/api` proxy)

---

## 10. Build & Testing

### TypeScript Verification
Ensure 100% type safety with zero compilation errors:
```bash
npm run lint
# Or directly:
npx tsc --noEmit
```
*Current Verified Status*: **0 Errors**

### Production Build
Compile the optimized static bundle:
```bash
npm run build
```
*Current Verified Status*: **Built cleanly in 16.65s (0 errors)**

### Automated Verification Suites
Execute the automated end-to-end regression suites:
```bash
# Phase 9 Comprehensive Suite (Missions, Explainable Risk, Timeline, AI, Boundary Guard)
node test_phase9.mjs
# Verified Result: 12/12 PASSED (100%)

# Route Intelligence E2E Suite (7 Corridors, OSRM, Topological Fallback, Error Handling)
node test_route_intelligence_e2e.mjs
# Verified Result: 53/53 PASSED (100%)

# Route Risk Color Classification Suite (Green, Yellow, Red thresholds)
node test_route_risk_visualization.mjs
# Verified Result: 11/11 PASSED (100%)

# SIH Full 12-Step Demo Readiness Suite
node test_phase7_sih_demo.mjs
# Verified Result: 13/13 PASSED (100%)
```

---

## 11. API Endpoints

All endpoints are hosted under `/api/v1` on Port 5000 (proxied via Vite on Port 3000):

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | System health check and database summary |
| `POST` | `/api/v1/routes/calculate` | Calculates multi-route options, risk breakdown, and predictive timeline |
| `GET` | `/api/v1/routes/locations` | Returns all 18 NER hubs with coordinates and elevation |
| `GET` | `/api/v1/missions` | Returns active logistics missions list |
| `POST` | `/api/v1/missions` | Calculates, optimizes, and registers a new logistics mission |
| `POST` | `/api/v1/ai/chat` | Grounded AI Assistant endpoint (accepts user queries and conversation history) |
| `GET` | `/api/v1/ai/status` | Reports active AI provider, Gemini configuration status, and capabilities |
| `GET` | `/api/v1/emergency/summary` | Summarizes critical corridors, isolated districts, and active hazard count |
| `GET` | `/api/v1/emergency/critical-corridors` | Evaluates top arterial corridors with ML disruption scores |
| `POST` | `/api/v1/emergency/recommend-route` | Generates priority emergency relief route recommendations |
| `GET` | `/api/v1/weather/all` | Returns live Open-Meteo weather data across all 18 NER hubs |
| `GET` | `/api/v1/vehicles` | Returns live fleet tracking status (also available at `/api/v1/fleet`) |
| `GET` | `/api/v1/incidents` | Returns all active alerts and hazard incidents |
| `GET` | `/api/v1/reports` | Returns synced field officer ground reports |
| `POST` | `/api/v1/reports` | Ingests a new ground officer report and triggers alert synthesis |
| `POST` | `/api/v1/reset` | Resets the JSON document store to initial seeded demo data |

---

## 12. AI Intelligence Architecture

```
User Query: "Kohima se Imphal jaana hai. Safest route kaunsa hai?"
                                 │
                                 ▼
                     1. Intent & Entity Extraction
       (Extracts: Origin = Kohima, Destination = Imphal, Intent = SPECIFIC_CORRIDOR)
                                 │
                                 ▼
                     2. Regional Boundary Check
             (Locations confirmed inside North Eastern Region)
                                 │
                                 ▼
                     3. Live Context Aggregation
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
   Corridor Routing        Open-Meteo API         Active Incidents
   - Primary: 138 km       - Rain: 12 mm          - No critical blockades
   - Alt: +38 km bypass    - Elevation: 1444m     - Clear transit status
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                                 ▼
                     4. ML Risk Model Evaluation
         (Risk Score = 39.8/100, Level = MODERATE, Predicted Delay = +43m)
                                 │
                                 ▼
               5. Response Generation & Source Grounding
     (Generates Structured Format: Recommended Route, Risk, Weather, Delay, ETA)
                                 │
                                 ▼
               6. Interactive Action Button Injection
          [📍 Open in Route Intelligence (Kohima ➔ Imphal)]
```

> [!NOTE]
> **Clear Boundary**: Gemini is used exclusively for natural-language interpretation and text formatting. The route calculations, distances, hazard intersections, and risk scores are executed directly by the deterministic backend engines.

---

## 13. Route Risk Model

### 1. Mathematical Formulation
The ML Risk Engine evaluates 12 normalized continuous and categorical features:
$$\text{RawScore} = \text{Base} + \sum_{j=1}^{12} \left(\frac{x_j - \mu_j}{\sigma_j}\right) \times w_j \times 28.0 + \text{CompoundInteraction} + \text{IncidentPenalty}$$

- **Compound Landslide Interaction**: When $\text{Elevation} > 900\text{ m}$ and $\text{Rainfall} > 25.0\text{ mm}$:
  $$\text{Penalty} = \left(\frac{\text{Rainfall}}{30.0}\right) \times \left(\frac{\text{Elevation}}{1000.0}\right) \times 2.8$$
- **Active Incident Penalty**: Each nearby incident adds $+7.5$ points, scaled by incident severity $+5.0 \times \text{Severity}$.
- **Final Risk Score**: Clamped between $5.0$ and $98.5$.

### 2. Risk Classification Thresholds
- **LOW RISK (🟢)**: Score $< 30.0$ | Disruption Prob: $0–35\%$ | Line Color: `#10b981`
- **MODERATE RISK (🟡)**: Score $30.0 – 54.9$ | Disruption Prob: $36–65\%$ | Line Color: `#f59e0b`
- **HIGH RISK (🔴)**: Score $55.0 – 77.9$ | Disruption Prob: $66–85\%$ | Line Color: `#ef4444`
- **CRITICAL RISK (🔴)**: Score $\ge 78.0$ | Disruption Prob: $86–99\%$ | Line Color: `#dc2626`

---

## 14. Security & Data Integrity

- **Environment Isolation**: Sensitive keys (`GEMINI_API_KEY`) are managed exclusively via environment variables and are never sent to the client browser.
- **Input Validation**: Backend endpoints validate location IDs, numeric weights, and parameter ranges; same-origin/destination queries are rejected with structured error codes (`SAME_ORIGIN_DESTINATION`).
- **CORS Protection**: Configured via Express CORS middleware to restrict unauthorized external cross-origin requests.
- **Fail-Safe Fallbacks**: If external APIs (OSRM, Open-Meteo, Gemini) time out or return errors, the platform automatically fails over to embedded topological models and local reasoners without crashing.

---

## 15. Limitations

As an active prototype engineered for the Smart India Hackathon, the current implementation has the following documented boundaries:
1. **Full Regional Language Localization**: Natural language parsing currently handles English and Hinglish corridor queries. Native Assamese, Bodo, Meitei, and Bengali scripts are in development.
2. **Direct Hardware Mesh Synchronization**: Ground officer reports persist locally in browser storage and sync via HTTP/REST; direct peer-to-peer Bluetooth mesh synchronization between physical radios is not yet implemented.
3. **Simulated Enterprise History**: Where multi-year regional historical logistics logs are unavailable, analytics metrics in the *Prototype Simulation* tab are clearly labeled as illustrative models.
4. **Third-Party API Rate Limits**: Public demo endpoints for OSRM and Open-Meteo may experience transient rate throttling; the platform includes topological and meteorological fallbacks to mitigate this.

---

## 16. Future Scope

- **Direct Hardware Mesh Sync**: Integration with LoRa and Bluetooth Low Energy (BLE) transceivers for device-to-device field report hopping in deep valleys.
- **Government Logistics Integration**: Direct API connectors with PM Gati Shakti, Vahan, and SARATHI national transportation databases.
- **Full Multilingual Localization**: Complete native-language user interfaces in Assamese, Bengali, Manipuri, and Bodo.
- **Satellite & Radar Precipitation Ingestion**: Integration with ISRO MOSDAC Doppler weather radar feeds for automated landslide nowcasting.
- **Multi-Vehicle Convoy Routing**: Algorithmic scheduling for military and civil supply convoys traveling through narrow single-lane mountain passes.

---

## 17. How NER-LINK Addresses the SIH Problem Statement

| SIH Problem Requirement | NER-LINK AI Implemented Feature | Implementation Location |
| :--- | :--- | :--- |
| **Real-time Accessibility Monitoring** | Live GIS state connectivity scores, corridor accessibility indices (0–100%), and interactive maps. | `CommandCenter.tsx`, `Districts.tsx`, `MapPage.tsx` |
| **Terrain & Weather Disruption Prediction** | Open-Meteo integration + Random Forest 12-feature ensemble model + 3-stage predictive timeline. | `mlRiskService.ts`, `weatherService.ts`, `RouteIntelligence.tsx` |
| **Alternative & Safe Bypass Routing** | OSRM multi-route generation with risk-classified alternate hill bypass routes. | `routingService.ts`, `RouteIntelligence.tsx` |
| **Fleet & Cargo Telemetry** | Real-time tracking of vehicle IDs, cargo types, speeds, destinations, and transit delays. | `vehicles.ts`, `FleetTracking.tsx` |
| **Automated Multi-Tier Alerts** | Dynamic alerts triggered by weather thresholds, ground hazard reports, and delivery delays. | `incidents.ts`, `Alerts.tsx` |
| **Field Ground Reporting** | Offline-capable mobile officer reports with automatic alert synthesis. | `reports.ts`, `FieldReports.tsx` |
| **Emergency Logistics Protocol** | Disaster Mode reprioritizing the dashboard for essential medical and relief cargo movement. | `emergencyService.ts`, `CommandCenter.tsx` |
| **AI Logistics Assistant** | Grounded conversational AI answering route, weather, and mission queries with zero hallucination. | `aiService.ts`, `AiAssistant.tsx` |
| **Logistics Mission Optimization** | End-to-end mission simulation with deterministic fuel formula and fleet integration. | `missions.ts`, `SupplyChain.tsx` |

---

## 18. Demonstration Flow (SIH Evaluation Walkthrough)

To experience the full capabilities of NER-LINK AI during evaluation, follow this verified 14-step demonstration flow:

1. **Command Center Overview**: Navigate to `http://localhost:3000`. Observe the continuous digital clock, the 8-state connectivity counters, and the live status indicators.
2. **Interactive Drill-Down**: Click on the **Delayed Vehicles** or **Critical Corridors** card in the Command Center to experience 1-click contextual navigation.
3. **Emergency Disaster Mode**: Click **Activate Disaster Mode** in the Command Center header. Observe the dashboard reprioritizing the top banner for essential cargo corridors.
4. **Logistics Mission Simulation**: Click **Create Mission** in the header. Configure a *Medical Supplies* mission from *Guwahati, Assam* to *Imphal, Manipur* with a cargo weight of *2.5 Tons*.
5. **Evaluate Fuel & Checkpoints**: Click **Calculate Mission & Optimize Route**. Inspect the generated Mission Summary, noting the estimated fuel consumption ($179\text{ L}$) marked with `ESTIMATED (PROTOTYPE FORMULA)`.
6. **Save & Ripple Mission**: Click **Confirm & Close**. Notice that vehicle `NER-MED-204` is automatically assigned and set to `IN TRANSIT`.
7. **View on GIS Route Map**: On the newly created mission card, click **View on GIS Route Map**.
8. **Analyze Multi-Route Options**: Observe the primary route and alternative bypass corridor rendered with strict color classification (🟢 Safest vs. 🔴 High/Critical).
9. **Inspect Explainable Risk**: Scroll down to the **Explainable Route Risk Breakdown** card. Observe the 5 progress bars showing exact point contributions summing to the route risk score.
10. **Inspect Predictive Timeline**: Review the **Predictive Disruption Timeline** cards showing the progression from `NOW` (`LIVE STATUS`) to `+2 HOURS` and `+5 HOURS` (`PREDICTED RISK`).
11. **Interact with AI Assistant**: Open the **AI Assistant** tab. Select the prompt chip: *"Kohima se Imphal jaana hai. Safest route kaunsa hai?"*.
12. **Verify Structured Response**: Observe NIRA's concise structured response containing *Recommended Route*, *Risk*, *Weather*, *Road Disruption*, *ETA*, *Alternative*, and *Reason*.
13. **Test Deep-Link Button**: Click the `[📍 Open in Route Intelligence (Kohima ➔ Imphal)]` button in the AI's response to immediately load that corridor on the GIS canvas.
14. **Toggle Analytics**: Open the **Analytics** page. Toggle between `[🟢 Live Platform Data]` and `[⚡ Prototype Simulation]` to review the transparency disclaimer and drill-down links.

---

## 19. Team & Problem Statement Details

- **Team Name**: Code Nova
- **Problem Statement ID**: SIH26002
- **Problem Statement Title**: AI-Based Smart Logistics and Accessibility Intelligence Platform for North Eastern Region (NER)
- **Category**: Software
- **Domain**: Logistics, Transportation & Disaster Management

---

## 20. License & Acknowledgements

Developed for the **Smart India Hackathon (SIH)**. Built using open data and public services provided by Open-Meteo, Project OSRM, CartoDB, and OpenStreetMap contributors.
