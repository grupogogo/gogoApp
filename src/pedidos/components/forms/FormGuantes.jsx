import React, { useEffect } from 'react'
import { useFuntions } from '../../../hooks';

export const FormGuantes = ({ categoria, tallaInicial, cantTallas, setPedidoGuantes, pedidoGuantes }) => {

    const {buscarPrecio} = useFuntions()


    
    const onInputChange = ({ target }, talla) => {
        const { name, value } = target;

        // Validaciones iniciales
        if (value === '' || isNaN(Number(value))) return;
        if (value < 0) return;

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
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

