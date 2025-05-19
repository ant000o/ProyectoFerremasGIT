import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginRequest } from "../api/auth";
import { jwtDecode } from "jwt-decode";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";



export function Login() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value,
        });
    };

    const navigate = useNavigate();

    const { login } = useContext(AuthContext);
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = await loginRequest(formData);
            const token = data.access_token;
            const decoded = jwtDecode(token); // decodificamos el token

            // Esto guarda el usuario con su rol en el contexto
            login({id: data.user.id, username: decoded.sub, rol: decoded.rol }, token);

            navigate("/");
        } catch (error) {
            alert("Usuario o contraseña incorrectos");
            console.error("Error en login:", error);
        }
    };


    return (
        <div className="form-container">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit} className="form">
            <input
            type="text"
            name="username"
            placeholder="Usuario"
            value={formData.username}
            onChange={handleChange}
            required
            />

            <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
            />

            <button type="submit">Ingresar</button>
        </form>

        <p>¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link></p>
        </div>
    );
}
