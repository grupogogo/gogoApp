import React, { useEffect, useState } from 'react'
import { useAuthStore, useClientesStore, usePedidosStore } from '../../hooks';
import { useGastosStore } from '../../hooks/useGastosStore';

export const GastosLoadInput = () => {
    const [searchTerm, setSearchTerm] = useState(""); // Estado para el valor del input
    const [suggestions, setSuggestions] = useState([]); // Estado para las sugerencias
    const { user } = useAuthStore();
    const { gastos, setGastoActivo } = useGastosStore();


    useEffect(() => {
        if (searchTerm) {
            const filteredGastos = gastos
                .filter(gasto =>
                    gasto.user === user.uid &&
                    gasto.gasto.toLowerCase().includes(searchTerm.toLowerCase())
                );

            // Crear un conjunto para eliminar duplicados por nombre de gasto (ignorando mayúsculas/minúsculas)
            const uniqueGastos = Array.from(
                new Map(
                    filteredGastos.map(gasto => [gasto.gasto.toLowerCase(), gasto]) // Usa un Map para evitar duplicados
                ).values()
            );

            // Ordenar alfabéticamente ignorando mayúsculas/minúsculas
            uniqueGastos.sort((a, b) => a.gasto.toLowerCase().localeCompare(b.gasto.toLowerCase()));

            setSuggestions(uniqueGastos);
        } else {
            setSuggestions([]);
        }
    }, [searchTerm, gastos, user]);



    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSuggestionClick = (gasto) => {
        setGastoActivo(gasto);  // Establece el cliente activo en el estado global o slice
        setSearchTerm('');  // Muestra el nombre del cliente seleccionado en el input
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
                    className="list-group position-absolute w-100 shadow-lg"
                    style={{ top: "100%", left: 0, zIndex: 1000, cursor: 'pointer' }}
                >
                    {suggestions.map((gasto) => (
                        <li
                            key={gasto.gastos_id}
                            className="list-group-item list-group-item-action"
                            onClick={() => handleSuggestionClick(gasto)}
                        >
                            {gasto.gasto}
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
