import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export function Users() {
    const { user } = useContext(AuthContext);
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        rol: "Cliente"
    });

    const [usuarios, setUsuarios] = useState([]);
    const [editandoId, setEditandoId] = useState(null);

    const fetchUsuarios = async () => {
        const res = await axios.get("http://localhost:8000/usuarios");
        setUsuarios(res.data);
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        try {
            if (editandoId) {
                await axios.put(`http://localhost:8000/usuarios/${editandoId}`, form, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setEditandoId(null);
            } else {
                await axios.post("http://localhost:8000/usuarios", form, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            setForm({ username: "", email: "", password: "", rol: "Cliente" });
            fetchUsuarios();
        } catch (error) {
            alert("Error al guardar usuario");
            console.error(error);
        }
    };

    const handleEdit = (usuario) => {
        setForm({
            username: usuario.username,
            email: usuario.email,
            password: "",
            rol: usuario.rol
        });
        setEditandoId(usuario.id);
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:8000/usuarios/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchUsuarios();
    };

    return (
        <div className="dashboard-container">
            <h2>Administrador de Usuarios</h2>

            <form onSubmit={handleSubmit} className="product-form">
                <input
                    type="text"
                    name="username"
                    placeholder="Nombre de usuario"
                    value={form.username}
                    onChange={handleChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Correo electrónico"
                    value={form.email}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    value={form.password}
                    onChange={handleChange}
                    required={!editandoId}
                />
                <select name="rol" value={form.rol} onChange={handleChange}>
                    <option value="Administrador">Administrador</option>
                    <option value="Vendedor">Vendedor</option>
                    <option value="Bodeguero">Bodeguero</option>
                    <option value="Contador">Contador</option>
                    <option value="Cliente">Cliente</option>
                </select>
                <button type="submit">
                    {editandoId ? "Actualizar Usuario" : "Agregar Usuario"}
                </button>
            </form>

            <table className="product-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((u) => (
                        <tr key={u.id}>
                            <td>{u.username}</td>
                            <td>{u.email}</td>
                            <td>{u.rol}</td>
                            <td>
                                <button onClick={() => handleEdit(u)}>Editar</button>
                                <button onClick={() => handleDelete(u.id)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
