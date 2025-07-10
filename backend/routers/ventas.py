from fastapi import APIRouter, HTTPException
from models import VentaCompletaCreate
from database import get_connection
from datetime import datetime

router = APIRouter(prefix="/ventas", tags=["ventas"])


@router.post("/")
def registrar_venta(venta: VentaCompletaCreate):
    db = get_connection()
    cursor = db.cursor(dictionary=True)

    # Verificar stock para todos los productos
    for item in venta.productos:
        cursor.execute("SELECT stock FROM productos WHERE id = %s", (item.producto_id,))
        producto = cursor.fetchone()
        if not producto or producto["stock"] < item.cantidad:
            raise HTTPException(status_code=400, detail=f"Stock insuficiente para el producto ID {item.producto_id}")

    # Insertar en tabla 'ventas'
    cursor.execute("""
        INSERT INTO ventas (cliente_id, nombre, apellido, telefono, direccion, notas, tipo_entrega, total)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        venta.cliente_id,
        venta.nombre,
        venta.apellido,
        venta.telefono,
        venta.direccion,
        venta.notas,
        venta.tipo_entrega,
        venta.total
    ))
    venta_id = cursor.lastrowid

    # Insertar en 'detalle_ventas' y actualizar stock
    for item in venta.productos:
        cursor.execute("""
            INSERT INTO detalle_ventas (venta_id, producto_id, cantidad)
            VALUES (%s, %s, %s)
        """, (venta_id, item.producto_id, item.cantidad))

        cursor.execute("""
            UPDATE productos SET stock = stock - %s WHERE id = %s
        """, (item.cantidad, item.producto_id))

    db.commit()
    return {"message": "Venta registrada exitosamente", "venta_id": venta_id}

@router.get("/detalladas")
def obtener_ventas_detalladas():
    db = get_connection()
    cursor = db.cursor(dictionary=True)

    # Obtener todas las ventas
    cursor.execute("""
        SELECT v.*, u.username FROM ventas v
        JOIN usuarios u ON v.cliente_id = u.id
        ORDER BY v.fecha DESC
    """)
    ventas = cursor.fetchall()

    # Para cada venta, obtener los productos asociados
    for venta in ventas:
        cursor.execute("""
            SELECT dv.producto_id, dv.cantidad, p.nombre 
            FROM detalle_ventas dv
            JOIN productos p ON dv.producto_id = p.id
            WHERE dv.venta_id = %s
        """, (venta["id"],))
        venta["productos"] = cursor.fetchall()

        venta["cliente"] = {
            "id": venta["cliente_id"],
            "username": venta["username"]
        }
        del venta["cliente_id"]
        del venta["username"]

    return ventas


from pydantic import BaseModel

class EstadoUpdate(BaseModel):
    estado: str

@router.put("/{venta_id}/estado")
def actualizar_estado_venta(venta_id: int, datos: EstadoUpdate):
    db = get_connection()
    cursor = db.cursor()

    cursor.execute("UPDATE ventas SET estado = %s WHERE id = %s", (datos.estado, venta_id))
    db.commit()

    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Venta no encontrada")

    return {"message": "Estado actualizado correctamente"}

@router.delete("/{venta_id}")
def eliminar_venta(venta_id: int):
    db = get_connection()
    cursor = db.cursor()

    # Eliminar primero los detalles de la venta
    cursor.execute("DELETE FROM detalle_ventas WHERE venta_id = %s", (venta_id,))

    # Luego eliminar la venta principal
    cursor.execute("DELETE FROM ventas WHERE id = %s", (venta_id,))
    db.commit()

    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Venta no encontrada")

    return {"message": f"Venta con ID {venta_id} eliminada correctamente"}
