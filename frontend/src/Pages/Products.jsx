import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export function Products() {
    const { user } = useContext(AuthContext);

    const [form, setForm] = useState({
        nombre: "",
        descripcion: "",
        precio: "",
        stock: "",
        image_url: "",
        categoria: ""
    });

    const categoriasDisponibles = [
        "Aseo y jardin",
        "Automotriz",
        "Carpintería",
        "Combos a la medida​",
        "Electricidad e Iluminación",
        "Ferreteria y taller",
        "Herramientas",
        "Industrial",
        "Liquidación Otoño",
        "Ofertas Cyber",
        "Soldadoras y accesorios"
    ];


    const [imagen, setImagen] = useState(null); // ← imagen seleccionada
    const [productos, setProductos] = useState([]);
    const [editandoId, setEditandoId] = useState(null);


    const subirImagen = async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await axios.post("http://localhost:8000/upload/image", formData, {
            headers: {
            "Content-Type": "multipart/form-data"
            }
        });

        return res.data.url; // URL relativa de la imagen
    };


    const fetchProductos = async () => {
        const res = await axios.get("http://localhost:8000/productos");
        setProductos(res.data);
    };

    useEffect(() => {
        fetchProductos();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        let imageUrl = form.image_url;

        if (imagen) {
            imageUrl = await subirImagen(imagen);
        }

        const payload = {
            ...form,
            image_url: imageUrl
        };

        if (editandoId) {
            await axios.put(`http://localhost:8000/productos/${editandoId}`, payload, {
            headers: { Authorization: `Bearer ${token}` }
            });
            setEditandoId(null);
        } else {
            await axios.post("http://localhost:8000/productos", payload, {
            headers: { Authorization: `Bearer ${token}` }
            });
        }

        setForm({ nombre: "", descripcion: "", precio: "", stock: "", image_url: "" });
        setImagen(null);
        fetchProductos();
    };


    const handleEdit = (producto) => {
        setForm({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        stock: producto.stock,
        categoria: producto.categoria || "",
        image_url: producto.image_url || "",
        });
        setEditandoId(producto.id);
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:8000/productos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
        });
        fetchProductos();
    };

    return (
        <div className="dashboard-container">
        <h2>Administrador de Productos</h2>

        <form onSubmit={handleSubmit} className="product-form">
            <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={form.nombre}
            onChange={handleChange}
            required
            />
            <input
            type="text"
            name="descripcion"
            placeholder="Descripción"
            value={form.descripcion}
            onChange={handleChange}
            required
            />
            <input
            type="number"
            name="precio"
            placeholder="Precio"
            value={form.precio}
            onChange={handleChange}
            required
            />
            <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={form.stock}
            onChange={handleChange}
            required
            />
            <label>Categoría:</label>
            <select
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                required
            >
                <option value="">Seleccione una categoría</option>
                <option value="Aseo y jardin">Aseo y jardin</option>
                <option value="Automotriz">Automotriz</option>
                <option value="Carpintería">Carpintería</option>
                <option value="Combos a la medida​">Combos a la medida​</option>
                <option value="Electricidad e Iluminación">Electricidad e Iluminación</option>
                <option value="Ferreteria y taller">Ferreteria y taller</option>
                <option value="Herramientas">Herramientas</option>
                <option value="Industrial">Industrial</option>
                <option value="Liquidación Otoño">Liquidación Otoño</option>
                <option value="Ofertas Cyber">Ofertas Cyber</option>
                <option value="Soldadoras y accesorios">Soldadoras y accesorios</option>
            </select>
            <input
            type="file"
            accept="image/*"
            onChange={(e) => setImagen(e.target.files[0])}
            />
            <button type="submit">
            {editandoId ? "Actualizar Producto" : "Agregar Producto"}
            </button>
        </form>

        <table className="product-table">
            <thead>
                <tr>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {productos.map((p) => (
                    <tr key={p.id}>
                    <td>
                        {p.image_url && (
                        <img
                            src={`http://localhost:8000${p.image_url}`}
                            alt={p.nombre}
                            width={60}
                        />
                        )}
                    </td>
                    <td>{p.nombre}</td>
                    <td>{p.descripcion}</td>
                    <td>${p.precio}</td>
                    <td>{p.stock}</td>
                    <td>
                        <button onClick={() => handleEdit(p)}>Editar</button>
                        <button onClick={() => handleDelete(p.id)}>Eliminar</button>
                    </td>
                    </tr>
                ))}
            </tbody>
        </table>
        </div>
    );
}
