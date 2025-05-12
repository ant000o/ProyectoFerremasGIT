from fastapi import APIRouter, Depends, HTTPException
from database import get_connection
from models import UserCreate
from utils.security import hash_password
import mysql.connector

router = APIRouter(
    prefix="/usuarios",
    tags=["usuarios"]
)

@router.get("/")
def get_usuarios():
    db = get_connection()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id, username, email, rol FROM usuarios")
    return cursor.fetchall()

@router.post("/")
def create_usuario(user: UserCreate):
    db = get_connection()
    cursor = db.cursor()

    cursor.execute("SELECT * FROM usuarios WHERE username = %s", (user.username,))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Usuario ya existe")

    hashed_password = hash_password(user.password)
    cursor.execute("""
        INSERT INTO usuarios (username, email, password_hash, rol)
        VALUES (%s, %s, %s, %s)
    """, (user.username, user.email, hashed_password, user.rol))
    db.commit()
    return {"message": "Usuario creado correctamente"}

@router.put("/{user_id}")
def update_usuario(user_id: int, user: UserCreate):
    db = get_connection()
    cursor = db.cursor()

    cursor.execute("SELECT * FROM usuarios WHERE id = %s", (user_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    hashed_password = hash_password(user.password)
    cursor.execute("""
        UPDATE usuarios
        SET username = %s, email = %s, password_hash = %s, rol = %s
        WHERE id = %s
    """, (user.username, user.email, hashed_password, user.rol, user_id))
    db.commit()
    return {"message": "Usuario actualizado correctamente"}

@router.delete("/{user_id}")
def delete_usuario(user_id: int):
    db = get_connection()
    cursor = db.cursor()
    cursor.execute("DELETE FROM usuarios WHERE id = %s", (user_id,))
    db.commit()
    return {"message": "Usuario eliminado correctamente"}
