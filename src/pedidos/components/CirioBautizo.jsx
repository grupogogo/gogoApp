import { useEffect, useState } from "react";
import { ImagesCiriosComunion } from "./ImagesCiriosComunion";
import { ProductsTable } from "./forms/ProductsTable";
import { HeadersPedidos } from "./forms/HeadersPedidos";
import { useForm } from "../../hooks";
import { Collapse } from 'bootstrap';
// Cierra el collapse manualmente con Bootstrap

export const CirioBautizo = ({ agregarPedidoGeneral, resetearPedido, initialItems }) => {
    const [cantidadItems, setCantidadItems] = useState(() => {
        return (initialItems?.pedido || []).reduce((acc, item) => acc + (parseInt(item.cantidad, 10) || 0), 0);
    });
    const [pedidoCB, setPedidoCB] = useState(() => initialItems?.pedido || []);
    const { detalle = '', onInputChange, setFormState } = useForm({
        detalle: initialItems?.detalleGeneral || ''
    });

    useEffect(() => {
        if (initialItems) {
            const items = initialItems.pedido || [];
            setPedidoCB(items);
            const qty = items.reduce((acc, item) => acc + (parseInt(item.cantidad, 10) || 0), 0);
            setCantidadItems(qty);
            if (initialItems.detalleGeneral !== undefined) {
                setFormState(prev => ({ ...prev, detalle: initialItems.detalleGeneral || '' }));
            }
        }
    }, [initialItems]);

    useEffect(() => {
        agregarPedidoGeneral('CB', pedidoCB, detalle); // Llamamos al callback con el pedido y la categoría
    }, [pedidoCB, detalle]);

    useEffect(() => {
        if (resetearPedido) {
            setPedidoCB([]);
            setCantidadItems(0);
            const collapseElement = document.getElementById('collapseFive');
            if (collapseElement) {
                const bsCollapse = Collapse.getInstance(collapseElement) || new Collapse(collapseElement, { toggle: false });
                bsCollapse.hide();
            }
        }
    }, [resetearPedido]);

    return (
        <>
            <div className="">
                <HeadersPedidos codigo='CB' titulo='CIRIO DE BAUTIZO' cantidadItems={cantidadItems} collapsed='Five' />

                <div id="collapseFive" className="collapse" aria-labelledby="headingFive" data-bs-parent="#accordionExample"
                    style={{ overflow: 'hidden', transition: 'height 0.3s ease' }}>
                    <div className="row">
                        {/* COLUMNA IZQUIERDA */}
                        <div className="col-lg-7">
                            {/* Segunda fila */}
                            <ImagesCiriosComunion pedido={pedidoCB} setPedido={setPedidoCB} categoria='cb' setCantidadItems={setCantidadItems} />
                            <div className="card border border-light-subtle shadow-xs rounded-4 p-3 bg-white mb-3">
                                <label className="form-label small fw-semibold text-muted mb-1" htmlFor="detalleCB">
                                    <i className="fa-regular fa-comment-dots me-1 text-primary"></i> Observaciones de Cirio Bautizo (opcional)
                                </label>
                                <textarea
                                    className="form-control shadow-none border-light-subtle"
                                    id="detalleCB"
                                    name="detalle"
                                    value={detalle}
                                    onChange={onInputChange}
                                    rows={2}
                                    placeholder="Nombres, detalles especiales o empaque..."
                                ></textarea>
                            </div>
                        </div>
                        {/* COLUMNA DERECHA TABLA */}
                        <ProductsTable CategoryProduct={3} tablaPedido={pedidoCB} setPedido={setPedidoCB} />
                    </div>
                </div>
            </div>
        </>
    )
}
