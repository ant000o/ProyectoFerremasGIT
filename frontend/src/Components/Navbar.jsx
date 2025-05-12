import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Loading } from "./Loading"; // Asegúrate que la ruta sea correcta

export function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const [mostrarMenuAdmin, setMostrarMenuAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const toggleMenuAdmin = () => {
        setMostrarMenuAdmin(!mostrarMenuAdmin);
    };

    const handleLogout = () => {
        setLoading(true);
        setTimeout(() => {
            logout();
            navigate("/");
            setLoading(false);
        }, 1500);
    };

    if (loading) return <Loading message="Cerrando sesión..." />;

    return (
        <div className="navbar">
            <img src="/assets/logo.png" alt="" style={{ width: "200px" }}/>

            <Link to="/"><button>Home</button></Link>
            <Link to="/catalogo"><button>Catálogo</button></Link>
            <Link to="/"><button>Carrito</button></Link>
            <Link to="/"><button>Contacto</button></Link>

            {!user ? (
                <Link to="/login"><button>Login</button></Link>
            ) : (
                <>
                    {user.rol === "Administrador" && (
                        <div className="admin-menu">
                            <button onClick={toggleMenuAdmin}>Menú Admin</button>
                            {mostrarMenuAdmin && (
                                <div className="admin-dropdown">
                                    <Link to="/productos"><button>Productos</button></Link>
                                    <Link to="/stock"><button>Stock</button></Link>
                                    <Link to="/usuarios"><button>Usuarios</button></Link>
                                    <Link to="/ventas"><button>Ventas</button></Link>
                                </div>
                            )}
                        </div>
                    )}
                    <button onClick={handleLogout}>Logout</button>
                </>
            )}
        </div>
    );
}
