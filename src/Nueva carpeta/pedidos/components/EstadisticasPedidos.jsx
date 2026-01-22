import { useEffect, useState } from "react";
import { useClientesStore, useFuntions, usePedidosStore } from "../../hooks";



export const EstadisticasPedidos = () => {
    let pedidosAnioActual = 0;
    let totalItems = 0;
    let itemsComprados = {};
    let totalGeneral = 0;
    let pendientes = 0;

    const [stats, setStats] = useState({ pedidosAnioActual: 0, totalItems: 0, itemsComprados: {}, totalGeneral: 0, pendientes: 0 }); // Estado inicial de las estadísticas
    const fecha = new Date();
    const currentYear = fecha.getFullYear().toString();
    const { pedidosActivo } = usePedidosStore();
    const { clienteActivo } = useClientesStore();
    const { formatearPrecio, number_format } = useFuntions();


    const countPedidos = () => {
        if (!clienteActivo) return; // Si no hay cliente activo, salir de la función.
        pedidosActivo.forEach((pedido) => {
            // Verificar si el pedido es del año actual
            if (pedido.fechaCreacion.includes(currentYear)) {
                pedidosAnioActual++; // Incrementar el contador de pedidos del año actual
            }
            if (pedido.estado === 'pendiente') {
                pendientes++;
            }
            pedido.itemPedido.forEach((item) => {
                // Iterar sobre las claves dentro de cada ítem
                Object.keys(item.itemPedido).forEach((key) => {
                    const categoriaData = item.itemPedido[key];

                    if (!categoriaData || !categoriaData.pedido) {
                        return;
                    }

                    if (key === "GUANTES") {
                        // Manejar la categoría GUANTES
                        categoriaData.pedido.forEach((p) => {
                            const categoria = p.categoria; // Obtener la subcategoría específica

                            if (!itemsComprados.GUANTES) {
                                itemsComprados.GUANTES = {}; // Inicializar el grupo de guantes si no existe
                            }

                            if (!itemsComprados.GUANTES[categoria]) {
                                itemsComprados.GUANTES[categoria] = 0; // Inicializar la categoría si no existe
                            }

                            itemsComprados.GUANTES[categoria] += parseInt(p.cantidad, 10); // Sumar la cantidad
                            totalItems += parseInt(p.cantidad, 10); // Sumar al total de artículos
                        });
                    } else if (key === "OTR") {
                        // Manejar la categoría OTR
                        categoriaData.pedido.forEach((p) => {
                            if (!itemsComprados[key]) {
                                itemsComprados[key] = 0; // Inicializar la categoría si no existe
                            }

                            itemsComprados[key] += parseInt(p.cantidad, 10); // Sumar la cantidad
                            totalItems += parseInt(p.cantidad, 10); // Incrementar el total de artículos
                        });
                    } else {
                        // Manejar otras categorías
                        categoriaData.pedido.forEach((p) => {
                            if (!itemsComprados[key]) {
                                itemsComprados[key] = 0; // Inicializar la categoría si no existe
                            }

                            itemsComprados[key] += parseInt(p.cantidad, 10); // Sumar la cantidad
                            totalItems += parseInt(p.cantidad, 10); // Incrementar el total de artículos
                        });
                    }
                });
            });
        });

        totalComprasCliente(itemsComprados); // Procesar los totales
        return { pedidosAnioActual, totalItems, itemsComprados, pendientes }; // Retornar los resultados
    };

    const totalComprasCliente = (itemsComprados) => {


        Object.entries(itemsComprados).forEach(([categoria, cantidad]) => {
            if (categoria === "GUANTES") {
                // Iterar sobre los tipos de guantes dentro de "GUANTES"
                Object.entries(cantidad).forEach(([tipoGuante, cantidadGuantes]) => {
                    let precioUnitario = 0;

                    // Determinar el precio según el tipo de guante
                    switch (tipoGuante) {
                        case "BLANCOS":
                            precioUnitario = clienteActivo.precios.precioGuantes.gb;
                            break;
                        case "NEGROS":
                            precioUnitario = clienteActivo.precios.precioGuantes.gn;
                            break;
                        case "MITON":
                            precioUnitario = clienteActivo.precios.precioGuantes.gm;
                            break;
                        default:
                            console.warn(`Tipo de guante desconocido: ${tipoGuante}`);
                            break;
                    }

                    const costoTotal = cantidadGuantes * precioUnitario;
                    totalGeneral += costoTotal
                    /*  console.log(
                         `Categoría: GUANTES, Tipo: ${tipoGuante}, Cantidad: ${cantidadGuantes}, Precio Unitario: ${precioUnitario}, Costo Total: ${costoTotal}`
                     ); */
                });
            } else {
                let precioUnitario = 0;

                // Determinar el precio según la categoría principal
                switch (categoria) {
                    case "KCG":
                        precioUnitario = clienteActivo.precios.precioKits.kcg;
                        break;
                    case "KCP":
                        precioUnitario = clienteActivo.precios.precioKits.kcp;
                        break;
                    case "KB":
                        precioUnitario = clienteActivo.precios.precioKits.kb;
                        break;
                    case "CC":
                        precioUnitario = clienteActivo.precios.precioCirios.cc;
                        break;
                    case "CB":
                        precioUnitario = clienteActivo.precios.precioCirios.cb;
                        break;
                    case 'OTROS':
                        console.log(clienteActivo)//TODO hacer en caso de que sean otros pedidos
                        break;
                }

                const costoTotal = cantidad * precioUnitario;
                totalGeneral += costoTotal
                /* console.log(
                    `Categoría: ${categoria}, Cantidad: ${cantidad}, Precio Unitario: ${precioUnitario}, Costo Total: ${costoTotal}`
                ); */
            }
        });
    }

    useEffect(() => {
        if (pedidosActivo) { // Si hay pedidos activos
            const { pedidosAnioActual, totalItems, itemsComprados } = countPedidos(pedidosActivo); // Contar los pedidos
            setStats({ pedidosAnioActual, totalItems, itemsComprados, totalGeneral, pendientes }); // Actualizar el estado con las nuevas estadísticas

        }
    }, [pedidosActivo]); // Ejecutar el efecto cuando cambien los pedidos activos

    return (
        <>
            <div className="row">
                {/* Pedidos en Alistamiento Card */}
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card shadow-sm border-start-custom border-success" style={{ fontSize: "0.6rem" }}>
                        <div className="card-body"
                            style={{ minHeight: '80px' }}>
                            <div className="d-flex align-items-center justify-content-between">
                                <div className="text-xs fw-bold text-black text-uppercase mb-1">
                                    Pedidos realizados {currentYear}
                                </div>
                                <div className="h5 mb-0 fw-bold text-center">
                                    <span className="badge text-bg-success">{stats.pedidosAnioActual || 0}</span>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-file-signature fa-2x text-success" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Pedidos Pendientes Card */}
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card shadow-sm border-start-custom border-primary" style={{ fontSize: "0.6rem" }}>
                        <div className="card-body"
                            style={{ minHeight: '80px' }}>
                            <div className="d-flex align-items-center justify-content-between">
                                <div className="text-xs fw-bold text-black text-uppercase mb-1">
                                    <div className="text-xs fw-bold text-black text-uppercase mb-1">
                                        cantidad item {currentYear}
                                    </div>
                                    <div className="fs-6 mb-0 fw-bold text-center">
                                        <span className="badge text-bg-primary">
                                            {stats.totalItems}
                                        </span>
                                    </div>
                                </div>
                                <div className="">
                                    <i className="fas fa-list-ol fa-2x text-primary" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card shadow-sm border-start-custom border-danger" style={{ fontSize: "0.6rem" }}>
                        <div className="card-body"
                            style={{ minHeight: '80px' }}>
                            <div className="d-flex align-items-center justify-content-between">
                                <div className="text-xs fw-bold text-black text-uppercase mb-1">
                                    <div className="text-xs fw-bold text-black text-uppercase mb-1">
                                        Pedidos pendientes
                                    </div>

                                    {/* Fila con porcentaje + barra */}
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="badge bg-danger text-light" style={{ whiteSpace: "nowrap" }}>
                                            {number_format((stats.pendientes / stats.pedidosAnioActual) * 100)}%
                                        </span>

                                        <div className="flex-grow-1">
                                            <div className="progress" style={{ height: "15px" }}>
                                                <div
                                                    className="progress-bar bg-danger progress-bar-striped"
                                                    role="progressbar"
                                                    style={{ width: `${(stats.pendientes / stats.pedidosAnioActual) * 100}%` }}
                                                    aria-valuenow={(stats.pendientes / stats.pedidosAnioActual) * 100}
                                                    aria-valuemin="0"
                                                    aria-valuemax="100"
                                                >
                                                    {/* Opcional: mostrar valor dentro de la barra */}
                                                    {/* stats.pendientes */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-auto">
                                    <i className="fas fa-clipboard-list fa-2x text-danger" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Pedidos Entregados (Mensual) Card */}
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card shadow-sm border-start-custom border-warning" style={{ fontSize: "0.6rem" }}>
                        <div className="card-body"
                            style={{ minHeight: '80px' }}>
                            <div className="d-flex align-items-center justify-content-between">
                                {/* Contenido textual */}
                                <div className="d-flex flex-column justify-content-center">
                                    <div className="text-xs fw-bold text-black text-uppercase mb-1">
                                        Total ventas
                                    </div>
                                    <div className="fs-6 mb-0 text-center">
                                        <span className="badge text-bg-warning text-light">
                                            {formatearPrecio(stats.totalGeneral)}
                                        </span>
                                    </div>
                                </div>

                                {/* Ícono */}
                                <div className="col-auto">
                                    <i className="fas fa-sack-dollar fa-2x text-warning" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </>
    )
}
