import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";     

export function VistaBodeguero() {
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);  

    useEffect(() => {
        axios.get("http://localhost:8000/ventas/detalladas")
            .then((res) => setVentas(res.data))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleEstadoChange = (id, nuevoEstado) => {
        axios.put(`http://localhost:8000/ventas/${id}/estado`, { estado: nuevoEstado })
            .then(() => {
                setVentas((prev) =>
                    prev.map((venta) =>
                        venta.id === id ? { ...venta, estado: nuevoEstado } : venta
                    )
                );
            })
            .catch((err) => console.error(err));
    };

    const ventasBodeguero = ventas.filter(v =>
    ["confirmada", "en preparación", "en despacho", "despachada"].includes(v.estado)
);


    return (
        <div className="dashboard-container">
            <h2>Vista Bodeguero – Pedidos Confirmados</h2>

            {loading ? (
                <p>Cargando ventas...</p>
            ) : ventasBodeguero.length === 0 ? (
                <p>No hay ventas confirmadas.</p>
            ) : (
                <table className="product-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Productos</th>
                            <th>Estado</th>
                            <th>Cambiar Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ventasBodeguero.map((venta) => (
                            <tr key={venta.id}>
                                <td>{venta.id}</td>
                                <td>{new Date(venta.fecha).toLocaleString()}</td>
                                <td>{venta.cliente.username}</td>
                                <td>
                                    <ul>
                                        {venta.productos.map((prod) => (
                                            <li key={prod.producto_id}>
                                                {prod.nombre} x{prod.cantidad}
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                                <td>{venta.estado}</td>
                                <td>
                                    <select
                                        value={venta.estado}
                                        onChange={(e) =>
                                            handleEstadoChange(venta.id, e.target.value)
                                        }
                                    >
                                        <option value="confirmada">Confirmada</option>
                                        <option value="en preparación">En preparación</option>
                                        <option value="en despacho">En despacho</option>
                                        <option value="despachada">Despachada</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}