export function Footer() {
    return (
        <footer style={{
        textAlign: "center",
        padding: "1rem",
        backgroundColor: "#f1f1f1",
        borderTop: "1px solid #ccc",
        marginTop: "auto"
        }}>
        <p>&copy; {new Date().getFullYear()} Ferremas. Todos los derechos reservados.</p>
        </footer>
    );
}
