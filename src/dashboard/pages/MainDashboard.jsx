import { AreaChart, BarChart, PieChart } from "../js"
import { Estadisticas, TopVentas } from './'
import { LayoutApp } from "../../layout/LayoutApp"
import { useAuthStore, useForm, useFuntions, usePedidosStore } from "../../hooks"
import { useEffect, useState } from "react"

export const MainDashboard = () => {
    const { pedidos, startLoadingPedidos } = usePedidosStore();
    const { user } = useAuthStore()
    const [lablesKits, setLablesKits] = useState([]);
    const [dataKits, setDataKits] = useState([]);
    const [lablesGuantes, setLablesGuantes] = useState([]);
    const [dataGuantes, setDataGuantes] = useState([]);
    const [lablesOtros, setLablesOtros] = useState([]);
    const [totalxAnio, setTotalxAnio] = useState([]);
    const [totalCategoriaxAnio, setTotalCategoriaxAnio] = useState([]);
    const [dataOtros, setDataOtros] = useState([]);
    const [lablesTodos, setLablesTodos] = useState([]);
    const [dataTodos, setDataTodos] = useState([]);
    const [totales, setTotales] = useState([])
    const { calcularTotalesPedidos, totalesPedidos, totalesPedidosAnuales, totalesPedidosAnualesPorCategoria, buscarNombre } = useFuntions();
    const [datosUsuario, setdatosUsuario] = useState(true);
    const { onInputChange } = useForm();
    const [totalesPorCategoria, setTotalesPorCategoria] = useState([])
    const [filtroCategoria, setFiltroCategoria] = useState('KCG')

    const selTipoCliente = (event) => {
        setdatosUsuario(event.target.checked);
        onInputChange(event);
    }

    const busquedaPorCategoria = (e) => {
        const value = e.target.value;
        setFiltroCategoria('' + value);
    }

    useEffect(() => {
        startLoadingPedidos();
    }, []);

    useEffect(() => {
        if (pedidos.length > 0) {
            setTotales(totalesPedidos(pedidos, datosUsuario));
            calcularTotalesPedidos('kits', pedidos, setDataKits, setLablesKits, datosUsuario);
            calcularTotalesPedidos('guantes', pedidos, setDataGuantes, setLablesGuantes, datosUsuario);
            calcularTotalesPedidos('otros', pedidos, setDataOtros, setLablesOtros, datosUsuario);
            calcularTotalesPedidos('todos', pedidos, setDataTodos, setLablesTodos, datosUsuario);
            setTotalxAnio(totalesPedidosAnuales(pedidos, datosUsuario));
            setTotalesPorCategoria(calcularTotalesPedidos('todos', pedidos, setDataTodos, setLablesTodos, datosUsuario));
        }
    }, [pedidos, datosUsuario]);

    useEffect(() => {
        setTotalCategoriaxAnio(totalesPedidosAnualesPorCategoria(pedidos, datosUsuario, filtroCategoria));
    }, [datosUsuario, filtroCategoria])



    return (
        <LayoutApp>
            <div className="container">
                <div className="container-fluid">
                    <Estadisticas totales={totales} tipo={1} />
                    <div className="row">
                        <div className="col-md-12">
                            <div
                                className="form-check form-switch form-md d-flex align-items-center justify-content-between"
                                alt="Click para ver los datos del usuario logueado"
                            >
                                <span className="me-2 fs-5">Datos {datosUsuario ? "globales 2025" : user.name}</span>
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    id="flexSwitchCheckClienteDistribuidor"
                                    name="distribuidor"
                                    value={!datosUsuario}
                                    onChange={selTipoCliente}
                                    checked={datosUsuario}
                                />
                                <label className="form-check-label" htmlFor="flexSwitchCheckClienteDistribuidor"></label>
                            </div>
                        </div>
                    </div>
                    <hr className="border border-primary border-3 opacity-80 mt-0" />
                    <div className="row">{/* PIE CHARTS TODOS LOS PRODUCTOS */}
                        <div className="col-xl-3 col-lg-3 col-md-3">
                            <div className="card shadow mb-3">
                                <PieChart arrayLabels={lablesTodos} arrayData={dataTodos} title={'TOP VENTAS GENERAL'} />
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-3 col-md-3">
                            <div className="card shadow mb-3">
                                <PieChart arrayLabels={lablesKits} arrayData={dataKits} title={'TOP VENTAS KITS'} />
                            </div>
                        </div>

                        <div className="col-xl-3 col-lg-3 col-md-3">
                            <div className="card shadow mb-3">
                                <PieChart arrayLabels={lablesGuantes} arrayData={dataGuantes} title={'TOP VENTAS GUANTES'} />
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-3 col-md-3">
                            <div className="card shadow mb-3">
                                <PieChart arrayLabels={lablesOtros} arrayData={dataOtros} title={'TOP VENTAS OTROS'} />
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card shadow mb-3">
                                <div className="card-body">
                                    <div className="chartArea">
                                        <AreaChart totales={totalxAnio} />
                                    </div>
                                    <hr />
                                    Comportamiento de TODAS las ventas desde el 2021 hasta la fecha
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card shadow mb-3">
                                <div className="card-body">
                                    <div className="col-auto">
                                        <select
                                            onChange={busquedaPorCategoria}
                                            className="form-select"
                                            style={{
                                                width: 'auto', display: 'inline-block'
                                            }}>
                                            <option value="KCG">{buscarNombre('KCG')}</option>
                                            <option value="KCP">{buscarNombre('KCP')}</option>
                                            <option value="KB">{buscarNombre('KB')}</option>
                                            <option value="CC">{buscarNombre('CC')}</option>
                                            <option value="CB">{buscarNombre('CB')}</option>
                                            <option value="GUANTES-BLANCOS">GUANTE BLANCO</option>
                                            <option value="GUANTES-NEGROS">GUANTE NEGRO</option>
                                            <option value="GUANTES-MITON">GUANTE MITÓN</option>
                                            <option value="OTR">OTROS PRODUCTOS</option>
                                        </select>
                                    </div>
                                    <div className="chartArea">
                                        <AreaChart totales={totalCategoriaxAnio} porValor={true} />
                                    </div>
                                    <hr />
                                    Comportamiento de las ventas por PRODUCTO

                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card shadow mb-3">
                                <BarChart totales={totalesPorCategoria} />
                            </div>
                        </div>
                    </div>
                    {/* <TopVentas /> */}
                </div>
            </div>
        </LayoutApp >
    );
};
