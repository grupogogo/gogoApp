import { useEffect, useState } from "react";
import { ProductsTable } from "./forms/ProductsTable";
import { ImagesCiriosComunion } from "./ImagesCiriosComunion";
import { HeadersPedidos } from "./forms/HeadersPedidos";
import { useForm } from "../../hooks";
import { Collapse } from 'bootstrap';


export const KitComunionECO = ({ agregarPedidoGeneral, resetearPedido }) => {
    const [cantidadItems, setCantidadItems] = useState(0)
    const [pedidoKCP, setPedidoKCP] = useState([]);
    const { detalle = '', onInputChange } = useForm();

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
                            <hr />
                            <div className="row">
                                <div className="col-md">
                                    <div className="form-group card-body">
                                        <label htmlFor="detalle-KCE">Detalle general de la categoría KC-E</label>
                                        <textarea className="form-control" name='detalle' value={detalle} onChange={onInputChange}></textarea>
                                    </div>
                                </div>
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
