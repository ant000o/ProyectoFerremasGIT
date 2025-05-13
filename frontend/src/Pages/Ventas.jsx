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
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Ventas</h2>
      {ventas.length === 0 ? (
        <p>No hay ventas registradas.</p>
      ) : (
        <table className="w-full border border-gray-300 rounded-md bg-white shadow">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">ID</th>
              <th className="p-2">Fecha</th>
              <th className="p-2">Cliente</th>
              <th className="p-2">Productos</th>
              <th className="p-2">Total</th>
              <th className="p-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((venta) => (
              <tr key={venta.id} className="border-t border-gray-200">
                <td className="p-2">{venta.id}</td>
                <td className="p-2">{new Date(venta.fecha).toLocaleString()}</td>
                <td className="p-2">{venta.cliente.username}</td>
                <td className="p-2">
                  <ul className="list-disc pl-4">
                    {venta.productos.map((prod) => (
                      <li key={prod.producto_id}>
                        {prod.nombre} x{prod.cantidad}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="p-2">${venta.total}</td>
                <td className="p-2">
                  <select
                    value={venta.estado}
                    onChange={(e) => handleEstadoChange(venta.id, e.target.value)}
                    className="border rounded px-2 py-1"
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
