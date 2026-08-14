from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
def health_check():
    return {"status": "ok", "message": "Backend is healthy and running!"}
