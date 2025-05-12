import { useState, useEffect } from "react";
import axios from "axios";

export function Ventas() {
    const [ventas, setVentas] = useState([]);
    const [form, setForm] = useState({
        cliente_id: "",
        producto_id: "",
        cantidad: ""
    });
    const [editandoId, setEditandoId] = useState(null);
    const [productos, setProductos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchVentas();
        fetchProductos();
        fetchClientes();
    }, []);

    useEffect(() => {
        const productoSeleccionado = productos.find(p => p.id === parseInt(form.producto_id));
        const cantidad = parseInt(form.cantidad);
        if (productoSeleccionado && !isNaN(cantidad)) {
            setTotal(productoSeleccionado.precio * cantidad);
        } else {
            setTotal(0);
        }
    }, [form.producto_id, form.cantidad, productos]);

    const fetchVentas = async () => {
        const res = await axios.get("http://localhost:8000/ventas");
        setVentas(res.data);
    };

    const fetchProductos = async () => {
        const res = await axios.get("http://localhost:8000/productos");
        setProductos(res.data);
    };

    const fetchClientes = async () => {
        const res = await axios.get("http://localhost:8000/usuarios");
        setClientes(res.data);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const productoSeleccionado = productos.find(p => p.id === parseInt(form.producto_id));
        const cantidad = parseInt(form.cantidad);

        if (!productoSeleccionado) {
            alert("Selecciona un producto válido.");
            return;
        }

        if (cantidad > productoSeleccionado.stock) {
            alert(`La cantidad supera el stock disponible (${productoSeleccionado.stock}).`);
            return;
        }

        const ventaData = {
            ...form,
            total
        };

        if (editandoId) {
            await axios.put(`http://localhost:8000/ventas/${editandoId}`, ventaData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditandoId(null);
        } else {
            await axios.post("http://localhost:8000/ventas", ventaData, {
                headers: { Authorization: `Bearer ${token}` }
            });
        }

        setForm({ cliente_id: "", producto_id: "", cantidad: "" });
        setTotal(0);
        fetchVentas();
    };

    const handleEdit = (venta) => {
        setForm({
            cliente_id: venta.cliente_id,
            producto_id: venta.producto_id,
            cantidad: venta.cantidad
        });
        setEditandoId(venta.id);
        setTotal(venta.total);
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:8000/ventas/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchVentas();
    };

    return (
        <div className="dashboard-container">
            <h2>Administrador de Ventas</h2>

            <form onSubmit={handleSubmit} className="product-form">
                <select
                    name="cliente_id"
                    value={form.cliente_id}
                    onChange={handleChange}
                    required
                >
                    <option value="">Seleccionar Cliente</option>
                    {clientes.map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>
                            {cliente.username}
                        </option>
                    ))}
                </select>

                <select
                    name="producto_id"
                    value={form.producto_id}
                    onChange={handleChange}
                    required
                >
                    <option value="">Seleccionar Producto</option>
                    {productos.map((producto) => (
                        <option key={producto.id} value={producto.id}>
                            {producto.nombre} (Stock: {producto.stock})
                        </option>
                    ))}
                </select>

                <input
                    type="number"
                    name="cantidad"
                    placeholder="Cantidad"
                    value={form.cantidad}
                    onChange={handleChange}
                    required
                    min="1"
                />

                <div>
                    <strong>Total:</strong> ${total}
                </div>

                <button type="submit">
                    {editandoId ? "Actualizar Venta" : "Agregar Venta"}
                </button>
            </form>

            <table className="product-table">
                <thead>
                    <tr>
                        <th>Cliente</th>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Total</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {ventas.map((venta) => (
                        <tr key={venta.id}>
                            <td>{venta.cliente_nombre}</td>
                            <td>{venta.producto_nombre}</td>
                            <td>{venta.cantidad}</td>
                            <td>${venta.total}</td>
                            <td>{venta.fecha}</td>
                            <td>
                                <button onClick={() => handleEdit(venta)}>Editar</button>
                                <button onClick={() => handleDelete(venta.id)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
