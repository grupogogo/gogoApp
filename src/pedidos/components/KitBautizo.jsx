import { useEffect, useState } from "react";
import { ProductsTable } from "./forms/ProductsTable";
import { ImagesCiriosComunion } from "./ImagesCiriosComunion";
import { HeadersPedidos } from "./forms/HeadersPedidos";
import { useForm } from "../../hooks";

export const KitBautizo = ({ agregarPedidoGeneral }) => {
    const [cantidadItems, setCantidadItems] = useState(0)
    const [pedidoKB, setPedidoKB] = useState([]);
    const { detalle = '', onInputChange } = useForm();



    useEffect(() => {
        agregarPedidoGeneral('KB', pedidoKB, detalle); // Llamamos al callback con el pedido y la categoría
    }, [pedidoKB, detalle]);

    return (
        <>
            {/* HEADER KIT COMUNION */}

            <div className="card">
                <HeadersPedidos codigo='KB' titulo='KIT BAUTIZO' cantidadItems={cantidadItems} collapsed='Three' />

                <div id="collapseThree" className="collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample"
                    style={{ overflow: 'hidden', transition: 'height 0.3s ease' }}>
                    <div className="row">
                        {/* COLUMNA IZQUIERDA */}
                        <div className="col-lg-7">
                            {/* Segunda fila */}
                            <ImagesCiriosComunion pedido={pedidoKB} setPedido={setPedidoKB} categoria='kb' setCantidadItems={setCantidadItems} />
                            <hr />
                            <div className="row">
                                <div className="col-md">
                                    <div className="form-group card-body">
                                        <label htmlFor="detalleCG">Detalle general de la categoría KB</label>
                                        <textarea className="form-control" id="detalleCG" name='detalle' value={detalle} onChange={onInputChange}></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* COLUMNA DERECHA TABLA */}
                        <ProductsTable CategoryProduct={3} tablaPedido={pedidoKB} setPedido={setPedidoKB} />
                    </div>
                </div>
            </div>
        </>
    )
}
