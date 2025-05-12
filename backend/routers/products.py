from fastapi import APIRouter
from fastapi import HTTPException, Depends
from database import get_connection
from models import ProductCreate

router = APIRouter(
    prefix="/productos",
    tags=["products"]
)

@router.post("/")
def create_product(product: ProductCreate):
    db = get_connection()
    cursor = db.cursor()

    try:
        cursor.execute("""
            INSERT INTO productos (nombre, descripcion, precio, stock, categoria, image_url)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            product.nombre,
            product.descripcion,
            product.precio,
            product.stock,
            product.categoria,
            product.image_url
        ))
        db.commit()
        return {"message": "Producto creado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/")
def get_products():
    db = get_connection()
    cursor = db.cursor(dictionary=True)

    try:
        cursor.execute("SELECT * FROM productos")
        productos = cursor.fetchall()
        return productos
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{product_id}")
def get_product(product_id: int):
    db = get_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM productos WHERE id = %s", (product_id,))
    producto = cursor.fetchone()

    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    return producto


@router.put("/{product_id}")
def update_product(product_id: int, updated_product: ProductCreate):
    db = get_connection()
    cursor = db.cursor()

    cursor.execute("SELECT * FROM productos WHERE id = %s", (product_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    cursor.execute("""
            UPDATE productos
            SET nombre = %s,
                descripcion = %s,
                precio = %s,
                stock = %s,
                categoria = %s,
                image_url = %s
            WHERE id = %s
        """, (
            updated_product.nombre,
            updated_product.descripcion,
            updated_product.precio,
            updated_product.stock,
            updated_product.categoria,
            updated_product.image_url,
            product_id
        ))
    db.commit()
    return {"message": "Producto actualizado correctamente"}

@router.delete("/{product_id}")
def delete_product(product_id: int):
    db = get_connection()
    cursor = db.cursor()

    cursor.execute("SELECT * FROM productos WHERE id = %s", (product_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    cursor.execute("DELETE FROM productos WHERE id = %s", (product_id,))
    db.commit()

    return {"message": "Producto eliminado correctamente"}

