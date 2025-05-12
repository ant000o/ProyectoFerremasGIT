from fastapi import APIRouter, HTTPException
from models import VentaCreate, Venta
from database import get_connection

router = APIRouter(
    prefix="/ventas",
    tags=["ventas"]
)

@router.post("/")
def create_venta(venta: VentaCreate):
    db = get_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT stock FROM productos WHERE id = %s", (venta.producto_id,))
    producto = cursor.fetchone()
    if not producto or producto["stock"] < venta.cantidad:
        raise HTTPException(status_code=400, detail="Stock insuficiente")

    cursor.execute("""
        INSERT INTO ventas (cliente_id, producto_id, cantidad, total)
        VALUES (%s, %s, %s, %s)
    """, (venta.cliente_id, venta.producto_id, venta.cantidad, venta.total))
    db.commit()

    cursor.execute("""
        UPDATE productos
        SET stock = stock - %s
        WHERE id = %s
    """, (venta.cantidad, venta.producto_id))
    db.commit()

    return {"message": "Venta registrada exitosamente"}

@router.get("/")
def get_ventas():
    db = get_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT v.*, u.username AS cliente_nombre, p.nombre AS producto_nombre
        FROM ventas v
        JOIN usuarios u ON v.cliente_id = u.id
        JOIN productos p ON v.producto_id = p.id
    """)
    ventas = cursor.fetchall()
    return ventas

@router.get("/{venta_id}")
def get_venta(venta_id: int):
    db = get_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM ventas WHERE id = %s", (venta_id,))
    venta = cursor.fetchone()

    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")

    return venta

@router.put("/{venta_id}")
def update_venta(venta_id: int, updated_venta: VentaCreate):
    db = get_connection()
    cursor = db.cursor(dictionary=True)

    # Obtener la venta original
    cursor.execute("SELECT * FROM ventas WHERE id = %s", (venta_id,))
    venta_anterior = cursor.fetchone()
    if not venta_anterior:
        raise HTTPException(status_code=404, detail="Venta no encontrada")

    producto_anterior_id = venta_anterior["producto_id"]
    cantidad_anterior = venta_anterior["cantidad"]

    # Revertir stock anterior
    cursor.execute("""
        UPDATE productos
        SET stock = stock + %s
        WHERE id = %s
    """, (cantidad_anterior, producto_anterior_id))

    # Verificar si hay suficiente stock del nuevo producto
    cursor.execute("SELECT stock FROM productos WHERE id = %s", (updated_venta.producto_id,))
    producto_nuevo = cursor.fetchone()
    if not producto_nuevo or producto_nuevo["stock"] < updated_venta.cantidad:
        db.rollback()
        raise HTTPException(status_code=400, detail="Stock insuficiente para el producto actualizado")

    # Descontar stock del nuevo producto
    cursor.execute("""
        UPDATE productos
        SET stock = stock - %s
        WHERE id = %s
    """, (updated_venta.cantidad, updated_venta.producto_id))

    # Actualizar la venta
    cursor.execute("""
        UPDATE ventas
        SET cliente_id = %s, producto_id = %s, cantidad = %s, total = %s
        WHERE id = %s
    """, (
        updated_venta.cliente_id,
        updated_venta.producto_id,
        updated_venta.cantidad,
        updated_venta.total,
        venta_id
    ))

    db.commit()
    return {"message": "Venta actualizada correctamente y stock ajustado"}

@router.delete("/{venta_id}")
def delete_venta(venta_id: int):
    db = get_connection()
    cursor = db.cursor(dictionary=True)

    # Obtener los datos de la venta antes de eliminarla
    cursor.execute("SELECT * FROM ventas WHERE id = %s", (venta_id,))
    venta = cursor.fetchone()

    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")

    producto_id = venta["producto_id"]
    cantidad = venta["cantidad"]

    # Reponer stock del producto
    cursor.execute("""
        UPDATE productos
        SET stock = stock + %s
        WHERE id = %s
    """, (cantidad, producto_id))

    # Eliminar la venta
    cursor.execute("DELETE FROM ventas WHERE id = %s", (venta_id,))
    db.commit()

    return {"message": "Venta eliminada correctamente y stock repuesto"}


