from fastapi import APIRouter, UploadFile, File, HTTPException
import os
from uuid import uuid4

upload_router = APIRouter(
    prefix="/upload",
    tags=["upload"]
)

UPLOAD_DIR = "static/images"

@upload_router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

    ext = os.path.splitext(file.filename)[1]
    if ext.lower() not in [".jpg", ".jpeg", ".png", ".gif", ".webp"]:
        raise HTTPException(status_code=400, detail="Tipo de archivo no soportado")

    filename = f"{uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    url = f"/static/images/{filename}"
    return {"url": url}
