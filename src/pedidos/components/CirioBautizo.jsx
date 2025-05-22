import { useEffect, useState } from "react";
import { ImagesCiriosComunion } from "./ImagesCiriosComunion";
import { ProductsTable } from "./forms/ProductsTable";
import { HeadersPedidos } from "./forms/HeadersPedidos";
import { useForm } from "../../hooks";


export const CirioBautizo = ({ agregarPedidoGeneral }) => {
    const [cantidadItems, setCantidadItems] = useState(0)
    const [pedidoCB, setPedidoCB] = useState([]);
    const { detalle = '', onInputChange } = useForm();

    useEffect(() => {
        agregarPedidoGeneral('CB', pedidoCB, detalle); // Llamamos al callback con el pedido y la categoría
    }, [pedidoCB, detalle]);
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
                            <hr />
                            <div className="row">
                                <div className="col-md">
                                    <div className="form-group card-body">
                                        <label htmlFor="detalleCG">Detalle general de l categoría CB</label>
                                        <textarea className="form-control" id="detalleCG" name='detalle' value={detalle} onChange={onInputChange}></textarea>
                                    </div>
                                </div>
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
