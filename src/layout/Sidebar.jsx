import { NavLink } from "react-router-dom";
import { useAuthStore, useClientesStore } from "../hooks";
import { useState } from "react";

const Sidebar = () => {
    const { limpiarClienteActivo } = useClientesStore();
    const { user, startLogout } = useAuthStore();
    const [isHovered, setIsHovered] = useState(false);

    if (!user || user.rol === "planta") return null;

    const navItemStyle = (isActive) => ({
        display: "flex",
        alignItems: "center",
        padding: "8px 12px",
        borderRadius: "10px",
        textDecoration: "none",
        position: "relative",
        transition: "all 0.2s ease",
        marginBottom: "4px",
        backgroundColor: isActive ? "rgba(59, 130, 246, 0.15)" : "transparent",
        border: isActive ? "1px solid rgba(96, 165, 250, 0.3)" : "1px solid transparent",
        color: isActive ? "#ffffff" : "#94a3b8",
        fontWeight: isActive ? "600" : "500",
    });

    const iconBoxStyle = (isActive) => ({
        width: "38px",
        height: "38px",
        minWidth: "38px",
        borderRadius: "9px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1rem",
        transition: "all 0.2s ease",
        background: isActive
            ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
            : "rgba(255, 255, 255, 0.05)",
        color: isActive ? "#ffffff" : "#94a3b8",
        boxShadow: isActive ? "0 4px 12px rgba(37, 99, 235, 0.35)" : "none",
    });

    const labelStyle = {
        marginLeft: "12px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        fontSize: "0.86rem",
        transition: "opacity 0.22s ease, transform 0.22s ease",
        opacity: isHovered ? 1 : 0,
        transform: isHovered ? "translateX(0)" : "translateX(-6px)",
        pointerEvents: isHovered ? "auto" : "none",
    };

    const sectionTitleStyle = {
        fontSize: "0.68rem",
        letterSpacing: "0.08em",
        color: "#64748b",
        fontWeight: "700",
        textTransform: "uppercase",
        padding: isHovered ? "10px 12px 4px 12px" : "10px 0 4px 0",
        whiteSpace: "nowrap",
        overflow: "hidden",
        transition: "all 0.2s ease",
        textAlign: isHovered ? "left" : "center",
        opacity: isHovered ? 0.9 : 0.4,
    };

    return (
        <aside
            className="d-none d-md-flex flex-column position-fixed h-100 sidebar shadow-lg"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                width: isHovered ? "280px" : "80px",
                transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease",
                zIndex: 1050,
                background: "linear-gradient(180deg, #0f172a 0%, #111e33 50%, #0b1120 100%)",
                borderRight: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: isHovered
                    ? "12px 0 32px -4px rgba(0, 0, 0, 0.65)"
                    : "4px 0 16px rgba(0, 0, 0, 0.3)",
                left: 0,
                top: 0,
                userSelect: "none",
            }}
        >
            {/* Cabecera / Logo alineada a la altura exacta de la Navbar (64px) */}
            <div
                className="d-flex align-items-center px-3"
                style={{
                    height: "64px",
                    minHeight: "64px",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                }}
            >
                <NavLink
                    to="/dashboard"
                    className="d-flex align-items-center text-decoration-none w-100"
                    style={{ overflow: "hidden" }}
                >
                    <div
                        className="d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "10px",
                            background: "rgba(255, 255, 255, 0.04)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            transition: "transform 0.2s ease",
                        }}
                    >
                        <img
                            src="/images/logos/LOGO GOGO BLANCO.webp"
                            alt="Logo Gogo"
                            style={{
                                width: "32px",
                                height: "auto",
                                objectFit: "contain",
                            }}
                        />
                    </div>
                    <div
                        style={{
                            marginLeft: "12px",
                            whiteSpace: "nowrap",
                            transition: "opacity 0.2s ease, transform 0.2s ease",
                            opacity: isHovered ? 1 : 0,
                            transform: isHovered ? "translateX(0)" : "translateX(-6px)",
                        }}
                    >
                        <span
                            className="fw-bold d-block text-white"
                            style={{ fontSize: "0.95rem", letterSpacing: "0.02em" }}
                        >
                            GRUPO GOGO
                        </span>
                        <small
                            className="text-info d-block fw-semibold"
                            style={{ fontSize: "0.68rem", letterSpacing: "0.05em" }}
                        >
                            SISTEMA COMERCIAL
                        </small>
                    </div>
                </NavLink>
            </div>

            {/* Navegación con scroll estilizado */}
            <nav
                className="flex-grow-1 p-2 d-flex flex-column"
                style={{
                    overflowY: "auto",
                    overflowX: "hidden",
                }}
            >
                {/* SECCIÓN: PRINCIPAL */}
                <div style={sectionTitleStyle}>
                    {isHovered ? "Principal" : "•••"}
                </div>

                {/* Dashboard */}
                <NavLink
                    to="/dashboard"
                    title="Dashboard"
                    style={({ isActive }) => navItemStyle(isActive)}
                    onMouseEnter={(e) => {
                        if (!e.currentTarget.className.includes("active")) {
                            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
                            e.currentTarget.style.color = "#f8fafc";
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!e.currentTarget.className.includes("active")) {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = "#94a3b8";
                        }
                    }}
                >
                    {({ isActive }) => (
                        <>
                            {isActive && (
                                <span
                                    style={{
                                        position: "absolute",
                                        left: 0,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        height: "22px",
                                        width: "3.5px",
                                        borderRadius: "0 4px 4px 0",
                                        backgroundColor: "#3b82f6",
                                        boxShadow: "0 0 10px rgba(59, 130, 246, 0.8)",
                                    }}
                                />
                            )}
                            <div style={iconBoxStyle(isActive)}>
                                <i className="fas fa-tachometer-alt" />
                            </div>
                            <span style={labelStyle}>Dashboard</span>
                        </>
                    )}
                </NavLink>

                {/* Gastos (Oculto para vendedor) */}
                {user.rol !== "vendedor" && (
                    <NavLink
                        to="/gastos"
                        title="Gastos"
                        style={({ isActive }) => navItemStyle(isActive)}
                        onMouseEnter={(e) => {
                            if (!e.currentTarget.className.includes("active")) {
                                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
                                e.currentTarget.style.color = "#f8fafc";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!e.currentTarget.className.includes("active")) {
                                e.currentTarget.style.backgroundColor = "transparent";
                                e.currentTarget.style.color = "#94a3b8";
                            }
                        }}
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <span
                                        style={{
                                            position: "absolute",
                                            left: 0,
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            height: "22px",
                                            width: "3.5px",
                                            borderRadius: "0 4px 4px 0",
                                            backgroundColor: "#3b82f6",
                                            boxShadow: "0 0 10px rgba(59, 130, 246, 0.8)",
                                        }}
                                    />
                                )}
                                <div style={iconBoxStyle(isActive)}>
                                    <i className="fas fa-sack-dollar" />
                                </div>
                                <span style={labelStyle}>Gastos</span>
                            </>
                        )}
                    </NavLink>
                )}

                {/* SECCIÓN: OPERACIONES */}
                <div style={sectionTitleStyle}>
                    {isHovered ? "Operaciones" : "•••"}
                </div>

                {/* Crear Pedido */}
                <NavLink
                    to="/pedidos"
                    onClick={limpiarClienteActivo}
                    title="Crear Pedido"
                    style={({ isActive }) => navItemStyle(isActive)}
                    onMouseEnter={(e) => {
                        if (!e.currentTarget.className.includes("active")) {
                            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
                            e.currentTarget.style.color = "#f8fafc";
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!e.currentTarget.className.includes("active")) {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = "#94a3b8";
                        }
                    }}
                >
                    {({ isActive }) => (
                        <>
                            {isActive && (
                                <span
                                    style={{
                                        position: "absolute",
                                        left: 0,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        height: "22px",
                                        width: "3.5px",
                                        borderRadius: "0 4px 4px 0",
                                        backgroundColor: "#3b82f6",
                                        boxShadow: "0 0 10px rgba(59, 130, 246, 0.8)",
                                    }}
                                />
                            )}
                            <div style={iconBoxStyle(isActive)}>
                                <i className="fas fa-clipboard-list" />
                            </div>
                            <span style={labelStyle}>Crear Pedido</span>
                        </>
                    )}
                </NavLink>

                {/* Listado de Pedidos */}
                <NavLink
                    to="/listaPedidos"
                    title="Listado de pedidos"
                    style={({ isActive }) => navItemStyle(isActive)}
                    onMouseEnter={(e) => {
                        if (!e.currentTarget.className.includes("active")) {
                            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
                            e.currentTarget.style.color = "#f8fafc";
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!e.currentTarget.className.includes("active")) {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = "#94a3b8";
                        }
                    }}
                >
                    {({ isActive }) => (
                        <>
                            {isActive && (
                                <span
                                    style={{
                                        position: "absolute",
                                        left: 0,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        height: "22px",
                                        width: "3.5px",
                                        borderRadius: "0 4px 4px 0",
                                        backgroundColor: "#3b82f6",
                                        boxShadow: "0 0 10px rgba(59, 130, 246, 0.8)",
                                    }}
                                />
                            )}
                            <div style={iconBoxStyle(isActive)}>
                                <i className="fas fa-boxes-stacked" />
                            </div>
                            <span style={labelStyle}>Listado de pedidos</span>
                        </>
                    )}
                </NavLink>

                {/* Cuentas por Cobrar */}
                <NavLink
                    to="/CuentasXCobrar"
                    title="Cuentas por cobrar"
                    style={({ isActive }) => navItemStyle(isActive)}
                    onMouseEnter={(e) => {
                        if (!e.currentTarget.className.includes("active")) {
                            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
                            e.currentTarget.style.color = "#f8fafc";
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!e.currentTarget.className.includes("active")) {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = "#94a3b8";
                        }
                    }}
                >
                    {({ isActive }) => (
                        <>
                            {isActive && (
                                <span
                                    style={{
                                        position: "absolute",
                                        left: 0,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        height: "22px",
                                        width: "3.5px",
                                        borderRadius: "0 4px 4px 0",
                                        backgroundColor: "#3b82f6",
                                        boxShadow: "0 0 10px rgba(59, 130, 246, 0.8)",
                                    }}
                                />
                            )}
                            <div style={iconBoxStyle(isActive)}>
                                <i className="fas fa-file-invoice-dollar" />
                            </div>
                            <span style={labelStyle}>Cuentas por cobrar</span>
                        </>
                    )}
                </NavLink>

                {/* Tareas / To-Do */}
                <NavLink
                    to="/tareas"
                    title="Tareas / To-Do"
                    style={({ isActive }) => navItemStyle(isActive)}
                    onMouseEnter={(e) => {
                        if (!e.currentTarget.className.includes("active")) {
                            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
                            e.currentTarget.style.color = "#f8fafc";
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!e.currentTarget.className.includes("active")) {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = "#94a3b8";
                        }
                    }}
                >
                    {({ isActive }) => (
                        <>
                            {isActive && (
                                <span
                                    style={{
                                        position: "absolute",
                                        left: 0,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        height: "22px",
                                        width: "3.5px",
                                        borderRadius: "0 4px 4px 0",
                                        backgroundColor: "#3b82f6",
                                        boxShadow: "0 0 10px rgba(59, 130, 246, 0.8)",
                                    }}
                                />
                            )}
                            <div style={iconBoxStyle(isActive)}>
                                <i className="fas fa-list-check" />
                            </div>
                            <span style={labelStyle}>Tareas / To-Do</span>
                        </>
                    )}
                </NavLink>

                {/* SECCIÓN: HISTORIAL (Solo no vendedores) */}
                {user.rol !== "vendedor" && (
                    <>
                        <div style={sectionTitleStyle}>
                            {isHovered ? "Historial" : "•••"}
                        </div>

                        <NavLink
                            to="/pedidos/old"
                            onClick={limpiarClienteActivo}
                            title="OLD Orders"
                            style={({ isActive }) => navItemStyle(isActive)}
                            onMouseEnter={(e) => {
                                if (!e.currentTarget.className.includes("active")) {
                                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
                                    e.currentTarget.style.color = "#f8fafc";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!e.currentTarget.className.includes("active")) {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                    e.currentTarget.style.color = "#94a3b8";
                                }
                            }}
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <span
                                            style={{
                                                position: "absolute",
                                                left: 0,
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                height: "22px",
                                                width: "3.5px",
                                                borderRadius: "0 4px 4px 0",
                                                backgroundColor: "#3b82f6",
                                                boxShadow: "0 0 10px rgba(59, 130, 246, 0.8)",
                                            }}
                                        />
                                    )}
                                    <div style={iconBoxStyle(isActive)}>
                                        <i className="fas fa-folder-tree" />
                                    </div>
                                    <span style={labelStyle}>OLD Orders</span>
                                </>
                            )}
                        </NavLink>

                        <NavLink
                            to="/pedidos/listOldOrders"
                            onClick={limpiarClienteActivo}
                            title="List OLD Orders"
                            style={({ isActive }) => navItemStyle(isActive)}
                            onMouseEnter={(e) => {
                                if (!e.currentTarget.className.includes("active")) {
                                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
                                    e.currentTarget.style.color = "#f8fafc";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!e.currentTarget.className.includes("active")) {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                    e.currentTarget.style.color = "#94a3b8";
                                }
                            }}
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <span
                                            style={{
                                                position: "absolute",
                                                left: 0,
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                height: "22px",
                                                width: "3.5px",
                                                borderRadius: "0 4px 4px 0",
                                                backgroundColor: "#3b82f6",
                                                boxShadow: "0 0 10px rgba(59, 130, 246, 0.8)",
                                            }}
                                        />
                                    )}
                                    <div style={iconBoxStyle(isActive)}>
                                        <i className="fas fa-clock-rotate-left" />
                                    </div>
                                    <span style={labelStyle}>List OLD Orders</span>
                                </>
                            )}
                        </NavLink>

                        <NavLink
                            to="/pedidos/cruceCuentas"
                            onClick={limpiarClienteActivo}
                            title="Cruce de Cuentas"
                            style={({ isActive }) => navItemStyle(isActive)}
                            onMouseEnter={(e) => {
                                if (!e.currentTarget.className.includes("active")) {
                                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
                                    e.currentTarget.style.color = "#f8fafc";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!e.currentTarget.className.includes("active")) {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                    e.currentTarget.style.color = "#94a3b8";
                                }
                            }}
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <span
                                            style={{
                                                position: "absolute",
                                                left: 0,
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                height: "22px",
                                                width: "3.5px",
                                                borderRadius: "0 4px 4px 0",
                                                backgroundColor: "#3b82f6",
                                                boxShadow: "0 0 10px rgba(59, 130, 246, 0.8)",
                                            }}
                                        />
                                    )}
                                    <div style={iconBoxStyle(isActive)}>
                                        <i className="fas fa-scale-balanced" />
                                    </div>
                                    <span style={labelStyle}>Cruce de Cuentas</span>
                                </>
                            )}
                        </NavLink>
                    </>
                )}

                {/* SECCIÓN: DIRECTORIO */}
                <div style={sectionTitleStyle}>
                    {isHovered ? "Directorio" : "•••"}
                </div>

                <NavLink
                    to="/clientes"
                    title="Clientes"
                    style={({ isActive }) => navItemStyle(isActive)}
                    onMouseEnter={(e) => {
                        if (!e.currentTarget.className.includes("active")) {
                            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
                            e.currentTarget.style.color = "#f8fafc";
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!e.currentTarget.className.includes("active")) {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = "#94a3b8";
                        }
                    }}
                >
                    {({ isActive }) => (
                        <>
                            {isActive && (
                                <span
                                    style={{
                                        position: "absolute",
                                        left: 0,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        height: "22px",
                                        width: "3.5px",
                                        borderRadius: "0 4px 4px 0",
                                        backgroundColor: "#3b82f6",
                                        boxShadow: "0 0 10px rgba(59, 130, 246, 0.8)",
                                    }}
                                />
                            )}
                            <div style={iconBoxStyle(isActive)}>
                                <i className="fas fa-users" />
                            </div>
                            <span style={labelStyle}>Clientes</span>
                        </>
                    )}
                </NavLink>

                {/* Gestión de Precios (Solo administradores) */}
                {user.rol !== "vendedor" && (
                    <NavLink
                        to="/precios"
                        onClick={limpiarClienteActivo}
                        title="Gestión de Precios"
                        style={({ isActive }) => navItemStyle(isActive)}
                        onMouseEnter={(e) => {
                            if (!e.currentTarget.className.includes("active")) {
                                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
                                e.currentTarget.style.color = "#f8fafc";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!e.currentTarget.className.includes("active")) {
                                e.currentTarget.style.backgroundColor = "transparent";
                                e.currentTarget.style.color = "#94a3b8";
                            }
                        }}
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <span
                                        style={{
                                            position: "absolute",
                                            left: 0,
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            height: "22px",
                                            width: "3.5px",
                                            borderRadius: "0 4px 4px 0",
                                            backgroundColor: "#3b82f6",
                                            boxShadow: "0 0 10px rgba(59, 130, 246, 0.8)",
                                        }}
                                    />
                                )}
                                <div style={iconBoxStyle(isActive)}>
                                    <i className="fas fa-tags" />
                                </div>
                                <span style={labelStyle}>Gestión Precios</span>
                            </>
                        )}
                    </NavLink>
                )}

                {/* Pie de navegación / Botón Salir */}
                <div
                    className="mt-auto pt-2"
                    style={{
                        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                >
                    <button
                        onClick={startLogout}
                        title="Cerrar sesión"
                        className="w-100 border-0 text-start"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "8px 12px",
                            borderRadius: "10px",
                            background: "transparent",
                            color: "#f87171",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.15)";
                            e.currentTarget.style.color = "#fca5a5";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = "#f87171";
                        }}
                    >
                        <div
                            style={{
                                width: "38px",
                                height: "38px",
                                minWidth: "38px",
                                borderRadius: "9px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1rem",
                                background: "rgba(239, 68, 68, 0.12)",
                                color: "#f87171",
                                transition: "all 0.2s ease",
                            }}
                        >
                            <i className="fas fa-sign-out-alt" />
                        </div>
                        <span style={{ ...labelStyle, color: "inherit", fontWeight: "600" }}>
                            Cerrar Sesión
                        </span>
                    </button>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;
