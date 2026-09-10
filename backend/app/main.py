from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import destinations, planner, ai_assistant, sustainability, community

app = FastAPI(
    title="LankaLens FastAPI Backend",
    description="Precision Cartography & Intelligent Tourism API for Sri Lanka",
    version="1.0.0",
)

# Configure CORS for Next.js Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(destinations.router)
app.include_router(planner.router)
app.include_router(ai_assistant.router)
app.include_router(sustainability.router)
app.include_router(community.router)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "online",
        "service": "LankaLens FastAPI Engine",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
