import { useEffect, useState } from "react";
import axios from "axios";
import "./../index.css";
import { CartContext } from "../context/CartContext";
import { useContext } from "react";

export function Catalogo() {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [filtroCategoria, setFiltroCategoria] = useState("");
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);


    useEffect(() => {
        axios.get("http://localhost:8000/productos")
            .then((res) => {
                setProductos(res.data);
                const cats = [...new Set(res.data.map(p => p.categoria).filter(c => c))];
                setCategorias(cats);
            })
            .catch((err) => {
                console.error("Error cargando productos", err);
            });
    }, []);

    const { agregarAlCarrito } = useContext(CartContext);

    const handleAgregarAlCarrito = (producto) => {
        agregarAlCarrito(producto);
        setMostrarConfirmacion(true); // Mostrar mensaje
        setTimeout(() => {
            setMostrarConfirmacion(false); // Ocultar mensaje
            setProductoSeleccionado(null); // Cerrar modal principal
        }, 2000); // 2 segundos
    };


    const productosFiltrados = filtroCategoria
        ? productos.filter(p => p.categoria === filtroCategoria)
        : productos;

    return (
        <div className="catalogo-container">
            <aside className="catalogo-sidebar">
                <h3>Categorías</h3>
                <ul>
                    <li onClick={() => setFiltroCategoria("")}>Todos</li>
                    {categorias.map((cat, i) => (
                        <li key={i} onClick={() => setFiltroCategoria(cat)}>{cat}</li>
                    ))}
                </ul>
            </aside>

            <section className="catalogo-productos">
                {productosFiltrados.map((producto) => (
                    <div className="producto-card" key={producto.id}>
                        <img
                            src={
                                producto.image_url
                                    ? `http://localhost:8000${producto.image_url}`
                                    : "/placeholder.jpg"
                            }
                            alt={producto.nombre}
                            className="producto-img"
                        />
                        <h4>{producto.nombre}</h4>
                        <p>${producto.precio.toFixed(2)}</p>
                        <button onClick={() => setProductoSeleccionado(producto)}>Ver más</button>
                    </div>
                ))}
            </section>

            {/* Modal de detalles del producto */}
            {productoSeleccionado && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close" onClick={() => setProductoSeleccionado(null)}>X</button>
                        <img
                            src={
                                productoSeleccionado.image_url
                                    ? `http://localhost:8000${productoSeleccionado.image_url}`
                                    : "/placeholder.jpg"
                            }
                            alt={productoSeleccionado.nombre}
                            className="producto-img"
                            style={{ height: "200px" }}
                        />
                        <h2>{productoSeleccionado.nombre}</h2>
                        <p><strong>Precio:</strong> ${productoSeleccionado.precio.toFixed(2)}</p>
                        <p><strong>Categoría:</strong> {productoSeleccionado.categoria || "Sin categoría"}</p>
                        <p><strong>Descripción:</strong> {productoSeleccionado.descripcion}</p>
                        <button onClick={() => handleAgregarAlCarrito(productoSeleccionado)}>
                            Agregar al carrito
                        </button>
                    </div>
                </div>
            )}
            {mostrarConfirmacion && (
                <div className="modal-overlay">
                    <div className="modal-content confirmacion">
                        <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                            ¡Producto agregado al carrito!
                        </p>
                    </div>
                </div>
            )}

        </div>
    );
}
