from fastapi import APIRouter, HTTPException
from database import get_connection

router = APIRouter(
    prefix="/bodega",
    tags=["bodega"]
)

@router.get("/ordenes")
def obtener_ordenes():
    db = get_connection()
    cursor = db.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT v.id, v.nombre, v.apellido, v.tipo_entrega, v.estado, v.fecha,
                   GROUP_CONCAT(CONCAT(p.nombre, ' x', dv.cantidad) SEPARATOR ', ') AS productos
            FROM ventas v
            JOIN detalle_ventas dv ON v.id = dv.venta_id
            JOIN productos p ON dv.producto_id = p.id
            WHERE v.estado = 'pendiente'
            GROUP BY v.id
        """)
        return cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/ordenes/{venta_id}/aceptar")
def aceptar_orden(venta_id: int):
    db = get_connection()
    cursor = db.cursor()

    cursor.execute("SELECT * FROM ventas WHERE id = %s", (venta_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Orden no encontrada")

    cursor.execute("UPDATE ventas SET estado = 'aceptado' WHERE id = %s", (venta_id,))
    db.commit()
    return {"message": "Orden aceptada y en preparación"}
