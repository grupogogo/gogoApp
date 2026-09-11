import React, { useEffect, useRef, useState } from 'react'
import { useAuthStore, useClientesStore, usePedidosStore } from '../../../hooks';

export const ClienteLoadInput = () => {
    const [searchTerm, setSearchTerm] = useState(""); // Estado para el valor del input
    const [suggestions, setSuggestions] = useState([]); // Estado para las sugerencias
    const { clientes, startLoadingClientes, setClienteActivo } = useClientesStore();
    const [mostrarLista, setMostrarLista] = useState(false);
    const { getPedidosCliente } = usePedidosStore();
    const { user } = useAuthStore();
    const inputRef = useRef(null);
    const [selectedIndex, setSelectedIndex] = useState(-1);


    const handleKeyDown = (e) => {
        if (suggestions.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prevIndex) =>
                prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prevIndex) =>
                prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1
            );
        } else if (e.key === "Enter") {
            if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                handleSuggestionClick(suggestions[selectedIndex]);
            }
        } else if (e.key === "Escape") {
            setMostrarLista(false);
            setSelectedIndex(-1);
        }
    };

    const handleBlur = () => {
        // Esperar un poco para permitir click en sugerencias antes de cerrar
        setTimeout(() => {
            setSearchTerm("");
            setMostrarLista(false);
        }, 150);
    };

    useEffect(() => {
        startLoadingClientes();
    }, []);
    // Filtrar clientes mientras el usuario escribe en el input
    useEffect(() => {
        if (searchTerm) {
            const filteredClients = clientes.filter(cliente =>
                cliente.user._id === user.uid && // Filtra solo los clientes creados por el usuario activo
                cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) // Aplica el filtro por nombre
            );
            setSuggestions(filteredClients);
        } else {
            setSuggestions([]);
        }
    }, [searchTerm, clientes, user]);

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSuggestionClick = (cliente) => {
        setClienteActivo(cliente);  // Establece el cliente activo en el estado global o slice
        setSearchTerm('');  // Muestra el nombre del cliente seleccionado en el input
        getPedidosCliente(cliente.cliente_id);  // Carga los pedidos del cliente seleccionado
        setTimeout(() => setSuggestions([]), 1);//!Revisar    
    };    

    return (
        <div className="position-relative w-100">
            <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                    <i className="fa-solid fa-magnifying-glass"></i>
                </span>
                <input
                    ref={inputRef}
                    type="text"
                    className="form-control border-start-0 ps-0 shadow-none"
                    placeholder="Escribe el nombre o razón social del cliente..."
                    value={searchTerm}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    onFocus={() => setMostrarLista(true)}
                    onChange={handleInputChange}
                />
                {searchTerm && (
                    <button
                        type="button"
                        className="btn btn-link text-muted position-absolute end-0 top-50 translate-middle-y me-2 text-decoration-none"
                        style={{ zIndex: 10 }}
                        onClick={() => setSearchTerm('')}
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                )}
            </div>
            {suggestions.length > 0 && (
                <ul
                    className="list-group position-absolute w-100 rounded-3 shadow-lg mt-1 border"
                    style={{ top: "100%", left: 0, zIndex: 1060, maxHeight: "250px", overflowY: "auto" }}
                >
                    {suggestions.map((cliente, index) => (
                        <li
                            className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2 px-3 border-bottom ${index === selectedIndex ? 'active' : ''}`}
                            style={{ cursor: 'pointer' }}
                            key={cliente.cliente_id}
                            onClick={() => handleSuggestionClick(cliente)}
                        >
                            <div>
                                <i className="fa-solid fa-user text-primary me-2"></i>
                                <strong className="text-dark">{cliente.nombre}</strong>
                                {cliente.ciudad && (
                                    <small className="text-muted ms-2">
                                        <i className="fa-solid fa-location-dot me-1 text-secondary"></i>
                                        {cliente.ciudad}
                                    </small>
                                )}
                            </div>
                            <span className={`badge rounded-pill px-2 py-1 ${cliente.distribuidor ? 'bg-primary-subtle text-primary border border-primary-subtle' : 'bg-light text-secondary border'}`} style={{ fontSize: '0.72rem' }}>
                                {cliente.distribuidor ? 'Distribuidor' : 'Casual'}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
