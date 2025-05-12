from fastapi import APIRouter, HTTPException
from models import UserCreate, UserLogin
from database import get_connection
from utils.security import hash_password, verify_password, create_access_token


router = APIRouter()

@router.post("/register")
def register(user: UserCreate):
    db = get_connection()
    cursor = db.cursor()

    cursor.execute("SELECT * FROM usuarios WHERE username = %s OR email = %s", (user.username, user.email))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Usuario o correo ya existe")

    hashed_password = hash_password(user.password)
    cursor.execute(
        "INSERT INTO usuarios (username, email, password_hash, rol) VALUES (%s, %s, %s, %s)",
        (user.username, user.email, hashed_password, user.rol)
    )
    db.commit()
    return {"message": "Usuario registrado exitosamente"}

@router.post("/login")
def login(user: UserLogin):
    db = get_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM usuarios WHERE username = %s", (user.username,))
    user_data = cursor.fetchone()
    if not user_data or not verify_password(user.password, user_data["password_hash"]):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    token = create_access_token({"sub": user_data["username"], "rol": user_data["rol"]})
    return {
    "access_token": token,
    "token_type": "bearer",
    "user": {
        "username": user_data["username"],
        "rol": user_data["rol"]
    }
}