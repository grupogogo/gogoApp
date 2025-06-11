import { useEffect, useState } from "react";
import { ImagesCiriosComunion } from "./ImagesCiriosComunion";
import { ProductsTable } from "./forms/ProductsTable";
import { HeadersPedidos } from "./forms/HeadersPedidos";
import { useForm } from "../../hooks";
import { Collapse } from 'bootstrap';

export const KitComuPeque = ({ agregarPedidoGeneral, resetearPedido }) => {
    const [cantidadItems, setCantidadItems] = useState(0);
    const [pedidoKCP, setPedidoKCP] = useState([]);
    const { detalle, onInputChange } = useForm();


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
                            <hr />
                            <div className="row">
                                <div className="col-md">
                                    <div className="form-group card-body">
                                        <label htmlFor="detalleCG">Detalle general de la categoría KCP</label>{/* TODO Cambiar esto en todas las categorias                         */}
                                        <textarea className="form-control" id="detalleCG" name='detalle' value={detalle} onChange={onInputChange}></textarea>
                                    </div>
                                </div>
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
