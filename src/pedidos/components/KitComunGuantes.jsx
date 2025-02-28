import { useEffect, useState } from 'react';
import { ImagesCiriosComunion, ProductsTable } from '..';
import { HeadersPedidos } from './forms/HeadersPedidos';
import { useForm } from '../../hooks';



export const KitComungrande = ({ agregarPedidoGeneral }) => {
    const [cantidadItems, setCantidadItems] = useState(0)
    const [pedidoKCG, setPedidoKCG] = useState([]);
    const { detalle = '', onInputChange } = useForm();




    useEffect(() => {

        agregarPedidoGeneral('KCG', pedidoKCG, detalle); // Llamamos al callback con el pedido y la categoría
    }, [pedidoKCG, detalle]);
    return (
        <>
            {/* HEADER KIT COMUNION */}

            <div className="card">
                <HeadersPedidos codigo='KCG' titulo='KIT COMUNION GRANDE' cantidadItems={cantidadItems} collapsed='One' />
                <div id="collapseOne" className="collapse" aria-labelledby="headingOne" data-bs-parent="#accordionExample"
                    style={{ overflow: 'hidden', transition: 'height 0.3s ease' }}>
                    <div className="row">
                        {/* COLUMNA IZQUIERDA */}
                        <div className="col-lg-7">
                            {/* Segunda fila */}
                            <ImagesCiriosComunion pedido={pedidoKCG} setPedido={setPedidoKCG} categoria='kcg' setCantidadItems={setCantidadItems} />
                            <hr />
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="form-group card-body">
                                        <label htmlFor="detalleCG">Detalle general de la categoría KCG</label>
                                        <textarea className="form-control" id="detalleCG" name='detalle' value={detalle} onChange={onInputChange}></textarea>
                                    </div>
                                </div>
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
