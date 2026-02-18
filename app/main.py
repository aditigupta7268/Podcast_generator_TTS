from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

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
# Static Files (IMPORTANT)
# -------------------------

# This allows serving generated MP3 files
app.mount("/output", StaticFiles(directory="output"), name="audio")


# -------------------------
# Routers
# -------------------------

app.include_router(stream.router, prefix="/stream", tags=["Streaming"])
app.include_router(podcast.router, prefix="/podcast", tags=["Podcast"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])


# -------------------------
# Health Check Endpoint
# -------------------------

@app.get("/")
def root():
    return {"message": "Podcast TTS API is running"}
