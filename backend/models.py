from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from typing import List

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    rol: str = "Cliente"

class UserLogin(BaseModel):
    username: str
    password: str

class ProductBase(BaseModel):
    nombre: str
    descripcion: str
    precio: float
    stock: int
    categoria: Optional[str] = None
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class ProductDB(ProductBase):
    id: int

    class Config:
        orm_mode = True


class BodegaBase(BaseModel):
    nombre: str
    direccion: str

class BodegaCreate(BodegaBase):
    pass

class Bodega(BodegaBase):
    id: int
    cantidad_total: int

    class Config:
        orm_mode = True

class StockBase(BaseModel):
    id_producto: int
    id_bodega: int
    cantidad: int

class StockCreate(StockBase):
    pass

class Stock(StockBase):
    id: int

    class Config:
        orm_mode = True

class MovimientoStock(BaseModel):
    id_stock: int
    tipo: str  # 'entrada' o 'salida'
    cantidad: int
    fecha: Optional[datetime] = None

class StockCreate(BaseModel):
    producto_id: int
    bodega_id: int
    cantidad: int

class StockUpdate(BaseModel):
    cantidad: int

class DetalleProducto(BaseModel):
    producto_id: int
    cantidad: int

class VentaCompletaCreate(BaseModel):
    cliente_id: int
    nombre: str
    apellido: str
    telefono: str
    direccion: str
    notas: Optional[str] = ""
    tipo_entrega: str  # "retiro" o "delivery"
    productos: List[DetalleProducto]
    total: float
