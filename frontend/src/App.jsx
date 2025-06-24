import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './Layout';
import { AuthLayout } from './AuthLayout';
import { Home } from './Pages/Home';
import { Login } from './Pages/Login';
import { Register } from './Pages/Register';
import { Products } from './Pages/Products';
import { Stock } from './Pages/Stock';
import { Users } from './Pages/Users';
import { Ventas } from './Pages/Ventas';
import { ProtectedRoute } from './ProtectedRoute';
import { Catalogo } from './Pages/Catalogo';
import { Carrito } from './Pages/Carrito';
import { Checkout } from './Pages/Checkout';
import { Contacto } from './Pages/Contacto';

function App() {
  return (
    <Router>
      <Routes>
        {/* Layout principal con navbar */}
        <Route element={<Layout />}>
          <Route path='/' element={<Home />} />
          <Route path='/catalogo' element={<Catalogo />} />
          <Route path='/carrito' element={<Carrito />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route path='/contacto' element={<Contacto />} />      
        </Route>

        {/* Layout de autenticación SIN navbar */}
        <Route element={<AuthLayout />}>
          <Route path='/login' element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Rutas protegidas para administradores */}
        <Route
          path="/productos"
          element={
            <ProtectedRoute roleRequired="Administrador">
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stock"
          element={
            <ProtectedRoute roleRequired="Administrador">
              <Stock />
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute roleRequired="Administrador">
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ventas"
          element={
            <ProtectedRoute allowedRoles={["Administrador", "Vendedor"]}>
              <Ventas />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};


export default App;