from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.api.router import api_router
from fastapi.middleware.cors import CORSMiddleware
import asyncpg
from app.infra.database import database

@asynccontextmanager
async def lifespan(app: FastAPI):
    database.pool = await asyncpg.create_pool(database.DB_URL)
    yield
    if database.pool:
        await database.pool.close()

app = FastAPI(
    title="Portfolio Backend API",
    description="Basic FastAPI backend for the portfolio",
    version="1.0.0",
    lifespan=lifespan
)


# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Welcome to the Portfolio API. Go to /docs for Swagger UI."}
