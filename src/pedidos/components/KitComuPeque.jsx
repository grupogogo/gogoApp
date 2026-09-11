import { useEffect, useState } from "react";
import { ImagesCiriosComunion } from "./ImagesCiriosComunion";
import { ProductsTable } from "./forms/ProductsTable";
import { HeadersPedidos } from "./forms/HeadersPedidos";
import { useForm } from "../../hooks";
import { Collapse } from 'bootstrap';

export const KitComuPeque = ({ agregarPedidoGeneral, resetearPedido, initialItems }) => {
    const [cantidadItems, setCantidadItems] = useState(() => {
        return (initialItems?.pedido || []).reduce((acc, item) => acc + (parseInt(item.cantidad, 10) || 0), 0);
    });
    const [pedidoKCP, setPedidoKCP] = useState(() => initialItems?.pedido || []);
    const { detalle = '', onInputChange, setFormState } = useForm({
        detalle: initialItems?.detalleGeneral || ''
    });

    useEffect(() => {
        if (initialItems) {
            const items = initialItems.pedido || [];
            setPedidoKCP(items);
            const qty = items.reduce((acc, item) => acc + (parseInt(item.cantidad, 10) || 0), 0);
            setCantidadItems(qty);
            if (initialItems.detalleGeneral !== undefined) {
                setFormState(prev => ({ ...prev, detalle: initialItems.detalleGeneral || '' }));
            }
        }
    }, [initialItems]);

    useEffect(() => {
        agregarPedidoGeneral('KCP', pedidoKCP, detalle); // Llamamos al callback con el pedido y la categoría           
    }, [pedidoKCP, detalle]);

    useEffect(() => {
        if (resetearPedido) {
            setPedidoKCP([]);
            setCantidadItems(0);
            // Cierra el collapse manualmente con Bootstrap
            const collapseElement = document.getElementById('collapseTwo');
            if (collapseElement) {
                const bsCollapse = Collapse.getInstance(collapseElement) || new Collapse(collapseElement, { toggle: false });
                bsCollapse.hide();
            }
        }
    }, [resetearPedido]);


    return (
        <>
            {/* HEADER KIT COMUNION */}
            <div className="">
                <HeadersPedidos codigo='KCP' titulo='KIT COMUNION PEQUEÑO' cantidadItems={cantidadItems} collapsed='Two' />
                <div id="collapseTwo" className="collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample"
                    style={{ overflow: 'hidden', transition: 'height 0.3s ease' }}>
                    <div className="row">
                        {/* COLUMNA IZQUIERDA */}
                        <div className="col-lg-7">
                            {/* Segunda fila */}
                            <ImagesCiriosComunion pedido={pedidoKCP} setPedido={setPedidoKCP} categoria='kcp' setCantidadItems={setCantidadItems} />
                            <div className="card border border-light-subtle shadow-xs rounded-4 p-3 bg-white mb-3">
                                <label className="form-label small fw-semibold text-muted mb-1" htmlFor="detalleKCP">
                                    <i className="fa-regular fa-comment-dots me-1 text-primary"></i> Observaciones de Kit Comunión Pequeño (opcional)
                                </label>
                                <textarea
                                    className="form-control shadow-none border-light-subtle"
                                    id="detalleKCP"
                                    name="detalle"
                                    value={detalle}
                                    onChange={onInputChange}
                                    rows={2}
                                    placeholder="Nombres, detalles especiales o empaque..."
                                ></textarea>
                            </div>
                        </div>
                        {/* COLUMNA DERECHA TABLA */}
                        <ProductsTable CategoryProduct={2} tablaPedido={pedidoKCP} setPedido={setPedidoKCP} />
                    </div>
                </div>
            </div>
        </>
    )
}
