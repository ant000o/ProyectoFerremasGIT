import { createContext, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // Cantidad total de productos en el carrito
    const cantidadTotal = cart.reduce((total, p) => total + p.cantidad, 0);

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
