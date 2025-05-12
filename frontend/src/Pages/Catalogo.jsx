import { useEffect, useState } from "react";
import axios from "axios";
import "./../index.css";

export function Catalogo() {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [filtroCategoria, setFiltroCategoria] = useState("");

    useEffect(() => {
        axios.get("http://localhost:8000/productos") // Ajusta URL si es necesario
            .then((res) => {
                setProductos(res.data);
                const cats = [...new Set(res.data.map(p => p.categoria).filter(c => c))];
                setCategorias(cats);
            })
            .catch((err) => {
                console.error("Error cargando productos", err);
            });
    }, []);

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
                        <button>Ver más</button>
                    </div>
                ))}
            </section>
        </div>
    );
}
