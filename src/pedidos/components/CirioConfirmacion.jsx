import React, { useEffect, useState } from 'react';
import { ImagesCiriosComunion } from './ImagesCiriosComunion';
import { ProductsTable } from './forms/ProductsTable';
import { HeadersPedidos } from './forms/HeadersPedidos';
import { useForm } from '../../hooks';
import { Collapse } from 'bootstrap';

export const CirioConfirmacion = ({ agregarPedidoGeneral, resetearPedido, initialItems }) => {
    const [cantidadItems, setCantidadItems] = useState(() => {
        return (initialItems?.pedido || []).reduce((acc, item) => acc + (parseInt(item.cantidad, 10) || 0), 0);
    });

    const [pedidoCCON, setPedidoCCON] = useState(() => initialItems?.pedido || []);
    const { detalle = '', onInputChange, setFormState } = useForm({
        detalle: initialItems?.detalleGeneral || ''
    });

    useEffect(() => {
        if (initialItems) {
            const items = initialItems.pedido || [];
            setPedidoCCON(items);
            const qty = items.reduce((acc, item) => acc + (parseInt(item.cantidad, 10) || 0), 0);
            setCantidadItems(qty);
            if (initialItems.detalleGeneral !== undefined) {
                setFormState(prev => ({ ...prev, detalle: initialItems.detalleGeneral || '' }));
            }
        }
    }, [initialItems]);

    useEffect(() => {
        agregarPedidoGeneral('CCON', pedidoCCON, detalle);
    }, [pedidoCCON, detalle]);

    useEffect(() => {
        if (resetearPedido) {
            setPedidoCCON([]);
            setCantidadItems(0);
            const collapseElement = document.getElementById('collapseConfirmacion');
            if (collapseElement) {
                const bsCollapse = Collapse.getInstance(collapseElement) || new Collapse(collapseElement, { toggle: false });
                bsCollapse.hide();
            }
        }
    }, [resetearPedido]);

    return (
        <>
            <div className="">
                <HeadersPedidos codigo='CCON' titulo='CIRIO DE CONFIRMACIÓN' cantidadItems={cantidadItems} collapsed='Confirmacion' />

                <div id="collapseConfirmacion" className="collapse" aria-labelledby="headingConfirmacion" data-bs-parent="#accordionExample"
                    style={{ overflow: 'hidden', transition: 'height 0.3s ease' }}>
                    <div className="row">
                        {/* COLUMNA IZQUIERDA */}
                        <div className="col-lg-7">
                            <ImagesCiriosComunion pedido={pedidoCCON} setPedido={setPedidoCCON} categoria='ccon' setCantidadItems={setCantidadItems} />
                            <div className="card border border-light-subtle shadow-xs rounded-4 p-3 bg-white mb-3">
                                <label className="form-label small fw-semibold text-muted mb-1" htmlFor="detalleCCON">
                                    <i className="fa-regular fa-comment-dots me-1 text-primary"></i> Observaciones de Cirio Confirmación (opcional)
                                </label>
                                <textarea
                                    className="form-control shadow-none border-light-subtle"
                                    id="detalleCCON"
                                    name="detalle"
                                    value={detalle}
                                    onChange={onInputChange}
                                    rows={2}
                                    placeholder="Nombres, detalles especiales o empaque..."
                                ></textarea>
                            </div>
                        </div>
                        {/* COLUMNA DERECHA TABLA */}
                        <ProductsTable CategoryProduct={2} tablaPedido={pedidoCCON} setPedido={setPedidoCCON} />
                    </div>
                </div>
            </div>
        </>
    );
};
