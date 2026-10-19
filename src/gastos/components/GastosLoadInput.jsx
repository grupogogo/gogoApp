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
            const term = searchTerm.toLowerCase();
            const suggestionsList = [];

            gastos.forEach(gasto => {
                const gastoUserId = (gasto.user?._id || gasto.user?.uid || gasto.user)?.toString();
                if (gastoUserId !== user.uid) return;

                // Si el gasto tiene items desglosados, incluir cada item individual
                if (Array.isArray(gasto.items) && gasto.items.length > 0) {
                    gasto.items.forEach(it => {
                        if (it.gasto && it.gasto.toLowerCase().includes(term)) {
                            suggestionsList.push({
                                gasto: it.gasto,
                                codigo: it.codigo,
                                subCategoria: it.subCategoria,
                                precio: it.precio,
                                cantidad: it.cantidad || 1,
                                proveedor: gasto.proveedor,
                                categoria: gasto.categoria,
                                tipoGasto: gasto.tipoGasto
                            });
                        }
                    });
                }

                // Gasto a nivel raíz
                if (gasto.gasto && gasto.gasto.toLowerCase().includes(term)) {
                    suggestionsList.push({
                        ...gasto,
                        gasto: gasto.gasto,
                        proveedor: gasto.proveedor,
                    });
                }
            });

            // Evitar duplicados por nombre de gasto
            const uniqueGastos = Array.from(
                new Map(
                    suggestionsList.map(g => [g.gasto.toLowerCase(), g])
                ).values()
            );

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
        <div className="position-relative">
            <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                    <i className="fa-solid fa-magnifying-glass"></i>
                </span>
                <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Escribe para buscar y autocompletar un gasto frecuente..."
                    value={searchTerm}
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
                    className="list-group position-absolute w-100 shadow-lg mt-1"
                    style={{ top: "100%", left: 0, zIndex: 1070, maxHeight: "220px", overflowY: "auto" }}
                >
                    {suggestions.map((gasto, idx) => (
                        <li
                            key={gasto._id || gasto.id || gasto.gastos_id || idx}
                            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2 px-3 border-bottom"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleSuggestionClick(gasto)}
                        >
                            <div>
                                <i className="fa-solid fa-file-invoice text-primary me-2"></i>
                                <span className="fw-semibold text-dark">{gasto.gasto}</span>
                                {gasto.proveedor && (
                                    <small className="text-muted ms-2">
                                        <i className="fa-solid fa-building text-secondary me-1"></i>
                                        {gasto.proveedor}
                                    </small>
                                )}
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                {gasto.codigo && (
                                    <span className="badge bg-light text-secondary border">
                                        {gasto.codigo}
                                    </span>
                                )}
                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                                    ${gasto.precio?.toLocaleString('es-CO') || gasto.precio}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
