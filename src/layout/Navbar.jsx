import { NavLink } from "react-router-dom";
import { useAuthStore } from "../hooks/useAuthStore";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useFuntions } from "../hooks/useFuntions";

const Navbar = () => {
    const { user, startLogout } = useAuthStore();
    const { theme, toggleTheme } = useTheme();
    const { aTitulo } = useFuntions();
    const [isOpen, setIsOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsOpen(!isOpen);
    };

    const rolFormateado = user?.rol === 'superAdmin'
        ? 'Super Administrador'
        : user?.rol === 'admin'
            ? 'Administrador'
            : 'Vendedor / Distribuidor';

    return (
        <nav
            className="navbar navbar-expand shadow-sm py-2 px-3 d-flex justify-content-between align-items-center"
            style={{
                marginLeft: user?.rol !== 'planta' ? "80px" : "0px",
                height: "64px",
                minHeight: "64px",
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                color: '#ffffff',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                zIndex: 1020,
                transition: 'margin-left 0.3s ease'
            }}
        >
            {/* Menú Móvil */}
            <div className="d-md-none position-relative">
                <button
                    className="btn btn-link text-white p-1"
                    onClick={toggleMobileMenu}
                    aria-label="Toggle navigation"
                >
                    <i className="fa fa-bars fa-lg" />
                </button>
                <ul
                    className={`dropdown-menu position-absolute ${isOpen ? "show" : "d-none"} p-2 shadow-lg`}
                    style={{
                        left: 0,
                        top: "48px",
                        minWidth: "220px",
                        zIndex: 1050,
                        background: "#0f172a",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        borderRadius: "12px"
                    }}
                >
                    <li>
                        <NavLink className="dropdown-item text-white py-2 px-3 rounded-2 d-flex align-items-center gap-2" to="/dashboard" onClick={() => setIsOpen(false)}>
                            <i className="fas fa-tachometer-alt text-primary" style={{ width: "18px" }} /> Dashboard
                        </NavLink>
                    </li>
                    {user?.rol !== 'vendedor' && (
                        <li>
                            <NavLink className="dropdown-item text-white py-2 px-3 rounded-2 d-flex align-items-center gap-2" to="/gastos" onClick={() => setIsOpen(false)}>
                                <i className="fas fa-sack-dollar text-warning" style={{ width: "18px" }} /> Gastos
                            </NavLink>
                        </li>
                    )}
                    {user?.rol !== 'planta' && (
                        <li>
                            <NavLink className="dropdown-item text-white py-2 px-3 rounded-2 d-flex align-items-center gap-2" to="/pedidos" onClick={() => setIsOpen(false)}>
                                <i className="fas fa-clipboard-list text-info" style={{ width: "18px" }} /> Crear pedido
                            </NavLink>
                        </li>
                    )}
                    <li>
                        <NavLink className="dropdown-item text-white py-2 px-3 rounded-2 d-flex align-items-center gap-2" to="/listapedidos" onClick={() => setIsOpen(false)}>
                            <i className="fas fa-boxes-stacked text-success" style={{ width: "18px" }} /> Listar pedidos
                        </NavLink>
                    </li>
                    <li>
                        <NavLink className="dropdown-item text-white py-2 px-3 rounded-2 d-flex align-items-center gap-2" to="/CuentasXCobrar" onClick={() => setIsOpen(false)}>
                            <i className="fas fa-file-invoice-dollar text-warning" style={{ width: "18px" }} /> Cuentas por cobrar
                        </NavLink>
                    </li>
                    {user?.rol !== 'planta' && (
                        <li>
                            <NavLink className="dropdown-item text-white py-2 px-3 rounded-2 d-flex align-items-center gap-2" to="/tareas" onClick={() => setIsOpen(false)}>
                                <i className="fas fa-list-check text-info" style={{ width: "18px" }} /> Tareas / To-Do
                            </NavLink>
                        </li>
                    )}
                    {user?.rol !== 'vendedor' && (
                        <>
                            <li>
                                <NavLink className="dropdown-item text-white py-2 px-3 rounded-2 d-flex align-items-center gap-2" to="/pedidos/listOldOrders" onClick={() => setIsOpen(false)}>
                                    <i className="fas fa-clock-rotate-left text-secondary" style={{ width: "18px" }} /> Consolidado anual
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="dropdown-item text-white py-2 px-3 rounded-2 d-flex align-items-center gap-2" to="/pedidos/cruceCuentas" onClick={() => setIsOpen(false)}>
                                    <i className="fas fa-scale-balanced text-primary" style={{ width: "18px" }} /> Cruce de Cuentas
                                </NavLink>
                            </li>
                        </>
                    )}
                    <li>
                        <NavLink className="dropdown-item text-white py-2 px-3 rounded-2 d-flex align-items-center gap-2" to="/clientes" onClick={() => setIsOpen(false)}>
                            <i className="fas fa-users text-primary" style={{ width: "18px" }} /> Clientes
                        </NavLink>
                    </li>
                    {user?.rol !== 'vendedor' && (
                        <li>
                            <NavLink className="dropdown-item text-white py-2 px-3 rounded-2 d-flex align-items-center gap-2" to="/precios" onClick={() => setIsOpen(false)}>
                                <i className="fas fa-tags text-info" style={{ width: "18px" }} /> Gestión Precios
                            </NavLink>
                        </li>
                    )}
                </ul>
            </div>

            {/* Usuario / Saludo a la izquierda */}
            <div className="d-flex align-items-center gap-3">
                {user?.rol === 'planta' ? (
                    <div className="text-center bg-secondary border-2 rounded d-none d-md-block p-1">
                        <img
                            src="/images/logos/LOGO GOGO BLANCO.webp"
                            alt="Logo"
                            style={{ width: "80px", height: "auto" }}
                        />
                    </div>
                ) : (
                    <div
                        className="rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm flex-shrink-0"
                        style={{
                            width: "42px",
                            height: "42px",
                            background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                            color: "#ffffff",
                            fontSize: "1.15rem"
                        }}
                    >
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'G'}
                    </div>
                )}

                <div className="d-none d-sm-block">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span className="fw-bold text-white" style={{ fontSize: "0.95rem" }}>
                            ¡Hola, {aTitulo(user?.name || 'Usuario')}!
                        </span>
                        <span
                            className="badge rounded-pill bg-primary bg-opacity-25 text-white border border-primary border-opacity-50 px-2 py-0 fw-normal"
                            style={{ fontSize: "0.68rem" }}
                        >
                            {rolFormateado}
                        </span>
                    </div>
                    <small className="text-white-50 d-block" style={{ fontSize: "0.72rem" }}>
                        <i className="far fa-calendar-alt me-1 text-info"></i>
                        {new Date().toLocaleDateString("es-CO", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </small>
                </div>
            </div>

            {/* Acciones a la derecha: Modo Noche/Día y Cerrar Sesión */}
            <div className="d-flex align-items-center gap-2">
                {/* Botón Tema (Noche / Día) */}
                <button
                    onClick={toggleTheme}
                    className="btn btn-sm d-flex align-items-center justify-content-center text-white border border-white border-opacity-25 rounded-circle shadow-xs"
                    title={theme === 'light' ? 'Cambiar a modo noche' : 'Cambiar a modo día'}
                    style={{
                        width: '38px',
                        height: '38px',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        transition: 'all 0.2s ease'
                    }}
                >
                    {theme === 'light' ? (
                        <i className="fas fa-moon text-warning" style={{ fontSize: '0.95rem' }}></i>
                    ) : (
                        <i className="fas fa-sun text-warning" style={{ fontSize: '0.95rem' }}></i>
                    )}
                </button>

                {/* Botón Cerrar Sesión */}
                <button
                    onClick={startLogout}
                    className="btn btn-sm d-flex align-items-center gap-2 text-white border border-danger border-opacity-50 px-3 py-1 rounded-pill shadow-xs"
                    title="Cerrar sesión"
                    style={{
                        backgroundColor: 'rgba(220, 53, 69, 0.2)',
                        transition: 'all 0.2s ease',
                        fontSize: '0.82rem'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.4)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.2)'}
                >
                    <i className="fas fa-sign-out-alt text-danger"></i>
                    <span className="d-none d-md-inline fw-semibold">Salir</span>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
