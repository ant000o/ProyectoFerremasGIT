import React, { useContext, useEffect, useState } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const Checkout = () => {
    const { cart, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [mensajeExito, setMensajeExito] = useState("");
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        telefono: "",
        direccion: "",
        comuna: "",
        notas: "",
        entrega: "retiro",
    });

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

    const camposCompletos = () => {
        return (
            formData.nombre.trim() &&
            formData.apellido.trim() &&
            formData.telefono.trim() &&
            formData.direccion.trim() &&
            formData.comuna.trim() &&
            user &&
            cart.length > 0
        );
    };

    useEffect(() => {
        if (!window.paypal || !camposCompletos() || mensajeExito) return;

        const container = document.getElementById("paypal-button-container");
        if (container) {
            container.innerHTML = ""; // 🔄 Limpiar para volver a renderizar
        }

        window.paypal.Buttons({
            createOrder: (data, actions) => {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: total.toFixed(2),
                        },
                    }],
                });
            },
            onApprove: async (data, actions) => {
                const details = await actions.order.capture();
                console.log("Pago aprobado:", details);

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

                try {
                    const response = await axios.post("http://localhost:8000/ventas/", ventaPayload);
                    console.log("Venta registrada:", response.data);
                    clearCart();
                    setMensajeExito("¡Pago exitoso! Compra registrada. Redirigiendo al inicio...");
                    setTimeout(() => navigate("/"), 5000);
                } catch (error) {
                    console.error("Error al registrar la venta:", error.response?.data || error);
                    alert("Pago recibido, pero ocurrió un error al registrar la venta.");
                }
            },
            onError: (err) => {
                console.error("Error en el pago:", err);
                alert("Ocurrió un error con PayPal.");
            }
        }).render("#paypal-button-container");
    }, [
        cart,
        total,
        formData.entrega,
        formData.nombre,
        formData.apellido,
        formData.telefono,
        formData.direccion,
        formData.comuna,
        user,
        mensajeExito
    ]);

    return (
        <div className="checkout-container">
            <form className="checkout-form" onSubmit={(e) => e.preventDefault()}>
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
                {camposCompletos() && !mensajeExito && (
                    <div id="paypal-button-container" style={{ marginTop: "20px" }} />
                )}
            </div>
            {mensajeExito && <p className="mensaje-exito">{mensajeExito}</p>}
        </div>
    );
};