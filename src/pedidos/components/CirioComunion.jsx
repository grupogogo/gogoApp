import React, { useEffect, useState } from 'react'
import { ImagesCiriosComunion } from './ImagesCiriosComunion';
import { ProductsTable } from './forms/ProductsTable';
import { HeadersPedidos } from './forms/HeadersPedidos';
import { useForm } from '../../hooks';
import { Collapse } from 'bootstrap';
            


export const CirioComunion = ({ agregarPedidoGeneral, resetearPedido, initialItems }) => {
    const [cantidadItems, setCantidadItems] = useState(() => {
        return (initialItems?.pedido || []).reduce((acc, item) => acc + (parseInt(item.cantidad, 10) || 0), 0);
    });

    const [pedidoCC, setPedidoCC] = useState(() => initialItems?.pedido || []);
    const { detalle = '', onInputChange, setFormState } = useForm({
        detalle: initialItems?.detalleGeneral || ''
    });

    useEffect(() => {
        if (initialItems) {
            const items = initialItems.pedido || [];
            setPedidoCC(items);
            const qty = items.reduce((acc, item) => acc + (parseInt(item.cantidad, 10) || 0), 0);
            setCantidadItems(qty);
            if (initialItems.detalleGeneral !== undefined) {
                setFormState(prev => ({ ...prev, detalle: initialItems.detalleGeneral || '' }));
            }
        }
    }, [initialItems]);

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
                            <div className="card border border-light-subtle shadow-xs rounded-4 p-3 bg-white mb-3">
                                <label className="form-label small fw-semibold text-muted mb-1" htmlFor="detalleCC">
                                    <i className="fa-regular fa-comment-dots me-1 text-primary"></i> Observaciones de Cirio Comunión (opcional)
                                </label>
                                <textarea
                                    className="form-control shadow-none border-light-subtle"
                                    id="detalleCC"
                                    name="detalle"
                                    value={detalle}
                                    onChange={onInputChange}
                                    rows={2}
                                    placeholder="Nombres, detalles especiales o empaque..."
                                ></textarea>
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