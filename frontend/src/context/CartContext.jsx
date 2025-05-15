import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const carritoGuardado = localStorage.getItem("carrito");
        return carritoGuardado ? JSON.parse(carritoGuardado) : [];
    });

    const cantidadTotal = cart.reduce((total, p) => total + p.cantidad, 0);

    useEffect(() => {
        localStorage.setItem("carrito", JSON.stringify(cart));
    }, [cart]);

    const agregarAlCarrito = (producto) => {
        const existente = cart.find((p) => p.id === producto.id);
        if (existente) {
        setCart(
            cart.map((p) =>
            p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
            )
        );
        } else {
        setCart([...cart, { ...producto, cantidad: 1 }]);
        }
    };

    // Aquí agregamos clearCart para vaciar carrito
    const clearCart = () => {
        setCart([]);
    };

    return (
        <CartContext.Provider
        value={{ cart, setCart, agregarAlCarrito, cantidadTotal, clearCart }}
        >
        {children}
        </CartContext.Provider>
    );
};
