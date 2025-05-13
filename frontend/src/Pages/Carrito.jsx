import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export function Carrito() {
    const { cart, setCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const actualizarCantidad = (id, delta) => {
        const nuevoCarrito = cart.map(p => 
            p.id === id ? { ...p, cantidad: Math.max(1, p.cantidad + delta) } : p
        );
        setCart(nuevoCarrito);
    };

    const eliminarProducto = (id) => {
        setCart(cart.filter(p => p.id !== id));
    };

    const total = cart.reduce((sum, p) => sum + p.precio * p.cantidad, 0).toFixed(2);

    const handleCheckout = () => {
        if (user) {
            navigate("/checkout");
        } else {
            navigate("/login");
        }
    };

    if (cart.length === 0) {
        return (
            <div className="carrito-container">
                <h2>Tu carrito está vacío.</h2>
            </div>
        );
    }

    return (
        <div className="carrito-container">
            <h2>Carrito de compras</h2>
            <table className="carrito-table">
                <thead>
                    <tr>
                        <th>Imagen</th>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Cantidad</th>
                        <th>Subtotal</th>
                        <th>Eliminar</th>
                    </tr>
                </thead>
                <tbody>
                    {cart.map((producto) => (
                        <tr key={producto.id}>
                            <td>
                                <img src={`http://localhost:8000${producto.image_url}`} alt={producto.nombre} />
                            </td>
                            <td>{producto.nombre}</td>
                            <td>${producto.precio.toFixed(2)}</td>
                            <td>
                                <button
                                    className="carrito-button"
                                    onClick={() => actualizarCantidad(producto.id, -1)}
                                >
                                    -
                                </button>
                                <span>{producto.cantidad}</span>
                                <button
                                    className="carrito-button"
                                    onClick={() => actualizarCantidad(producto.id, 1)}
                                >
                                    +
                                </button>
                            </td>
                            <td>${(producto.precio * producto.cantidad).toFixed(2)}</td>
                            <td>
                                <button
                                    className="carrito-button"
                                    onClick={() => eliminarProducto(producto.id)}
                                >
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h3 className="carrito-total">Total: ${total}</h3>
            <div className="carrito-pago">
                <button className="carrito-button" onClick={handleCheckout}>Ir a pagar</button>
            </div>
        </div>
    );
}
