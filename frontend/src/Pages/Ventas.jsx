import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export function Ventas() {
  const { user } = useContext(AuthContext);
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div>Cargando ventas...</div>;

  return (
      <div className="dashboard-container">
          <h2>Administrador de Ventas</h2>

          {ventas.length === 0 ? (
              <p>No hay ventas registradas.</p>
          ) : (
              <table className="product-table">
                  <thead>
                      <tr>
                          <th>ID</th>
                          <th>Fecha</th>
                          <th>Cliente</th>
                          <th>Productos</th>
                          <th>Total</th>
                          <th>Estado</th>
                      </tr>
                  </thead>
                  <tbody>
                      {ventas.map((venta) => (
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
                              <td>${venta.total}</td>
                              <td>
                                  <select
                                      value={venta.estado}
                                      onChange={(e) =>
                                          handleEstadoChange(venta.id, e.target.value)
                                      }
                                  >
                                      <option value="pendiente">Pendiente</option>
                                      <option value="confirmada">Confirmada</option>
                                      <option value="enviada">Enviada</option>
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
