from fastapi import APIRouter, HTTPException
from database import get_connection
from models import BodegaCreate

router = APIRouter(
    prefix="/bodegas",
    tags=["bodegas"]
)


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


@router.post("/")
def crear_bodega(bodega: BodegaCreate):
    db = get_connection()
    cursor = db.cursor()

    try:
        cursor.execute(
            "INSERT INTO bodegas (nombre, direccion) VALUES (%s, %s)",
            (bodega.nombre, bodega.direccion)
        )
        db.commit()
        return {"message": "Bodega creada correctamente", "bodega_id": cursor.lastrowid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{bodega_id}")
def actualizar_bodega(bodega_id: int, bodega: BodegaCreate):
    db = get_connection()
    cursor = db.cursor()

    cursor.execute(
        "UPDATE bodegas SET nombre = %s, direccion = %s WHERE id = %s",
        (bodega.nombre, bodega.direccion, bodega_id)
    )
    db.commit()

    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Bodega no encontrada")

    return {"message": "Bodega actualizada correctamente"}


@router.delete("/{bodega_id}")
def eliminar_bodega(bodega_id: int):
    db = get_connection()
    cursor = db.cursor()

    cursor.execute("DELETE FROM bodegas WHERE id = %s", (bodega_id,))
    db.commit()

    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Bodega no encontrada")

    return {"message": f"Bodega con ID {bodega_id} eliminada correctamente"}
