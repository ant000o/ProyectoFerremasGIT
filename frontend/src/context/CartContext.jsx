import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const carritoGuardado = localStorage.getItem("carrito");
        return carritoGuardado ? JSON.parse(carritoGuardado) : [];
    });

    // Cantidad total de productos en el carrito
    const cantidadTotal = cart.reduce((total, p) => total + p.cantidad, 0);

    // Guardar el carrito en localStorage cada vez que cambia
    useEffect(() => {
        localStorage.setItem("carrito", JSON.stringify(cart));
    }, [cart]);

    // Agregar producto al carrito
    const agregarAlCarrito = (producto) => {
        const existente = cart.find((p) => p.id === producto.id);
        if (existente) {
            setCart(cart.map((p) =>
                p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
            ));
        } else {
            setCart([...cart, { ...producto, cantidad: 1 }]);
        }
    };

    return (
        <CartContext.Provider value={{ cart, setCart, agregarAlCarrito, cantidadTotal }}>
            {children}
        </CartContext.Provider>
    );
};
