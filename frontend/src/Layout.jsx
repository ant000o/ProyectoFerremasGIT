import { Navbar } from "./Components/Navbar";
import { Footer } from "./Components/Footer";
import { Outlet } from "react-router-dom";

export function Layout() {
    return (
        <>
        <Navbar />
        <main>
            <Outlet />
        </main>
        <Footer />
        </>
    );
}
