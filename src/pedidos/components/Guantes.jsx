import React, { useEffect, useState } from 'react'
import { ProductsTable } from './forms/ProductsTable';
import { FormGuantes } from './forms/FormGuantes';
import { HeadersPedidos } from './forms/HeadersPedidos';
import { useClientesStore, useForm, usePedidosStore } from '../../hooks';
import { Collapse } from 'bootstrap';


export const Guantes = ({ agregarPedidoGeneral, resetearPedido, initialItems }) => {
    const [totalCalculado, setTotalCalculado] = useState(0);
    const [cantidadItems, setCantidadItems] = useState(() => {
        return (initialItems?.pedido || []).reduce((acc, item) => acc + (parseInt(item.cantidad || 0, 10)), 0);
    });
    const [pedidoGuantes, setPedidoGuantes] = useState(() => initialItems?.pedido || []);
    const { detalle = '', onInputChange, setFormState } = useForm({
        detalle: initialItems?.detalleGeneral || ''
    });
    const { clienteActivo } = useClientesStore();
    const { startSetGuantes, totalGuantes } = usePedidosStore();
    const precioGuantes = {
        guantes: {
            BLANCOS: clienteActivo?.precios?.precioGuantes?.gb || 0,
            NEGROS: clienteActivo?.precios?.precioGuantes?.gn || 0,
            MITON: clienteActivo?.precios?.precioGuantes?.gm || 0
        }
    };

    useEffect(() => {
        if (initialItems) {
            const items = initialItems.pedido || [];
            setPedidoGuantes(items);
            const qty = items.reduce((acc, item) => acc + (parseInt(item.cantidad || 0, 10)), 0);
            setCantidadItems(qty);
            if (initialItems.detalleGeneral !== undefined) {
                setFormState(prev => ({ ...prev, detalle: initialItems.detalleGeneral || '' }));
            }
        }
    }, [initialItems]);


    useEffect(() => {
        if (resetearPedido) {
            setPedidoGuantes([]);
            setCantidadItems(0);
            setTotalCalculado(0);
            const collapseElement = document.getElementById('collapseSix');
            if (collapseElement) {
                const bsCollapse = Collapse.getInstance(collapseElement) || new Collapse(collapseElement, { toggle: false });
                bsCollapse.hide();
            }
        }
    }, [resetearPedido]);

    useEffect(() => {
        const cantidad = pedidoGuantes.reduce((acc, item) => acc + parseInt(item.cantidad || 0, 10), 0);
        setCantidadItems(cantidad);
        const subtotal = Object.values(pedidoGuantes).reduce((acc, item) => {
            const precio = precioGuantes.guantes[item.categoria] ?? item.precioUnitario ?? 0;
            return acc + (parseInt(item.cantidad || 0, 10) * (precio || 0));
        }, 0);
        setTotalCalculado(subtotal);
        agregarPedidoGeneral('GUANTES', pedidoGuantes, detalle);
        startSetGuantes(subtotal);

    }, [pedidoGuantes, detalle, clienteActivo])

    return (
        <>
            {/* HEADER*/}
            <div className="">
                <HeadersPedidos
                    codigo='GUA'
                    titulo='GUANTES  [BLANCOS - NEGROS - MITÓN - ESPECIAL]'
                    cantidadItems={cantidadItems}
                    collapsed='Six'
                    vTotal={totalCalculado}
                />
                <div id="collapseSix" className="collapse mt-2" aria-labelledby="headingSix" data-bs-parent="#accordionExample"
                    style={{ overflow: 'hidden', transition: 'height 0.3s ease' }}>
                    <div className="row">
                        {/* COLUMNA IZQUIERDA */}
                        <div className="col-lg-7">
                            <FormGuantes categoria="BLANCOS" tallaInicial={4} cantTallas={9} setPedidoGuantes={setPedidoGuantes} pedidoGuantes={pedidoGuantes} />
                            <FormGuantes categoria="NEGROS" tallaInicial={6} cantTallas={7} setPedidoGuantes={setPedidoGuantes} pedidoGuantes={pedidoGuantes} />
                            <FormGuantes categoria="MITON" tallaInicial={7} cantTallas={4} setPedidoGuantes={setPedidoGuantes} pedidoGuantes={pedidoGuantes} />
                            {/* <FormGuantes categoria="ESPECIAL" tallaInicial={7} cantTallas={4} setPedidoGuantes={setPedidoGuantes} pedidoGuantes={pedidoGuantes} /> */}
                            <div className="card border border-light-subtle shadow-xs rounded-4 p-3 bg-white mb-3">
                                <label className="form-label small fw-semibold text-muted mb-1" htmlFor="detalleGUA">
                                    <i className="fa-regular fa-comment-dots me-1 text-primary"></i> Observaciones de Guantes (opcional)
                                </label>
                                <textarea
                                    className="form-control shadow-none border-light-subtle"
                                    id="detalleGUA"
                                    name="detalle"
                                    value={detalle}
                                    onChange={onInputChange}
                                    rows={2}
                                    placeholder="Nombres, detalles especiales o empaque..."
                                ></textarea>
                            </div>
                        </div>
                        {/* COLUMNA DERECHA TABLA */}
                        <ProductsTable CategoryProduct={5} tablaPedido={pedidoGuantes} setPedido={setPedidoGuantes} />
                    </div>
                </div>
            </div>
        </>
    )
}