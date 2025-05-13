import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../index.css";

export const Checkout = () => {
    const { cart, setCart } = useContext(CartContext);
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        telefono: "",
        direccion: "",
        notas: "",
        tipo_entrega: "retiro"
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const totalBase = cart.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
    const deliveryFee = formData.tipo_entrega === "delivery" ? 3000 : 0;
    const total = totalBase + deliveryFee;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
        const token = localStorage.getItem("token");
        await axios.post(
            "http://localhost:8000/ventas",
            {
            ...formData,
            productos: cart.map((p) => ({ producto_id: p.id, cantidad: p.cantidad })),
            total,
            },
            {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            }
        );
        setCart([]);
        navigate("/catalogo");
        } catch (err) {
        console.error(err);
        alert("Hubo un error al procesar la compra.");
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="checkout-container">
        <form className="checkout-form" onSubmit={handleSubmit}>
            <h2>Información de envío</h2>
            <div className="form-group">
            <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required />
            <input type="text" name="apellido" placeholder="Apellido" value={formData.apellido} onChange={handleChange} required />
            <input type="tel" name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} required />
            <input type="text" name="direccion" placeholder="Dirección (calle, número, comuna)" value={formData.direccion} onChange={handleChange} required />
            <textarea name="notas" placeholder="Notas" value={formData.notas} onChange={handleChange} />
            <select name="tipo_entrega" value={formData.tipo_entrega} onChange={handleChange}>
                <option value="retiro">Retiro en tienda</option>
                <option value="delivery">Delivery (+$3000)</option>
            </select>
            </div>
            <button className="checkout-button" type="submit" disabled={loading}>
            {loading ? "Procesando..." : `Confirmar compra ($${total})`}
            </button>
        </form>

        <div className="checkout-summary">
            <h2>Resumen del carrito</h2>
            {cart.length === 0 ? (
            <p>No hay productos en el carrito.</p>
            ) : (
            <ul>
                {cart.map((p) => (
                <li key={p.id}>
                    {p.nombre} x {p.cantidad} - ${p.precio * p.cantidad}
                </li>
                ))}
            </ul>
            )}
            <p className="checkout-total">Total: ${total}</p>
        </div>
        </div>
    );
};
