from fastapi import APIRouter, HTTPException
from models import VentaCompletaCreate
from database import get_connection
from datetime import datetime
from pydantic import BaseModel

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
def get_ventas_detalladas():
    db = get_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT 
            v.id AS venta_id, v.fecha, v.total, v.estado,
            u.id AS cliente_id, u.username AS cliente_username,
            dv.producto_id, p.nombre AS producto_nombre, dv.cantidad
        FROM ventas v
        JOIN usuarios u ON v.cliente_id = u.id
        JOIN detalle_ventas dv ON v.id = dv.venta_id
        JOIN productos p ON dv.producto_id = p.id
        ORDER BY v.fecha DESC
    """)
    rows = cursor.fetchall()

    # Agrupar por venta
    ventas = {}
    for row in rows:
        vid = row["venta_id"]
        if vid not in ventas:
            ventas[vid] = {
                "id": vid,
                "fecha": row["fecha"],
                "total": row["total"],
                "estado": row["estado"],
                "cliente": {
                    "id": row["cliente_id"],
                    "username": row["cliente_username"]
                },
                "productos": []
            }
        ventas[vid]["productos"].append({
            "producto_id": row["producto_id"],
            "nombre": row["producto_nombre"],
            "cantidad": row["cantidad"]
        })

    return list(ventas.values())





class EstadoVenta(BaseModel):
    estado: str

@router.put("/{venta_id}/estado")
def actualizar_estado_venta(venta_id: int, estado: EstadoVenta):
    db = get_connection()
    cursor = db.cursor()
    cursor.execute("UPDATE ventas SET estado = %s WHERE id = %s", (estado.estado, venta_id))
    db.commit()
    return {"message": "Estado actualizado correctamente"}