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
        <div className="input-group">
            <input
                ref={inputRef}
                type="text"
                className="form-control"
                placeholder="Razón social o nombre"
                value={searchTerm}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                onFocus={() => setMostrarLista(true)}
                onChange={handleInputChange}
            />
            {suggestions.length > 0 && (
                <ul
                    className="list-group position-absolute w-100 rounded-1"
                    style={{ top: "100%", left: 0, zIndex: 1000 }}
                >
                    {suggestions.map((cliente, index) => (
                        <li
                            className={`list-group-item list-group-item-action ${index === selectedIndex ? 'active' : ''}`}
                            style={{ cursor: 'pointer' }}
                            key={cliente.cliente_id}
                            onClick={() => handleSuggestionClick(cliente)}
                        >
                            {cliente.nombre}
                        </li>
                    ))}
                </ul>
            )}
            <span className="input-group-text">
                <i className="fa-solid fa-magnifying-glass"></i>
            </span>
        </div>
    )
}
