import { NavLink } from "react-router-dom";
import { Pedidos } from "../pedidos/pages/Pedidos";
import { Clientes } from "../clients/pages/Clientes";
import { ListaPedidos } from "../pedidos/pages/ListaPedidos";
import { useAuthStore, useClientesStore } from "../hooks";
import { useState } from "react";

const Sidebar = () => {
    const { limpiarClienteActivo } = useClientesStore();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { user } = useAuthStore();
    console.log(user)
    const handleSidebarToggle = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <>
            {(user && user.rol === "admin" || user.rol === "superAdmin") && (

                <div className={`navbar-nav bg-gradient-primary sidebar sidebar-dark accordion ${isCollapsed ? "toggled" : ""}`} id="accordionSidebar">
                    {/* Sidebar - Brand */}
                    <NavLink className="sidebar-brand d-flex align-items-center justify-content-center" to="/">
                        <div className="sidebar-brand-icon rotate-n-15">
                            <i className="fas fa-laugh-wink" />
                        </div>
                        {!isCollapsed && (
                            <div className="sidebar-brand-text mx-3">
                                <sup>Gogo Admin</sup>
                            </div>
                        )}
                    </NavLink>

                    {/* Divider */}
                    <hr className="sidebar-divider my-0" />

                    {/* Sidebar Items */}
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/dashboard">
                            <i className="fas fa-fw fa-tachometer-alt" />
                            {!isCollapsed && <span>Dashboard</span>}
                        </NavLink>
                    </li>

                    {/* <li className="nav-item">
                <NavLink className="nav-link" to="/charts">
                    <i className="fas fa-fw fa-chart-area" />
                    {!isCollapsed && <span>Charts</span>}
                </NavLink>
            </li> */}

                    <li className="nav-item">
                        <NavLink className="nav-link" to="/bur">
                            <i className="fas fa-fw fa-sack-dollar" />
                            {!isCollapsed && <span>Budget</span>}
                        </NavLink>
                    </li>

                    <hr className="sidebar-divider" />

                    <li className="nav-item" onClick={limpiarClienteActivo}>
                        <NavLink className="nav-link" to="/pedidos">
                            <i className="fas fa-fw fa-clipboard-list" />
                            {!isCollapsed && <span className="text-light">Crear Pedido</span>}
                        </NavLink>
                    </li>

                    <li className="nav-item">
                        <NavLink className="nav-link" to="/listaPedidos">
                            <i className="fas fa-fw fa-list-check" />
                            {!isCollapsed && <span>Listado de pedidos</span>}
                        </NavLink>
                    </li>

                    <hr className="sidebar-divider" />

                    <li className="nav-item">
                        <NavLink className="nav-link" to="/clientes">
                            <i className="fas fa-fw fa-address-book" />
                            {!isCollapsed && <span>Clientes</span>}
                        </NavLink>
                    </li>

                    <hr className="sidebar-divider" />

                    <li className="nav-item">
                        <NavLink className="nav-link" to="/productos">
                            <i className="fas fa-fw fa-table" />
                            {!isCollapsed && <span>Productos</span>}
                        </NavLink>
                    </li>

                    <hr className="sidebar-divider" />

                   {/*  <li className="nav-item">
                        <NavLink className="nav-link" to="/inventario">
                            <i className="fas fa-fw fa-list-check" />
                            {!isCollapsed && <span>Inventario</span>}
                        </NavLink>
                    </li> */}

                    {/* <li className="nav-item">
                        <NavLink className="nav-link" to="/solicitudes">
                            <i className="fas fa-fw fa-envelope-open-text" />
                            {!isCollapsed && <span>Solicitudes</span>}
                        </NavLink>
                    </li> */}

                    <hr className="sidebar-divider d-none d-md-block" />

                    {/* Sidebar Toggler */}
                    <div className="text-center text-middle text-light">
                        <button className="" id="sidebarToggle" onClick={handleSidebarToggle}>
                        </button>
                    </div>
                </div>
            )}
            {(user && user.rol === "planta") && (
                <div className={`navbar-nav bg-gradient-primary sidebar sidebar-dark accordion ${isCollapsed ? "toggled" : ""}`} id="accordionSidebar">
                    {/* Sidebar - Brand */}
                    <NavLink className="sidebar-brand d-flex align-items-center justify-content-center" to="/">
                        <div className="sidebar-brand-icon rotate-n-15">
                            <i className="fas fa-laugh-wink" />
                        </div>
                        {!isCollapsed && (
                            <div className="sidebar-brand-text mx-3">
                                <sup>Gogo Admin</sup>
                            </div>
                        )}
                    </NavLink>

                    {/* Divider */}
                    <hr className="sidebar-divider my-0" />

                    <li className="nav-item">
                        <NavLink className="nav-link" to="/listaPedidos">
                            <i className="fas fa-fw fa-list-check" />
                            {!isCollapsed && <span>Listado de pedidos</span>}
                        </NavLink>
                    </li>
                    <hr className="sidebar-divider d-none d-md-block" />

                    {/* Sidebar Toggler */}
                    <div className="text-center text-middle text-light">
                        <button className="" id="sidebarToggle" onClick={handleSidebarToggle}>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
export default Sidebar;



