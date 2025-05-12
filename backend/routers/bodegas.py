from fastapi import APIRouter, HTTPException
from database import get_connection

router = APIRouter(
    prefix="/bodegas",
    tags=["bodegas"]
)

# Obtener todas las bodegas
@router.get("/")
def get_bodegas():
    db = get_connection()
    cursor = db.cursor(dictionary=True)

    try:
        cursor.execute("SELECT * FROM bodegas")
        bodegas = cursor.fetchall()
        return bodegas
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
