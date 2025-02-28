import { useEffect, useState } from "react"
import { Estadisticas } from "../../dashboard/pages"
import { useFuntions, usePedidosStore } from "../../hooks"
import { LayoutApp } from "../../layout/LayoutApp"
import { TablaPedidos } from "../components/TablaPedidos"
import { useNavigate } from "react-router-dom"


export const ListaPedidos = () => {
    const { startLoadingPedidos } = usePedidosStore();
    const { pedidos } = usePedidosStore()
    const [totales, setTotales] = useState([])
    const navegar = useNavigate();
    const { totalesPedidos } = useFuntions();

    useEffect(() => {
        startLoadingPedidos();
    }, [])

    useEffect(() => {
        setTotales(totalesPedidos(pedidos, false))
    }, [pedidos])

    return (
        <LayoutApp>
            <div className="container-fluid">
                <Estadisticas totales={totales} tipo={2} />
                <div className="alert alert-primary d-flex justify-content-between align-items-center" role="alert">
                    <div>
                        <h6 className="m-0 fw-bold text-primary">Listado de pedidos</h6>
                    </div>
                    <div>
                        <button
                            className="btn btn-success"
                            type="button"
                            id="dropdownMenuButton1"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                            onClick={() => navegar('/pedidos')}
                        >
                            Crear pedido &nbsp;
                            <i className="fa fa-clipboard-list"></i>
                        </button>
                    </div>
                </div>

                <div>
                    <div className="col">
                        <TablaPedidos />
                    </div>
                </div>
            </div>
        </LayoutApp>
    )
}
