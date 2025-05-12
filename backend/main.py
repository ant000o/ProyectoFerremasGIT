from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, products, stock, bodegas, users, ventas
from fastapi.staticfiles import StaticFiles
from routers.upload import upload_router




app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

# CORS (para conectar con React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(upload_router)
app.include_router(stock.router)
app.include_router(bodegas.router)
app.include_router(users.router)
app.include_router(ventas.router)


@app.get("/")
def root():
    return {"message": "API funcionando correctamente"}
