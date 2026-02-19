from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routes import stream, podcast, admin
from app.utils.rate_limiter import limiter

from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware


# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Podcast TTS API",
    description="LLM + TTS Podcast Generator",
    version="1.0.0"
)

# -------------------------
# Rate Limiter Setup
# -------------------------

app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"error": "Rate limit exceeded"}
    )


# -------------------------
# CORS Middleware
# -------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust origins as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# Static Files (IMPORTANT)
# -------------------------

# This allows serving generated MP3 files
app.mount("/output", StaticFiles(directory="output"), name="audio")

# Serve static files, including favicon
app.mount("/frontend", StaticFiles(directory="frontend"), name="frontend")

# Ensure static files (CSS, JS) are served
app.mount("/static", StaticFiles(directory="frontend"), name="static")


# -------------------------
# Routers
# -------------------------

app.include_router(stream.router, prefix="/stream", tags=["Streaming"])
app.include_router(podcast.router, prefix="/podcast", tags=["Podcast"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])


# -------------------------
# Health Check Endpoint
# -------------------------

# Serve the frontend index.html
@app.get("/", response_class=HTMLResponse)
async def serve_frontend():
    with open("frontend/index.html", "r") as file:
        return HTMLResponse(content=file.read(), status_code=200)


# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok"}