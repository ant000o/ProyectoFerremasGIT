export function Loading({ message = "Cargando..." }) {
    return (
        <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.5rem',
        gap: '1rem'
        }}>
        <div className="spinner" />
        <p>{message}</p>
        <style>
            {`
            .spinner {
                border: 6px solid #ccc;
                border-top: 6px solid #333;
                border-radius: 50%;
                width: 60px;
                height: 60px;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            `}
        </style>
        </div>
    );
}
