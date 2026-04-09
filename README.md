# 🌡️ Urban Heat Island (UHI) Detector

A full-stack web application that detects, analyzes, and visualizes **Urban Heat Island** effects using real-time **Landsat 8** satellite imagery via **Google Earth Engine**. Search any city worldwide to get emissivity-corrected Land Surface Temperature data, zone-level analysis, historical trends, and AI-prioritized mitigation strategies.

---

## 📸 Demo

> _Add screenshots here — home page, results page, thermal map, charts_

---

## ✨ Features

- 🛰️ **Live Satellite Data** — Landsat 8 Collection 2 via Google Earth Engine, filtered for <20% cloud cover
- 🌡️ **LST Computation** — Emissivity-corrected Land Surface Temperature using NDVI-based proportional vegetation
- 🗺️ **Interactive Thermal Map** — Real GEE tile layers with toggleable NDVI overlay and hotspot markers
- 📊 **Zone Analysis** — Mean LST and NDVI for CBD, Industrial, Residential, Suburban, Parks, and Water zones
- 📈 **Historical Trend** — Urban vs suburban vs green area LST from 2015 to 2024
- 🌿 **NDVI Correlation** — 200-point scatter plot of vegetation index vs surface temperature
- 🥧 **Land Cover Breakdown** — Built-up, Vegetation, Water, Bare Soil, and Mixed area percentages
- 🌦️ **Seasonal Comparison** — LST and NDVI across Summer, Monsoon, Autumn, and Winter
- ⚙️ **Mitigation Simulator** — Sliders for green cover, cool roofs, and water features with real-time LST reduction and carbon offset estimates
- 🌳 **Mitigation Strategies** — 7 prioritized cooling interventions ranked by UHI severity (LOW / MODERATE / CRITICAL)
- ⚖️ **City Comparison** — Side-by-side UHI statistics for any two cities
- 📄 **PDF Export** — Download a full analysis report
- 📱 **Responsive Design** — Mobile, tablet, and desktop layouts

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite, Tailwind CSS, Recharts, Leaflet |
| Backend | Python Flask REST API |
| Satellite | Google Earth Engine (`earthengine-api`) |
| Geocoding | Geopy (Nominatim / OpenStreetMap) |
| Animation | Framer Motion |
| PDF Export | jsPDF + html2canvas |

---

## 📁 Project Structure

```
uhi-detector/
├── backend/
│   ├── app.py              # Flask API — all route handlers
│   ├── gee_analysis.py     # GEE logic: LST, NDVI, zones, hotspots, tiles, trends, seasonal
│   ├── geocoder.py         # City name → bounding box via Nominatim
│   ├── mitigation.py       # Strategy engine + mitigation simulator
│   └── requirements.txt
└── frontend/
    └── src/
        ├── components/     # BeforeAfterSlider, HeatMap, TrendChart, ZoneChart, etc.
        ├── pages/          # Home.jsx + Results.jsx
        ├── api/            # Axios service (uhiService.js)
        ├── utils/          # shareLink.js
        ├── App.jsx
        └── main.jsx
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- A [Google Earth Engine](https://earthengine.google.com/) account with a Cloud project

### 1. Clone the repository

```bash
git clone https://github.com/ankur8178/uhi-detector.git
cd uhi-detector
```

### 2. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Authenticate Google Earth Engine

```bash
python -c "import ee; ee.Authenticate()"
```

Sign in with the Google account that has GEE access.

#### Set your GEE Project ID

Open `backend/gee_analysis.py` and replace:

```python
ee.Initialize(project='your-gee-project-id')
```

with your actual project ID from [Google Cloud Console](https://console.cloud.google.com).

#### Start the Flask server

```bash
python app.py
# Runs on http://127.0.0.1:5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

API calls to `/api/*` are proxied to `localhost:5000` via `vite.config.js`.

---

## 🔌 API Reference

All endpoints accept GET requests and return JSON.

| Endpoint | Parameters | Description |
|---|---|---|
| `/api/analyze` | `city` | Full UHI analysis — LST, NDVI, zones, land cover, hotspots, map tiles |
| `/api/trend` | `city` | Historical LST trend 2015–2024 (urban / suburban / green) |
| `/api/seasonal` | `city`, `year` | LST and NDVI by season (Summer, Monsoon, Autumn, Winter) |
| `/api/compare` | `city1`, `city2` | Side-by-side UHI analysis for two cities |
| `/api/simulate` | `city`, `greenPct`, `roofPct`, `waterPct` | Mitigation simulation with LST drop and carbon offset |

#### Example

```bash
curl "http://localhost:5000/api/analyze?city=Mumbai"
curl "http://localhost:5000/api/compare?city1=Delhi&city2=Chennai"
curl "http://localhost:5000/api/simulate?city=Bengaluru&greenPct=20&roofPct=10&waterPct=5"
```

#### Sample Response — `/api/analyze`

```json
{
  "city": "Mumbai",
  "uhi_intensity": 3.38,
  "urban_lst": 42.1,
  "rural_lst": 38.72,
  "peak_lst": 48.86,
  "avg_ndvi": 0.043,
  "hotspot_count": 5,
  "zone_stats": { "CBD": { "lst": 45.2, "ndvi": 0.02 }, "Parks": { "lst": 33.1, "ndvi": 0.61 } },
  "land_cover": { "Built-up": 58.3, "Vegetation": 12.1, "Water": 9.4 },
  "mitigation": { "severity": "MODERATE", "strategies": [...] }
}
```

---

## 🧠 How It Works

### Land Surface Temperature

LST is computed from Landsat 8 Band 10 (thermal infrared) using an emissivity correction:

1. **NDVI** is derived from Bands 5 (NIR) and 4 (Red)
2. **Proportion of Vegetation (Pv)** is calculated from NDVI min/max bounds
3. **Emissivity (ε)** is estimated as `ε = 0.004 × Pv + 0.986`
4. **Brightness Temperature (BT)** is retrieved from Band 10 and converted to Kelvin
5. **LST** is derived using the Planck function inversion and converted to Celsius

### UHI Intensity

UHI intensity = mean LST of the urban core (inner 40% of the bounding box) minus mean LST of the full city extent — reflecting the rural-urban temperature differential.

### Mitigation Simulator

| Intervention | LST reduction per % applied |
|---|---|
| Green cover (trees, parks) | 0.08°C / % |
| Cool / reflective roofs | 0.05°C / % |
| Water features | 0.04°C / % |

Carbon offset is estimated at 2.5 kg CO₂ per m² of green cover added.

---

## 🎨 Design

- **Fonts:** Orbitron (headings) · Share Tech Mono (data) · Rajdhani (body)
- **Theme:** Dark thermal instrument aesthetic
- **Color palette:**

| Token | Color | Use |
|---|---|---|
| `--heat1` | `#a83a1a` | Extreme heat values |
| `--heat2` | `#c45a1a` | High heat / primary CTA |
| `--cool1` | `#1e6a90` | Cool zones / NDVI |
| `--accent` | `#1d5a78` | Interactive elements |

---

## ⚙️ Configuration

| Setting | Value |
|---|---|
| Flask port | `5000` |
| Vite dev port | `5173` |
| API proxy | `/api` → `localhost:5000` (via `vite.config.js`) |
| GEE credentials | Stored locally at `~/.config/earthengine/` after authentication |
| Landsat collection | `LANDSAT/LC08/C02/T1_L2` |
| Cloud filter | `< 20%` cloud cover |
| Analysis period | `2023-01-01` to `2024-12-31` (median composite) |

---

## 🐛 Troubleshooting

| Problem | Solution |
|---|---|
| `GEE initialization failed` | Run `python -c "import ee; ee.Authenticate()"` and re-run |
| `pip` not found | Use `pip3` or `python3 -m pip` |
| Map tiles not loading | Check that the GEE tile URL is returned in the `/api/analyze` response |
| CORS error in browser | Ensure Flask is running on port 5000 before starting Vite |
| `venv` not found | Run `python3 -m venv venv` first |
| Seasonal data empty | Some season/year combinations have insufficient Landsat coverage — try a different year |

---

## 📦 Dependencies

### Backend (`requirements.txt`)
```
flask
flask-cors
earthengine-api
geopy
numpy
```

### Frontend (`package.json`)
```
react, react-dom, react-router-dom
react-leaflet, leaflet
recharts
axios
framer-motion
jspdf, html2canvas
```

---

## 🙏 Acknowledgements

- [Google Earth Engine](https://earthengine.google.com/) — satellite data platform
- [Landsat 8 Collection 2](https://www.usgs.gov/landsat-missions/landsat-8) — USGS / NASA
- [OpenStreetMap / Nominatim](https://www.openstreetmap.org/) — geocoding
- [CARTO Dark Matter](https://carto.com/basemaps/) — base map tiles

---

## 📄 License

MIT License — free to use for educational and research purposes.