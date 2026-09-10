# LankaLens FastAPI Backend Engine

Precision Cartography & Intelligent Tourism API for Sri Lanka built with **Python 3.14** and **FastAPI**.

---

## ⚡ Architecture & API Endpoints

- **`GET /api/health`** — Health check status (`online`)
- **`GET /api/destinations`** — Query curated Sri Lanka landmarks by category, region, and search query
- **`GET /api/planner`** — 10-day Ceylon itinerary details & budget breakdown data
- **`POST /api/ai-assistant/query`** — Intelligent AI travel assistant response generator with destination cards
- **`GET /api/sustainability/density`** — Real-time crowd density thresholds for Recharts visualization
- **`POST /api/sustainability/report`** — Submit ranger field hazard reports
- **`GET /api/community/posts`** — Explorer dispatches feed & community reviews

---

## 🚀 How to Run the FastAPI Server

1. Open a terminal in `backend/`:
   ```bash
   cd backend
   ```
2. Activate virtual environment and run Uvicorn server:
   ```bash
   .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
   ```
3. Interactive API documentation is available at:
   - **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
