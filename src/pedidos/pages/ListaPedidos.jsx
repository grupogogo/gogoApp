import { useEffect, useState } from "react"
import { Estadisticas } from "../../dashboard/pages"
import { useAuthStore, useFuntions, usePedidosStore } from "../../hooks"
import { LayoutApp } from "../../layout/LayoutApp"
import { TablaPedidos } from "../components/TablaPedidos"


export const ListaPedidos = () => {
    const { user } = useAuthStore()
    const { startLoadingPedidos } = usePedidosStore();
    const { pedidos } = usePedidosStore()
    const [totales, setTotales] = useState([])    
    const { totalesPedidos } = useFuntions();

    useEffect(() => {
        startLoadingPedidos();
    }, [])

    useEffect(() => {
        setTotales(totalesPedidos(pedidos, false))
    }, [pedidos])

    return (
        <LayoutApp>
            {user.rol !== 'planta' && (
                <div className="container-fluid">
                    <Estadisticas totales={totales} tipo={2} />                    
                    <div>
                        <div>
                            <TablaPedidos />
                        </div>
                    </div>
                </div>
            )}
            {user.rol === 'planta' && (
                <div className="container-fluid">
                    {/* <Estadisticas totales={totales} tipo={3} />    */}                 
                    <div>
                        <div className="col">
                            <TablaPedidos />
                        </div>
                    </div>
                </div>
            )}
        </LayoutApp>
    )
}
