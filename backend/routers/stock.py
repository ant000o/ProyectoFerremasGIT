from fastapi import APIRouter, HTTPException, Depends, Query
from database import get_connection
from models import StockCreate
from typing import Optional

router = APIRouter(
    prefix="/stock",
    tags=["stock"]
)

# Obtener stock por bodega (con nombre de producto)
@router.get("/")
def get_stock(bodega_id: int = Query(...)):
    db = get_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT s.id, s.cantidad, s.producto_id, p.nombre AS nombre_producto
            FROM stock s
            JOIN productos p ON s.producto_id = p.id
            WHERE s.bodega_id = %s
        """, (bodega_id,))
        return cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Crear nuevo registro de stock
@router.post("/")
def create_stock(stock: StockCreate):
    db = get_connection()
    cursor = db.cursor()

    # Comprobar si ya existe el stock para ese producto en esa bodega
    cursor.execute("SELECT * FROM stock WHERE producto_id = %s AND bodega_id = %s",
                   (stock.producto_id, stock.bodega_id))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Stock ya existe para este producto en esta bodega")

    cursor.execute("""
        INSERT INTO stock (producto_id, bodega_id, cantidad)
        VALUES (%s, %s, %s)
    """, (stock.producto_id, stock.bodega_id, stock.cantidad))
    db.commit()
    return {"message": "Stock creado exitosamente"}


# Actualizar stock
@router.put("/{stock_id}")
def update_stock(stock_id: int, updated_stock: StockCreate):
    db = get_connection()
    cursor = db.cursor()

    cursor.execute("SELECT * FROM stock WHERE id = %s", (stock_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Stock no encontrado")

    cursor.execute("""
        UPDATE stock
        SET producto_id = %s, bodega_id = %s, cantidad = %s
        WHERE id = %s
    """, (updated_stock.producto_id, updated_stock.bodega_id, updated_stock.cantidad, stock_id))
    db.commit()
    return {"message": "Stock actualizado correctamente"}


# Eliminar stock
@router.delete("/{stock_id}")
def delete_stock(stock_id: int):
    db = get_connection()
    cursor = db.cursor()

    cursor.execute("SELECT * FROM stock WHERE id = %s", (stock_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Stock no encontrado")

    cursor.execute("DELETE FROM stock WHERE id = %s", (stock_id,))
    db.commit()
    return {"message": "Stock eliminado correctamente"}
