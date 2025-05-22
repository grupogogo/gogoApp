import { NavLink } from "react-router-dom";
import { useAuthStore, useClientesStore } from "../hooks";
import { useState } from "react";

const Sidebar = () => {
    const { limpiarClienteActivo } = useClientesStore();
    const { user } = useAuthStore();
    const [isHovered, setIsHovered] = useState(false);

    if (!user || (user.rol !== "admin" && user.rol !== "superAdmin")) return null;

    return (
        <div
            className="bg-dark text-white d-flex flex-column p-2 position-fixed h-100"

            style={{
                width: isHovered ? '250px' : '80px',
                transition: 'width 1s ease',
                zIndex: 1050 // aseguramos que esté sobrepuesto
            }}
        >
            {/* Logo */}
            <div className="text-center mb-4">
                <img
                    src="/images/logos/LOGO GOGO BLANCO.webp"
                    alt="Logo"
                    style={{
                        width: isHovered ? "70px" : "70px",
                        height: "auto",
                        transition: "width 2s ease"
                    }}
                />
            </div>

            {/* Navegación */}
            <nav className="nav flex-column"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <NavLink to="/dashboard" className="nav-link text-white d-flex align-items-center mb-3">
                    <i className="fas fa-tachometer-alt fa-2x me-3" />
                    {isHovered && <span>Dashboard</span>}
                </NavLink>

                <NavLink to="/gastos" className="nav-link text-white d-flex align-items-center mb-3">
                    <i className="fas fa-sack-dollar fa-2x me-3" />
                    {isHovered && <span>Gastos</span>}
                </NavLink>

                <NavLink to="/pedidos" onClick={limpiarClienteActivo} className="nav-link text-white d-flex align-items-center mb-3">
                    <i className="fas fa-clipboard-list fa-2x me-3" />
                    {isHovered && <span>Crear Pedido</span>}
                </NavLink>

                <NavLink to="/listaPedidos" className="nav-link text-white d-flex align-items-center mb-3">
                    <i className="fas fa-list-check fa-2x me-3" />
                    {isHovered && <span>Listado de pedidos</span>}
                </NavLink>

                <NavLink to="/clientes" className="nav-link text-white d-flex align-items-center mb-3">
                    <i className="fas fa-address-book fa-2x me-3" />
                    {isHovered && <span>Clientes</span>}
                </NavLink>

                <NavLink to="/CuentasXCobrar" className="nav-link text-white d-flex align-items-center mb-3">
                    <i className="fas fa-table fa-2x me-3" />
                    {isHovered && <span>Cuentas por cobrar</span>}
                </NavLink>
            </nav>
        </div>
    );
};

export default Sidebar;
