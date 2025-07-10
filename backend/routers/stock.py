from fastapi import APIRouter, HTTPException, Depends, Query
from database import get_connection
from models import StockCreate
from typing import Optional

router = APIRouter(
    prefix="/stock",
    tags=["stock"]
)

def obtener_stock_total_asignado(producto_id, excluir_stock_id=None):
    db = get_connection()
    cursor = db.cursor()

    if excluir_stock_id:
        cursor.execute(
            "SELECT SUM(cantidad) FROM stock WHERE producto_id = %s AND id != %s",
            (producto_id, excluir_stock_id)
        )
    else:
        cursor.execute(
            "SELECT SUM(cantidad) FROM stock WHERE producto_id = %s",
            (producto_id,)
        )
    resultado = cursor.fetchone()
    return resultado[0] or 0


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

    # Verifica si ya existe stock para este producto en esa bodega
    cursor.execute("SELECT * FROM stock WHERE producto_id = %s AND bodega_id = %s",
                (stock.producto_id, stock.bodega_id))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Stock ya existe para este producto en esta bodega")

    # Obtener stock total del producto
    cursor.execute("SELECT stock FROM productos WHERE id = %s", (stock.producto_id,))
    producto = cursor.fetchone()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    stock_total = producto[0]
    stock_asignado = obtener_stock_total_asignado(stock.producto_id)
    if stock_asignado + stock.cantidad > stock_total:
        raise HTTPException(status_code=400, detail=f"Stock excede el disponible. Ya asignado: {stock_asignado}, Total disponible: {stock_total}")

    # Insertar el nuevo registro
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

    # Obtener stock total del producto
    cursor.execute("SELECT stock FROM productos WHERE id = %s", (updated_stock.producto_id,))
    producto = cursor.fetchone()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    stock_total = producto[0]
    stock_asignado = obtener_stock_total_asignado(updated_stock.producto_id, excluir_stock_id=stock_id)
    if stock_asignado + updated_stock.cantidad > stock_total:
        raise HTTPException(status_code=400, detail=f"Stock excede el disponible. Ya asignado: {stock_asignado}, Total disponible: {stock_total}")

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
