import React, { useEffect, useState } from 'react'
import { useAuthStore, useClientesStore, usePedidosStore } from '../../../hooks';

export const ClienteLoadInput = () => {
    const [searchTerm, setSearchTerm] = useState(""); // Estado para el valor del input
    const [suggestions, setSuggestions] = useState([]); // Estado para las sugerencias
    const { clientes, startLoadingClientes, setClienteActivo } = useClientesStore();
    const {  getPedidosCliente } = usePedidosStore();    
    const {user} =  useAuthStore();

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
                type="text"
                className="form-control"
                placeholder="Razón social o nombre"
                value={searchTerm}
                onChange={handleInputChange}
            />
            {suggestions.length > 0 && (
                <ul
                    className="list-group position-absolute w-100"
                    style={{ top: "100%", left: 0, zIndex: 1000 }}
                >
                    {suggestions.map((cliente) => (
                        <li
                            key={cliente.cliente_id}
                            className="list-group-item list-group-item-action"
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
