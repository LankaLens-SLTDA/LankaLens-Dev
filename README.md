# LankaLens Development Workspace 🇱🇰

Precision Cartography & Intelligent Tourism Web Platform for Sri Lanka.

## 🏗️ Architecture

- **Frontend**: Next.js 16 (React 19, TypeScript, Tailwind CSS, Recharts, Mapbox GL)
- **Backend**: FastAPI (Python 3.11+, Uvicorn, Supabase Python Client, Pydantic)
- **Database**: Supabase PostgreSQL

---

## 🐳 Docker Development Environment

The project includes a multi-container Docker setup for rapid local development with full hot-reloading support.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Docker Engine 20.10+ and Docker Compose v2+)

### 🚀 Quick Start with Docker Compose

1. **Clone the repository and navigate to root**:
   ```bash
   cd "d:\Tourism\LankaLens Dev"
   ```

2. **Start the containers in development mode**:
   ```bash
   docker compose up --build
   ```

   To run in detached mode (background):
   ```bash
   docker compose up -d --build
   ```

3. **Access Services**:
   - **Frontend App**: [http://localhost:3000](http://localhost:3000)
   - **FastAPI Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)
   - **FastAPI Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **FastAPI ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

4. **Stop the containers**:
   ```bash
   docker compose down
   ```

---

## 💻 Manual / Local Development Setup

### Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend Setup (Next.js)
```bash
cd frontend
npm install
npm run dev
```

---

## 🛠️ Useful Docker Commands

- **View Container Logs**:
  ```bash
  docker compose logs -f
  ```

- **Rebuild Single Service**:
  ```bash
  docker compose build backend
  docker compose build frontend
  ```

- **Check Running Containers Status**:
  ```bash
  docker compose ps
  ```