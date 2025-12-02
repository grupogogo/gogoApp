import React, { useEffect } from 'react'
import { useClientesStore, useFuntions } from '../../../hooks';
import Swal from 'sweetalert2';

export const FormGuantes = ({ categoria, tallaInicial, cantTallas, setPedidoGuantes, pedidoGuantes }) => {

    const { buscarPrecio, buscarNombre, capitalize } = useFuntions();
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

    return (
        <>
            {/* Segunda fila */}
            <div className="row m-2 shadow">
                <div className="badge text-bg-success text-wrap mb-3">
                    GUANTES {categoria}
                </div>
                {[...Array(cantTallas)].map((_, index) => (
                    <div key={index} className="col-md-3 col-sm-3 p-1">
                        <div className="text-center rounded">
                            <div className="input-group has-validation mb-2 border border-success rounded-2">
                                <div className="input-group-prepend">
                                    <span className="input-group-text fw-bold">T{index + tallaInicial}</span>
                                </div>
                                <input
                                    type="number"
                                    className="form-control"
                                    name={`inputGuantes-T${index + tallaInicial}-${categoria}`}
                                    value={pedidoGuantes.find(item => item.nombreInput === `inputGuantes-T${index + tallaInicial}-${categoria}`)?.cantidad || '0'}
                                    onChange={event => onInputChange(event, (index + tallaInicial))}
                                    min="0" // Establecer un mínimo    
                                    onFocus={(e) => e.target.select()}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

