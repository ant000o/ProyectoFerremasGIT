export function Contacto() {
    return (
        <div className="contacto-container">
            {/* Imagen de encabezado */}
            <div className="contacto-header">
                <img src="/assets/contacto-banner.jpg" alt="Contáctanos" className="contacto-banner" />
                <h1 className="contacto-titulo">Contáctanos</h1>
            </div>

            {/* Widgets de contacto */}
            <section className="contacto-widgets">
                <div className="widget">
                    <img src="/assets/telefono-icon.png" alt="Teléfono" />
                    <h3>Teléfono</h3>
                    <a href="#" className="contact-link">+56 9 1234 5678</a>
                </div>
                <div className="widget">
                    <img src="/assets/correo-icon.png" alt="Correo" />
                    <h3>Correo</h3>
                    <a href="#" className="contact-link">Soporte@ferremas.cl</a>
                </div>
                <div className="widget">
                    <img src="/assets/ubicacion-icon.png" alt="Ubicación" />
                    <h3>Ubicación</h3>
                    <a
                        href="https://www.google.com/maps?q=Ñuble+1034,+oficina+202,+Santiago+de+Chile"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contact-link"
                    >
                        Ñuble 1034, oficina 202. <br /> Santiago de Chile.
                    </a>
                </div>
            </section>

            {/* Mapa de Google */}
            <section className="contacto-mapa">
                <iframe
                    title="Mapa de ubicación"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3328.2100984377075!2d-70.65240654718369!3d-33.46988040495869!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662c53f08e6aaab%3A0xe7d3f0e74c8a057c!2s%C3%91uble%201034%2C%20oficina%20202%2C%20Santiago%2C%20Regi%C3%B3n%20Metropolitana!5e0!3m2!1ses!2scl!4v1747698104263!5m2!1ses!2scl"
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </section>
        </div>
    );
}