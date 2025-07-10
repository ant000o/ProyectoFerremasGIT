import { useState, useEffect } from "react";
import axios from "axios";

export function Stock() {
    const [bodegas, setBodegas] = useState([]);
    const [productos, setProductos] = useState([]);
    const [stock, setStock] = useState([]);
    const [bodegaSeleccionada, setBodegaSeleccionada] = useState("");
    const [form, setForm] = useState({ producto_id: "", cantidad: "" });
    const [editandoId, setEditandoId] = useState(null);

    const [formBodega, setFormBodega] = useState({ nombre: "", direccion: "" });
    const [editandoBodegaId, setEditandoBodegaId] = useState(null);

    useEffect(() => {
        fetchBodegas();
        fetchProductos();
    }, []);

    useEffect(() => {
        if (bodegaSeleccionada) fetchStock();
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

    const handleBodegaChange = (e) => {
        setFormBodega({ ...formBodega, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const producto = productos.find(p => p.id === parseInt(form.producto_id));
        if (!producto) return alert("Producto inválido.");

        const cantidadDeseada = parseInt(form.cantidad);
        const totalAsignado = await getStockAsignadoTotal(form.producto_id);
        const restante = producto.stock - totalAsignado;

        if (editandoId === null && cantidadDeseada > restante) {
            return alert(`No puedes asignar más de ${restante} unidades restantes para este producto.`);
        }

        const url = editandoId
            ? `http://localhost:8000/stock/${editandoId}`
            : "http://localhost:8000/stock";
        const method = editandoId ? "put" : "post";

        await axios[method](url, { ...form, bodega_id: bodegaSeleccionada });
        setForm({ producto_id: "", cantidad: "" });
        setEditandoId(null);
        fetchStock();
    };

    const getStockAsignadoTotal = async (producto_id) => {
        let total = 0;
        for (let bodega of bodegas) {
            const res = await axios.get(`http://localhost:8000/stock?bodega_id=${bodega.id}`);
            const matching = res.data.filter(s => s.producto_id === parseInt(producto_id));
            total += matching.reduce((sum, item) => sum + item.cantidad, 0);
        }
        return total;
    };

    const handleEdit = (item) => {
        setForm({ producto_id: item.producto_id, cantidad: item.cantidad });
        setEditandoId(item.id);
    };

    const handleDelete = async (id) => {
        await axios.delete(`http://localhost:8000/stock/${id}`);
        fetchStock();
    };

    const handleBodegaSubmit = async (e) => {
        e.preventDefault();
        const url = editandoBodegaId
            ? `http://localhost:8000/bodegas/${editandoBodegaId}`
            : "http://localhost:8000/bodegas";
        const method = editandoBodegaId ? "put" : "post";

        await axios[method](url, formBodega);
        setFormBodega({ nombre: "", direccion: "" });
        setEditandoBodegaId(null);
        fetchBodegas();
    };

    const handleBodegaEdit = (bodega) => {
        setFormBodega({ nombre: bodega.nombre, direccion: bodega.direccion });
        setEditandoBodegaId(bodega.id);
    };

    const handleBodegaDelete = async (id) => {
        await axios.delete(`http://localhost:8000/bodegas/${id}`);
        fetchBodegas();
    };

    return (
        <div className="dashboard-container">
            <h2>Gestión de Bodegas</h2>
            <form onSubmit={handleBodegaSubmit} className="product-form">
                <input type="text" name="nombre" placeholder="Nombre" value={formBodega.nombre} onChange={handleBodegaChange} required />
                <input type="text" name="direccion" placeholder="Dirección" value={formBodega.direccion} onChange={handleBodegaChange} required />
                <button type="submit">{editandoBodegaId ? "Actualizar Bodega" : "Agregar Bodega"}</button>
            </form>

            <table className="product-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Dirección</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {bodegas.map((b) => (
                        <tr key={b.id}>
                            <td>{b.nombre}</td>
                            <td>{b.direccion}</td>
                            <td>
                                <button onClick={() => handleBodegaEdit(b)}>Editar</button>
                                <button onClick={() => handleBodegaDelete(b.id)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <hr />

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
