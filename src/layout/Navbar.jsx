import { NavLink } from "react-router-dom";
import { useAuthStore } from "../hooks/useAuthStore";
import { useState } from "react";

const Navbar = () => {
    const { user, startLogout } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="navbar navbar-expand navbar-light bg-white shadow  main-content  d-flex justify-content-between" style={{ marginLeft: user.rol !== 'planta' ? "80px" : "0px" }}>
            {/* Menú Móvil */}
            <div className="d-md-none">
                <button
                    className="btn btn-link text-dark"
                    onClick={toggleMobileMenu}
                >
                    <i className="fa fa-bars fa-lg" />
                </button>
                <ul
                    className={`dropdown-menu position-absolute ${isOpen ? "show" : "d-none"}`}
                    style={{ left: 10, top: "50px", minWidth: "200px", zIndex: 1000 }}
                >
                    <li><NavLink className="dropdown-item" to="/dashboard">Dashboard</NavLink></li>
                    <li><NavLink className="dropdown-item" to="/gastos">Gastos</NavLink></li>
                    <li><NavLink className="dropdown-item" to="/pedidos">Crear pedido</NavLink></li>
                    <li><NavLink className="dropdown-item" to="/listapedidos">Listar pedidos</NavLink></li>
                    <li><NavLink className="dropdown-item" to="/clientes">Clientes</NavLink></li>
                    <li><NavLink className="dropdown-item" to="/CuentasXCobrar">Cuentas por cobrar</NavLink></li>
                </ul>
            </div>
            {user.role === 'planta' && (
                <div className="align-items-center">
                    {/* Logo */}
                    <div className="text-center mb-4 bg-secondary border-2 rounded d-none d-md-block">
                        <img
                            src="/images/logos/LOGO GOGO BLANCO.webp"
                            alt="Logo"
                            style={{
                                width: "70px",
                                height: "auto",
                                transition: "width 2s ease",
                                margin: "10px 0",
                            }}
                        />
                    </div>
                </div>
            )}


            {/* Fecha actual */}
            <div className="text-secondary small mx-3">
                {new Date().toLocaleDateString("es-CO", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                })}
            </div>

            {/* Usuario a la derecha */}
            <ul className="navbar-nav ms-auto">
                <li className="nav-item dropdown">
                    <a
                        className="nav-link dropdown-toggle d-flex align-items-center"
                        href="#"
                        id="userDropdown"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                    >
                        <span className="me-2 text-gray-600 small">{user.name}</span>
                        <img
                            className="img-profile rounded-circle"
                            src="/images/avatar/undraw_profile.svg"
                            style={{ width: "32px", height: "32px" }}
                            alt="Avatar"
                        />
                    </a>
                    <div
                        className="dropdown-menu dropdown-menu-end shadow animated--grow-in"
                        aria-labelledby="userDropdown"
                    >
                        <button className="dropdown-item" onClick={startLogout}>
                            <i className="fas fa-sign-out-alt fa-sm fa-fw me-2 text-gray-400" />
                            Salir
                        </button>
                    </div>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
