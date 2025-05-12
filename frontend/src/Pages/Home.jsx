import { useEffect, useState } from "react";
import "./../index.css";

export function Home() {
    const images = ["/assets/carrusel1.jpg", "/assets/carrusel2.jpg"];
    const [current, setCurrent] = useState(0);

    const nextSlide = () => {
        setCurrent((prev) => (prev + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrent((prev) => (prev - 1 + images.length) % images.length);
    };

    useEffect(() => {
        const interval = setInterval(nextSlide, 5000); // cada 5 segundos
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="home-container">
        <div className="carousel">
            <img src={images[current]} alt={`Carrusel ${current + 1}`} />

            <button className="carousel-arrow left" onClick={prevSlide}>
            &#10094;
            </button>
            <button className="carousel-arrow right" onClick={nextSlide}>
            &#10095;
            </button>
        </div>

        <div className="info-section">
            <div className="info-text">
            <h2>Bienvenido a Ferremas</h2>
            <p>
                Somos tu ferretería de confianza. En Ferremas encontrarás una amplia variedad
                de herramientas, materiales de construcción y artículos para el hogar. ¡Estamos
                aquí para ayudarte a construir tus proyectos!
            </p>
            </div>
            <img src="/assets/ferreteria.jpg" alt="Ferretería" className="info-image" />
        </div>
        </div>
    );
}
