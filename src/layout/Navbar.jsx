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
            className="navbar navbar-expand app-navbar shadow-sm py-2 px-3 d-flex justify-content-between align-items-center"
            style={{
                height: "64px",
                minHeight: "64px",
                width: "100%",
                maxWidth: "100%",
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                color: '#ffffff',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                zIndex: 1020
            }}
        >
            {/* Botón Menú Móvil */}
            <div className="d-md-none">
                <button
                    className="btn btn-sm btn-outline-light border-0 d-flex align-items-center justify-content-center"
                    onClick={toggleMobileMenu}
                    aria-label="Abrir navegación móvil"
                    style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)' }}
                >
                    <i className="fa-solid fa-bars fs-5" />
                </button>

                {/* Drawer Móvil con Backdrop */}
                {isOpen && (
                    <div
                        className="mobile-drawer-backdrop"
                        onClick={() => setIsOpen(false)}
                    />
                )}
                <div className={`mobile-drawer-panel ${isOpen ? "open" : ""}`}>
                    {/* Cabecera del Drawer */}
                    <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary border-opacity-25">
                        <div className="d-flex align-items-center gap-2">
                            <img
                                src="/images/logos/LOGO GOGO BLANCO.webp"
                                alt="Logo"
                                style={{ width: "32px", height: "auto" }}
                            />
                            <div>
                                <span className="fw-bold d-block text-white" style={{ fontSize: "0.95rem" }}>GRUPO GOGO</span>
                                <small className="text-info d-block fw-semibold" style={{ fontSize: "0.68rem" }}>SISTEMA COMERCIAL</small>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn btn-sm btn-link text-white-50 p-2"
                            onClick={() => setIsOpen(false)}
                            aria-label="Cerrar menú"
                        >
                            <i className="fa-solid fa-xmark fs-5"></i>
                        </button>
                    </div>

                    {/* Perfil del Usuario en Drawer */}
                    <div className="p-3 bg-black bg-opacity-20 border-bottom border-secondary border-opacity-25 d-flex align-items-center gap-3">
                        <div
                            className="rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm flex-shrink-0"
                            style={{
                                width: "40px",
                                height: "40px",
                                background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                                color: "#ffffff",
                                fontSize: "1.1rem"
                            }}
                        >
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'G'}
                        </div>
                        <div className="overflow-hidden">
                            <span className="fw-bold text-white d-block text-truncate" style={{ fontSize: "0.9rem" }}>
                                {aTitulo(user?.name || 'Usuario')}
                            </span>
                            <span className="badge bg-primary bg-opacity-25 text-info border border-primary border-opacity-25 px-2 py-0 fw-normal" style={{ fontSize: "0.68rem" }}>
                                {rolFormateado}
                            </span>
                        </div>
                    </div>

                    {/* Lista de Navegación Móvil */}
                    <div className="flex-grow-1 p-2 overflow-y-auto">
                        <ul className="nav flex-column gap-1">
                            <li className="nav-item">
                                <NavLink
                                    className={({ isActive }) => `nav-link text-white rounded-3 py-2.5 px-3 d-flex align-items-center gap-3 ${isActive ? 'bg-primary shadow-sm' : 'hover-bg'}`}
                                    to="/dashboard"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <i className="fas fa-tachometer-alt" style={{ width: "20px" }} />
                                    <span>Dashboard</span>
                                </NavLink>
                            </li>
                            {user?.rol !== 'vendedor' && (
                                <li className="nav-item">
                                    <NavLink
                                        className={({ isActive }) => `nav-link text-white rounded-3 py-2.5 px-3 d-flex align-items-center gap-3 ${isActive ? 'bg-primary shadow-sm' : ''}`}
                                        to="/gastos"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <i className="fas fa-sack-dollar text-warning" style={{ width: "20px" }} />
                                        <span>Gastos</span>
                                    </NavLink>
                                </li>
                            )}
                            {user?.rol !== 'planta' && (
                                <li className="nav-item">
                                    <NavLink
                                        className={({ isActive }) => `nav-link text-white rounded-3 py-2.5 px-3 d-flex align-items-center gap-3 ${isActive ? 'bg-primary shadow-sm' : ''}`}
                                        to="/pedidos"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <i className="fas fa-clipboard-list text-info" style={{ width: "20px" }} />
                                        <span>Crear Pedido</span>
                                    </NavLink>
                                </li>
                            )}
                            <li className="nav-item">
                                <NavLink
                                    className={({ isActive }) => `nav-link text-white rounded-3 py-2.5 px-3 d-flex align-items-center gap-3 ${isActive ? 'bg-primary shadow-sm' : ''}`}
                                    to="/listapedidos"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <i className="fas fa-boxes-stacked text-success" style={{ width: "20px" }} />
                                    <span>Listar Pedidos</span>
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink
                                    className={({ isActive }) => `nav-link text-white rounded-3 py-2.5 px-3 d-flex align-items-center gap-3 ${isActive ? 'bg-primary shadow-sm' : ''}`}
                                    to="/CuentasXCobrar"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <i className="fas fa-file-invoice-dollar text-warning" style={{ width: "20px" }} />
                                    <span>Cuentas por Cobrar</span>
                                </NavLink>
                            </li>
                            {user?.rol !== 'planta' && (
                                <li className="nav-item">
                                    <NavLink
                                        className={({ isActive }) => `nav-link text-white rounded-3 py-2.5 px-3 d-flex align-items-center gap-3 ${isActive ? 'bg-primary shadow-sm' : ''}`}
                                        to="/tareas"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <i className="fas fa-list-check text-info" style={{ width: "20px" }} />
                                        <span>Tareas / To-Do</span>
                                    </NavLink>
                                </li>
                            )}
                            {user?.rol !== 'vendedor' && (
                                <>
                                    <li className="nav-item">
                                        <NavLink
                                            className={({ isActive }) => `nav-link text-white rounded-3 py-2.5 px-3 d-flex align-items-center gap-3 ${isActive ? 'bg-primary shadow-sm' : ''}`}
                                            to="/pedidos/listOldOrders"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <i className="fas fa-clock-rotate-left text-secondary" style={{ width: "20px" }} />
                                            <span>Consolidado Anual</span>
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink
                                            className={({ isActive }) => `nav-link text-white rounded-3 py-2.5 px-3 d-flex align-items-center gap-3 ${isActive ? 'bg-primary shadow-sm' : ''}`}
                                            to="/pedidos/cruceCuentas"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <i className="fas fa-scale-balanced text-primary" style={{ width: "20px" }} />
                                            <span>Cruce de Cuentas</span>
                                        </NavLink>
                                    </li>
                                </>
                            )}
                            <li className="nav-item">
                                <NavLink
                                    className={({ isActive }) => `nav-link text-white rounded-3 py-2.5 px-3 d-flex align-items-center gap-3 ${isActive ? 'bg-primary shadow-sm' : ''}`}
                                    to="/clientes"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <i className="fas fa-users text-primary" style={{ width: "20px" }} />
                                    <span>Clientes</span>
                                </NavLink>
                            </li>
                            {user?.rol !== 'vendedor' && (
                                <li className="nav-item">
                                    <NavLink
                                        className={({ isActive }) => `nav-link text-white rounded-3 py-2.5 px-3 d-flex align-items-center gap-3 ${isActive ? 'bg-primary shadow-sm' : ''}`}
                                        to="/precios"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <i className="fas fa-tags text-info" style={{ width: "20px" }} />
                                        <span>Gestión Precios</span>
                                    </NavLink>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Footer Drawer con Acciones */}
                    <div className="p-3 border-top border-secondary border-opacity-25 d-flex align-items-center justify-content-between gap-2">
                        <button
                            onClick={toggleTheme}
                            className="btn btn-sm btn-outline-light border-opacity-25 rounded-pill px-3 d-flex align-items-center gap-2"
                        >
                            <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'} text-warning`}></i>
                            <span style={{ fontSize: '0.8rem' }}>{theme === 'light' ? 'Modo Noche' : 'Modo Día'}</span>
                        </button>
                        <button
                            onClick={startLogout}
                            className="btn btn-sm btn-danger rounded-pill px-3 d-flex align-items-center gap-2"
                            style={{ fontSize: '0.8rem' }}
                        >
                            <i className="fas fa-sign-out-alt"></i>
                            <span>Salir</span>
                        </button>
                    </div>
                </div>
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
