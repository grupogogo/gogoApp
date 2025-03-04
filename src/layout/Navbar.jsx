import { Navigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../hooks/useAuthStore";
import { useState } from "react";

const Navbar = () => {
    const { user, startLogout } = useAuthStore();
    //console.log(user)

    const [isOpen, setIsOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsOpen(!isOpen);
    };
    return (
        <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
            <div className="btn-group">
                <button
                    type="button"
                    className="btn btn-link dropdown-toggle d-md-none mr-3"
                    aria-expanded={isOpen}
                    onClick={toggleMobileMenu}
                >
                    <i className="fa fa-bars" />
                </button>
                <ul
                    className={`dropdown-menu d-md-none position-absolute ${isOpen ? "show" : "d-none"}`}
                    style={{ left: 2, top: "50px", width: "auto", minWidth: "200px" }}
                >
                    <li>
                        <NavLink className="nav-link dropdown-item ml-2" to="/dashboard">Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <NavLink className="nav-link dropdown-item ml-2" to="/blur">Budget
                        </NavLink>
                    </li>
                    <li>
                        <NavLink className="nav-link dropdown-item ml-2" to="/pedidos">Crear pedido
                        </NavLink>
                    </li>
                    <li>
                        <NavLink className="nav-link dropdown-item ml-2" to="/listapedidos">Listar pedidos
                        </NavLink>
                    </li>
                    <li>
                        <NavLink className="nav-link dropdown-item ml-2" to="/clientes">Clientes
                        </NavLink>
                    </li>
                    <li>
                        <NavLink className="nav-link dropdown-item ml-2" to="/productos">Productos
                        </NavLink>
                    </li>
                </ul>

            </div>
            <div className="nav-item text-gray-600 small text-center text-middle text-start ml-2">
                {new Date().toLocaleDateString('es-CO', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}
            </div>
            {/* Sidebar Toggle (Topbar) */}

            {/* Topbar Navbar */}
            <ul className="navbar-nav ms-auto">
                {/* Nav Item - Alerts */}
                <li className="nav-item dropdown no-arrow mx-1">
                    <a
                        className="nav-link dropdown-toggle"
                        href="#"
                        id="alertsDropdown"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                        style={{ display: "none" }}
                    >
                        <i className="fas fa-bell fa-fw" />
                        <span className="badge bg-danger badge-counter">3+</span>
                    </a>
                    {/* Dropdown - Alerts */}
                    <div className="dropdown-list dropdown-menu dropdown-menu-end shadow animated--grow-in" aria-labelledby="alertsDropdown">
                        <h6 className="dropdown-header">Alerts Center</h6>
                        <a className="dropdown-item d-flex align-items-center" href="#">
                            <div className="mr-3">
                                <div className="icon-circle bg-primary">
                                    <i className="fas fa-file-alt text-white" />
                                </div>
                            </div>
                            <div>
                                <div className="small text-gray-500">December 12, 2019</div>
                                <span className="font-weight-bold">A new monthly report is ready to download!</span>
                            </div>
                        </a>
                    </div>
                </li>

                {/* Nav Item - Messages */}
                <li className="nav-item dropdown no-arrow mx-1">
                    <a
                        className="nav-link dropdown-toggle"
                        href="#"
                        id="messagesDropdown"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                        style={{ display: "none" }}

                    >
                        <i className="fas fa-envelope fa-fw" />
                        <span className="badge bg-danger badge-counter">7</span>
                    </a>
                    {/* Dropdown - Messages */}
                    <div className="dropdown-list dropdown-menu dropdown-menu-end shadow animated--grow-in" aria-labelledby="messagesDropdown">
                        <h6 className="dropdown-header">Message Center</h6>
                        <a className="dropdown-item d-flex align-items-center" href="#">
                            <div className="dropdown-list-image mr-3">
                                <img className="rounded-circle" src="/src/dashboard/img/undraw_profile_1.svg" alt="..." />
                                <div className="status-indicator bg-success" />
                            </div>
                            <div className="font-weight-bold">
                                <div className="text-truncate">Hi there! I am wondering if you can help me with a problem I've been having.</div>
                                <div className="small text-gray-500">Emily Fowler · 58m</div>
                            </div>
                        </a>
                        {/* Más mensajes */}
                    </div>
                </li>



                <div className="topbar-divider d-none d-sm-block" />

                {/* Nav Item - User Information */}
                <li className="nav-item dropdown no-arrow">
                    <a
                        className="nav-link dropdown-toggle"
                        href="#"
                        id="userDropdown"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                    >
                        <span className="mr-2 d-lg-inline text-gray-600 small">{user.name}</span>
                        <img className="img-profile rounded-circle" src="/images/avatar/undraw_profile.svg" />
                    </a>
                    {/* Dropdown - User Information */}
                    <div className="dropdown-menu dropdown-menu-end shadow animated--grow-in" aria-labelledby="userDropdown" >
                        <a className="dropdown-item" href="#" style={{ display: "none" }}>
                            <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400" />
                            Profile
                        </a>
                        <a className="dropdown-item" href="#" style={{ display: "none" }}>
                            <i className="fas fa-cogs fa-sm fa-fw mr-2 text-gray-400" />
                            Settings
                        </a>
                        <a className="dropdown-item" href="#" style={{ display: "none" }}>
                            <i className="fas fa-list fa-sm fa-fw mr-2 text-gray-400" />
                            Activity Log
                        </a>
                        <div className="dropdown-divider" />
                        <a className="dropdown-item" href="" data-bs-toggle="modal" data-bs-target="#logoutModal" onClick={() => startLogout()}>
                            <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400" />
                            Salir
                        </a>
                    </div>
                </li>
            </ul>
        </nav>
    )
};

export default Navbar;
