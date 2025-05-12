import { useState } from "react";
import { registerRequest } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";

export function Register() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
        alert("Las contraseñas no coinciden");
        return;
        }

        try {
        await registerRequest({
            username: formData.username,
            email: formData.email,
            password: formData.password
        });
        alert("Usuario registrado con éxito");
        navigate("/login");
        } catch (error) {
        alert("Error al registrar usuario");
        console.error(error);
        }
    };

    return (
        <div>
        <h2>Registro</h2>
        <form onSubmit={handleSubmit}>
            <input
            name="username"
            placeholder="Nombre de usuario"
            value={formData.username}
            onChange={handleChange}
            /><br/>

            <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            /><br/>

            <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            /><br/>

            <input
            type="password"
            name="confirmPassword"
            placeholder="Confirmar contraseña"
            value={formData.confirmPassword}
            onChange={handleChange}
            /><br/>

            <button type="submit">Registrarse</button>
        </form>

        <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
        </div>
    );
}
