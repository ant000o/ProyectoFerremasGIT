import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export function Stock() {
    const [bodegas, setBodegas] = useState([]);
    const [productos, setProductos] = useState([]);
    const [stock, setStock] = useState([]);
    const [bodegaSeleccionada, setBodegaSeleccionada] = useState("");
    const [form, setForm] = useState({
        producto_id: "",
        cantidad: ""
    });
    const [editandoId, setEditandoId] = useState(null);

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchBodegas();
        fetchProductos();
    }, []);

    useEffect(() => {
        if (bodegaSeleccionada) {
            fetchStock();
        }
    }, [bodegaSeleccionada]);

    const fetchBodegas = async () => {
        const res = await axios.get("http://localhost:8000/bodegas");
        setBodegas(res.data);
        if (res.data.length > 0) setBodegaSeleccionada(res.data[0].id);
    };

    const fetchProductos = async () => {
        const res = await axios.get("http://localhost:8000/productos");
        setProductos(res.data);
    };

    const fetchStock = async () => {
        const res = await axios.get(`http://localhost:8000/stock?bodega_id=${bodegaSeleccionada}`);
        setStock(res.data);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editandoId
            ? `http://localhost:8000/stock/${editandoId}`
            : "http://localhost:8000/stock";
        const method = editandoId ? "put" : "post";

        await axios[method](url, { ...form, bodega_id: bodegaSeleccionada }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        setForm({ producto_id: "", cantidad: "" });
        setEditandoId(null);
        fetchStock();
    };

    const handleEdit = (item) => {
        setForm({
            producto_id: item.producto_id,
            cantidad: item.cantidad
        });
        setEditandoId(item.id);
    };

    const handleDelete = async (id) => {
        await axios.delete(`http://localhost:8000/stock/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchStock();
    };

    return (
        <div className="dashboard-container">
            <h2>Mantenedor de Stock por Bodega</h2>

            <label>Bodega:</label>
            <select value={bodegaSeleccionada} onChange={e => setBodegaSeleccionada(e.target.value)}>
                {bodegas.map(b => (
                    <option key={b.id} value={b.id}>{b.nombre} - {b.direccion}</option>
                ))}
            </select>

            <form onSubmit={handleSubmit} className="product-form">
                <select name="producto_id" value={form.producto_id} onChange={handleChange} required>
                    <option value="">Selecciona un producto</option>
                    {productos.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                </select>
                <input
                    type="number"
                    name="cantidad"
                    placeholder="Cantidad"
                    value={form.cantidad}
                    onChange={handleChange}
                    required
                />
                <button type="submit">{editandoId ? "Actualizar Stock" : "Agregar Stock"}</button>
            </form>

            <table className="product-table">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {stock.map((item) => (
                        <tr key={item.id}>
                            <td>{item.nombre_producto}</td>
                            <td>{item.cantidad}</td>
                            <td>
                                <button onClick={() => handleEdit(item)}>Editar</button>
                                <button onClick={() => handleDelete(item.id)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Stock;