import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export const Checkout = () => {
    const { cart, clearCart } = useContext(CartContext);

    const { user } = useContext(AuthContext);

    const navigate = useNavigate();

    const [mensajeExito, setMensajeExito] = useState("")

    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        telefono: "",
        direccion: "",
        comuna: "",
        notas: "",
        entrega: "retiro", // "retiro" o "delivery"
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const subtotal = cart.reduce(
        (acc, item) => acc + item.precio * item.cantidad,
        0
    );
    const deliveryFee = formData.entrega === "delivery" ? 3000 : 0;
    const total = subtotal + deliveryFee;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (!user) {
            alert("Debes iniciar sesión para realizar la compra.");
            return;
            }
            console.log("Usuario:", user);

            const ventaPayload = {
            cliente_id: user.id,
            nombre: formData.nombre,
            apellido: formData.apellido,
            telefono: formData.telefono,
            direccion: `${formData.direccion}, ${formData.comuna}`,
            notas: formData.notas,
            tipo_entrega: formData.entrega,
            productos: cart.map((item) => ({
                producto_id: item.id,
                cantidad: item.cantidad,
            })),
            total: total,
            };

            console.log("Datos enviados a /ventas/:", ventaPayload);




            const response = await axios.post("http://localhost:8000/ventas/", ventaPayload);
            console.log("Venta registrada:", response.data);
            alert("¡Compra realizada con éxito!");
            setMensajeExito("¡Compra realizada con éxito! Serás redirigido al inicio...");
            // ✅ Vaciar carrito
            clearCart();
            setTimeout(() => {
            navigate("/");
            }, 3000);
        } catch (error) {
            console.error("Error al registrar la venta:", error.response?.data || error);
            alert("Ocurrió un error al procesar tu compra.");
        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <div className="checkout-container">
            <form className="checkout-form" onSubmit={handleSubmit}>
                <h2>Datos de la Compra</h2>
                <div className="form-group">
                <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="apellido"
                    placeholder="Apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    required
                />
                <input
                    type="tel"
                    name="telefono"
                    placeholder="Teléfono"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="direccion"
                    placeholder="Calle y número"
                    value={formData.direccion}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="comuna"
                    placeholder="Comuna"
                    value={formData.comuna}
                    onChange={handleChange}
                    required
                />
                <select name="entrega" value={formData.entrega} onChange={handleChange}>
                    <option value="retiro">Retiro en tienda</option>
                    <option value="delivery">Delivery (+$3000)</option>
                </select>
                <textarea
                    name="notas"
                    placeholder="Notas adicionales"
                    value={formData.notas}
                    onChange={handleChange}
                    rows="3"
                />
                </div>
                <button type="submit" className="checkout-button" disabled={isSubmitting}>
                {isSubmitting ? "Procesando..." : "Finalizar Compra"}
                </button>
            </form>

            <div className="checkout-summary">
                <h2>Resumen</h2>
                <ul>
                {cart.map((item) => (
                    <li key={item.id}>
                    {item.nombre} x{item.cantidad}
                    <span>${item.precio * item.cantidad}</span>
                    </li>
                ))}
                <li>
                    Subtotal <span>${subtotal}</span>
                </li>
                {deliveryFee > 0 && (
                    <li>
                    Delivery <span>${deliveryFee}</span>
                    </li>
                )}
                </ul>
                <div className="checkout-total">Total: ${total}</div>
            </div>
            {mensajeExito && <p className="mensaje-exito">{mensajeExito}</p>}
        </div>
    );
};

