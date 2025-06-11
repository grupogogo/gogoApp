import React, { useEffect, useState } from 'react'
import { ImagesCiriosComunion } from './ImagesCiriosComunion';
import { ProductsTable } from './forms/ProductsTable';
import { HeadersPedidos } from './forms/HeadersPedidos';
import { useForm } from '../../hooks';
import { Collapse } from 'bootstrap';
            


export const CirioComunion = ({ agregarPedidoGeneral, resetearPedido }) => {
    const [cantidadItems, setCantidadItems] = useState(0)

    const [pedidoCC, setPedidoCC] = useState([]);
    const { detalle = '', onInputChange } = useForm();

    useEffect(() => {
        agregarPedidoGeneral('CC', pedidoCC, detalle); // Llamamos al callback con el pedido y la categoría
    }, [pedidoCC, detalle]);

    useEffect(() => {
        if (resetearPedido) {            
            setPedidoCC([]);
            setCantidadItems(0);
            // Cierra el collapse manualmente con Bootstrap
            const collapseElement = document.getElementById('collapseFour');
            if (collapseElement) {
                const bsCollapse = Collapse.getInstance(collapseElement) || new Collapse(collapseElement, { toggle: false });
                bsCollapse.hide();
            }
        }
    }, [resetearPedido]);

    return (
        <>
            <div className="">
                <HeadersPedidos codigo='CC' titulo='CIRIO COMUNIÓN' cantidadItems={cantidadItems} collapsed='Four' />

                <div id="collapseFour" className="collapse" aria-labelledby="headingFour" data-bs-parent="#accordionExample"
                    style={{ overflow: 'hidden', transition: 'height 0.3s ease' }}>
                    <div className="row">
                        {/* COLUMNA IZQUIERDA */}
                        <div className="col-lg-7">
                            {/* Segunda fila */}
                            <ImagesCiriosComunion pedido={pedidoCC} setPedido={setPedidoCC} categoria='cc' setCantidadItems={setCantidadItems} />
                            <hr />
                            <div className="row">
                                <div className="col-md">
                                    <div className="form-group card-body">
                                        <label htmlFor="detalleCG">Detalle general de la categoría CC</label>
                                        <textarea className="form-control" id="detalleCG" name='detalle' value={detalle} onChange={onInputChange}></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* COLUMNA DERECHA TABLA */}
                        <ProductsTable CategoryProduct={2} tablaPedido={pedidoCC} setPedido={setPedidoCC} />
                    </div>
                </div>
            </div>
        </>
    )
}