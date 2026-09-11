import { useEffect, useState } from "react";
import { ProductsTable } from "./forms/ProductsTable";
import { ImagesCiriosComunion } from "./ImagesCiriosComunion";
import { HeadersPedidos } from "./forms/HeadersPedidos";
import { useForm } from "../../hooks";
import { Collapse } from 'bootstrap';


export const KitComunionECO = ({ agregarPedidoGeneral, resetearPedido, initialItems }) => {
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
        if (resetearPedido) {
            setPedidoKCP([]);
            setCantidadItems(0);
            const collapseElement = document.getElementById('collapseNine');
            if (collapseElement) {
                const bsCollapse = Collapse.getInstance(collapseElement) || new Collapse(collapseElement, { toggle: false });
                //bsCollapse.hide();
            }
        }
    }, [resetearPedido]);

    useEffect(() => {
        agregarPedidoGeneral('KCE', pedidoKCP, detalle); // Llamamos al callback con el pedido y la categoría
    }, [pedidoKCP, detalle]);

    return (
        <>
            {/* HEADER KIT COMUNION ECONOMICO */}
            <div className="">
                <HeadersPedidos codigo='KCE' titulo='KIT COMUNION ECONÓMICO' cantidadItems={cantidadItems} collapsed='Nine' />

                <div id="collapseNine" className="collapse" aria-labelledby="headingNine" data-bs-parent="#accordionExample"
                    style={{ overflow: 'hidden', transition: 'height 0.3s ease' }}>
                    <div className="row">
                        {/* COLUMNA IZQUIERDA */}
                        <div className="col-lg-7">
                            {/* Segunda fila */}
                            <ImagesCiriosComunion className="border" pedido={pedidoKCP} setPedido={setPedidoKCP} categoria='kce' setCantidadItems={setCantidadItems} />
                            <div className="card border border-light-subtle shadow-xs rounded-4 p-3 bg-white mb-3">
                                <label className="form-label small fw-semibold text-muted mb-1" htmlFor="detalle-KCE">
                                    <i className="fa-regular fa-comment-dots me-1 text-primary"></i> Observaciones de Kit Comunión Económico (opcional)
                                </label>
                                <textarea
                                    className="form-control shadow-none border-light-subtle"
                                    id="detalle-KCE"
                                    name="detalle"
                                    value={detalle}
                                    onChange={onInputChange}
                                    rows={2}
                                    placeholder="Nombres, detalles especiales o empaque..."
                                ></textarea>
                            </div>
                        </div>
                        {/* COLUMNA DERECHA TABLA */}
                        <ProductsTable CategoryProduct={3} tablaPedido={pedidoKCP} setPedido={setPedidoKCP} />
                    </div>
                </div>
            </div>
        </>
    )
}
