import { useEffect, useState } from 'react';
import { ImagesCiriosComunion, ProductsTable } from '..';
import { HeadersPedidos } from './forms/HeadersPedidos';
import { useForm } from '../../hooks';
import { Collapse } from 'bootstrap';


export const KitComungrande = ({ agregarPedidoGeneral, resetearPedido, initialItems }) => {
    const [cantidadItems, setCantidadItems] = useState(() => {
        return (initialItems?.pedido || []).reduce((acc, item) => acc + (parseInt(item.cantidad, 10) || 0), 0);
    });
    const [pedidoKCG, setPedidoKCG] = useState(() => initialItems?.pedido || []);
    const { detalle = '', onInputChange, setFormState } = useForm({
        detalle: initialItems?.detalleGeneral || ''
    });

    useEffect(() => {
        if (initialItems) {
            const items = initialItems.pedido || [];
            setPedidoKCG(items);
            const qty = items.reduce((acc, item) => acc + (parseInt(item.cantidad, 10) || 0), 0);
            setCantidadItems(qty);
            if (initialItems.detalleGeneral !== undefined) {
                setFormState(prev => ({ ...prev, detalle: initialItems.detalleGeneral || '' }));
            }
        }
    }, [initialItems]);

    useEffect(() => {
        if (resetearPedido) {           
            setPedidoKCG([]);
            setCantidadItems(0);
            // Cierra el collapse manualmente con Bootstrap
            const collapseElement = document.getElementById('collapseOne');
            if (collapseElement) {
                const bsCollapse = Collapse.getInstance(collapseElement) || new Collapse(collapseElement, { toggle: false });
                bsCollapse.hide();
            }

        }
    }, [resetearPedido]);

    useEffect(() => {
        agregarPedidoGeneral('KCG', pedidoKCG, detalle); // Llamamos al callback con el pedido y la categoría
    }, [pedidoKCG, detalle]);
    return (
        <>
            {/* HEADER KIT COMUNION */}
            <div className="">
                <HeadersPedidos codigo='KCG' titulo='KIT COMUNION GRANDE' cantidadItems={cantidadItems} collapsed='One' />
                <div id="collapseOne" className="collapse" aria-labelledby="headingOne" data-bs-parent="#accordionExample"
                    style={{ overflow: 'hidden', transition: 'height 0.3s ease' }}>
                    <div className="row">
                        {/* COLUMNA IZQUIERDA */}
                        <div className="col-lg-7">
                            {/* Segunda fila */}
                            <ImagesCiriosComunion pedido={pedidoKCG} setPedido={setPedidoKCG} categoria='kcg' setCantidadItems={setCantidadItems} />
                            <div className="card border border-light-subtle shadow-xs rounded-4 p-3 bg-white mb-3">
                                <label className="form-label small fw-semibold text-muted mb-1" htmlFor="detalleCG">
                                    <i className="fa-regular fa-comment-dots me-1 text-primary"></i> Observaciones de Kit Comunión Grande (opcional)
                                </label>
                                <textarea
                                    className="form-control shadow-none border-light-subtle"
                                    id="detalleCG"
                                    name="detalle"
                                    value={detalle}
                                    onChange={onInputChange}
                                    rows={2}
                                    placeholder="Nombres, detalles especiales o empaque..."
                                ></textarea>
                            </div>
                        </div>
                        {/* COLUMNA DERECHA TABLA */}
                        <ProductsTable CategoryProduct={1} tablaPedido={pedidoKCG} setPedido={setPedidoKCG} />
                    </div>
                </div>
            </div>
        </>
    )
}
