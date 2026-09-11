import React, { useEffect } from 'react'
import { useClientesStore, useFuntions } from '../../../hooks';
import Swal from 'sweetalert2';

export const FormGuantes = ({ categoria, tallaInicial, cantTallas, setPedidoGuantes, pedidoGuantes }) => {

    const { buscarPrecio, buscarNombre, capitalize, formatearPrecio } = useFuntions();
    const { clienteActivo } = useClientesStore();

    const verificarPrecio = () => {
        switch (categoria) {
            case 'BLANCOS':
                if (clienteActivo.precios.precioGuantes.gb !== null) {
                    return true
                } else {
                    return false;
                }
            case 'NEGROS':
                if (clienteActivo.precios.precioGuantes.gn !== null) {
                    return true
                } else {
                    return false;
                }
            case 'MITON':
                if (clienteActivo.precios.precioGuantes.gm !== null) {
                    return true
                } else {
                    return false;
                }

            default:
                break;
        }
    }

    const onInputChange = ({ target }, talla) => {

        const { name, value } = target;

        // Validaciones iniciales
        if (value === '' || isNaN(Number(value))) return;
        if (value < 0) return;

        const ban = verificarPrecio()
        if (!ban) {
            Swal.fire({
                icon: "error",
                title: 'Agregue primero el precio de guantes ' + categoria.toLowerCase() + ' para el cliente ' + clienteActivo.nombre,
                text: "Alto está mal!",
            });
            return;
        }

        setPedidoGuantes(prevState => {
            // Clonar el estado previo
            const nuevoEstado = [...prevState];
            const index = nuevoEstado.findIndex(item => item.nombreInput === name);

            if (value !== '0') {
                const nuevoItem = {
                    nombreInput: name, // Usar el nombre del input como identificador
                    cantidad: value,
                    talla: 'T-' + talla,
                    categoria,
                    precioUnitario: buscarPrecio(categoria),
                };
                if (index !== -1) {
                    // Si existe, actualizamos el objeto existente
                    nuevoEstado[index] = nuevoItem;
                } else {
                    // Si no existe, agregamos un nuevo objeto
                    nuevoEstado.push(nuevoItem);
                }
            } else {
                // Eliminar el objeto si el valor es '0'
                if (index !== -1) {
                    // Si existe, eliminamos
                    nuevoEstado.splice(index, 1);
                }
            }
            return nuevoEstado;
        });
    };

    useEffect(() => {
    }, [pedidoGuantes]);

    const getHeaderTheme = (cat) => {
        switch (cat) {
            case 'BLANCOS':
                return {
                    badgeClass: 'bg-white text-dark border border-light-subtle',
                    icon: 'fa-hand',
                    price: clienteActivo?.precios?.precioGuantes?.gb,
                };
            case 'NEGROS':
                return {
                    badgeClass: 'bg-dark text-white',
                    icon: 'fa-hand',
                    price: clienteActivo?.precios?.precioGuantes?.gn,
                };
            case 'MITON':
                return {
                    badgeClass: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle',
                    icon: 'fa-mitten',
                    price: clienteActivo?.precios?.precioGuantes?.gm,
                };
            default:
                return {
                    badgeClass: 'bg-success-subtle text-success',
                    icon: 'fa-hand',
                    price: null,
                };
        }
    };

    const theme = getHeaderTheme(categoria);

    // Sumar items de esta categoría específica de guantes
    const itemsEnCategoria = pedidoGuantes
        .filter(item => item.categoria === categoria)
        .reduce((acc, item) => acc + parseInt(item.cantidad || 0, 10), 0);

    return (
        <div className="card border border-light-subtle shadow-xs rounded-4 p-3 bg-white mb-3">
            <div className="d-flex align-items-center justify-content-between pb-2 mb-3 border-bottom flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                    <span className={`badge rounded-pill px-3 py-1 fw-bold fs-7 ${theme.badgeClass}`}>
                        <i className={`fa-solid ${theme.icon} me-1`}></i>
                        GUANTES {categoria}
                    </span>
                    {theme.price ? (
                        <span className="badge bg-light text-muted border border-light-subtle rounded-pill px-2 py-1 small fw-normal">
                            {formatearPrecio(theme.price)} c/u
                        </span>
                    ) : null}
                </div>

                {itemsEnCategoria > 0 && (
                    <span className="badge bg-success text-white rounded-pill px-2 py-1 small">
                        <i className="fa-solid fa-check me-1"></i>
                        {itemsEnCategoria} {itemsEnCategoria === 1 ? 'par' : 'pares'}
                    </span>
                )}
            </div>

            <div className="row g-2">
                {[...Array(cantTallas)].map((_, index) => {
                    const tallaNum = index + tallaInicial;
                    const inputName = `inputGuantes-T${tallaNum}-${categoria}`;
                    const currentVal = pedidoGuantes.find(item => 
                        item.nombreInput === inputName || 
                        (item.categoria === categoria && (item.talla === `T-${tallaNum}` || item.talla === `T${tallaNum}` || item.talla === String(tallaNum)))
                    )?.cantidad || '0';
                    const hasValue = parseInt(currentVal, 10) > 0;

                    return (
                        <div key={index} className="col-6 col-sm-4 col-md-3">
                            <div className={`p-2 rounded-3 border transition-all ${
                                hasValue
                                    ? 'border-success bg-success-subtle bg-opacity-25'
                                    : 'border-light-subtle bg-light bg-opacity-50'
                            }`}>
                                <div className="d-flex align-items-center justify-content-between mb-1">
                                    <span className="badge bg-white text-dark border border-light-subtle rounded-pill px-2 py-0 small fw-bold">
                                        T-{tallaNum}
                                    </span>
                                    {hasValue && (
                                        <i className="fa-solid fa-circle-check text-success small"></i>
                                    )}
                                </div>
                                <div className="input-group input-group-sm">
                                    <span className="input-group-text bg-white text-muted small px-1 border-light-subtle">
                                        Pares
                                    </span>
                                    <input
                                        type="number"
                                        className={`form-control form-control-sm text-center fw-bold shadow-none ${
                                            hasValue ? 'border-success text-success' : 'border-light-subtle'
                                        }`}
                                        name={inputName}
                                        value={currentVal}
                                        onChange={event => onInputChange(event, tallaNum)}
                                        min="0"
                                        onFocus={(e) => e.target.select()}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


