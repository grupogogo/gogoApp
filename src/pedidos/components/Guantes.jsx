import React, { useEffect, useState } from 'react'
import { ProductsTable } from './forms/ProductsTable';
import { FormGuantes } from './forms/FormGuantes';
import { HeadersPedidos } from './forms/HeadersPedidos';
import { useClientesStore, useForm, usePedidosStore } from '../../hooks';
import { Collapse } from 'bootstrap';


export const Guantes = ({ agregarPedidoGeneral, resetearPedido }) => {
    let total = 0
    const [cantidadItems, setCantidadItems] = useState(0)
    const [pedidoGuantes, setPedidoGuantes] = useState([]);
    const { detalle = '', onInputChange } = useForm();
    const { clienteActivo } = useClientesStore();
    const { startSetGuantes, totalGuantes } = usePedidosStore();
    const precioGuantes = {
        guantes: {
            BLANCOS: clienteActivo.precios.precioGuantes.gb,
            NEGROS: clienteActivo.precios.precioGuantes.gn,
            MITON: clienteActivo.precios.precioGuantes.gm
        }
    };


    useEffect(() => {
        if (resetearPedido) {
            setPedidoGuantes([]);
            setCantidadItems(0);
            const collapseElement = document.getElementById('collapseSix');
            if (collapseElement) {
                const bsCollapse = Collapse.getInstance(collapseElement) || new Collapse(collapseElement, { toggle: false });
                bsCollapse.hide();
            }
        }
    }, [resetearPedido]);

    useEffect(() => {
        setCantidadItems(pedidoGuantes.reduce((acc, item) => acc + parseInt(item.cantidad), 0));
        total = Object.values(pedidoGuantes).reduce((acc, item) => {
            const precio = precioGuantes.guantes[item.categoria];
            return acc + (parseInt(item.cantidad) * (precio || 0));
        }, 0);
        agregarPedidoGeneral('GUANTES', pedidoGuantes, detalle);
        startSetGuantes(total)

    }, [pedidoGuantes, detalle])

    return (
        <>
            {/* HEADER*/}
            <div className="">
                <HeadersPedidos codigo='GUA' titulo='GUANTES  [BLANCOS - NEGROS - MITÓN]' cantidadItems={cantidadItems} collapsed='Six' />
                <div id="collapseSix" className="collapse mt-2" aria-labelledby="headingSix" data-bs-parent="#accordionExample"
                    style={{ overflow: 'hidden', transition: 'height 0.3s ease' }}>
                    <div className="row">
                        {/* COLUMNA IZQUIERDA */}
                        <div className="col-lg-7">
                            <FormGuantes categoria="BLANCOS" tallaInicial={4} cantTallas={9} setPedidoGuantes={setPedidoGuantes} pedidoGuantes={pedidoGuantes} />
                            <FormGuantes categoria="NEGROS" tallaInicial={6} cantTallas={7} setPedidoGuantes={setPedidoGuantes} pedidoGuantes={pedidoGuantes} />
                            <FormGuantes categoria="MITON" tallaInicial={7} cantTallas={4} setPedidoGuantes={setPedidoGuantes} pedidoGuantes={pedidoGuantes} />
                            <hr />
                            <div className="row">
                                <div className="col-md">
                                    <div className="form-group card-body">
                                        <label htmlFor="detalleCG">Detalle general del pedido</label>
                                        <textarea className="form-control" id="detalleCG" name='detalle' value={detalle} onChange={onInputChange}></textarea>
                                    </div>
                                </div>
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