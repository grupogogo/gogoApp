import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import Swal from 'sweetalert2';
import html2pdf from 'html2pdf.js';
import { useNavigate } from 'react-router-dom';

import { LayoutApp } from '../../layout/LayoutApp';
import { useAuthStore, useFuntions, usePedidosStore, usePreciosStore } from '../../hooks';
import { getVisiblePageNumbers } from '../../helpers';
import { useGastosStore } from '../../hooks/useGastosStore';
import { StackedChart, AreaChartOld, AreaChartOldYear } from '../../dashboard/js';
import { AreaChartOldYearAcumulada } from '../../dashboard/js/AreaChartOldYearAcumulada';
import { ChartKitsMultiAnual } from '../components/ChartKitsMultiAnual';
import { ChartBarrasMensualAnios } from '../components/ChartBarrasMensualAnios';
import { ChartMetaVsAnterior } from '../components/ChartMetaVsAnterior';

import {
    MONTH_LABELS,
    CATEGORIAS_DEFINICION,
    obtenerPedidosPorAnio,
    obtenerGastosPorAnio,
    calcularEstadisticasAnio,
    compararDosAnios,
    obtenerAniosDisponibles,
    filtrarPedidosYGastosPorUsuario,
    calcularDivisionSocios,
    aplicarPreciosFabricaAKits,
    parsearFechaSegura,
    esOtrDeKit,
    esOtrDeGuantes,
    UID_LEONARDO,
    UID_OSCAR,
    UID_KAROL,
} from '../helpers/historicalOrdersHelper';

export const ListOldOrders = () => {
    const reportPrintRef = useRef();
    const navigate = useNavigate();

    // Stores
    const { startLoadingOldOrders, startLoadingPedidos } = usePedidosStore();
    const { startLoadingGastos } = useGastosStore();
    const { startLoadingPrecios } = usePreciosStore();
    const oldOrders = useSelector(state => state.pedidos.oldOrders) || [];
    const pedidos = useSelector(state => state.pedidos.pedidos) || [];
    const gastos = useSelector(state => state.gastos.gastos) || [];
    const listaPrecios = useSelector(state => state.precios?.listaPrecios) || [];

    // Utilities
    const {
        formatearPrecio,
        pastelColors,
        mensualGastosUsuarios,
        aTitulo
    } = useFuntions();

    // User authentication and role identification
    const { user } = useAuthStore();
    const esKarol = user?.uid === UID_KAROL || (user?.email || '').toLowerCase().includes('karol') || (user?.name || '').toLowerCase().includes('karol');
    const esLeonardo = user?.uid === UID_LEONARDO || (user?.name || '').toLowerCase().includes('leonardo');
    const esOscar = user?.uid === UID_OSCAR || (user?.name || '').toLowerCase().includes('oscar');

    // Local State (comienza dinámicamente en el año en curso y compara con el año previo)
    const anioActualSistema = String(new Date().getFullYear());
    const anioPrevioSistema = String(new Date().getFullYear() - 1);
    const [fechaPedido, setFechaPedido] = useState(anioActualSistema);
    const [anioComparar, setAnioComparar] = useState(anioPrevioSistema);
    const [filtroUsuario, setFiltroUsuario] = useState(esKarol ? 'KAROL' : (esLeonardo ? 'LEONARDO' : 'GENERAL'));
    const [soloPagados, setSoloPagados] = useState(false); // false por defecto (muestra todos los estados)
    const [filtroCategoria, setFiltroCategoria] = useState('TODOS'); // 'TODOS' | 'KITS' | 'GUANTES' | 'OTROS'
    const [activeTab, setActiveTab] = useState('finanzas'); // 'finanzas', 'categorias', 'clientes', 'comparativa', 'multianual', 'pedidos'
    const [search, setSearch] = useState('');
    const [excluirCliente, setExcluirCliente] = useState(false);
    const [categoriaFiltro, setCategoriaFiltro] = useState('TODAS');
    const [filtroGrupoMatriz, setFiltroGrupoMatriz] = useState('TODAS'); // 'TODAS' | 'Kits' | 'Guantes' | 'Otros'
    const [paginaActual, setPaginaActual] = useState(1);
    const itemsPorPagina = 25;
    const [trimestresExpandidos, setTrimestresExpandidos] = useState({});
    const [auditoriaTrimestreModal, setAuditoriaTrimestreModal] = useState(null);
    const topFilterRef = useRef(null);
    const [mostrarFiltroFlotante, setMostrarFiltroFlotante] = useState(false);

    const handleCambiarAnio = (nuevo) => {
        setFechaPedido(nuevo);
        if (String(anioComparar) === nuevo) {
            const yrNum = Number(nuevo);
            const fallback = String(yrNum > 2017 ? yrNum - 1 : (yrNum + 1));
            setAnioComparar(fallback);
        }
    };

    // Detectar scroll para mostrar el filtro flotante cuando el superior sale del viewport
    useEffect(() => {
        const checkScroll = () => {
            if (topFilterRef.current) {
                const rect = topFilterRef.current.getBoundingClientRect();
                setMostrarFiltroFlotante(rect.bottom < 50);
            } else {
                const scrollActual = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
                setMostrarFiltroFlotante(scrollActual > 260);
            }
        };

        window.addEventListener("scroll", checkScroll, { passive: true, capture: true });
        document.addEventListener("scroll", checkScroll, { passive: true, capture: true });

        let observer = null;
        if (typeof IntersectionObserver !== "undefined" && topFilterRef.current) {
            observer = new IntersectionObserver(([entry]) => {
                const isAbove = entry.boundingClientRect.bottom < 60;
                setMostrarFiltroFlotante(!entry.isIntersecting && isAbove);
            }, { threshold: [0, 1] });
            observer.observe(topFilterRef.current);
        }

        const timer = setTimeout(checkScroll, 200);

        return () => {
            clearTimeout(timer);
            if (observer) observer.disconnect();
            window.removeEventListener("scroll", checkScroll, { capture: true });
            document.removeEventListener("scroll", checkScroll, { capture: true });
        };
    }, []);

    // Load initial data
    useEffect(() => {
        startLoadingOldOrders();
        startLoadingPedidos();
        startLoadingGastos();
        startLoadingPrecios();
    }, []);

    // Sincronizar filtro según rol de usuario
    useEffect(() => {
        if (esKarol) {
            setFiltroUsuario('KAROL');
        } else if (esLeonardo && filtroUsuario === 'OSCAR') {
            setFiltroUsuario('LEONARDO');
        }
    }, [esKarol, esLeonardo]);

    // Años disponibles en la base de datos y archivo histórico
    const aniosDisponibles = useMemo(() => {
        return obtenerAniosDisponibles(oldOrders, pedidos);
    }, [oldOrders, pedidos]);

    // Filtro auxiliar por estado pagado
    const filtrarPorEstadoPagado = useCallback((listaPedidos = []) => {
        if (!soloPagados) return listaPedidos;
        return listaPedidos.filter(o => {
            if (o.origen === 'HISTORICO') return true; // Histórico son ventas cerradas
            const st = String(o.estado || o.raw?.estado || '').toLowerCase().trim();
            const fp = String(o.raw?.formaPago || '').toLowerCase().trim();
            return st === 'pagado' || fp === 'pagado';
        });
    }, [soloPagados]);

    // Pedidos y gastos totales del año seleccionado (Kits valorados con precios de fábrica según Gestión de Precios)
    const todosPedidosDelAnio = useMemo(() => {
        const raw = obtenerPedidosPorAnio(oldOrders, pedidos, fechaPedido);
        const filtrados = filtrarPorEstadoPagado(raw);
        return aplicarPreciosFabricaAKits(filtrados, listaPrecios);
    }, [oldOrders, pedidos, fechaPedido, filtrarPorEstadoPagado, listaPrecios]);

    const todosGastosDelAnio = useMemo(() => {
        return obtenerGastosPorAnio(gastos, fechaPedido);
    }, [gastos, fechaPedido]);

    // Ventas de guantes de Leonardo Gómez para destacar a Oscar (GUANTES + OTR)
    const ventasGuantesLeoAnio = useMemo(() => {
        if (filtroCategoria === 'KITS' || filtroCategoria === 'OTROS') return 0;
        let sum = 0;
        todosPedidosDelAnio.forEach(ord => {
            const userId = (ord.user?._id || ord.user || ord.raw?.user?._id || ord.raw?.user)?.toString();
            const userName = (ord.user?.name || ord.raw?.user?.name || '').toLowerCase();
            const isLeo = userId === UID_LEONARDO || userName.includes('leonardo');
            if (isLeo) {
                (ord.items || []).forEach(it => {
                    const isGlove = it.categoriaId === 'GUANTES' || (it.producto || '').toLowerCase().includes('guante');
                    if (isGlove) {
                        sum += Number(it.total || (Number(it.precio || 0) * Number(it.cantidad || 0)));
                    }
                });
            }
        });
        return sum;
    }, [todosPedidosDelAnio, filtroCategoria]);

    // Ventas de guantes de Leonardo vs Karol (separadas y sumadas)
    const desgloseGuantesLeoYKarol = useMemo(() => {
        if (filtroCategoria === 'KITS' || filtroCategoria === 'OTROS') return { leo: 0, karol: 0, total: 0 };
        let leo = 0;
        let karol = 0;
        todosPedidosDelAnio.forEach(ord => {
            const userId = (ord.user?._id || ord.user || ord.raw?.user?._id || ord.raw?.user)?.toString();
            const userName = (ord.user?.name || ord.raw?.user?.name || '').toLowerCase();
            const userEmail = (ord.user?.email || ord.raw?.user?.email || '').toLowerCase();
            const isLeo = userId === UID_LEONARDO || userName.includes('leonardo');
            const isKarol = userId === UID_KAROL || userName.includes('karol') || userEmail.includes('karol');

            (ord.items || []).forEach(it => {
                const isGlove = it.categoriaId === 'GUANTES' || (it.producto || '').toLowerCase().includes('guante');
                if (isGlove) {
                    const val = Number(it.total || (Number(it.precio || 0) * Number(it.cantidad || 0)));
                    if (isLeo) leo += val;
                    if (isKarol) karol += val;
                }
            });
        });
        return { leo, karol, total: leo + karol };
    }, [todosPedidosDelAnio, filtroCategoria]);

    // División consolidada de cuentas por socio (Leonardo vs Oscar + Regla Karol)
    const divisionSocios = useMemo(() => {
        return calcularDivisionSocios(todosPedidosDelAnio, todosGastosDelAnio, listaPrecios, filtroCategoria);
    }, [todosPedidosDelAnio, todosGastosDelAnio, listaPrecios, filtroCategoria]);

    // Pedidos y gastos filtrados según la vista seleccionada ('GENERAL', 'LEONARDO', 'OSCAR') y categoría
    const { pedidosFiltrados: pedidosDelAnio, gastosFiltrados: gastosDelAnio, descripcionFiltro } = useMemo(() => {
        return filtrarPedidosYGastosPorUsuario(todosPedidosDelAnio, todosGastosDelAnio, filtroUsuario, esLeonardo, filtroCategoria);
    }, [todosPedidosDelAnio, todosGastosDelAnio, filtroUsuario, esLeonardo, filtroCategoria]);

    // Pedidos del año anterior con el mismo criterio de usuario para comparativa YoY
    const anioAnterior = String(parseInt(fechaPedido, 10) - 1);
    const todosPedidosAnioAnterior = useMemo(() => {
        const raw = obtenerPedidosPorAnio(oldOrders, pedidos, anioAnterior);
        const filtrados = filtrarPorEstadoPagado(raw);
        return aplicarPreciosFabricaAKits(filtrados, listaPrecios);
    }, [oldOrders, pedidos, anioAnterior, filtrarPorEstadoPagado, listaPrecios]);

    const todosGastosAnioAnterior = useMemo(() => {
        return obtenerGastosPorAnio(gastos, anioAnterior);
    }, [gastos, anioAnterior]);

    const { pedidosFiltrados: pedidosAnioAnterior } = useMemo(() => {
        return filtrarPedidosYGastosPorUsuario(todosPedidosAnioAnterior, todosGastosAnioAnterior, filtroUsuario, esLeonardo, filtroCategoria);
    }, [todosPedidosAnioAnterior, todosGastosAnioAnterior, filtroUsuario, esLeonardo, filtroCategoria]);

    // Pedidos y gastos para la pestaña de Comparativa Cara a Cara
    const todosPedidosComparar = useMemo(() => {
        const raw = obtenerPedidosPorAnio(oldOrders, pedidos, anioComparar);
        const filtrados = filtrarPorEstadoPagado(raw);
        return aplicarPreciosFabricaAKits(filtrados, listaPrecios);
    }, [oldOrders, pedidos, anioComparar, filtrarPorEstadoPagado, listaPrecios]);

    const todosGastosComparar = useMemo(() => {
        return obtenerGastosPorAnio(gastos, anioComparar);
    }, [gastos, anioComparar]);

    const { pedidosFiltrados: pedidosComparar, gastosFiltrados: gastosComparar } = useMemo(() => {
        return filtrarPedidosYGastosPorUsuario(todosPedidosComparar, todosGastosComparar, filtroUsuario, esLeonardo, filtroCategoria);
    }, [todosPedidosComparar, todosGastosComparar, filtroUsuario, esLeonardo, filtroCategoria]);

    const statsComparar = useMemo(() => {
        return calcularEstadisticasAnio(pedidosComparar, gastosComparar, [], listaPrecios);
    }, [pedidosComparar, gastosComparar, listaPrecios]);

    // Estadísticas y Métricas Ejecutivas de la vista activa
    const stats = useMemo(() => {
        return calcularEstadisticasAnio(pedidosDelAnio, gastosDelAnio, pedidosAnioAnterior, listaPrecios);
    }, [pedidosDelAnio, gastosDelAnio, pedidosAnioAnterior, listaPrecios]);

    // Comparativa Cara a Cara
    const comparativaData = useMemo(() => {
        return compararDosAnios(stats, statsComparar, fechaPedido, anioComparar);
    }, [stats, statsComparar, fechaPedido, anioComparar]);

    // Filtrado y totales para la Matriz Unificada de Categorías (Kits, Guantes, Otros)
    const categoriasMatrizSegunFiltro = useMemo(() => {
        const list = stats?.categoriasMatriz || [];
        if (filtroCategoria === 'KITS') return list.filter(c => c.grupo === 'Kits');
        if (filtroCategoria === 'GUANTES') return list.filter(c => c.grupo === 'Guantes');
        if (filtroCategoria === 'OTROS') return list.filter(c => c.grupo === 'Otros');
        return list;
    }, [stats?.categoriasMatriz, filtroCategoria]);

    const conteoMatrizKits = useMemo(() => categoriasMatrizSegunFiltro.filter(c => c.grupo === 'Kits').length, [categoriasMatrizSegunFiltro]);
    const conteoMatrizGuantes = useMemo(() => categoriasMatrizSegunFiltro.filter(c => c.grupo === 'Guantes').length, [categoriasMatrizSegunFiltro]);
    const conteoMatrizOtros = useMemo(() => categoriasMatrizSegunFiltro.filter(c => c.grupo === 'Otros').length, [categoriasMatrizSegunFiltro]);

    const categoriasMatrizFiltradas = useMemo(() => {
        if (filtroGrupoMatriz === 'TODAS') return categoriasMatrizSegunFiltro;
        return categoriasMatrizSegunFiltro.filter(cat => String(cat.grupo || '').toLowerCase() === filtroGrupoMatriz.toLowerCase());
    }, [categoriasMatrizSegunFiltro, filtroGrupoMatriz]);

    const totalesMatrizFiltrada = useMemo(() => {
        const unidades = categoriasMatrizFiltradas.reduce((acc, c) => acc + (Number(c.unidades) || 0), 0);
        const totalVenta = categoriasMatrizFiltradas.reduce((acc, c) => acc + (Number(c.totalVenta) || 0), 0);
        const pctUnidades = (stats?.totalPrendas || 0) > 0 ? (unidades / stats.totalPrendas) * 100 : 0;
        const pctVenta = (stats?.totalVentas || 0) > 0 ? (totalVenta / stats.totalVentas) * 100 : 0;
        const precioPromedio = unidades > 0 ? totalVenta / unidades : 0;
        return { unidades, totalVenta, pctUnidades, pctVenta, precioPromedio };
    }, [categoriasMatrizFiltradas, stats?.totalPrendas, stats?.totalVentas]);

    // Filtrado de pedidos para la tabla
    const pedidosFiltrados = useMemo(() => {
        const query = search.toLowerCase().trim();
        return pedidosDelAnio.filter(order => {
            const coincideCliente = order.cliente.toLowerCase().includes(query);
            const coincideNIT = order.nit.toLowerCase().includes(query);
            const coincideRemision = order.remision.toLowerCase().includes(query);
            const coincideFecha = (order.fechaStr || '').toLowerCase().includes(query);

            const matchTexto = excluirCliente
                ? (!coincideCliente && (coincideNIT || coincideRemision || coincideFecha))
                : (coincideCliente || coincideNIT || coincideRemision || coincideFecha);

            if (!matchTexto) return false;

            if (categoriaFiltro !== 'TODAS') {
                const tieneCategoria = order.items.some(it => it.categoriaId === categoriaFiltro);
                if (!tieneCategoria) return false;
            }

            return true;
        });
    }, [pedidosDelAnio, search, excluirCliente, categoriaFiltro]);

    // Paginación de la tabla
    const totalPaginas = Math.ceil(pedidosFiltrados.length / itemsPorPagina) || 1;
    const pedidosPaginados = useMemo(() => {
        const inicio = (paginaActual - 1) * itemsPorPagina;
        return pedidosFiltrados.slice(inicio, inicio + itemsPorPagina);
    }, [pedidosFiltrados, paginaActual, itemsPorPagina]);

    // Resetear a página 1 cuando cambia filtro o año
    useEffect(() => {
        setPaginaActual(1);
    }, [fechaPedido, search, categoriaFiltro, excluirCliente]);

    // Preparación de datasets para gráficos multianuales (con filtros de usuario, categoría y pago)
    const multiAnualSalesData = useMemo(() => {
        const yearsToCompare = aniosDisponibles.slice().reverse();
        const datasets = yearsToCompare.map((yr, idx) => {
            const raw = obtenerPedidosPorAnio(oldOrders, pedidos, yr);
            const conPrecios = aplicarPreciosFabricaAKits(filtrarPorEstadoPagado(raw), listaPrecios);
            const { pedidosFiltrados } = filtrarPedidosYGastosPorUsuario(conPrecios, [], filtroUsuario, esLeonardo, filtroCategoria);
            const monthly = Array(12).fill(0);
            pedidosFiltrados.forEach(p => {
                if (p.mes !== null && p.mes >= 0 && p.mes <= 11) {
                    monthly[p.mes] += p.total;
                }
            });
            const color = pastelColors[idx % pastelColors.length];
            return {
                label: String(yr),
                data: monthly,
                backgroundColor: color,
                borderColor: color,
            };
        });

        return {
            labels: MONTH_LABELS,
            datasets
        };
    }, [aniosDisponibles, oldOrders, pedidos, pastelColors, filtrarPorEstadoPagado, listaPrecios, filtroUsuario, esLeonardo, filtroCategoria]);

    // Preparación de datasets para gastos multianuales (con filtros de usuario y categoría)
    const multiAnualGastosData = useMemo(() => {
        const yearsToCompare = aniosDisponibles.slice().reverse();
        const datasets = yearsToCompare.map((yr, idx) => {
            const rawG = obtenerGastosPorAnio(gastos, yr);
            const { gastosFiltrados } = filtrarPedidosYGastosPorUsuario([], rawG, filtroUsuario, esLeonardo, filtroCategoria);
            const color = pastelColors[(idx + 4) % pastelColors.length];
            return {
                label: String(yr),
                data: gastosFiltrados.mensual,
                backgroundColor: color,
                borderColor: color,
            };
        });

        return {
            labels: MONTH_LABELS,
            datasets
        };
    }, [aniosDisponibles, gastos, pastelColors, filtroUsuario, esLeonardo, filtroCategoria]);

    // Datasets para gráfico de Ventas vs Gastos del año seleccionado
    const chartVentasVsGastos = useMemo(() => {
        const catSuffix = filtroCategoria !== 'TODOS' ? ` (${filtroCategoria === 'KITS' ? 'Kits' : filtroCategoria === 'GUANTES' ? 'Guantes' : 'Otros'})` : '';
        return {
            labels: MONTH_LABELS,
            datasets: [
                {
                    label: `Ventas ${fechaPedido}${catSuffix}`,
                    data: stats.ventasMensuales,
                    backgroundColor: 'rgba(16, 185, 129, 0.75)',
                },
                {
                    label: `Gastos ${fechaPedido}${catSuffix}`,
                    data: stats.gastosMensuales,
                    backgroundColor: 'rgba(239, 68, 68, 0.75)',
                }
            ]
        };
    }, [fechaPedido, stats, filtroCategoria]);

    // Datasets para gráfico de ventas por categoría del año (respeta filtro superior de categoría)
    const chartCategoriasData = useMemo(() => {
        let lista = stats.categoriasMatriz || [];
        if (filtroCategoria === 'KITS') {
            lista = lista.filter(c => c.grupo === 'Kits');
        } else if (filtroCategoria === 'GUANTES') {
            lista = lista.filter(c => c.grupo === 'Guantes');
        } else if (filtroCategoria === 'OTROS') {
            lista = lista.filter(c => c.grupo === 'Otros');
        }

        const datasets = lista
            .filter(cat => filtroCategoria !== 'TODOS' ? true : (cat.totalVenta > 0 || cat.unidades > 0))
            .map((cat, idx) => ({
                label: cat.nombre,
                data: cat.mensualVenta,
                backgroundColor: cat.color || pastelColors[idx % pastelColors.length],
            }));

        return {
            labels: MONTH_LABELS,
            datasets
        };
    }, [stats, pastelColors, filtroCategoria]);

    // Datasets para gráfico de cantidades por categoría del año (respeta filtro superior de categoría)
    const chartCategoriasCantidad = useMemo(() => {
        let lista = stats.categoriasMatriz || [];
        if (filtroCategoria === 'KITS') {
            lista = lista.filter(c => c.grupo === 'Kits');
        } else if (filtroCategoria === 'GUANTES') {
            lista = lista.filter(c => c.grupo === 'Guantes');
        } else if (filtroCategoria === 'OTROS') {
            lista = lista.filter(c => c.grupo === 'Otros');
        }

        const datasets = lista
            .filter(cat => filtroCategoria !== 'TODOS' ? true : (cat.totalVenta > 0 || cat.unidades > 0))
            .map((cat, idx) => ({
                label: cat.nombre,
                data: cat.mensualUnidades,
                backgroundColor: cat.color || pastelColors[idx % pastelColors.length],
            }));

        return {
            labels: MONTH_LABELS,
            datasets
        };
    }, [stats, pastelColors, filtroCategoria]);

    // Preparación para AreaChartOld (mantener compatibilidad Brand Design vs Otros con filtros activos)
    const areaChartProps = useMemo(() => {
        const NIT_BRAND_DESIGN = '900879470';
        const brandMensual = Array(12).fill(0);
        const otrosMensual = Array(12).fill(0);

        pedidosDelAnio.forEach(ord => {
            if (ord.mes !== null && ord.mes >= 0 && ord.mes <= 11) {
                const esBrand = ord.nit.includes(NIT_BRAND_DESIGN) || ord.cliente.toLowerCase().includes('brand');
                if (esBrand) {
                    brandMensual[ord.mes] += ord.total;
                } else {
                    otrosMensual[ord.mes] += ord.total;
                }
            }
        });

        const gastosFiltradosLista = gastosDelAnio.lista || [];
        const gastosMensualesO = new Array(12).fill(0);
        const gastosMensualesL = new Array(12).fill(0);

        gastosFiltradosLista.forEach(gasto => {
            const fechaGasto = parsearFechaSegura(gasto.fecha || gasto.createdAt);
            if (!fechaGasto) return;
            const mes = fechaGasto.getMonth();
            if (mes < 0 || mes > 11) return;

            const subtotal = Number(gasto.precio || 0) * Number(gasto.cantidad || 1);
            const userId = (gasto.user?._id || gasto.user)?.toString();
            if (userId === UID_OSCAR) {
                gastosMensualesO[mes] += subtotal;
            } else if (userId === UID_LEONARDO) {
                gastosMensualesL[mes] += subtotal;
            } else {
                gastosMensualesL[mes] += Math.round(subtotal * 0.5);
                gastosMensualesO[mes] += Math.round(subtotal * 0.5);
            }
        });

        return {
            gastos: {
                gastosMensualesO,
                gastosMensualesL
            },
            ventas: { data: stats.ventasMensuales },
            ventasBrandDesign: { data: brandMensual },
            ventasOtros: { data: otrosMensual },
            porValor: false
        };
    }, [pedidosDelAnio, gastosDelAnio, stats]);

    // Exportación CSV
    const handleDownloadCsv = () => {
        const delimiter = ";";
        const headers = ["Fecha", "NIT/CC", "Remision", "Cliente", "Productos/Cant", "Items Variedad", "Total ($)", "Origen"];
        const rows = pedidosFiltrados.map(p => [
            `"${p.fechaStr}"`,
            `"${p.nit}"`,
            `"${p.remision}"`,
            `"${p.cliente.replace(/"/g, '""')}"`,
            p.cantidadPrendas,
            p.itemsCount,
            p.total,
            `"${p.origen}"`
        ]);

        const csvContent = "\uFEFF" + [headers.join(delimiter), ...rows.map(r => r.join(delimiter))].join("\r\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Reporte_Detalle_Pedidos_${fechaPedido}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Exportación PDF Gerencial
    const handleDownloadPDF = () => {
        Swal.fire({
            title: "Generando Informe Ejecutivo PDF...",
            text: `Compilando balance financiero y métricas de ${fechaPedido}`,
            timer: 2200,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const element = reportPrintRef.current;
        const opt = {
            margin: [8, 8, 8, 8],
            filename: `Informe_Gerencial_${fechaPedido}_${Date.now()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    const esModerno = parseInt(fechaPedido, 10) >= 2025;

    return (
        <LayoutApp>
            {/* Barra Flotante de Filtro de Cuentas y Año al hacer Scroll */}
            <div
                className={`floating-user-filter rounded-pill px-3 py-2 align-items-center gap-2.5 shadow ${
                    mostrarFiltroFlotante ? "is-visible" : ""
                }`}
                role="region"
                aria-label="Filtro rápido de cuentas y año"
            >
                {/* Indicador / Icono de Cuentas */}
                <div className="d-flex align-items-center gap-2 px-1 text-secondary">
                    <span 
                        className="d-inline-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-circle shadow-xs" 
                        style={{ width: "28px", height: "28px", fontSize: "0.82rem" }}
                    >
                        <i className="fa-solid fa-users-gear"></i>
                    </span>
                    <span className="fw-bold small d-none d-sm-inline text-dark" style={{ fontSize: "0.82rem" }}>
                        Cuentas:
                    </span>
                </div>

                {esKarol ? (
                    <span className="badge bg-primary text-white rounded-pill px-3 py-2 fw-semibold shadow-xs" style={{ fontSize: "0.82rem" }}>
                        <i className="fa-solid fa-user me-1.5"></i> Karol Gómez
                    </span>
                ) : (
                    <div className="btn-group rounded-pill p-1 bg-light border shadow-xs" role="group">
                        <button
                            type="button"
                            className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold transition-all ${
                                filtroUsuario === "GENERAL"
                                    ? "btn-dark text-white shadow-sm"
                                    : "btn-light text-secondary border-0 bg-transparent"
                            }`}
                            onClick={() => setFiltroUsuario("GENERAL")}
                            title={esLeonardo ? "Consolidado General filtrado: Kits globales, Guantes propios y Otros de Kits" : "Consolidado General de la Empresa"}
                            style={{ fontSize: "0.82rem", whiteSpace: "nowrap" }}
                        >
                            <i className="fa-solid fa-building me-1.5 opacity-75"></i>
                            Consolidado General
                        </button>
                        <button
                            type="button"
                            className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold transition-all ${
                                filtroUsuario === "LEONARDO"
                                    ? "btn-primary text-white shadow-sm"
                                    : "btn-light text-secondary border-0 bg-transparent"
                            }`}
                            onClick={() => setFiltroUsuario("LEONARDO")}
                            style={{ fontSize: "0.82rem", whiteSpace: "nowrap" }}
                        >
                            <i className="fa-solid fa-user me-1.5 opacity-75"></i>
                            Leonardo
                            <span className="badge bg-white text-primary rounded-pill ms-2 px-2 py-0.5" style={{ fontSize: "0.68rem" }}>
                                + Karol
                            </span>
                        </button>
                        {!esLeonardo && (
                            <button
                                type="button"
                                className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold transition-all ${
                                    filtroUsuario === "OSCAR"
                                        ? "btn-success text-white shadow-sm"
                                        : "btn-light text-secondary border-0 bg-transparent"
                                }`}
                                onClick={() => setFiltroUsuario("OSCAR")}
                                style={{ fontSize: "0.82rem", whiteSpace: "nowrap" }}
                            >
                                <i className="fa-solid fa-user-tie me-1.5 opacity-75"></i>
                                Oscar
                                <span className="badge bg-white text-success rounded-pill ms-2 px-2 py-0.5" style={{ fontSize: "0.68rem" }}>
                                    + Guantes
                                </span>
                            </button>
                        )}
                    </div>
                )}

                {/* Divisor vertical sutil */}
                <div className="vr my-1 text-secondary opacity-25 d-none d-sm-block" style={{ height: "24px" }}></div>

                {/* Selector interactivo de año con espacio adecuado */}
                <div className="d-flex align-items-center gap-2 bg-light border rounded-pill px-3 py-1 shadow-xs" title="Año analizado">
                    <i className="fa-regular fa-calendar text-primary" style={{ fontSize: "0.85rem" }}></i>
                    <span className="fw-semibold text-secondary small d-none d-md-inline" style={{ fontSize: "0.78rem" }}>Año:</span>
                    <select
                        className="form-select form-select-sm border-0 bg-transparent fw-bolder py-0 ps-1 pe-3 text-dark"
                        value={fechaPedido}
                        onChange={(e) => handleCambiarAnio(e.target.value)}
                        style={{ cursor: "pointer", width: "auto", minWidth: "68px", fontSize: "0.82rem", boxShadow: "none" }}
                    >
                        {aniosDisponibles.map(yr => (
                            <option key={yr} value={yr}>
                                {yr}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Badge contextual si hay filtro de categoría activo */}
                {filtroCategoria !== "TODOS" && (
                    <span 
                        className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-2.5 py-1.5 fw-bold d-none d-lg-inline-block"
                        style={{ fontSize: "0.75rem" }}
                        title={`Filtro de categoría: ${filtroCategoria}`}
                    >
                        {filtroCategoria === "KITS" ? "Kits" : filtroCategoria === "GUANTES" ? "Guantes" : "Otros"}
                    </span>
                )}

                {/* Divisor vertical hacia el botón de subir */}
                <div className="vr my-1 text-secondary opacity-25" style={{ height: "24px" }}></div>

                {/* Botón para subir rápido al inicio con mejor proporción */}
                <button
                    type="button"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="btn btn-sm btn-light text-secondary rounded-circle border d-flex align-items-center justify-content-center shadow-xs"
                    style={{ width: "32px", height: "32px", minWidth: "32px" }}
                    title="Subir al inicio de la página"
                >
                    <i className="fa-solid fa-arrow-up" style={{ fontSize: "0.78rem" }}></i>
                </button>
            </div>
            <div className="w-100 py-2" ref={reportPrintRef} style={{ minWidth: 0, maxWidth: "100%" }}>
                {/* Header Superior con Selector de Años y Acciones */}
                <div className="card shadow-sm border-0 mb-4 bg-white rounded-4 overflow-hidden">
                    <div className="card-body p-4">
                        <div className="row align-items-center g-3">
                            <div className="col-12 col-lg-7">
                                <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                                    <span className="badge rounded-pill bg-primary-subtle text-primary fw-bold px-3 py-1">
                                        <i className="fa-solid fa-briefcase me-1"></i> Inteligencia del Negocio
                                    </span>
                                    <span className={`badge rounded-pill px-3 py-1 fw-bold ${esModerno ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-dark'}`}>
                                        <i className={`fa-solid ${esModerno ? 'fa-database' : 'fa-box-archive'} me-1`}></i>
                                        {esModerno ? 'Sistema en Curso (MongoDB)' : 'Archivo Histórico (Excel/OldOrders)'}
                                    </span>
                                </div>
                                <h3 className="fw-bolder text-dark mb-1">
                                    Reportes y Finanzas del Negocio ({fechaPedido})
                                </h3>
                                <p className="text-muted small mb-0">
                                    Consolidado integral de ventas, egresos operativos, rentabilidad, estacionalidad y comportamiento de clientes.
                                </p>
                            </div>

                            {/* Selector Rápido de Años y Botones de Exportación */}
                            <div className="col-12 col-lg-5">
                                <div className="d-flex flex-column align-items-lg-end gap-2">
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="fw-semibold text-secondary small">Año principal:</span>
                                        <select
                                            className="form-select form-select-sm w-auto rounded-pill border-success fw-bold shadow-sm px-3"
                                            value={fechaPedido}
                                            onChange={(e) => handleCambiarAnio(e.target.value)}
                                            style={{ cursor: 'pointer', minWidth: '100px' }}
                                        >
                                            {aniosDisponibles.map(yr => (
                                                <option key={yr} value={yr}>
                                                    {yr}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Total en Ventas Categoría Kits para el año seleccionado */}
                                    <div className="text-lg-end mt-1">
                                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 rounded-pill small fw-bold shadow-xs">
                                            <i className="fa-solid fa-box-archive me-1"></i>
                                            Ventas Kits (Fábrica) {fechaPedido}: {formatearPrecio(stats.totalVentasKits || ((stats.gruposResumen?.Kits?.total || 0) + (stats.gruposResumen?.Cirios?.total || 0)))}
                                        </span>
                                    </div>

                                    <div className="d-flex gap-2 mt-1">
                                        <Button
                                            variant="outline-danger"
                                            className="btn-sm rounded-pill px-3 d-flex align-items-center gap-2"
                                            onClick={handleDownloadPDF}
                                        >
                                            <i className="fa-solid fa-file-pdf"></i>
                                            <span>Exportar Informe PDF</span>
                                        </Button>
                                        <Button
                                            variant="outline-success"
                                            className="btn-sm rounded-pill px-3 d-flex align-items-center gap-2"
                                            onClick={handleDownloadCsv}
                                        >
                                            <i className="fa-solid fa-file-csv"></i>
                                            <span>Descargar CSV</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Selector de Cuentas por Usuario / Consolidado */}
                        <div ref={topFilterRef} className="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-4 pt-3 border-top">
                            <div className="d-flex align-items-center gap-2">
                                <span className="p-2 bg-light rounded-3 border text-secondary">
                                    <i className="fa-solid fa-users-gear"></i>
                                </span>
                                <div>
                                    <span className="fw-bold text-dark d-block small">División de Cuentas:</span>
                                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                        {filtroUsuario === 'KAROL'
                                            ? 'Exclusivamente pedidos y métricas de Karol Gómez.'
                                            : filtroUsuario === 'GENERAL'
                                                ? (esLeonardo
                                                    ? 'Consolidado filtrado para Leonardo: Todos los Kits, Guantes propios y Otros con categoría Kits.'
                                                    : 'Visualizando 100% de la empresa (sin duplicar pedidos de clientes).')
                                                : filtroUsuario === 'LEONARDO'
                                                    ? 'Cuentas de Leonardo Gómez + Kits y Guantes de Karol Gómez (separados y consolidados).'
                                                    : 'Cuentas de Oscar Gómez + Guantes vendidos por Karol Gómez.'}
                                        {filtroCategoria !== 'TODOS' && (
                                            <span className="badge bg-primary text-white rounded-pill ms-2">
                                                Filtro activo: {filtroCategoria === 'KITS' ? 'Solo Kits' : filtroCategoria === 'GUANTES' ? 'Solo Guantes' : 'Solo Otros'}
                                            </span>
                                        )}
                                    </small>
                                </div>
                            </div>

                            <div className="d-flex flex-wrap align-items-center gap-2">
                                {/* Botón Filtro Solo Pagados */}
                                <button
                                    type="button"
                                    className={`btn btn-sm rounded-pill px-3 py-1 fw-bold transition-all shadow-sm ${
                                        soloPagados 
                                            ? 'btn-success text-white border-0' 
                                            : 'btn-outline-secondary bg-white'
                                    }`}
                                    onClick={() => setSoloPagados(!soloPagados)}
                                    title={soloPagados ? 'Haga clic para mostrar todos los estados' : 'Haga clic para filtrar y mostrar únicamente pedidos en estado PAGADO'}
                                >
                                    <i className={`fa-solid ${soloPagados ? 'fa-circle-check text-white' : 'fa-money-bill-wave text-success'} me-1.5`}></i>
                                    {soloPagados ? 'Estado: Solo PAGADOS' : 'Todos los Estados (Por defecto)'}
                                </button>

                                {/* Filtro por Categoría de Producto */}
                                <div className="btn-group shadow-sm rounded-pill p-1 bg-light border" role="group" aria-label="Filtro de categoría">
                                    <button
                                        type="button"
                                        className={`btn btn-sm rounded-pill px-2.5 py-1 fw-bold transition-all ${
                                            filtroCategoria === 'TODOS'
                                                ? 'btn-secondary text-white shadow-sm'
                                                : 'btn-light text-secondary border-0 bg-transparent'
                                        }`}
                                        onClick={() => setFiltroCategoria('TODOS')}
                                        title="Mostrar todas las categorías permitidas"
                                    >
                                        <i className="fa-solid fa-layer-group me-1"></i>
                                        Todas
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn btn-sm rounded-pill px-2.5 py-1 fw-bold transition-all ${
                                            filtroCategoria === 'KITS'
                                                ? 'btn-info text-white shadow-sm'
                                                : 'btn-light text-secondary border-0 bg-transparent'
                                        }`}
                                        onClick={() => setFiltroCategoria('KITS')}
                                        title="Filtrar valores únicamente por la categoría Kits"
                                    >
                                        <i className="fa-solid fa-box-open me-1"></i>
                                        Solo Kits
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn btn-sm rounded-pill px-2.5 py-1 fw-bold transition-all ${
                                            filtroCategoria === 'GUANTES'
                                                ? 'btn-warning text-dark shadow-sm'
                                                : 'btn-light text-secondary border-0 bg-transparent'
                                        }`}
                                        onClick={() => setFiltroCategoria('GUANTES')}
                                        title="Filtrar valores únicamente por la categoría Guantes"
                                    >
                                        <i className="fa-solid fa-mitten me-1"></i>
                                        Solo Guantes
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn btn-sm rounded-pill px-2.5 py-1 fw-bold transition-all ${
                                            filtroCategoria === 'OTROS'
                                                ? 'btn-primary text-white shadow-sm'
                                                : 'btn-light text-secondary border-0 bg-transparent'
                                        }`}
                                        onClick={() => setFiltroCategoria('OTROS')}
                                        title="Filtrar valores únicamente por la categoría Otros (accesorios)"
                                    >
                                        <i className="fa-solid fa-tags me-1"></i>
                                        Solo Otros
                                    </button>
                                </div>

                                {esKarol ? (
                                    <span className="badge bg-primary text-white rounded-pill px-3 py-2 fw-semibold shadow-xs">
                                        <i className="fa-solid fa-user me-1"></i> Karol Gómez (Mis Estadísticas)
                                    </span>
                                ) : (
                                    <div className="btn-group shadow-sm rounded-pill p-1 bg-light border" role="group">
                                        <button
                                            type="button"
                                            className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${filtroUsuario === 'GENERAL'
                                                ? 'btn-dark text-white shadow-sm'
                                                : 'btn-light text-secondary border-0 bg-transparent'
                                                }`}
                                            onClick={() => setFiltroUsuario('GENERAL')}
                                            title={esLeonardo ? 'Consolidado General filtrado: Kits globales, Guantes propios y Otros de Kits' : 'Consolidado General de la Empresa'}
                                        >
                                            <i className="fa-solid fa-building me-1"></i>
                                            Consolidado General
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${filtroUsuario === 'LEONARDO'
                                                ? 'btn-primary text-white shadow-sm'
                                                : 'btn-light text-secondary border-0 bg-transparent'
                                                }`}
                                            onClick={() => setFiltroUsuario('LEONARDO')}
                                        >
                                            <i className="fa-solid fa-user me-1"></i>
                                            Leonardo Gómez
                                            <span className="badge bg-white text-primary rounded-pill ms-1" style={{ fontSize: '0.67rem' }}>
                                                + Karol
                                            </span>
                                        </button>
                                        {!esLeonardo && (
                                            <button
                                                type="button"
                                                className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${filtroUsuario === 'OSCAR'
                                                    ? 'btn-success text-white shadow-sm'
                                                    : 'btn-light text-secondary border-0 bg-transparent'
                                                    }`}
                                                onClick={() => setFiltroUsuario('OSCAR')}
                                            >
                                                <i className="fa-solid fa-user-tie me-1"></i>
                                                Oscar Gómez
                                                <span className="badge bg-white text-success rounded-pill ms-1" style={{ fontSize: '0.67rem' }}>
                                                    + Guantes Karol
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pestañas de Navegación de Reportes */}
                        <div className="scroll-horizontal-touch gap-2 mt-3 pt-3 border-top pb-1">
                            <button
                                className={`btn btn-sm rounded-3 px-3 py-2 fw-semibold d-flex align-items-center gap-2 text-nowrap ${activeTab === 'finanzas' ? 'btn-dark text-white shadow-sm' : 'btn-outline-secondary'
                                    }`}
                                onClick={() => setActiveTab('finanzas')}
                            >
                                <i className="fa-solid fa-scale-balanced"></i>
                                <span>Finanzas & P&L Mensual</span>
                            </button>

                            <button
                                className={`btn btn-sm rounded-3 px-3 py-2 fw-semibold d-flex align-items-center gap-2 text-nowrap ${activeTab === 'categorias' ? 'btn-dark text-white shadow-sm' : 'btn-outline-secondary'
                                    }`}
                                onClick={() => setActiveTab('categorias')}
                            >
                                <i className="fa-solid fa-tags"></i>
                                <span>Categorías & Género</span>
                            </button>

                            <button
                                className={`btn btn-sm rounded-3 px-3 py-2 fw-semibold d-flex align-items-center gap-2 text-nowrap ${activeTab === 'clientes' ? 'btn-dark text-white shadow-sm' : 'btn-outline-secondary'
                                    }`}
                                onClick={() => setActiveTab('clientes')}
                            >
                                <i className="fa-solid fa-users"></i>
                                <span>Clientes & Concentración</span>
                                <span className="badge bg-secondary rounded-pill">{stats.totalClientesUnicos}</span>
                            </button>

                            <button
                                className={`btn btn-sm rounded-3 px-3 py-2 fw-semibold d-flex align-items-center gap-2 text-nowrap ${activeTab === 'comparativa' ? 'btn-dark text-white shadow-sm' : 'btn-outline-secondary'
                                    }`}
                                onClick={() => setActiveTab('comparativa')}
                            >
                                <i className="fa-solid fa-code-compare"></i>
                                <span>Comparativa Cara a Cara</span>
                            </button>

                            <button
                                className={`btn btn-sm rounded-3 px-3 py-2 fw-semibold d-flex align-items-center gap-2 text-nowrap ${activeTab === 'multianual' ? 'btn-dark text-white shadow-sm' : 'btn-outline-secondary'
                                    }`}
                                onClick={() => setActiveTab('multianual')}
                            >
                                <i className="fa-solid fa-chart-line"></i>
                                <span>Evolución Histórica</span>
                            </button>

                            <button
                                className={`btn btn-sm rounded-3 px-3 py-2 fw-semibold d-flex align-items-center gap-2 text-nowrap ${activeTab === 'pedidos' ? 'btn-dark text-white shadow-sm' : 'btn-outline-secondary'
                                    }`}
                                onClick={() => setActiveTab('pedidos')}
                            >
                                <i className="fa-solid fa-table-list"></i>
                                <span>Listado Detallado de Órdenes</span>
                                <span className="badge bg-primary rounded-pill">{pedidosFiltrados.length}</span>
                            </button>

                            <button
                                className="btn btn-sm btn-primary rounded-3 px-3 py-2 fw-bold d-flex align-items-center gap-2 ms-auto shadow-xs"
                                onClick={() => navigate('/pedidos/cruceCuentas')}
                                title="Ir a la liquidación financiera y cruce de cuentas entre socios a precios de fábrica"
                            >
                                <i className="fa-solid fa-scale-balanced"></i>
                                <span>Cruce de Cuentas (Socios)</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Banner de Estado Pagado Activo */}
                {soloPagados && (
                    <div className="alert alert-success border-0 rounded-4 shadow-sm py-2 px-4 d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 bg-success-subtle text-success-emphasis">
                        <div className="d-flex align-items-center gap-2">
                            <i className="fa-solid fa-circle-check fs-5 text-success"></i>
                            <div>
                                <strong className="d-block small">Filtro Activo: Calculando únicamente pedidos PAGADOS</strong>
                                <small className="text-muted" style={{ fontSize: '0.78rem' }}>
                                    Todas las métricas de finanzas, ventas, unidades y división por socios reflejan exclusivamente pedidos con estado pagado.
                                </small>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-success rounded-pill px-3 py-1 fw-bold"
                            onClick={() => setSoloPagados(false)}
                        >
                            <i className="fa-solid fa-rotate-left me-1"></i>
                            Restablecer a Todos los Estados
                        </button>
                    </div>
                )}

                {/* Banners de Estado del Filtro de Usuario */}
                {filtroUsuario === 'GENERAL' && esLeonardo && (
                    <div className="alert border-0 rounded-4 shadow-sm py-3 px-4 d-flex flex-column gap-2 mb-4 text-white" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            <div className="d-flex align-items-center gap-3">
                                <span className="badge rounded-circle bg-white text-dark p-3 shadow-xs">
                                    <i className="fa-solid fa-building-user fs-5 text-primary"></i>
                                </span>
                                <div>
                                    <strong className="text-white d-block fs-6">
                                        Consolidado General Filtrado: Leonardo Gómez ({fechaPedido})
                                    </strong>
                                    <small className="text-white-50">
                                        Visualizando <strong>Todos los Kits</strong> de la empresa, <strong>Guantes vendidos por Leonardo</strong> y <strong>Otros con categoría Kits</strong>.
                                    </small>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <button className="btn btn-sm btn-outline-light rounded-pill px-3 fw-bold" onClick={() => setFiltroUsuario('LEONARDO')}>
                                    <i className="fa-solid fa-user me-1"></i> Ver Cuenta Propia (Leonardo + Karol)
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Banner de Filtro de Categoría Activo */}
                {filtroCategoria !== 'TODOS' && (
                    <div className="alert alert-info border-0 rounded-4 shadow-sm py-2 px-3 d-flex align-items-center justify-content-between mb-4">
                        <div className="d-flex align-items-center gap-2 small">
                            <i className="fa-solid fa-filter text-primary fs-6"></i>
                            <span>
                                Filtro de Categoría activo: <strong>{filtroCategoria === 'KITS' ? 'Solo Kits' : filtroCategoria === 'GUANTES' ? 'Solo Guantes' : 'Solo Otros'}</strong>. Todos los cálculos, gráficos, tarjetas ejecutivas y estados reflejan únicamente esta categoría.
                            </span>
                        </div>
                        <button
                            type="button"
                            className="btn btn-sm btn-light border rounded-pill px-3 py-1 fw-bold text-secondary shadow-xs"
                            onClick={() => setFiltroCategoria('TODOS')}
                        >
                            <i className="fa-solid fa-xmark me-1 text-danger"></i> Quitar Filtro (Ver Todas)
                        </button>
                    </div>
                )}

                {filtroUsuario === 'KAROL' && (
                    <div className="alert alert-primary border-0 rounded-4 shadow-sm py-3 px-4 d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                        <div className="d-flex align-items-center gap-3">
                            <span className="badge rounded-circle bg-primary text-white p-3">
                                <i className="fa-solid fa-user fs-5"></i>
                            </span>
                            <div>
                                <strong className="text-dark d-block fs-6">
                                    Mis Estadísticas y Pedidos: Karol Gómez ({fechaPedido})
                                </strong>
                                <small className="text-muted">
                                    Mostrando exclusivamente las ventas, pedidos y operaciones asociadas a su cuenta de usuario.
                                </small>
                            </div>
                        </div>
                    </div>
                )}

                {filtroUsuario === 'LEONARDO' && (
                    <div className="alert alert-primary border-0 rounded-4 shadow-sm py-3 px-4 d-flex flex-column gap-2 mb-4">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            <div className="d-flex align-items-center gap-3">
                                <span className="badge rounded-circle bg-primary text-white p-3">
                                    <i className="fa-solid fa-user fs-5"></i>
                                </span>
                                <div>
                                    <strong className="text-dark d-block fs-6">
                                        Cuentas Desglosadas: Leonardo Gómez ({fechaPedido})
                                    </strong>
                                    <small className="text-muted">
                                        Mostrando pedidos propios de Leonardo + Kits y Guantes vendidos por Karol Gómez (separados y consolidados).
                                    </small>
                                </div>
                            </div>
                            <button className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold" onClick={() => setFiltroUsuario('GENERAL')}>
                                <i className="fa-solid fa-rotate-left me-1"></i> Ver Consolidado General
                            </button>
                        </div>

                        {/* Desglose de Guantes Leo vs Karol */}
                        <div className="p-2 px-3 rounded-3 bg-white border border-primary-subtle d-flex flex-wrap align-items-center justify-content-between gap-2 mt-1">
                            <span className="small fw-bold text-dark">
                                <i className="fa-solid fa-hand-sparkles text-warning me-1"></i>
                                Venta de Guantes (Separada & Sumada):
                            </span>
                            <div className="d-flex flex-wrap align-items-center gap-2">
                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 rounded-pill">
                                    Guantes Leonardo: {formatearPrecio(desgloseGuantesLeoYKarol.leo)}
                                </span>
                                <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1 rounded-pill">
                                    Guantes Karol: {formatearPrecio(desgloseGuantesLeoYKarol.karol)}
                                </span>
                                <span className="badge bg-warning-subtle text-dark border border-warning px-2 py-1 rounded-pill fw-bold">
                                    Total Guantes: {formatearPrecio(desgloseGuantesLeoYKarol.total)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {filtroUsuario === 'OSCAR' && (
                    <div className="alert alert-success border-0 rounded-4 shadow-sm py-3 px-4 d-flex flex-column gap-2 mb-4">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            <div className="d-flex align-items-center gap-3">
                                <span className="badge rounded-circle bg-success text-white p-3">
                                    <i className="fa-solid fa-user-tie fs-5"></i>
                                </span>
                                <div>
                                    <strong className="text-dark d-block fs-6">
                                        Cuentas Desglosadas: Oscar Gómez ({fechaPedido})
                                    </strong>
                                    <small className="text-muted">
                                        Mostrando pedidos propios de Oscar + Ítems de <strong>Guantes</strong> vendidos por Karol Gómez. Egresos operativos y de insumos.
                                    </small>
                                </div>
                            </div>
                            <button className="btn btn-sm btn-outline-success rounded-pill px-3 fw-bold" onClick={() => setFiltroUsuario('GENERAL')}>
                                <i className="fa-solid fa-rotate-left me-1"></i> Ver Consolidado General
                            </button>
                        </div>

                        {/* Destacado especial para Oscar: Ventas Guantes de Leonardo */}
                        {ventasGuantesLeoAnio > 0 && (
                            <div className="p-2 px-3 rounded-3 bg-white border border-warning-subtle d-flex flex-wrap align-items-center justify-content-between gap-2 mt-1">
                                <span className="small fw-bold text-dark">
                                    <i className="fa-solid fa-hand-sparkles text-warning me-1"></i>
                                    Ventas de Guantes de Leonardo Gómez (GUANTES + OTR):
                                </span>
                                <span className="badge bg-warning-subtle text-dark border border-warning px-3 py-1 rounded-pill fw-bold fs-7">
                                    {formatearPrecio(ventasGuantesLeoAnio)}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {!esModerno && (
                    <div className="alert border-0 rounded-4 py-2 px-3 mb-4 small d-flex align-items-center gap-2 bg-primary bg-opacity-10 text-primary-emphasis border border-primary-subtle">
                        <i className="fa-solid fa-circle-info fs-5 text-primary"></i>
                        <span>
                            <strong>Archivo Histórico ({fechaPedido}):</strong> Para los administradores, las ventas de <strong>Leonardo Gómez</strong> corresponden a <strong>BRAND DESIGN SAS</strong>, y las ventas de <strong>Oscar Gómez</strong> corresponden al <strong>resto de clientes</strong> de la empresa.
                        </span>
                    </div>
                )}

                {/* KPI CARDS EJECUTIVAS: CONTEXTO INMEDIATO */}
                <div className="row g-3 mb-4">
                    {/* Card 1: Ventas Totales */}
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white border-start border-4 border-primary">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <span className="text-muted small fw-bold text-uppercase d-block">Ventas Totales</span>
                                    <div className="d-flex align-items-center gap-1 mt-1">
                                        <span className="badge bg-light text-secondary border">Año {fechaPedido}</span>
                                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: '0.68rem' }} title="Kits calculados a precios de fábrica; Guantes y Otros a precios de venta">
                                            Kits a Precio de Fábrica
                                        </span>
                                    </div>
                                </div>
                                <div className="rounded-circle bg-primary-subtle text-primary p-2 d-flex align-items-center justify-content-center" style={{ width: 38, height: 38 }}>
                                    <i className="fa-solid fa-sack-dollar"></i>
                                </div>
                            </div>
                            <h4 className="fw-bolder text-dark mb-1">{formatearPrecio(stats.totalVentas)}</h4>
                            <small className="text-muted d-block mb-1" style={{ fontSize: '0.72rem' }}>
                                Kits a precio de fábrica + Guantes/Otros venta
                            </small>
                            <div className="d-flex align-items-center gap-2 mt-auto pt-2">
                                {stats.totalVentasAnterior > 0 ? (
                                    <span className={`badge rounded-pill ${stats.crecimientoYoY >= 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} fw-bold`}>
                                        <i className={`fa-solid ${stats.crecimientoYoY >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'} me-1`}></i>
                                        {stats.crecimientoYoY >= 0 ? `+${stats.crecimientoYoY.toFixed(1)}%` : `${stats.crecimientoYoY.toFixed(1)}%`} vs {anioAnterior}
                                    </span>
                                ) : (
                                    <span className="badge bg-light text-muted">Sin base previa</span>
                                )}
                                <span className="text-muted small ms-auto">{stats.totalPedidos} pedidos</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Gastos Totales */}
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white border-start border-4 border-danger">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <span className="text-muted small fw-bold text-uppercase d-block">Gastos Operativos</span>
                                    <span className="badge bg-light text-secondary border">Costos registrados</span>
                                </div>
                                <div className="rounded-circle bg-danger-subtle text-danger p-2 d-flex align-items-center justify-content-center" style={{ width: 38, height: 38 }}>
                                    <i className="fa-solid fa-receipt"></i>
                                </div>
                            </div>
                            <h4 className="fw-bolder text-dark mb-1">{formatearPrecio(stats.totalGastos)}</h4>
                            <div className="d-flex align-items-center justify-content-between mt-auto pt-2">
                                <span className="text-muted small">
                                    Impacto: <strong>{stats.totalVentas > 0 ? ((stats.totalGastos / stats.totalVentas) * 100).toFixed(1) : 0}%</strong> de ventas
                                </span>
                                <span className="badge bg-danger-subtle text-danger fw-semibold">Egresos</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Utilidad Operativa */}
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white border-start border-4 border-success">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <span className="text-muted small fw-bold text-uppercase d-block">Utilidad Operativa</span>
                                    <span className="badge bg-light text-secondary border">Ventas - Gastos</span>
                                </div>
                                <div className="rounded-circle bg-success-subtle text-success p-2 d-flex align-items-center justify-content-center" style={{ width: 38, height: 38 }}>
                                    <i className="fa-solid fa-hand-holding-dollar"></i>
                                </div>
                            </div>
                            <h4 className={`fw-bolder mb-1 ${stats.utilidadOperativa >= 0 ? 'text-success' : 'text-danger'}`}>
                                {formatearPrecio(stats.utilidadOperativa)}
                            </h4>
                            <small className="text-muted d-block mb-1" style={{ fontSize: '0.72rem' }}>
                                Base: Kits a precio de fábrica
                            </small>
                            <div className="d-flex align-items-center justify-content-between mt-auto pt-2">
                                <span className={`badge rounded-pill fw-bold ${stats.margenOperativoPorcentaje >= 30 ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-dark'}`}>
                                    Margen: {stats.margenOperativoPorcentaje.toFixed(1)}%
                                </span>
                                <span className="text-muted small">{stats.utilidadOperativa >= 0 ? 'Operación Rentable' : 'Déficit'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Volumen, Ticket y Clientes */}
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white border-start border-4 border-info">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <span className="text-muted small fw-bold text-uppercase d-block">Volumen y Ticket</span>
                                    <span className="badge bg-light text-secondary border">{stats.totalClientesUnicos} clientes</span>
                                </div>
                                <div className="rounded-circle bg-info-subtle text-info p-2 d-flex align-items-center justify-content-center" style={{ width: 38, height: 38 }}>
                                    <i className="fa-solid fa-boxes-stacked"></i>
                                </div>
                            </div>
                            <h4 className="fw-bolder text-dark mb-1">{stats.totalPrendas.toLocaleString()} productos</h4>
                            <div className="d-flex align-items-center justify-content-between mt-auto pt-2">
                                <span className="text-muted small">
                                    Ticket prom: <strong className="text-dark">{formatearPrecio(stats.ticketPromedio)}</strong>
                                </span>
                                <span className="badge bg-info-subtle text-info fw-semibold">Producción</span>
                            </div>
                            <div className="mt-2 small text-muted border-top pt-1" style={{ fontSize: '0.73rem' }}>
                                Kits: <strong>{stats.gruposResumen.Kits.unidades}</strong> • Guantes: <strong className="text-primary">{stats.gruposResumen.Guantes.unidades} docenas</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* VISTA 1: FINANZAS & P&L MENSUAL */}
                {activeTab === 'finanzas' && (
                    <div className="row g-4">
                        {/* Gráfico Ventas vs Gastos del Año */}
                        <div className="col-12 col-xl-8">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                                <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
                                    <div>
                                        <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                                            <h5 className="fw-bold text-dark mb-0">
                                                <i className="fa-solid fa-chart-column text-primary me-2"></i>
                                                Flujo Mensual: Ventas vs Gastos ({fechaPedido})
                                            </h5>
                                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle small fw-semibold">
                                                <i className="fa-solid fa-industry me-1"></i> Kits a Precio de Fábrica
                                            </span>
                                        </div>
                                        <p className="text-muted small mb-0">
                                            Contraste de ingresos y egresos mes por mes (ingresos calculados con la facturación comercial real cobrada en los pedidos ya realizados).
                                        </p>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <span className="badge bg-success-subtle text-success p-2">
                                            <i className="fa-solid fa-circle me-1" style={{ fontSize: '0.6rem' }}></i> Ventas (Cobrado)
                                        </span>
                                        <span className="badge bg-danger-subtle text-danger p-2">
                                            <i className="fa-solid fa-circle me-1" style={{ fontSize: '0.6rem' }}></i> Gastos (Egresos)
                                        </span>
                                    </div>
                                </div>
                                <div style={{ minHeight: 330 }}>
                                    <StackedChart
                                        labels={chartVentasVsGastos.labels}
                                        datasets={chartVentasVsGastos.datasets}
                                        title={`Ventas vs Gastos ${fechaPedido}`}
                                        stacked={false}
                                        formato={true}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Estacionalidad Trimestral (Q1 a Q4) */}
                        <div className="col-12 col-xl-4">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                                <h6 className="fw-bold text-dark mb-1">
                                    <i className="fa-solid fa-calendar-week text-warning me-2"></i>
                                    Estacionalidad Trimestral ({fechaPedido})
                                </h6>
                                <p className="text-muted small mb-3">
                                    Rendimiento por trimestres. Kits valorizados a precios de fábrica (2025+) y Guantes a precios reales de pedidos.
                                </p>

                                <div className="d-flex flex-column gap-2">
                                    {Object.entries(stats.reporteTrimestres).map(([clave, tri]) => {
                                        if (clave.startsWith('S')) return null; // solo mostrar Q1-Q4 aquí
                                        return (
                                            <div key={clave} className="p-3 bg-light rounded-3 border">
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <span className="fw-bold text-dark small">{tri.nombre}</span>
                                                    <span className="badge bg-primary rounded-pill">{tri.participacion.toFixed(1)}% del año</span>
                                                </div>

                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className="text-muted small">Venta: <strong className="text-dark">{formatearPrecio(tri.ventas)}</strong></span>
                                                    <span className="text-muted small">Utilidad: <strong className={tri.utilidad >= 0 ? 'text-success' : 'text-danger'}>{formatearPrecio(tri.utilidad)}</strong></span>
                                                </div>

                                                {/* Desglose Separado: Kits (inc. Cirios) vs Guantes */}
                                                <div className="d-flex gap-2 mt-2 pt-2 border-top">
                                                    {/* Kits */}
                                                    <div className="flex-fill p-2 rounded-2 bg-white border border-primary-subtle shadow-xs">
                                                        <div className="d-flex align-items-center justify-content-between mb-1">
                                                            <span className="badge bg-primary-subtle text-primary fw-bold" style={{ fontSize: '0.68rem' }} title="Incluye kits de comunión, bautizo y cirios">
                                                                <i className="fa-solid fa-box me-1"></i> Kits (inc. Cirios)
                                                            </span>
                                                            <span className="fw-bolder text-dark" style={{ fontSize: '0.82rem' }}>
                                                                {tri.kits || 0} <small className="text-muted fw-normal" style={{ fontSize: '0.68rem' }}>unds</small>
                                                            </span>
                                                        </div>
                                                        <div className="text-end text-primary fw-bold" style={{ fontSize: '0.78rem' }}>
                                                            {formatearPrecio(tri.ventasKits || 0)}
                                                        </div>
                                                    </div>

                                                    {/* Guantes */}
                                                    <div className="flex-fill p-2 rounded-2 bg-white border border-purple-subtle shadow-xs" style={{ borderColor: 'rgba(139, 92, 246, 0.25)' }}>
                                                        <div className="d-flex align-items-center justify-content-between mb-1">
                                                            <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#f3e8ff', color: '#7e22ce', fontSize: '0.68rem' }}>
                                                                <i className="fa-solid fa-hand-sparkles me-1"></i> Guantes
                                                            </span>
                                                            <span className="fw-bolder text-dark" style={{ fontSize: '0.82rem' }}>
                                                                {tri.guantes || 0} <small className="text-muted fw-normal" style={{ fontSize: '0.68rem' }}>doc</small>
                                                            </span>
                                                        </div>
                                                        <div className="text-end fw-bold" style={{ color: '#7e22ce', fontSize: '0.78rem' }}>
                                                            {formatearPrecio(tri.ventasGuantes || 0)}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="d-flex justify-content-between align-items-center mt-2 text-muted" style={{ fontSize: '0.74rem' }}>
                                                    <span>
                                                        <i className="fa-solid fa-receipt me-1 text-secondary"></i>
                                                        {tri.pedidos} pedidos ({tri.prendas} prods.)
                                                        {(tri.otros > 0) && (
                                                            <span className="ms-1 text-secondary">({tri.otros} otros)</span>
                                                        )}
                                                    </span>
                                                    <span className="badge bg-light text-secondary border">
                                                        Margen: {tri.margen.toFixed(1)}%
                                                    </span>
                                                </div>

                                                {/* Acciones de comprobación de precios */}
                                                <div className="mt-2 pt-2 border-top d-flex justify-content-between align-items-center">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 rounded-pill px-2 py-0"
                                                        style={{ fontSize: '0.70rem' }}
                                                        onClick={() => setTrimestresExpandidos(prev => ({ ...prev, [clave]: !prev[clave] }))}
                                                        title="Ver la fórmula Cantidad × Precio de cada producto"
                                                    >
                                                        <i className={`fa-solid ${trimestresExpandidos[clave] ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                                                        <span>{trimestresExpandidos[clave] ? 'Ocultar Precios' : 'Comprobar Precios'}</span>
                                                        <span className="badge bg-primary text-white rounded-pill ms-1" style={{ fontSize: '0.60rem' }}>
                                                            {tri.auditoriaProductos?.length || 0}
                                                        </span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-light text-primary border rounded-pill px-2 py-0"
                                                        style={{ fontSize: '0.70rem' }}
                                                        title="Abrir auditoría completa con tabla detallada"
                                                        onClick={() => setAuditoriaTrimestreModal({ clave, ...tri })}
                                                    >
                                                        <i className="fa-solid fa-calculator me-1"></i> Auditoría
                                                    </button>
                                                </div>

                                                {/* Desglose inline de comprobación: Cantidad × Precio por asignación de fecha */}
                                                {trimestresExpandidos[clave] && (
                                                    <div className="mt-2 p-2 bg-white rounded-3 border shadow-xs" style={{ fontSize: '0.73rem' }}>
                                                        <div className="d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom">
                                                            <span className="fw-bold text-dark" style={{ fontSize: '0.72rem' }}>
                                                                <i className="fa-solid fa-list-check text-success me-1"></i>
                                                                Comprobación: Cantidad × Precio
                                                            </span>
                                                            <span className="badge bg-light text-dark border" style={{ fontSize: '0.64rem' }}>
                                                                Total: {formatearPrecio(tri.ventas)}
                                                            </span>
                                                        </div>

                                                        {(!tri.auditoriaProductos || tri.auditoriaProductos.length === 0) ? (
                                                            <div className="text-muted text-center py-2 fst-italic">No hay productos registrados en este trimestre.</div>
                                                        ) : (
                                                            <div className="d-flex flex-column gap-2">
                                                                {tri.auditoriaProductos.map((prod) => (
                                                                    <div key={prod.id} className="p-2 rounded bg-light border border-light-subtle">
                                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                                            <span className="fw-bold text-dark text-truncate" style={{ maxWidth: '65%' }} title={prod.nombre}>
                                                                                {prod.nombre}
                                                                            </span>
                                                                            <span className="fw-bolder text-primary">
                                                                                {formatearPrecio(prod.totalVenta)}
                                                                            </span>
                                                                        </div>

                                                                        {/* Filas de fórmulas por asignación de precio */}
                                                                        {prod.desglosesPorPrecio.map((des, dIdx) => (
                                                                            <div key={dIdx} className="d-flex justify-content-between align-items-center text-muted ms-1 mt-1" style={{ fontSize: '0.69rem' }}>
                                                                                <div>
                                                                                    <span className="text-dark fw-semibold">{des.cantidad} {prod.unidad}</span>
                                                                                    <span className="mx-1">×</span>
                                                                                    <span className="text-primary fw-semibold">{formatearPrecio(des.precioUnitario)}</span>
                                                                                    {des.esPrecioFabrica && (
                                                                                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle ms-1 py-0 px-1" style={{ fontSize: '0.58rem' }}>Fábrica</span>
                                                                                    )}
                                                                                    {des.rangoFechas && (
                                                                                        <span className="text-secondary ms-1" style={{ fontSize: '0.62rem' }}>
                                                                                            ({des.rangoFechas})
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                <div className="fw-bold text-dark">
                                                                                    = {formatearPrecio(des.subtotal)}
                                                                                </div>
                                                                            </div>
                                                                        ))}

                                                                        {prod.tieneMultiplesPrecios && (
                                                                            <div className="d-flex justify-content-between align-items-center text-warning-emphasis fw-bold mt-1 pt-1 border-top" style={{ fontSize: '0.64rem' }}>
                                                                                <span>
                                                                                    <i className="fa-solid fa-clock-rotate-left me-1 text-warning"></i>
                                                                                    {prod.desglosesPorPrecio.length} precios modificados por fecha
                                                                                </span>
                                                                                <span>
                                                                                    Total: {prod.totalCantidad} {prod.unidad}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Tabla Estado de Resultados Mensual Completo (P&L) */}
                        <div className="col-12">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
                                    <div>
                                        <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                                            <h5 className="fw-bold text-dark mb-0">
                                                <i className="fa-solid fa-file-invoice-dollar text-success me-2"></i>
                                                Estado de Resultados Mensual (P&L {fechaPedido})
                                            </h5>
                                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle small fw-semibold">
                                                <i className="fa-solid fa-industry me-1"></i> Kits a Precio de Fábrica
                                            </span>
                                        </div>
                                        <p className="text-muted small mb-0">
                                            Auditoría detallada mes por mes: ingresos facturados en pedidos, costos, utilidad operativa, margen y volumen de productos.
                                        </p>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <span className="badge bg-light text-dark border p-2">
                                            Mejor Mes: <strong>{stats.mejorMes.nombre} ({formatearPrecio(stats.mejorMes.total)})</strong>
                                        </span>
                                    </div>
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-hover table-bordered align-middle text-center mb-0" style={{ fontSize: '0.88rem' }}>
                                        <thead className="table-light">
                                            <tr>
                                                <th className="text-start ps-3">Mes</th>
                                                <th className="text-end">
                                                    Ventas ($)
                                                    <small className="d-block text-muted fw-normal" style={{ fontSize: '0.68rem' }}>(Precios de Pedidos)</small>
                                                </th>
                                                <th className="text-end">Gastos ($)</th>
                                                <th className="text-end">Utilidad Neta ($)</th>
                                                <th>Margen %</th>
                                                <th>Pedidos</th>
                                                <th title="Kits (incluye cirios) y Docenas de Guantes">Productos*</th>
                                                <th className="text-end">Ticket Prom.</th>
                                                <th>% Anual</th>
                                                <th>Desempeño</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.reporteMensualPL.map((mes) => (
                                                <tr key={mes.mesIndex}>
                                                    <td className="text-start ps-3 fw-bold">{mes.nombreCompleto}</td>
                                                    <td className="text-end fw-bold text-dark">{formatearPrecio(mes.ventas)}</td>
                                                    <td className="text-end text-danger">{formatearPrecio(mes.gastos)}</td>
                                                    <td className={`text-end fw-bold ${mes.utilidad >= 0 ? 'text-success' : 'text-danger'}`}>
                                                        {formatearPrecio(mes.utilidad)}
                                                    </td>
                                                    <td className="fw-semibold">
                                                        {mes.ventas > 0 ? `${mes.margen.toFixed(1)}%` : '-'}
                                                    </td>
                                                    <td>{mes.pedidos}</td>
                                                    <td>{mes.prendas.toLocaleString()}</td>
                                                    <td className="text-end text-muted">{formatearPrecio(mes.ticketPromedio)}</td>
                                                    <td>{mes.participacionAnual.toFixed(1)}%</td>
                                                    <td>
                                                        <span className={`badge rounded-pill ${mes.rendimiento === 'Excelente' ? 'bg-success text-white' :
                                                            mes.rendimiento === 'Positivo' ? 'bg-success-subtle text-success' :
                                                                mes.rendimiento === 'Déficit' ? 'bg-danger text-white' : 'bg-light text-muted'
                                                            }`}>
                                                            {mes.rendimiento}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="table-secondary fw-bold">
                                            <tr>
                                                <td className="text-start ps-3">TOTAL CONSOLIDADO</td>
                                                <td className="text-end text-primary">{formatearPrecio(stats.totalVentas)}</td>
                                                <td className="text-end text-danger">{formatearPrecio(stats.totalGastos)}</td>
                                                <td className={`text-end ${stats.utilidadOperativa >= 0 ? 'text-success' : 'text-danger'}`}>
                                                    {formatearPrecio(stats.utilidadOperativa)}
                                                </td>
                                                <td>{stats.margenOperativoPorcentaje.toFixed(1)}%</td>
                                                <td>{stats.totalPedidos}</td>
                                                <td>{stats.totalPrendas.toLocaleString()}</td>
                                                <td className="text-end">{formatearPrecio(stats.ticketPromedio)}</td>
                                                <td>100%</td>
                                                <td>-</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                <span className="small text-muted mt-2 d-block">
                                    <i className="fa-solid fa-circle-info me-1"></i> *Los productos totalizan kits y cirios (en unidades) junto con los guantes (en docenas).
                                </span>
                            </div>
                        </div>

                        {/* División de Cuentas por Socio (Leonardo Gómez vs Oscar Gómez) */}
                        <div className="col-12">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
                                    <div>
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="badge rounded-pill bg-dark text-white px-3 py-1">
                                                <i className="fa-solid fa-scale-balanced me-1"></i> Auditoría de Cuentas
                                            </span>
                                            <h5 className="fw-bold text-dark mb-0">
                                                División por Socio: Leonardo Gómez vs Oscar Gómez ({fechaPedido})
                                            </h5>
                                        </div>
                                        <p className="text-muted small mb-0 mt-1">
                                            Desglose individual de ventas, costos operativos, utilidades y distribución de la regla comercial con Karol Gómez.
                                        </p>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <span className="badge bg-primary-subtle text-primary border px-3 py-2 fw-semibold">
                                            Leonardo: {divisionSocios.leonardo.share}% facturación
                                        </span>
                                        <span className="badge bg-success-subtle text-success border px-3 py-2 fw-semibold">
                                            Oscar: {divisionSocios.oscar.share}% facturación
                                        </span>
                                    </div>
                                </div>

                                {/* Barra de Participación */}
                                <div className="progress mb-3 rounded-pill overflow-hidden" style={{ height: 14 }}>
                                    <div
                                        className="progress-bar bg-primary"
                                        role="progressbar"
                                        style={{ width: `${divisionSocios.leonardo.share}%` }}
                                        title={`Leonardo Gómez: ${divisionSocios.leonardo.share}%`}
                                    >
                                        {divisionSocios.leonardo.share > 10 && `Leonardo: ${divisionSocios.leonardo.share}%`}
                                    </div>
                                    <div
                                        className="progress-bar bg-success"
                                        role="progressbar"
                                        style={{ width: `${divisionSocios.oscar.share}%` }}
                                        title={`Oscar Gómez: ${divisionSocios.oscar.share}%`}
                                    >
                                        {divisionSocios.oscar.share > 10 && `Oscar: ${divisionSocios.oscar.share}%`}
                                    </div>
                                </div>

                                {/* Tabla Comparativa de Negocios por Categoría (Kits vs Guantes vs Consolidado General) */}
                                <div className="table-responsive mb-4">
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <div>
                                            <h6 className="fw-bold text-dark mb-0">
                                                <i className="fa-solid fa-layer-group text-primary me-2"></i>
                                                Balance por Negocio & Categoría ({fechaPedido})
                                            </h6>
                                            <span className="small text-muted">
                                                Kits y Guantes operan como líneas de negocio independientes con sus propios ingresos, costos, utilidades y totales generales.
                                            </span>
                                        </div>
                                    </div>
                                    <table className="table table-hover table-bordered align-middle text-center mb-0 bg-white shadow-xs">
                                        <thead className="table-dark small text-uppercase">
                                            <tr>
                                                <th className="text-start ps-3" style={{ width: '25%' }}>Negocio / Categoría</th>
                                                <th style={{ width: '16%' }}>Ventas Totales ($)</th>
                                                <th style={{ width: '15%' }}>Gastos Directos ($)</th>
                                                <th style={{ width: '15%' }}>Utilidad Neta ($)</th>
                                                <th style={{ width: '10%' }}>Margen %</th>
                                                <th style={{ width: '12%' }}>Volumen</th>
                                                <th style={{ width: '7%' }}>Cuota</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* Negocio Kits */}
                                            <tr>
                                                <td className="text-start ps-3">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="badge bg-primary-subtle text-primary border p-2 rounded-3">
                                                            <i className="fa-solid fa-box-open"></i>
                                                        </span>
                                                        <div>
                                                            <strong className="text-dark d-block">Negocio Kits</strong>
                                                            <small className="text-muted">Socio: Leonardo Gómez (+ Kits Karol)</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="fw-bold text-dark">{formatearPrecio(divisionSocios.negociosPorCategoria?.kits.ventas || 0)}</td>
                                                <td className="text-danger fw-semibold">{formatearPrecio(divisionSocios.negociosPorCategoria?.kits.gastos || 0)}</td>
                                                <td className={`fw-bold ${(divisionSocios.negociosPorCategoria?.kits.utilidad || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                                                    {formatearPrecio(divisionSocios.negociosPorCategoria?.kits.utilidad || 0)}
                                                </td>
                                                <td>
                                                    <span className="badge bg-primary-subtle text-primary fw-bold">
                                                        {(divisionSocios.negociosPorCategoria?.kits.margen || 0).toFixed(1)}%
                                                    </span>
                                                </td>
                                                <td className="small fw-semibold text-secondary">
                                                    {(divisionSocios.negociosPorCategoria?.kits.unidades || 0).toLocaleString()} uds
                                                </td>
                                                <td>
                                                    <span className="badge rounded-pill bg-light text-dark border">
                                                        {(divisionSocios.negociosPorCategoria?.kits.participacion || 0).toFixed(1)}%
                                                    </span>
                                                </td>
                                            </tr>

                                            {/* Negocio Guantes */}
                                            <tr>
                                                <td className="text-start ps-3">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="badge bg-success-subtle text-success border p-2 rounded-3">
                                                            <i className="fa-solid fa-hand-sparkles"></i>
                                                        </span>
                                                        <div>
                                                            <strong className="text-dark d-block">Negocio Guantes</strong>
                                                            <small className="text-muted">Socio: Oscar Gómez (+ Guantes Karol)</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="fw-bold text-dark">{formatearPrecio(divisionSocios.negociosPorCategoria?.guantes.ventas || 0)}</td>
                                                <td className="text-danger fw-semibold">{formatearPrecio(divisionSocios.negociosPorCategoria?.guantes.gastos || 0)}</td>
                                                <td className={`fw-bold ${(divisionSocios.negociosPorCategoria?.guantes.utilidad || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                                                    {formatearPrecio(divisionSocios.negociosPorCategoria?.guantes.utilidad || 0)}
                                                </td>
                                                <td>
                                                    <span className="badge bg-success-subtle text-success fw-bold">
                                                        {(divisionSocios.negociosPorCategoria?.guantes.margen || 0).toFixed(1)}%
                                                    </span>
                                                </td>
                                                <td className="small fw-semibold text-primary">
                                                    {(divisionSocios.negociosPorCategoria?.guantes.unidades || 0).toLocaleString()} doc.
                                                </td>
                                                <td>
                                                    <span className="badge rounded-pill bg-light text-dark border">
                                                        {(divisionSocios.negociosPorCategoria?.guantes.participacion || 0).toFixed(1)}%
                                                    </span>
                                                </td>
                                            </tr>

                                            {/* Otros si existen */}
                                            {(divisionSocios.negociosPorCategoria?.otros.ventas > 0 || divisionSocios.negociosPorCategoria?.otros.gastos > 0) && (
                                                <tr>
                                                    <td className="text-start ps-3">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <span className="badge bg-secondary-subtle text-secondary border p-2 rounded-3">
                                                                <i className="fa-solid fa-tags"></i>
                                                            </span>
                                                            <div>
                                                                <strong className="text-dark d-block">Otros / No Asignados</strong>
                                                                <small className="text-muted">Accesorios, libros o gastos generales</small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="fw-bold text-dark">{formatearPrecio(divisionSocios.negociosPorCategoria?.otros.ventas || 0)}</td>
                                                    <td className="text-danger fw-semibold">{formatearPrecio(divisionSocios.negociosPorCategoria?.otros.gastos || 0)}</td>
                                                    <td className={`fw-bold ${(divisionSocios.negociosPorCategoria?.otros.utilidad || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                                                        {formatearPrecio(divisionSocios.negociosPorCategoria?.otros.utilidad || 0)}
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-secondary-subtle text-secondary fw-bold">
                                                            {(divisionSocios.negociosPorCategoria?.otros.margen || 0).toFixed(1)}%
                                                        </span>
                                                    </td>
                                                    <td className="small fw-semibold text-secondary">
                                                        {(divisionSocios.negociosPorCategoria?.otros.unidades || 0).toLocaleString()} uds
                                                    </td>
                                                    <td>
                                                        <span className="badge rounded-pill bg-light text-dark border">
                                                            {(divisionSocios.negociosPorCategoria?.otros.participacion || 0).toFixed(1)}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot className="table-secondary fw-bold">
                                            <tr>
                                                <td className="text-start ps-3 text-uppercase">
                                                    <i className="fa-solid fa-building me-1"></i> Total Consolidado (General)
                                                </td>
                                                <td className="text-primary">{formatearPrecio(divisionSocios.negociosPorCategoria?.consolidado.ventas || 0)}</td>
                                                <td className="text-danger">{formatearPrecio(divisionSocios.negociosPorCategoria?.consolidado.gastos || 0)}</td>
                                                <td className={(divisionSocios.negociosPorCategoria?.consolidado.utilidad || 0) >= 0 ? 'text-success' : 'text-danger'}>
                                                    {formatearPrecio(divisionSocios.negociosPorCategoria?.consolidado.utilidad || 0)}
                                                </td>
                                                <td>
                                                    <span className="badge bg-dark text-white fw-bold">
                                                        {(divisionSocios.negociosPorCategoria?.consolidado.margen || 0).toFixed(1)}%
                                                    </span>
                                                </td>
                                                <td className="small">{(divisionSocios.negociosPorCategoria?.consolidado.unidades || 0).toLocaleString()} productos</td>
                                                <td>100%</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                    <span className="small text-muted mt-2 d-block" style={{ fontSize: '0.78rem' }}>
                                        <i className="fa-solid fa-circle-info text-primary me-1"></i>
                                        *Criterio de Precios: Para 2025 en adelante, el <strong>Negocio Kits</strong> se valoriza con <strong>Precios de Fábrica</strong> (tarifas de producción según vigencia en BD); mientras que el <strong>Negocio Guantes</strong> y <strong>Otros</strong> se valorizan con <strong>Precios Reales Facturados en los Pedidos</strong>.
                                    </span>
                                </div>

                                <div className="row g-4">
                                    {/* Columna Leonardo Gómez */}
                                    <div className="col-12 col-lg-6">
                                        <div className="card border border-primary-subtle rounded-4 p-3 bg-light-subtle h-100 shadow-xs">
                                            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="rounded-circle bg-primary text-white p-2 d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                                                        <i className="fa-solid fa-user"></i>
                                                    </div>
                                                    <div>
                                                        <h6 className="fw-bolder text-dark mb-0">Leonardo Gómez</h6>
                                                        <small className="text-muted">{divisionSocios.leonardo.pedidosCount} pedidos computados</small>
                                                    </div>
                                                </div>
                                                <span className="badge bg-primary rounded-pill px-3 py-1">
                                                    {divisionSocios.leonardo.share}% Cuota
                                                </span>
                                            </div>

                                            <div className="row g-2 mb-3">
                                                <div className="col-6">
                                                    <div className="p-2 bg-white rounded-3 border">
                                                        <span className="text-muted small d-block">Ventas Totales</span>
                                                        <strong className="text-dark fs-6">{formatearPrecio(divisionSocios.leonardo.totalVentas)}</strong>
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="p-2 bg-white rounded-3 border">
                                                        <span className="text-muted small d-block">Gastos (Kits)</span>
                                                        <strong className="text-danger fs-6">{formatearPrecio(divisionSocios.leonardo.totalGastos)}</strong>
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="p-2 bg-white rounded-3 border">
                                                        <span className="text-muted small d-block">Utilidad Neta</span>
                                                        <strong className={divisionSocios.leonardo.utilidadOperativa >= 0 ? 'text-success fs-6' : 'text-danger fs-6'}>
                                                            {formatearPrecio(divisionSocios.leonardo.utilidadOperativa)}
                                                        </strong>
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="p-2 bg-white rounded-3 border">
                                                        <span className="text-muted small d-block">Margen Operativo</span>
                                                        <strong className="text-dark fs-6">{divisionSocios.leonardo.margenOperativoPorcentaje.toFixed(1)}%</strong>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Desglose Separado: Kits vs Guantes (Ventas y Gastos de Leonardo) */}
                                            <div className="card border-0 bg-white rounded-3 shadow-xs p-3 mb-3">
                                                <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom">
                                                    <span className="small fw-bold text-uppercase text-secondary">
                                                        <i className="fa-solid fa-code-compare me-1"></i> Desglose de Líneas: Kits vs Guantes
                                                    </span>
                                                    <span className="badge bg-light text-dark border">Auditoría Individual</span>
                                                </div>

                                                {/* Línea Kits */}
                                                <div className="p-2 mb-2 rounded-3 border bg-light-subtle">
                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                        <span className="fw-bold text-primary small">
                                                            <i className="fa-solid fa-box-open me-1"></i> Línea Kits
                                                        </span>
                                                        <span className="badge bg-primary-subtle text-primary">
                                                            {divisionSocios.leonardo.kits.unidades.toLocaleString()} productos
                                                        </span>
                                                    </div>
                                                    <div className="row g-2 text-center small">
                                                        <div className="col-4">
                                                            <div className="bg-white p-1 rounded border">
                                                                <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Ventas</span>
                                                                <strong className="text-dark">{formatearPrecio(divisionSocios.leonardo.kits.ventas)}</strong>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="bg-white p-1 rounded border">
                                                                <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Gastos (K)</span>
                                                                <strong className="text-danger">{formatearPrecio(divisionSocios.leonardo.kits.gastos)}</strong>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="bg-white p-1 rounded border">
                                                                <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Utilidad ({divisionSocios.leonardo.kits.margen.toFixed(0)}%)</span>
                                                                <strong className={divisionSocios.leonardo.kits.utilidad >= 0 ? 'text-success' : 'text-danger'}>
                                                                    {formatearPrecio(divisionSocios.leonardo.kits.utilidad)}
                                                                </strong>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Línea Guantes */}
                                                <div className="p-2 rounded-3 border bg-light-subtle">
                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                        <span className="fw-bold text-success small">
                                                            <i className="fa-solid fa-hand-sparkles me-1"></i> Línea Guantes
                                                        </span>
                                                        <span className="badge bg-success-subtle text-success">
                                                            {divisionSocios.leonardo.guantes.unidades.toLocaleString()} doc.
                                                        </span>
                                                    </div>
                                                    <div className="row g-2 text-center small">
                                                        <div className="col-4">
                                                            <div className="bg-white p-1 rounded border">
                                                                <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Ventas</span>
                                                                <strong className="text-dark">{formatearPrecio(divisionSocios.leonardo.guantes.ventas)}</strong>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="bg-white p-1 rounded border">
                                                                <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Gastos (G)</span>
                                                                <strong className="text-danger">{formatearPrecio(divisionSocios.leonardo.guantes.gastos)}</strong>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="bg-white p-1 rounded border">
                                                                <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Utilidad ({divisionSocios.leonardo.guantes.margen.toFixed(0)}%)</span>
                                                                <strong className={divisionSocios.leonardo.guantes.utilidad >= 0 ? 'text-success' : 'text-danger'}>
                                                                    {formatearPrecio(divisionSocios.leonardo.guantes.utilidad)}
                                                                </strong>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Atribución Perfil Karol Gómez (Kits) */}
                                            <div className="p-3 bg-primary-subtle rounded-3 border border-primary-subtle mb-3 small">
                                                <div className="d-flex align-items-center justify-content-between text-primary fw-bold mb-1">
                                                    <span><i className="fa-solid fa-handshake me-1"></i> Atribución Karol Gómez (Kits):</span>
                                                    <span>{formatearPrecio(divisionSocios.atribucionKarol.karolKitsVenta)}</span>
                                                </div>
                                                <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.75rem' }}>
                                                    <span>Productos de Kits transferidos: <strong>{divisionSocios.atribucionKarol.karolKitsPrendas} productos</strong></span>
                                                    <span>Gastos Kits Karol: <strong>{formatearPrecio(divisionSocios.atribucionKarol.karolKitsGastos)}</strong></span>
                                                </div>
                                                <div className="text-muted mt-1" style={{ fontSize: '0.72rem' }}>
                                                    Karol actúa como cliente distribuidor de Leonardo. Toda su facturación y costos en Kits se computan en Leonardo.
                                                </div>
                                            </div>

                                            <button
                                                className={`btn btn-sm rounded-pill fw-bold w-100 ${filtroUsuario === 'LEONARDO' ? 'btn-primary text-white shadow-sm' : 'btn-outline-primary'}`}
                                                onClick={() => setFiltroUsuario('LEONARDO')}
                                            >
                                                <i className="fa-solid fa-filter me-1"></i>
                                                {filtroUsuario === 'LEONARDO' ? 'Viendo cuentas de Leonardo actualmente' : 'Filtrar todo el informe por Leonardo Gómez'}
                                            </button>
                                        </div>
                                    </div>

                                     {/* Columna Oscar Gómez */}
                                    <div className="col-12 col-lg-6">
                                        <div className="card border border-success-subtle rounded-4 p-3 bg-light-subtle h-100 shadow-xs">
                                            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="rounded-circle bg-success text-white p-2 d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                                                        <i className="fa-solid fa-user-tie"></i>
                                                    </div>
                                                    <div>
                                                        <h6 className="fw-bolder text-dark mb-0">Oscar Gómez</h6>
                                                        <small className="text-muted">
                                                            {esLeonardo
                                                                ? `${divisionSocios.oscarParaLeonardo?.pedidosCount || 0} pedidos de Kits computados`
                                                                : `${divisionSocios.oscar.pedidosCount} pedidos computados`}
                                                        </small>
                                                    </div>
                                                </div>
                                                <span className="badge bg-success rounded-pill px-3 py-1">
                                                    {esLeonardo
                                                        ? `${divisionSocios.oscarParaLeonardo?.share || 0}% Cuota Kits`
                                                        : `${divisionSocios.oscar.share}% Cuota`}
                                                </span>
                                            </div>

                                            <div className="row g-2 mb-3">
                                                <div className="col-6">
                                                    <div className="p-2 bg-white rounded-3 border">
                                                        <span className="text-muted small d-block">
                                                            {esLeonardo ? 'Ventas (Kits)' : 'Ventas Totales'}
                                                        </span>
                                                        <strong className="text-dark fs-6">
                                                            {formatearPrecio(esLeonardo ? (divisionSocios.oscarParaLeonardo?.totalVentas || 0) : divisionSocios.oscar.totalVentas)}
                                                        </strong>
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="p-2 bg-white rounded-3 border">
                                                        <span className="text-muted small d-block">
                                                            {esLeonardo ? 'Gastos (Kits)' : 'Gastos Totales'}
                                                        </span>
                                                        <strong className="text-danger fs-6">
                                                            {formatearPrecio(esLeonardo ? (divisionSocios.oscarParaLeonardo?.totalGastos || 0) : divisionSocios.oscar.totalGastos)}
                                                        </strong>
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="p-2 bg-white rounded-3 border">
                                                        <span className="text-muted small d-block">Utilidad Neta</span>
                                                        {(() => {
                                                            const ut = esLeonardo ? (divisionSocios.oscarParaLeonardo?.utilidadOperativa || 0) : divisionSocios.oscar.utilidadOperativa;
                                                            return (
                                                                <strong className={ut >= 0 ? 'text-success fs-6' : 'text-danger fs-6'}>
                                                                    {formatearPrecio(ut)}
                                                                </strong>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="p-2 bg-white rounded-3 border">
                                                        <span className="text-muted small d-block">Margen Operativo</span>
                                                        <strong className="text-dark fs-6">
                                                            {(esLeonardo
                                                                ? (divisionSocios.oscarParaLeonardo?.margenOperativoPorcentaje || 0)
                                                                : divisionSocios.oscar.margenOperativoPorcentaje
                                                            ).toFixed(1)}%
                                                        </strong>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Desglose Separado: Kits vs Guantes (Ventas y Gastos de Oscar) */}
                                            <div className="card border-0 bg-white rounded-3 shadow-xs p-3 mb-3">
                                                <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom">
                                                    <span className="small fw-bold text-uppercase text-secondary">
                                                        <i className="fa-solid fa-code-compare me-1"></i> {esLeonardo ? 'Línea Kits: Oscar Gómez' : 'Desglose de Líneas: Kits vs Guantes'}
                                                    </span>
                                                    <span className="badge bg-light text-dark border">
                                                        {esLeonardo ? 'Negocio Kits' : 'Auditoría Individual'}
                                                    </span>
                                                </div>

                                                {/* Línea Guantes: Bloqueada para Leonardo, Visible para Oscar */}
                                                {esLeonardo ? (
                                                    <div className="p-2 mb-2 rounded-3 border bg-light text-muted small d-flex align-items-center justify-content-between">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <i className="fa-solid fa-lock text-warning"></i>
                                                            <span><strong>Línea Guantes:</strong> Datos reservados para Oscar Gómez</span>
                                                        </div>
                                                        <span className="badge bg-secondary-subtle text-secondary border">Restringido</span>
                                                    </div>
                                                ) : (
                                                    <div className="p-2 mb-2 rounded-3 border bg-light-subtle">
                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                            <span className="fw-bold text-success small">
                                                                <i className="fa-solid fa-hand-sparkles me-1"></i> Línea Guantes (Principal)
                                                            </span>
                                                            <span className="badge bg-success-subtle text-success">
                                                                {divisionSocios.oscar.guantes.unidades.toLocaleString()} doc.
                                                            </span>
                                                        </div>
                                                        <div className="row g-2 text-center small">
                                                            <div className="col-4">
                                                                <div className="bg-white p-1 rounded border">
                                                                    <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Ventas</span>
                                                                    <strong className="text-dark">{formatearPrecio(divisionSocios.oscar.guantes.ventas)}</strong>
                                                                </div>
                                                            </div>
                                                            <div className="col-4">
                                                                <div className="bg-white p-1 rounded border">
                                                                    <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Gastos (G)</span>
                                                                    <strong className="text-danger">{formatearPrecio(divisionSocios.oscar.guantes.gastos)}</strong>
                                                                </div>
                                                            </div>
                                                            <div className="col-4">
                                                                <div className="bg-white p-1 rounded border">
                                                                    <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Utilidad ({divisionSocios.oscar.guantes.margen.toFixed(0)}%)</span>
                                                                    <strong className={divisionSocios.oscar.guantes.utilidad >= 0 ? 'text-success' : 'text-danger'}>
                                                                        {formatearPrecio(divisionSocios.oscar.guantes.utilidad)}
                                                                    </strong>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Línea Kits */}
                                                <div className="p-2 rounded-3 border bg-light-subtle">
                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                        <span className="fw-bold text-primary small">
                                                            <i className="fa-solid fa-box-open me-1"></i> Línea Kits
                                                        </span>
                                                        <span className="badge bg-primary-subtle text-primary">
                                                            {divisionSocios.oscar.kits.unidades.toLocaleString()} productos
                                                        </span>
                                                    </div>
                                                    <div className="row g-2 text-center small">
                                                        <div className="col-4">
                                                            <div className="bg-white p-1 rounded border">
                                                                <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Ventas</span>
                                                                <strong className="text-dark">{formatearPrecio(divisionSocios.oscar.kits.ventas)}</strong>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="bg-white p-1 rounded border">
                                                                <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Gastos (K)</span>
                                                                <strong className="text-danger">{formatearPrecio(divisionSocios.oscar.kits.gastos)}</strong>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="bg-white p-1 rounded border">
                                                                <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Utilidad ({divisionSocios.oscar.kits.margen.toFixed(0)}%)</span>
                                                                <strong className={divisionSocios.oscar.kits.utilidad >= 0 ? 'text-success' : 'text-danger'}>
                                                                    {formatearPrecio(divisionSocios.oscar.kits.utilidad)}
                                                                </strong>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Atribución Perfil Karol Gómez (Guantes) - solo visible para Oscar */}
                                            {!esLeonardo && (
                                                <div className="p-3 bg-success-subtle rounded-3 border border-success-subtle mb-3 small">
                                                    <div className="d-flex align-items-center justify-content-between text-success fw-bold mb-1">
                                                        <span><i className="fa-solid fa-mitten me-1"></i> Atribución Karol Gómez (Guantes):</span>
                                                        <span>{formatearPrecio(divisionSocios.atribucionKarol.karolGuantesVenta)}</span>
                                                    </div>
                                                    <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.75rem' }}>
                                                        <span>Docenas transferidas: <strong>{divisionSocios.atribucionKarol.karolGuantesDocenas} doc.</strong></span>
                                                        <span>Gastos Guantes Karol: <strong>{formatearPrecio(divisionSocios.atribucionKarol.karolGuantesGastos)}</strong></span>
                                                    </div>
                                                    <div className="text-muted mt-1" style={{ fontSize: '0.72rem' }}>
                                                        Todos los guantes facturados y gastos directos en el perfil de Karol Gómez se computan estrictamente a favor de Oscar.
                                                    </div>
                                                </div>
                                            )}

                                            {esLeonardo ? (
                                                <div className="text-center p-2 bg-white rounded-pill border text-muted small fw-semibold">
                                                    <i className="fa-solid fa-eye me-1 text-primary"></i> Vista Exclusiva de Kits — Oscar Gómez
                                                </div>
                                            ) : (
                                                <button
                                                    className={`btn btn-sm rounded-pill fw-bold w-100 ${filtroUsuario === 'OSCAR' ? 'btn-success text-white shadow-sm' : 'btn-outline-success'}`}
                                                    onClick={() => setFiltroUsuario('OSCAR')}
                                                >
                                                    <i className="fa-solid fa-filter me-1"></i>
                                                    {filtroUsuario === 'OSCAR' ? 'Viendo cuentas de Oscar actualmente' : 'Filtrar todo el informe por Oscar Gómez'}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* CARD CATEGORÍA OTR (Otros / Accesorios) */}
                                <div className="col-12 mt-4">
                                    <div className="card border-0 rounded-4 shadow-sm overflow-hidden" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                                        <div className="card-header bg-white border-bottom p-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="rounded-circle bg-primary bg-opacity-10 text-primary p-2 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                                                    <i className="fa-solid fa-boxes-stacked fs-5"></i>
                                                </div>
                                                <div>
                                                    <h5 className="fw-bolder text-dark mb-0 d-flex align-items-center gap-2">
                                                        Categoría OTR (Otros / Accesorios)
                                                        <span className="badge bg-secondary-subtle text-dark border rounded-pill px-2 py-1" style={{ fontSize: '0.75rem' }}>
                                                            {esLeonardo ? 'Accesorios de Kits (Consolidado Global)' : 'Gestión Integral (Separado por Asesor)'}
                                                        </span>
                                                    </h5>
                                                    <small className="text-muted">
                                                        {esLeonardo
                                                            ? 'Leonardo visualiza todos los productos OTR comercializados por todos los usuarios que pertenecen al negocio de Kits.'
                                                            : 'Oscar visualiza todos los productos de la categoría OTR comercializados, desglosados individualmente por cada usuario.'}
                                                    </small>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <span className="badge bg-white text-dark border px-3 py-2 rounded-pill shadow-xs">
                                                    <i className="fa-solid fa-calendar-day me-1 text-primary"></i> Año {fechaPedido}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="card-body p-4">
                                            {esLeonardo ? (
                                                /* VISTA LEONARDO: OTR DE KITS DE TODOS LOS USUARIOS */
                                                <div>
                                                    <div className="row g-3 mb-4">
                                                        <div className="col-12 col-md-4">
                                                            <div className="p-3 bg-white rounded-3 border shadow-xs">
                                                                <div className="text-muted small mb-1 fw-semibold">
                                                                    <i className="fa-solid fa-sack-dollar text-primary me-1"></i> Ventas OTR (Línea Kits)
                                                                </div>
                                                                <h4 className="fw-bold text-dark mb-0">
                                                                    {formatearPrecio(divisionSocios.otrKitsTodos?.totalVentas || 0)}
                                                                </h4>
                                                                <small className="text-success fw-semibold">Consolidado de todos los asesores</small>
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-md-4">
                                                            <div className="p-3 bg-white rounded-3 border shadow-xs">
                                                                <div className="text-muted small mb-1 fw-semibold">
                                                                    <i className="fa-solid fa-box-archive text-info me-1"></i> Unidades Vendidas
                                                                </div>
                                                                <h4 className="fw-bold text-dark mb-0">
                                                                    {(divisionSocios.otrKitsTodos?.totalUnidades || 0).toLocaleString()} uds.
                                                                </h4>
                                                                <small className="text-muted">Accesorios y complementos de kits</small>
                            </div>
                                                        </div>
                                                        <div className="col-12 col-md-4">
                                                            <div className="p-3 bg-white rounded-3 border shadow-xs">
                                                                <div className="text-muted small mb-1 fw-semibold">
                                                                    <i className="fa-solid fa-tags text-warning me-1"></i> Variedades OTR Registradas
                                                                </div>
                                                                <h4 className="fw-bold text-dark mb-0">
                                                                    {divisionSocios.otrKitsTodos?.productos?.length || 0} referencias
                                                                </h4>
                                                                <small className="text-muted">{divisionSocios.otrKitsTodos?.totalItemsCount || 0} ítems computados</small>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Tabla de Productos OTR Kits */}
                                                    <div className="card border rounded-3 bg-white overflow-hidden shadow-xs">
                                                        <div className="card-header bg-light-subtle py-2 px-3 border-bottom d-flex justify-content-between align-items-center">
                                                            <span className="fw-bold small text-uppercase text-secondary">
                                                                <i className="fa-solid fa-list-check me-1"></i> Desglose de Productos OTR de Kits (Todos los Asesores)
                                                            </span>
                                                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                                                                {divisionSocios.otrKitsTodos?.productos?.length || 0} productos
                                                            </span>
                                                        </div>
                                                        <div className="table-responsive">
                                                            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                                                                <thead className="table-light text-secondary">
                                                                    <tr>
                                                                        <th>Producto</th>
                                                                        <th className="text-center">Unidades</th>
                                                                        <th className="text-end">Total Ventas</th>
                                                                        <th className="text-center">Asesores Contribuyentes</th>
                                                                        <th className="text-end">% Participación</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {(divisionSocios.otrKitsTodos?.productos || []).length === 0 ? (
                                                                        <tr>
                                                                            <td colSpan="5" className="text-center py-4 text-muted">
                                                                                <i className="fa-solid fa-inbox fs-4 d-block mb-2"></i>
                                                                                No se registraron productos OTR de la línea Kits en {fechaPedido}.
                                                                            </td>
                                                                        </tr>
                                                                    ) : (
                                                                        (divisionSocios.otrKitsTodos?.productos || []).map((prod, pIdx) => {
                                                                            const totalOtr = divisionSocios.otrKitsTodos?.totalVentas || 1;
                                                                            const part = ((prod.total / totalOtr) * 100).toFixed(1);
                                                                            return (
                                                                                <tr key={pIdx}>
                                                                                    <td className="fw-bold text-dark">
                                                                                        <i className="fa-solid fa-bookmark me-2 text-primary opacity-50"></i>
                                                                                        {prod.producto}
                                                                                    </td>
                                                                                    <td className="text-center">
                                                                                        <span className="badge bg-light text-dark border">
                                                                                            {prod.cantidad.toLocaleString()} uds
                                                                                        </span>
                                                                                    </td>
                                                                                    <td className="text-end fw-bold text-dark">
                                                                                        {formatearPrecio(prod.total)}
                                                                                    </td>
                                                                                    <td className="text-center">
                                                                                        <div className="d-flex flex-wrap gap-1 justify-content-center">
                                                                                            {(prod.vendedores || []).map((vend, vIdx) => (
                                                                                                <span
                                                                                                    key={vIdx}
                                                                                                    className={`badge rounded-pill ${
                                                                                                        vend.includes('Oscar') ? 'bg-success-subtle text-success border border-success-subtle' :
                                                                                                        vend.includes('Leonardo') ? 'bg-primary-subtle text-primary border border-primary-subtle' :
                                                                                                        'bg-warning-subtle text-warning-emphasis border border-warning-subtle'
                                                                                                    }`}
                                                                                                >
                                                                                                    {vend}
                                                                                                </span>
                                                                                            ))}
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="text-end">
                                                                                        <div className="d-flex align-items-center justify-content-end gap-2">
                                                                                            <div className="progress flex-grow-1" style={{ height: 6, maxWidth: 60 }}>
                                                                                                <div className="progress-bar bg-primary" style={{ width: `${Math.min(100, part)}%` }}></div>
                                                                                            </div>
                                                                                            <span className="small text-muted">{part}%</span>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        })
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                /* VISTA OSCAR: TODOS LOS OTR SEPARADOS POR CADA USUARIO */
                                                <div>
                                                    <div className="row g-3 mb-4">
                                                        <div className="col-12 col-md-4">
                                                            <div className="p-3 bg-white rounded-3 border shadow-xs">
                                                                <div className="text-muted small mb-1 fw-semibold">
                                                                    <i className="fa-solid fa-sack-dollar text-success me-1"></i> Ventas OTR Globales
                                                                </div>
                                                                <h4 className="fw-bold text-dark mb-0">
                                                                    {formatearPrecio(divisionSocios.otrPorUsuario?.totalVentasGlobal || 0)}
                                                                </h4>
                                                                <small className="text-muted">Todos los productos OTR del sistema</small>
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-md-4">
                                                            <div className="p-3 bg-white rounded-3 border shadow-xs">
                                                                <div className="text-muted small mb-1 fw-semibold">
                                                                    <i className="fa-solid fa-boxes-packing text-primary me-1"></i> Unidades OTR Totales
                                                                </div>
                                                                <h4 className="fw-bold text-dark mb-0">
                                                                    {(divisionSocios.otrPorUsuario?.totalUnidadesGlobal || 0).toLocaleString()} uds.
                                                                </h4>
                                                                <small className="text-muted">Volumen total comercializado</small>
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-md-4">
                                                            <div className="p-3 bg-white rounded-3 border shadow-xs">
                                                                <div className="text-muted small mb-1 fw-semibold">
                                                                    <i className="fa-solid fa-users text-info me-1"></i> Asesores con Registros OTR
                                                                </div>
                                                                <h4 className="fw-bold text-dark mb-0">
                                                                    {divisionSocios.otrPorUsuario?.totalUsuarios || 0} asesores
                                                                </h4>
                                                                <small className="text-muted">Separado por usuario individual</small>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Tarjetas Separadas por Cada Usuario */}
                                                    <div className="row g-3">
                                                        {(divisionSocios.otrPorUsuario?.usuarios || []).length === 0 ? (
                                                            <div className="col-12">
                                                                <div className="p-4 bg-white rounded-3 border text-center text-muted">
                                                                    <i className="fa-solid fa-inbox fs-3 d-block mb-2"></i>
                                                                    No se encontraron registros de la categoría OTR en el año {fechaPedido}.
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            (divisionSocios.otrPorUsuario?.usuarios || []).map((usr, uIdx) => {
                                                                const isOscar = usr.nombre.toLowerCase().includes('oscar');
                                                                const isLeo = usr.nombre.toLowerCase().includes('leonardo');

                                                                const borderClass = isOscar ? 'border-success-subtle' : isLeo ? 'border-primary-subtle' : 'border-warning-subtle';
                                                                const bgHeader = isOscar ? 'bg-success-subtle text-success' : isLeo ? 'bg-primary-subtle text-primary' : 'bg-warning-subtle text-warning-emphasis';
                                                                const iconClass = isOscar ? 'fa-user-tie text-success' : isLeo ? 'fa-user text-primary' : 'fa-user-check text-warning';

                                                                return (
                                                                    <div className="col-12 col-lg-4" key={uIdx}>
                                                                        <div className={`card border ${borderClass} rounded-3 bg-white h-100 shadow-xs`}>
                                                                            <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
                                                                                <div className="d-flex align-items-center gap-2">
                                                                                    <div className={`rounded-circle p-2 d-flex align-items-center justify-content-center ${bgHeader}`} style={{ width: 34, height: 34 }}>
                                                                                        <i className={`fa-solid ${iconClass}`}></i>
                                                                                    </div>
                                                                                    <div>
                                                                                        <h6 className="fw-bold text-dark mb-0">{usr.nombre}</h6>
                                                                                        <small className="text-muted">{usr.rol}</small>
                                                                                    </div>
                                                                                </div>
                                                                                <span className={`badge rounded-pill ${bgHeader}`}>
                                                                                    {usr.items.length} regs
                                                                                </span>
                                                                            </div>

                                                                            <div className="card-body p-3">
                                                                                <div className="row g-2 mb-3 text-center">
                                                                                    <div className="col-6">
                                                                                        <div className="p-2 bg-light rounded-2 border">
                                                                                            <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Ventas OTR</span>
                                                                                            <strong className="text-dark fs-6">{formatearPrecio(usr.totalVentas)}</strong>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="col-6">
                                                                                        <div className="p-2 bg-light rounded-2 border">
                                                                                            <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Unidades</span>
                                                                                            <strong className="text-dark fs-6">{usr.totalUnidades.toLocaleString()} uds</strong>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="border rounded-2 overflow-hidden">
                                                                                    <div className="bg-light p-2 border-bottom small fw-bold text-secondary d-flex justify-content-between">
                                                                                        <span>Producto OTR</span>
                                                                                        <span>Cant. / Total</span>
                                                                                    </div>
                                                                                    <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                                                                                        {(usr.productos || []).length === 0 ? (
                                                                                            <div className="p-3 text-center text-muted small">Sin productos</div>
                                                                                        ) : (
                                                                                            (usr.productos || []).map((pr, prIdx) => (
                                                                                                <div key={prIdx} className="d-flex justify-content-between align-items-center p-2 border-bottom small hover-bg-light">
                                                                                                    <div>
                                                                                                        <span className="fw-semibold text-dark d-block">{pr.producto}</span>
                                                                                                        <span className="badge bg-light text-secondary border" style={{ fontSize: '0.65rem' }}>
                                                                                                            {pr.categoriaNegocio}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                    <div className="text-end">
                                                                                                        <strong className="text-dark d-block">{formatearPrecio(pr.total)}</strong>
                                                                                                        <small className="text-muted">{pr.cantidad} uds</small>
                                                                                                    </div>
                                                                                                </div>
                                                                                            ))
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                </div>

                                {/* Pie de Auditoría */}
                                <div className="mt-3 p-3 bg-light rounded-3 border d-flex flex-wrap align-items-center justify-content-between gap-2">
                                    <div className="d-flex align-items-center gap-2">
                                        <i className="fa-solid fa-shield-halved text-secondary"></i>
                                        <small className="text-muted">
                                            <strong>Regla de No Duplicación:</strong> En el Consolidado General las ventas de Karol Gómez ({formatearPrecio(divisionSocios.atribucionKarol.totalKarol)}) se computan una sola vez. En los desgloses individuales se reparten estrictamente (Kits para Leonardo, Guantes para Oscar).
                                        </small>
                                    </div>
                                    {filtroUsuario !== 'GENERAL' && (
                                        <button className="btn btn-sm btn-dark rounded-pill px-3 fw-bold" onClick={() => setFiltroUsuario('GENERAL')}>
                                            <i className="fa-solid fa-building me-1"></i> Ver Consolidado General
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* VISTA 2: CATEGORÍAS & GÉNERO */}
                {activeTab === 'categorias' && (
                    <div className="row g-4">
                        {/* Tarjetas de Producción por Género (Niña vs Niño) */}
                        <div className="col-12">
                            {filtroCategoria === 'GUANTES' ? (
                                <div className="alert alert-warning py-3 px-4 rounded-4 shadow-sm border-0 d-flex align-items-center gap-3">
                                    <i className="fa-solid fa-mitten fs-3 text-warning"></i>
                                    <div>
                                        <h6 className="fw-bold mb-1">Filtro activo: Solo Guantes</h6>
                                        <p className="mb-0 small text-muted">
                                            El análisis de producción por género (Niña vs Niño) aplica a la confección de Kits y Cirios. Cambie el filtro superior a "Todas" o "Solo Kits" para visualizarlo.
                                        </p>
                                    </div>
                                </div>
                            ) : filtroCategoria === 'OTROS' ? (
                                <div className="alert alert-info py-3 px-4 rounded-4 shadow-sm border-0 d-flex align-items-center gap-3">
                                    <i className="fa-solid fa-tags fs-3 text-info"></i>
                                    <div>
                                        <h6 className="fw-bold mb-1">Filtro activo: Solo Otros</h6>
                                        <p className="mb-0 small text-muted">
                                            El análisis de producción por género (Niña vs Niño) aplica a la confección de Kits y Cirios.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-1">
                                        <h6 className="fw-bold text-dark mb-0">
                                            <i className="fa-solid fa-venus-mars text-primary me-2"></i>
                                            Análisis de Producción por Género (Niña vs Niño en {fechaPedido})
                                        </h6>
                                        <span className="badge bg-light text-secondary border small">
                                            Kits/Cirios: Precios Fábrica (2025+) | Pedidos (pre-2025)
                                        </span>
                                    </div>
                                    <p className="text-muted small mb-3">
                                        Métrica de taller para planificar confección, compras de telas, cintas y accesorios.
                                    </p>

                                    <div className="row g-3 align-items-center">
                                        <div className="col-12 col-md-5">
                                            <div className="p-3 bg-light rounded-3 border">
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <span className="fw-bold text-danger">
                                                        <i className="fa-solid fa-venus me-1"></i> Línea Niña (Kits)
                                                    </span>
                                                    <span className="badge bg-danger rounded-pill">{stats.desgloseGenero.porcentajeNina.toFixed(1)}%</span>
                                                </div>
                                                <h4 className="fw-bold text-dark mb-1">{stats.desgloseGenero.prendasNina.toLocaleString()} productos</h4>
                                                <div className="d-flex justify-content-between small text-muted">
                                                    <span>Kits Niña: <strong>{stats.desgloseGenero.kitsNina}</strong> | Cirios: <strong>{stats.desgloseGenero.ciriosNina}</strong></span>
                                                    <strong className="text-dark">{formatearPrecio(stats.desgloseGenero.ventasNina)}</strong>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-12 col-md-2 text-center">
                                            <div className="progress" style={{ height: 16 }}>
                                                <div
                                                    className="progress-bar bg-danger"
                                                    role="progressbar"
                                                    style={{ width: `${stats.desgloseGenero.porcentajeNina}%` }}
                                                    title={`Niña: ${stats.desgloseGenero.porcentajeNina.toFixed(1)}%`}
                                                >
                                                    {stats.desgloseGenero.porcentajeNina.toFixed(0)}%
                                                </div>
                                                <div
                                                    className="progress-bar bg-primary"
                                                    role="progressbar"
                                                    style={{ width: `${stats.desgloseGenero.porcentajeNino}%` }}
                                                    title={`Niño: ${stats.desgloseGenero.porcentajeNino.toFixed(1)}%`}
                                                >
                                                    {stats.desgloseGenero.porcentajeNino.toFixed(0)}%
                                                </div>
                                            </div>
                                            <span className="small text-muted mt-1 d-block">Distribución de Género</span>
                                        </div>

                                        <div className="col-12 col-md-5">
                                            <div className="p-3 bg-light rounded-3 border">
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <span className="fw-bold text-primary">
                                                        <i className="fa-solid fa-mars me-1"></i> Línea Niño (Kits)
                                                    </span>
                                                    <span className="badge bg-primary rounded-pill">{stats.desgloseGenero.porcentajeNino.toFixed(1)}%</span>
                                                </div>
                                                <h4 className="fw-bold text-dark mb-1">{stats.desgloseGenero.prendasNino.toLocaleString()} productos</h4>
                                                <div className="d-flex justify-content-between small text-muted">
                                                    <span>Kits Niño: <strong>{stats.desgloseGenero.kitsNino}</strong> | Cirios: <strong>{stats.desgloseGenero.ciriosNino}</strong></span>
                                                    <strong className="text-dark">{formatearPrecio(stats.desgloseGenero.ventasNino)}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Matriz Unificada de Categorías */}
                        <div className="col-12">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                                    <div>
                                        <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                                            <h5 className="fw-bold text-dark mb-0">
                                                <i className="fa-solid fa-layer-group text-primary me-2"></i>
                                                Matriz Unificada de Categorías ({fechaPedido})
                                            </h5>
                                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle fs-7">
                                                {filtroUsuario === 'GENERAL'
                                                    ? (esLeonardo ? 'Consolidado General (Kits, Guantes Leo, Otros Kits)' : 'Consolidado General')
                                                    : filtroUsuario === 'LEONARDO' ? 'Leonardo Gómez' : 'Oscar Gómez'}
                                            </span>
                                            {filtroCategoria !== 'TODOS' && (
                                                <span className="badge bg-info-subtle text-info border border-info-subtle fs-7 fw-semibold">
                                                    Filtro: {filtroCategoria === 'KITS' ? 'Solo Kits' : filtroCategoria === 'GUANTES' ? 'Solo Guantes' : 'Solo Otros'}
                                                </span>
                                            )}
                                            <span className="badge bg-warning-subtle text-dark border border-warning-subtle fs-7 fw-semibold">
                                                Kits: Precios de Fábrica | Guantes/Otros: Precios de Pedidos
                                            </span>
                                        </div>
                                        <p className="text-muted small mb-0">
                                            Desglose armonizado: subcategorías de guantes (blancos, mitón, negros), productos específicos de otros y kits.
                                        </p>
                                    </div>
                                    <div className="btn-group shadow-sm rounded-pill p-1 bg-light border" role="group">
                                        <button
                                            type="button"
                                            className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${filtroUsuario === 'GENERAL' ? 'btn-primary text-white shadow-sm' : 'text-secondary border-0'}`}
                                            onClick={() => setFiltroUsuario('GENERAL')}
                                            title="Ver todas las ventas consolidadas del negocio"
                                        >
                                            <i className="fa-solid fa-briefcase me-1"></i> Consolidado
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${filtroUsuario === 'LEONARDO' ? 'btn-primary text-white shadow-sm' : 'text-secondary border-0'}`}
                                            onClick={() => setFiltroUsuario('LEONARDO')}
                                            title="Ver ventas de Leonardo Gómez (incluye kits de Karol)"
                                        >
                                            <i className="fa-solid fa-user-tie me-1"></i> Leonardo
                                        </button>
                                        {!esLeonardo && (
                                            <button
                                                type="button"
                                                className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${filtroUsuario === 'OSCAR' ? 'btn-success text-white shadow-sm' : 'text-secondary border-0'}`}
                                                onClick={() => setFiltroUsuario('OSCAR')}
                                                title="Ver ventas de Oscar Gómez (incluye guantes de Karol)"
                                            >
                                                <i className="fa-solid fa-user-gear me-1"></i> Oscar
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Barra de Filtro por Categoría / Grupo */}
                                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 p-2 mb-3 rounded-3 bg-light border">
                                    <div className="d-flex flex-wrap align-items-center gap-2">
                                        <span className="small fw-bold text-secondary text-uppercase ms-1 me-1">
                                            <i className="fa-solid fa-filter me-1 text-primary"></i> Filtrar Categoría:
                                        </span>
                                        <div className="btn-group btn-group-sm shadow-xs rounded-pill bg-white border p-1" role="group">
                                            <button
                                                type="button"
                                                className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${
                                                    filtroGrupoMatriz === 'TODAS' ? 'btn-dark text-white shadow-sm' : 'btn-light text-secondary border-0'
                                                }`}
                                                onClick={() => setFiltroGrupoMatriz('TODAS')}
                                            >
                                                <i className="fa-solid fa-table-cells-large me-1"></i> Todas ({stats.categoriasMatriz?.length || 0})
                                            </button>
                                            <button
                                                type="button"
                                                className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${
                                                    filtroGrupoMatriz === 'Kits' ? 'btn-primary text-white shadow-sm' : 'btn-light text-secondary border-0'
                                                }`}
                                                onClick={() => setFiltroGrupoMatriz('Kits')}
                                            >
                                                <i className="fa-solid fa-boxes-packing me-1"></i> Kits ({conteoMatrizKits})
                                            </button>
                                            <button
                                                type="button"
                                                className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${
                                                    filtroGrupoMatriz === 'Guantes' ? 'btn-warning text-dark shadow-sm' : 'btn-light text-secondary border-0'
                                                }`}
                                                onClick={() => setFiltroGrupoMatriz('Guantes')}
                                            >
                                                <i className="fa-solid fa-hand-sparkles me-1"></i> Guantes ({conteoMatrizGuantes})
                                            </button>
                                            <button
                                                type="button"
                                                className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${
                                                    filtroGrupoMatriz === 'Otros' ? 'btn-info text-white shadow-sm' : 'btn-light text-secondary border-0'
                                                }`}
                                                onClick={() => setFiltroGrupoMatriz('Otros')}
                                            >
                                                <i className="fa-solid fa-tags me-1"></i> Otros ({conteoMatrizOtros})
                                            </button>
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-center gap-2 text-muted small me-2">
                                        <span>Mostrando <strong>{categoriasMatrizFiltradas.length}</strong> de <strong>{stats.categoriasMatriz?.length || 0}</strong> filas</span>
                                        {filtroGrupoMatriz !== 'TODAS' && (
                                            <button
                                                type="button"
                                                className="btn btn-link btn-sm text-decoration-none p-0 text-muted"
                                                onClick={() => setFiltroGrupoMatriz('TODAS')}
                                                title="Quitar filtro de categoría"
                                            >
                                                <i className="fa-solid fa-xmark text-danger ms-1"></i> Limpiar
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Nota Metodológica de Precios en la Matriz */}
                                <div className="alert alert-light border rounded-3 py-2 px-3 mb-3 d-flex flex-wrap align-items-center justify-content-between gap-2 small">
                                    <div className="d-flex align-items-center gap-2">
                                        <i className="fa-solid fa-calculator text-primary"></i>
                                        <span>
                                            <strong>Criterio de Precios en la Matriz:</strong> La fila de <strong>Kits y Cirios</strong> (2025 en adelante) se calcula con los <strong>Precios de Fábrica</strong> vigentes en la Base de Datos; las filas de <strong>Guantes</strong> y <strong>Otros Productos</strong> se calculan con los <strong>Precios Reales Facturados en los Pedidos</strong>.
                                        </span>
                                    </div>
                                    <span className="badge bg-light text-secondary border">
                                        Metodología Mixta Identificada
                                    </span>
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-hover table-bordered align-middle text-center mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="text-start ps-3">Categoría / Producto</th>
                                                <th>Grupo</th>
                                                <th>Unidad de Medida</th>
                                                <th>Cantidad Producida / Vendida</th>
                                                <th>% Cantidad</th>
                                                <th className="text-end">
                                                    Total Venta ($)
                                                    <small className="d-block text-muted fw-normal" style={{ fontSize: '0.68rem' }}>(Fábrica en Kits / Pedidos en Guantes)</small>
                                                </th>
                                                <th>% Venta</th>
                                                <th className="text-end pe-3">Precio Unitario Promedio</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {categoriasMatrizFiltradas.length === 0 ? (
                                                <tr>
                                                    <td colSpan="8" className="text-center py-4 text-muted">
                                                        <i className="fa-solid fa-inbox fs-4 d-block mb-2 text-secondary opacity-50"></i>
                                                        No se registraron productos en la categoría <strong>{filtroGrupoMatriz}</strong> para el año {fechaPedido}.
                                                    </td>
                                                </tr>
                                            ) : (
                                                categoriasMatrizFiltradas.map((cat) => (
                                                    <tr key={cat.id}>
                                                        <td className="text-start ps-3 fw-semibold">
                                                            <span className="badge me-2" style={{ backgroundColor: cat.color }}>
                                                                {cat.id}
                                                            </span>
                                                            {cat.nombre}
                                                        </td>
                                                        <td>
                                                            <span className={`badge border ${
                                                                cat.grupo === 'Kits' ? 'bg-primary-subtle text-primary border-primary-subtle' :
                                                                cat.grupo === 'Guantes' ? 'bg-warning-subtle text-warning-emphasis border-warning-subtle' :
                                                                'bg-light text-secondary border'
                                                            }`}>
                                                                {cat.grupo}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {cat.grupo === 'Guantes' ? (
                                                                <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle fw-bold px-2 py-1">
                                                                    <i className="fas fa-hand-sparkles me-1"></i>Docenas
                                                                </span>
                                                            ) : cat.grupo === 'Kits' ? (
                                                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
                                                                    Kits
                                                                </span>
                                                            ) : (
                                                                <span className="badge bg-light text-secondary border px-2 py-1">
                                                                    {cat.unidad || 'Unidades'}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="fw-bold">
                                                            {cat.unidades.toLocaleString()} {cat.grupo === 'Guantes' ? 'docenas' : (cat.grupo === 'Kits' ? 'kits' : 'uds')}
                                                        </td>
                                                        <td>{cat.porcentajeUnidades.toFixed(1)}%</td>
                                                        <td className="text-end fw-bold text-primary">{formatearPrecio(cat.totalVenta)}</td>
                                                        <td>{cat.porcentajeVenta.toFixed(1)}%</td>
                                                        <td className="text-end pe-3 text-muted">
                                                            {formatearPrecio(cat.precioPromedio)} {cat.grupo === 'Guantes' ? '/ docena' : (cat.grupo === 'Kits' ? '/ kit' : '/ ud')}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                        <tfoot className="table-secondary fw-bold">
                                            <tr>
                                                <td className="text-start ps-3">
                                                    {filtroGrupoMatriz === 'TODAS' ? 'TOTAL CONSOLIDADO' : `TOTAL ${filtroGrupoMatriz.toUpperCase()}`}
                                                </td>
                                                <td>
                                                    {filtroGrupoMatriz === 'TODAS' ? '-' : (
                                                        <span className={`badge border ${
                                                            filtroGrupoMatriz === 'Kits' ? 'bg-primary text-white' :
                                                            filtroGrupoMatriz === 'Guantes' ? 'bg-warning text-dark' :
                                                            'bg-info text-white'
                                                        }`}>
                                                            {filtroGrupoMatriz}
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    {filtroGrupoMatriz === 'Guantes' ? 'Docenas' : (filtroGrupoMatriz === 'Kits' ? 'Kits / Cirios' : (filtroGrupoMatriz === 'Otros' ? 'Unidades' : 'Múltiples unidades'))}
                                                </td>
                                                <td>
                                                    {totalesMatrizFiltrada.unidades.toLocaleString()} {filtroGrupoMatriz === 'Guantes' ? 'docenas' : (filtroGrupoMatriz === 'Kits' ? 'kits' : 'productos*')}
                                                </td>
                                                <td>{totalesMatrizFiltrada.pctUnidades.toFixed(1)}%</td>
                                                <td className="text-end text-primary">{formatearPrecio(totalesMatrizFiltrada.totalVenta)}</td>
                                                <td>{totalesMatrizFiltrada.pctVenta.toFixed(1)}%</td>
                                                <td className="text-end pe-3">
                                                    {formatearPrecio(totalesMatrizFiltrada.precioPromedio)} {filtroGrupoMatriz === 'Guantes' ? '/ docena' : (filtroGrupoMatriz === 'Kits' ? '/ kit' : '/ ud')}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                <span className="small text-muted mt-2 d-block">
                                    <i className="fa-solid fa-circle-info me-1"></i> *Nota: Los guantes se miden y comercializan en <strong>docenas</strong>, mientras que los kits y otros productos se contabilizan en <strong>unidades</strong>. De la categoría Otros no se suma ningún producto de Karol Gómez.
                                </span>
                            </div>
                        </div>

                        {/* Gráficos de Categoría */}
                        <div className="col-12 col-lg-6">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-1">
                                    <h6 className="fw-bold text-dark mb-0">
                                        <i className="fa-solid fa-chart-column text-primary me-2"></i>
                                        Ventas Mensuales ($) por Categoría en {fechaPedido}
                                    </h6>
                                    <span className="badge bg-light text-secondary border small">
                                        Kits: Fábrica | Guantes/Otros: Pedidos
                                    </span>
                                </div>
                                <p className="text-muted small mb-3">
                                    Kits valorizados a <strong>Precios de Fábrica</strong> (2025+); Guantes y Otros a <strong>Precios Reales de Pedidos</strong>.
                                </p>
                                <div style={{ minHeight: 320 }}>
                                    <StackedChart
                                        labels={chartCategoriasData.labels}
                                        datasets={chartCategoriasData.datasets}
                                        title={`Ventas $ por Categoría ${fechaPedido}`}
                                        stacked={true}
                                        formato={true}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-lg-6">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-1">
                                    <h6 className="fw-bold text-dark mb-0">
                                        <i className="fa-solid fa-boxes-stacked text-primary me-2"></i>
                                        Unidades Mensuales por Categoría en {fechaPedido}
                                    </h6>
                                    <span className="badge bg-info-subtle text-info border border-info-subtle small">
                                        Cantidades Físicas
                                    </span>
                                </div>
                                <p className="text-muted small mb-3">
                                    Volumen de producción y despacho en unidades (kits/otros) y docenas (guantes), independiente de precios.
                                </p>
                                <div style={{ minHeight: 320 }}>
                                    <StackedChart
                                        labels={chartCategoriasCantidad.labels}
                                        datasets={chartCategoriasCantidad.datasets}
                                        title={`Productos por Categoría ${fechaPedido}`}
                                        stacked={true}
                                        formato={true}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Histórico Multianual de Toda la Categoría Kits */}
                        <div className="col-12 mt-2">
                            {filtroCategoria === 'GUANTES' ? (
                                <div className="alert alert-warning py-3 px-4 rounded-4 shadow-sm border-0 d-flex align-items-center gap-3">
                                    <i className="fa-solid fa-mitten fs-3 text-warning"></i>
                                    <div>
                                        <h6 className="fw-bold mb-1">Filtro superior activo: Solo Guantes</h6>
                                        <p className="mb-0 small text-muted">
                                            El gráfico multianual de Kits no aplica porque actualmente estás visualizando exclusivamente la categoría <strong>Guantes</strong>.
                                        </p>
                                    </div>
                                </div>
                            ) : filtroCategoria === 'OTROS' ? (
                                <div className="alert alert-info py-3 px-4 rounded-4 shadow-sm border-0 d-flex align-items-center gap-3">
                                    <i className="fa-solid fa-tags fs-3 text-info"></i>
                                    <div>
                                        <h6 className="fw-bold mb-1">Filtro superior activo: Solo Otros</h6>
                                        <p className="mb-0 small text-muted">
                                            El gráfico multianual de Kits no aplica porque actualmente estás visualizando exclusivamente la categoría <strong>Otros</strong>.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <ChartKitsMultiAnual
                                    oldOrders={oldOrders}
                                    pedidos={pedidos}
                                    aniosDisponibles={aniosDisponibles}
                                    filtrarPorEstadoPagado={filtrarPorEstadoPagado}
                                    filtroUsuario={filtroUsuario}
                                    listaPrecios={listaPrecios}
                                    esLeonardo={esLeonardo}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* VISTA 3: CLIENTES & CONCENTRACIÓN */}
                {activeTab === 'clientes' && (
                    <div className="row g-4">
                        {/* Métricas de Concentración */}
                        <div className="col-12 col-md-4">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 border-start border-4 border-primary">
                                <span className="text-muted small fw-bold text-uppercase d-block mb-1">Clientes Activos</span>
                                <h3 className="fw-bold text-dark mb-2">{stats.totalClientesUnicos} clientes</h3>
                                <p className="text-muted small mb-0">
                                    Realizaron al menos un pedido durante el año {fechaPedido}.
                                </p>
                            </div>
                        </div>

                        <div className="col-12 col-md-4">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 border-start border-4 border-warning">
                                <span className="text-muted small fw-bold text-uppercase d-block mb-1">Concentración Top 3</span>
                                <h3 className="fw-bold text-warning mb-2">{stats.concentracionTop3.toFixed(1)}%</h3>
                                <p className="text-muted small mb-0">
                                    Porcentaje de las ventas totales que depende de los 3 clientes más grandes.
                                </p>
                            </div>
                        </div>

                        <div className="col-12 col-md-4">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 border-start border-4 border-info">
                                <span className="text-muted small fw-bold text-uppercase d-block mb-1">Concentración Top 5</span>
                                <h3 className="fw-bold text-info mb-2">{stats.concentracionTop5.toFixed(1)}%</h3>
                                <p className="text-muted small mb-0">
                                    Participación de los 5 clientes principales sobre el total facturado.
                                </p>
                            </div>
                        </div>

                        {/* Ranking Detallado de Clientes */}
                        <div className="col-12">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-1">
                                    <h5 className="fw-bold text-dark mb-0">
                                        <i className="fa-solid fa-trophy text-warning me-2"></i>
                                        Ranking de Clientes del Año {fechaPedido}
                                    </h5>
                                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 rounded-pill small fw-semibold">
                                        <i className="fa-solid fa-industry me-1"></i> Kits a Precio de Fábrica
                                    </span>
                                </div>
                                <p className="text-muted small mb-3">
                                    Listado ordenado por volumen de facturación comercial real cobrada, cantidad de pedidos y productos adquiridos.
                                </p>

                                <div className="table-responsive">
                                    <table className="table table-hover table-bordered align-middle mb-0">
                                        <thead className="table-light text-center small text-muted">
                                            <tr>
                                                <th style={{ width: '5%' }}>#</th>
                                                <th className="text-start ps-3" style={{ width: '30%' }}>Cliente</th>
                                                <th style={{ width: '15%' }}>NIT / CC</th>
                                                <th style={{ width: '10%' }}>Pedidos</th>
                                                <th style={{ width: '10%' }}>Productos</th>
                                                <th className="text-end" style={{ width: '15%' }}>
                                                    Total Comprado ($)
                                                    <small className="d-block text-muted fw-normal" style={{ fontSize: '0.68rem' }}>(Precios de Pedidos)</small>
                                                </th>
                                                <th style={{ width: '15%' }}>Ticket Promedio</th>
                                                <th style={{ width: '10%' }}>% del Negocio</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.topClientes.map((cli, idx) => (
                                                <tr key={idx} className="text-center">
                                                    <td className="fw-bold text-secondary">{idx + 1}</td>
                                                    <td className="text-start ps-3 fw-bold text-dark">
                                                        {aTitulo(cli.nombre)}
                                                    </td>
                                                    <td className="small text-muted">{cli.nit || '-'}</td>
                                                    <td>{cli.pedidos}</td>
                                                    <td className="fw-bold">{cli.prendas.toLocaleString()}</td>
                                                    <td className="text-end fw-bold text-primary">{formatearPrecio(cli.total)}</td>
                                                    <td className="text-end text-muted">{formatearPrecio(cli.ticketPromedio)}</td>
                                                    <td>
                                                        <span className="badge bg-primary-subtle text-primary fw-bold">
                                                            {cli.participacion.toFixed(1)}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {stats.topClientes.length === 0 && (
                                                <tr>
                                                    <td colSpan={8} className="text-center text-muted py-4">No hay clientes registrados en este periodo</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* VISTA 4: COMPARATIVA CARA A CARA */}
                {activeTab === 'comparativa' && (
                    <div className="row g-4">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
                                    <div>
                                        <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                                            <h5 className="fw-bold text-dark mb-0">
                                                <i className="fa-solid fa-code-compare text-primary me-2"></i>
                                                Comparativa Directa: {fechaPedido} vs {anioComparar}
                                            </h5>
                                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 rounded-pill small fw-semibold">
                                                <i className="fa-solid fa-industry me-1"></i> Kits a Precio de Fábrica
                                            </span>
                                        </div>
                                        <p className="text-muted small mb-0">
                                            Confronta directamente la facturación comercial real cobrada y los gastos operacionales entre el año analizado y el año comparado.
                                        </p>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="small fw-semibold text-secondary">Comparar contra:</span>
                                        <select
                                            className="form-select form-select-sm w-auto rounded-pill border-primary"
                                            value={anioComparar}
                                            onChange={(e) => setAnioComparar(e.target.value)}
                                        >
                                            {aniosDisponibles.filter(y => String(y) !== String(fechaPedido)).map(y => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-bordered table-hover align-middle text-center mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="text-start ps-3">Métrica de Negocio</th>
                                                <th>Año {fechaPedido} (Principal)</th>
                                                <th>Año {anioComparar} (Comparado)</th>
                                                <th>Diferencia Absoluta</th>
                                                <th>Variación %</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="text-start ps-3 fw-bold">
                                                    Ventas Totales ($)
                                                    <span className="badge bg-light text-secondary border fw-normal ms-1" style={{ fontSize: '0.7rem' }}>Precios de Pedidos</span>
                                                </td>
                                                <td className="fw-bold text-dark">{formatearPrecio(comparativaData.ventas.valA)}</td>
                                                <td className="text-muted">{formatearPrecio(comparativaData.ventas.valB)}</td>
                                                <td className={`fw-bold ${comparativaData.ventas.dif >= 0 ? 'text-success' : 'text-danger'}`}>
                                                    {comparativaData.ventas.dif >= 0 ? `+${formatearPrecio(comparativaData.ventas.dif)}` : formatearPrecio(comparativaData.ventas.dif)}
                                                </td>
                                                <td>
                                                    <span className={`badge rounded-pill fw-bold ${comparativaData.ventas.pct >= 0 ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                                                        {comparativaData.ventas.pct >= 0 ? `+${comparativaData.ventas.pct.toFixed(1)}%` : `${comparativaData.ventas.pct.toFixed(1)}%`}
                                                    </span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="text-start ps-3 fw-bold">Gastos Operativos ($)</td>
                                                <td className="text-danger fw-bold">{formatearPrecio(comparativaData.gastos.valA)}</td>
                                                <td className="text-muted">{formatearPrecio(comparativaData.gastos.valB)}</td>
                                                <td className={`fw-bold ${comparativaData.gastos.dif <= 0 ? 'text-success' : 'text-danger'}`}>
                                                    {comparativaData.gastos.dif >= 0 ? `+${formatearPrecio(comparativaData.gastos.dif)}` : formatearPrecio(comparativaData.gastos.dif)}
                                                </td>
                                                <td>
                                                    <span className="badge rounded-pill bg-light text-secondary border">
                                                        {comparativaData.gastos.pct >= 0 ? `+${comparativaData.gastos.pct.toFixed(1)}%` : `${comparativaData.gastos.pct.toFixed(1)}%`}
                                                    </span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="text-start ps-3 fw-bold">Utilidad Operativa ($)</td>
                                                <td className={`fw-bold ${comparativaData.utilidad.valA >= 0 ? 'text-success' : 'text-danger'}`}>
                                                    {formatearPrecio(comparativaData.utilidad.valA)}
                                                </td>
                                                <td className="text-muted">{formatearPrecio(comparativaData.utilidad.valB)}</td>
                                                <td className={`fw-bold ${comparativaData.utilidad.dif >= 0 ? 'text-success' : 'text-danger'}`}>
                                                    {comparativaData.utilidad.dif >= 0 ? `+${formatearPrecio(comparativaData.utilidad.dif)}` : formatearPrecio(comparativaData.utilidad.dif)}
                                                </td>
                                                <td>
                                                    <span className={`badge rounded-pill fw-bold ${comparativaData.utilidad.pct >= 0 ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                                                        {comparativaData.utilidad.pct >= 0 ? `+${comparativaData.utilidad.pct.toFixed(1)}%` : `${comparativaData.utilidad.pct.toFixed(1)}%`}
                                                    </span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="text-start ps-3 fw-bold">Margen de Rentabilidad (%)</td>
                                                <td className="fw-bold">{comparativaData.margen.valA.toFixed(1)}%</td>
                                                <td className="text-muted">{comparativaData.margen.valB.toFixed(1)}%</td>
                                                <td className={`fw-bold ${comparativaData.margen.dif >= 0 ? 'text-success' : 'text-danger'}`}>
                                                    {comparativaData.margen.dif >= 0 ? `+${comparativaData.margen.dif.toFixed(1)} pts` : `${comparativaData.margen.dif.toFixed(1)} pts`}
                                                </td>
                                                <td>
                                                    <span className="badge rounded-pill bg-light text-dark border">
                                                        {comparativaData.margen.dif >= 0 ? 'Mejora de Margen' : 'Compresión de Margen'}
                                                    </span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="text-start ps-3 fw-bold">Total Productos Vendidos (Kits y Doc. Guantes)</td>
                                                <td className="fw-bold">{comparativaData.prendas.valA.toLocaleString()} prod.</td>
                                                <td className="text-muted">{comparativaData.prendas.valB.toLocaleString()} prod.</td>
                                                <td className={`fw-bold ${comparativaData.prendas.dif >= 0 ? 'text-success' : 'text-danger'}`}>
                                                    {comparativaData.prendas.dif >= 0 ? `+${comparativaData.prendas.dif.toLocaleString()}` : comparativaData.prendas.dif.toLocaleString()}
                                                </td>
                                                <td>
                                                    <span className={`badge rounded-pill fw-bold ${comparativaData.prendas.pct >= 0 ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                                                        {comparativaData.prendas.pct >= 0 ? `+${comparativaData.prendas.pct.toFixed(1)}%` : `${comparativaData.prendas.pct.toFixed(1)}%`}
                                                    </span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="text-start ps-3 fw-bold">Total de Pedidos</td>
                                                <td className="fw-bold">{comparativaData.pedidos.valA} pedidos</td>
                                                <td className="text-muted">{comparativaData.pedidos.valB} pedidos</td>
                                                <td className="fw-bold">{comparativaData.pedidos.dif >= 0 ? `+${comparativaData.pedidos.dif}` : comparativaData.pedidos.dif}</td>
                                                <td>
                                                    <span className="badge rounded-pill bg-light text-secondary border">
                                                        {comparativaData.pedidos.pct >= 0 ? `+${comparativaData.pedidos.pct.toFixed(1)}%` : `${comparativaData.pedidos.pct.toFixed(1)}%`}
                                                    </span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="text-start ps-3 fw-bold">Ticket Promedio por Pedido</td>
                                                <td className="fw-bold text-dark">{formatearPrecio(comparativaData.ticket.valA)}</td>
                                                <td className="text-muted">{formatearPrecio(comparativaData.ticket.valB)}</td>
                                                <td className={`fw-bold ${comparativaData.ticket.dif >= 0 ? 'text-success' : 'text-danger'}`}>
                                                    {comparativaData.ticket.dif >= 0 ? `+${formatearPrecio(comparativaData.ticket.dif)}` : formatearPrecio(comparativaData.ticket.dif)}
                                                </td>
                                                <td>
                                                    <span className={`badge rounded-pill fw-bold ${comparativaData.ticket.pct >= 0 ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                                                        {comparativaData.ticket.pct >= 0 ? `+${comparativaData.ticket.pct.toFixed(1)}%` : `${comparativaData.ticket.pct.toFixed(1)}%`}
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* VISTA 5: EVOLUCIÓN HISTÓRICA */}
                {activeTab === 'multianual' && (
                    <div className="row g-4">
                        {/* Comparativa Mensual por Barras: Año Actual vs Top 3 Años Anteriores */}
                        <div className="col-12">
                            <ChartBarrasMensualAnios
                                oldOrders={oldOrders}
                                pedidos={pedidos}
                                aniosDisponibles={aniosDisponibles}
                                anioActual={fechaPedido}
                                filtroCategoria={filtroCategoria}
                                filtroUsuario={filtroUsuario}
                                filtrarPorEstadoPagado={filtrarPorEstadoPagado}
                                listaPrecios={listaPrecios}
                                esLeonardo={esLeonardo}
                            />
                        </div>

                        {/* Histórico Multianual de Toda la Categoría Kits */}
                        <div className="col-12">
                            {filtroCategoria === 'GUANTES' ? (
                                <div className="alert alert-warning py-3 px-4 rounded-4 shadow-sm border-0 d-flex align-items-center gap-3">
                                    <i className="fa-solid fa-mitten fs-3 text-warning"></i>
                                    <div>
                                        <h6 className="fw-bold mb-1">Filtro superior activo: Solo Guantes</h6>
                                        <p className="mb-0 small text-muted">
                                            El gráfico multianual de Kits no aplica porque actualmente estás visualizando exclusivamente la categoría <strong>Guantes</strong>.
                                        </p>
                                    </div>
                                </div>
                            ) : filtroCategoria === 'OTROS' ? (
                                <div className="alert alert-info py-3 px-4 rounded-4 shadow-sm border-0 d-flex align-items-center gap-3">
                                    <i className="fa-solid fa-tags fs-3 text-info"></i>
                                    <div>
                                        <h6 className="fw-bold mb-1">Filtro superior activo: Solo Otros</h6>
                                        <p className="mb-0 small text-muted">
                                            El gráfico multianual de Kits no aplica porque actualmente estás visualizando exclusivamente la categoría <strong>Otros</strong>.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <ChartKitsMultiAnual
                                    oldOrders={oldOrders}
                                    pedidos={pedidos}
                                    aniosDisponibles={aniosDisponibles}
                                    filtrarPorEstadoPagado={filtrarPorEstadoPagado}
                                    filtroUsuario={filtroUsuario}
                                    listaPrecios={listaPrecios}
                                    esLeonardo={esLeonardo}
                                />
                            )}
                        </div>

                        <div className="col-12 col-lg-6">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-1">
                                    <h6 className="fw-bold text-dark mb-0">
                                        <i className="fa-solid fa-chart-line text-success me-2"></i>
                                        Curva Comparativa de Ventas Anuales
                                    </h6>
                                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle small fw-semibold">
                                        <i className="fa-solid fa-industry me-1"></i> Kits a Precio de Fábrica
                                    </span>
                                </div>
                                <p className="text-muted small mb-2">Compara las ventas mes a mes en cada año con Kits a precios de fábrica.</p>
                                <div style={{ minHeight: 300 }}>
                                    <AreaChartOldYear data={multiAnualSalesData} />
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-lg-6">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-1">
                                    <h6 className="fw-bold text-dark mb-0">
                                        <i className="fa-solid fa-arrow-trend-up text-primary me-2"></i>
                                        Ventas Acumuladas Año a Año
                                    </h6>
                                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle small fw-semibold">
                                        <i className="fa-solid fa-industry me-1"></i> Kits a Precio de Fábrica
                                    </span>
                                </div>
                                <p className="text-muted small mb-2">Acumulación de ventas a lo largo de cada año con Kits a precios de fábrica.</p>
                                <div style={{ minHeight: 300 }}>
                                    <AreaChartOldYearAcumulada data={multiAnualSalesData} />
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-lg-6">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-1">
                                    <h6 className="fw-bold text-dark mb-0">
                                        <i className="fa-solid fa-receipt text-danger me-2"></i>
                                        Gastos Mensuales por Año
                                    </h6>
                                    <span className="badge bg-danger-subtle text-danger border border-danger-subtle small fw-semibold">
                                        Egresos Registrados
                                    </span>
                                </div>
                                <p className="text-muted small mb-2">Compara los egresos operacionales de cada periodo.</p>
                                <div style={{ minHeight: 300 }}>
                                    <AreaChartOldYear data={multiAnualGastosData} />
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-lg-6">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-1">
                                    <h6 className="fw-bold text-dark mb-0">
                                        <i className="fa-solid fa-chart-pie text-secondary me-2"></i>
                                        Brand Design vs Otros Clientes ({fechaPedido})
                                    </h6>
                                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle small fw-semibold">
                                        <i className="fa-solid fa-receipt me-1"></i> Precios Reales de Pedidos
                                    </span>
                                </div>
                                <p className="text-muted small mb-2">Desglose histórico de ventas reales cobradas a Brand Design frente al resto de clientes.</p>
                                <div style={{ minHeight: 300 }}>
                                    <AreaChartOld
                                        gastos={areaChartProps.gastos}
                                        ventas={areaChartProps.ventas}
                                        ventasBrandDesign={areaChartProps.ventasBrandDesign}
                                        ventasOtros={areaChartProps.ventasOtros}
                                        porValor={false}
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Gráfico: Progreso por Producto vs Año Anterior */}
                        <div className="col-12">
                            <ChartMetaVsAnterior
                                pedidosAnioActual={pedidosDelAnio}
                                pedidosAnioAnterior={pedidosAnioAnterior}
                                anioActual={fechaPedido}
                                anioAnterior={anioAnterior}
                                filtroUsuario={filtroUsuario}
                            />
                        </div>
                    </div>
                )}

                {/* VISTA 6: DETALLE DE PEDIDOS */}
                {activeTab === 'pedidos' && (
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                        <div className="row g-3 align-items-center mb-3">
                            <div className="col-12 col-md-6">
                                <h5 className="fw-bold text-dark mb-1">
                                    <i className="fa-solid fa-list-check text-primary me-2"></i>
                                    Detalle de Pedidos Registrados ({fechaPedido})
                                </h5>
                                <p className="text-muted small mb-0">
                                    {pedidosFiltrados.length} pedidos encontrados con los filtros actuales.
                                </p>
                            </div>

                            <div className="col-12 col-md-6 d-flex flex-wrap justify-content-md-end gap-2">
                                <Button
                                    variant="outline-success"
                                    className="btn-sm rounded-pill px-3 d-flex align-items-center gap-2"
                                    onClick={handleDownloadCsv}
                                >
                                    <i className="fa-solid fa-file-csv"></i>
                                    <span>Descargar CSV</span>
                                </Button>
                                <Button
                                    variant="outline-danger"
                                    className="btn-sm rounded-pill px-3 d-flex align-items-center gap-2"
                                    onClick={handleDownloadPDF}
                                >
                                    <i className="fa-solid fa-file-pdf"></i>
                                    <span>Descargar PDF</span>
                                </Button>
                            </div>
                        </div>

                        {/* Filtros de Búsqueda */}
                        <div className="row g-3 mb-4 p-3 bg-light rounded-3 align-items-center">
                            <div className="col-12 col-md-5">
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0">
                                        <i className="fa-solid fa-magnifying-glass text-muted"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0"
                                        placeholder="Buscar por cliente, NIT, remisión o fecha..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                    {search && (
                                        <button className="btn btn-outline-secondary border-start-0 bg-white" onClick={() => setSearch('')}>
                                            <i className="fa-solid fa-times"></i>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="col-12 col-md-4">
                                <select
                                    className="form-select"
                                    value={categoriaFiltro}
                                    onChange={(e) => setCategoriaFiltro(e.target.value)}
                                >
                                    <option value="TODAS">Todas las categorías de producto</option>
                                    {CATEGORIAS_DEFINICION.map(c => (
                                        <option key={c.id} value={c.id}>{c.nombre} ({c.id})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-12 col-md-3">
                                <Form.Check
                                    type="checkbox"
                                    id="checkExcluir"
                                    label="Excluir coincidencias por cliente"
                                    checked={excluirCliente}
                                    onChange={(e) => setExcluirCliente(e.target.checked)}
                                    className="small fw-semibold text-secondary"
                                />
                            </div>
                        </div>

                        {/* Tabla de Datos */}
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr className="small text-muted text-uppercase">
                                        <th className="text-center" style={{ width: '10%' }}>Fecha</th>
                                        <th className="text-center" style={{ width: '12%' }}>Remisión</th>
                                        <th style={{ width: '12%' }}>NIT / CC</th>
                                        <th className="text-center" style={{ width: '8%' }} title="Kits y cirios en unidades, guantes en docenas">Productos*</th>
                                        <th className="text-center" style={{ width: '8%' }}>Items</th>
                                        <th style={{ width: '30%' }}>Cliente</th>
                                        <th className="text-end pe-3" style={{ width: '15%' }}>Total ($)</th>
                                        <th className="text-center" style={{ width: '5%' }}>Origen</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pedidosPaginados.map((order, idx) => (
                                        <tr key={order.id || idx}>
                                            <td className="text-center small text-muted">
                                                {order.fechaStr}
                                            </td>

                                            {/* Remisión con Popover de Items */}
                                            <td className="text-center">
                                                <OverlayTrigger
                                                    trigger="click"
                                                    rootClose
                                                    placement="top"
                                                    overlay={
                                                        <Popover id={`popover-order-${idx}`} style={{ maxWidth: '650px', width: 'auto' }}>
                                                            <Popover.Header as="h6" className="fw-bold d-flex justify-content-between align-items-center bg-dark text-white">
                                                                <span>Remisión: {order.remision}</span>
                                                                <span className="badge bg-primary">{order.origen}</span>
                                                            </Popover.Header>
                                                            <Popover.Body className="p-2">
                                                                <div className="small mb-2">
                                                                    <strong>Cliente:</strong> {order.cliente} <br />
                                                                    <strong>NIT:</strong> {order.nit || 'S/N'}
                                                                </div>
                                                                <div className="table-responsive" style={{ maxHeight: '250px' }}>
                                                                    <table className="table table-sm table-bordered text-center align-middle mb-0" style={{ fontSize: '0.8rem' }}>
                                                                        <thead className="table-light">
                                                                            <tr>
                                                                                <th>Código / Cat.</th>
                                                                                <th>Producto</th>
                                                                                <th>Cant. / Medida</th>
                                                                                <th className="text-end">Precio</th>
                                                                                <th className="text-end">Total</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {order.items?.map((it, i) => {
                                                                                const esGuante = it.categoriaId === 'GUANTES' || (it.producto && it.producto.toLowerCase().includes('guante'));
                                                                                const esKit = ['KCG', 'KCP', 'KCE', 'KB'].includes(it.categoriaId);
                                                                                const esCirio = ['CC', 'CB', 'CCON'].includes(it.categoriaId);
                                                                                const unidadTexto = esGuante ? 'docenas' : (esKit ? 'kits' : (esCirio ? 'cirios' : 'uds'));

                                                                                return (
                                                                                    <tr key={i}>
                                                                                        <td>
                                                                                            <span className="badge bg-secondary-subtle text-secondary">{it.codigo}</span>
                                                                                        </td>
                                                                                        <td className="text-start">
                                                                                            {it.producto}
                                                                                            {it.esPrecioFabrica && (
                                                                                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle ms-1" style={{ fontSize: '0.65rem' }}>
                                                                                                    Fábrica
                                                                                                </span>
                                                                                            )}
                                                                                        </td>
                                                                                        <td className="fw-bold text-nowrap">
                                                                                            {it.cantidad} <small className={esGuante ? 'badge bg-warning-subtle text-warning-emphasis' : 'text-muted fw-normal'}>({unidadTexto})</small>
                                                                                        </td>
                                                                                        <td className="text-end">{formatearPrecio(it.precio)}</td>
                                                                                        <td className="text-end fw-bold">{formatearPrecio(it.total)}</td>
                                                                                    </tr>
                                                                                );
                                                                            })}
                                                                            {(!order.items || order.items.length === 0) && (
                                                                                <tr>
                                                                                    <td colSpan={5} className="text-muted">Sin detalle de productos</td>
                                                                                </tr>
                                                                            )}
                                                                        </tbody>
                                                                        <tfoot className="table-light fw-bold">
                                                                            <tr>
                                                                                <td colSpan={2} className="text-end">Total:</td>
                                                                                <td>{order.cantidadPrendas}</td>
                                                                                <td colSpan={2} className="text-end text-primary">{formatearPrecio(order.total)}</td>
                                                                            </tr>
                                                                        </tfoot>
                                                                    </table>
                                                                </div>
                                                            </Popover.Body>
                                                        </Popover>
                                                    }
                                                >
                                                    <span className="badge bg-light text-primary border rounded-pill px-3 py-1 cursor-pointer hover-shadow" style={{ cursor: 'pointer' }}>
                                                        <i className="fa-solid fa-eye me-1"></i> {order.remision}
                                                    </span>
                                                </OverlayTrigger>
                                            </td>

                                            <td className="small text-secondary">{order.nit || '-'}</td>
                                            <td className="text-center fw-bold">{order.cantidadPrendas}</td>
                                            <td className="text-center text-muted small">{order.itemsCount}</td>
                                            <td className="fw-semibold text-dark text-truncate" style={{ maxWidth: 240 }}>
                                                {aTitulo(order.cliente)}
                                                {order.atribuidoKarol && (
                                                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill ms-2" style={{ fontSize: '0.65rem' }}>
                                                        <i className="fa-solid fa-handshake me-1"></i>
                                                        {order.tipoAtribucion || 'Karol'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="text-end pe-3 fw-bold text-dark">
                                                {formatearPrecio(order.total)}
                                            </td>
                                            <td className="text-center">
                                                <span className={`badge rounded-pill ${order.origen === 'SISTEMA' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`} style={{ fontSize: '0.65rem' }}>
                                                    {order.origen === 'SISTEMA' ? '2025+' : 'Histórico'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}

                                    {pedidosFiltrados.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="text-center text-muted py-5">
                                                <i className="fa-solid fa-box-open fa-2x mb-2 text-secondary d-block"></i>
                                                No se encontraron pedidos que coincidan con los criterios de búsqueda para {fechaPedido}.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <span className="small text-muted mt-2 d-block">
                            <i className="fa-solid fa-circle-info me-1"></i> *Nota: Los guantes se contabilizan en <strong>docenas</strong>; los kits, cirios y accesorios se contabilizan por <strong>unidades</strong>.
                        </span>

                        {/* Paginador y Resumen */}
                        {pedidosFiltrados.length > 0 && (
                            <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 pt-3 border-top">
                                <span className="small text-muted">
                                    Mostrando {((paginaActual - 1) * itemsPorPagina) + 1} a {Math.min(paginaActual * itemsPorPagina, pedidosFiltrados.length)} de {pedidosFiltrados.length} pedidos
                                </span>

                                <div className="d-flex align-items-center gap-1 flex-wrap">
                                    <button
                                        className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                                        disabled={paginaActual === 1}
                                        onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                                    >
                                        <i className="fa-solid fa-chevron-left me-1"></i> Anterior
                                    </button>
                                    {getVisiblePageNumbers(paginaActual - 1, totalPaginas, 5).map((pageIndex) => (
                                        <button
                                            key={pageIndex}
                                            className={`btn btn-sm rounded-circle px-2 py-1 ${paginaActual === pageIndex + 1 ? 'btn-primary' : 'btn-light border'}`}
                                            style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}
                                            onClick={() => setPaginaActual(pageIndex + 1)}
                                        >
                                            {pageIndex + 1}
                                        </button>
                                    ))}
                                    <button
                                        className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                                        disabled={paginaActual === totalPaginas}
                                        onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                                    >
                                        Siguiente <i className="fa-solid fa-chevron-right ms-1"></i>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal de Auditoría y Comprobación de Precios de Estacionalidad Trimestral */}
            <Modal
                show={Boolean(auditoriaTrimestreModal)}
                onHide={() => setAuditoriaTrimestreModal(null)}
                size="lg"
                centered
                scrollable
            >
                <Modal.Header closeButton className="bg-light border-bottom">
                    <Modal.Title className="h6 fw-bold text-dark d-flex align-items-center gap-2 m-0">
                        <i className="fa-solid fa-calculator text-primary"></i>
                        Auditoría de Cantidad × Precios: {auditoriaTrimestreModal?.nombre} ({fechaPedido})
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-3">
                    {/* Banner explicativo */}
                    <div className="alert alert-info py-2 px-3 small rounded-3 border-0 shadow-xs mb-3">
                        <div className="d-flex align-items-center gap-2">
                            <i className="fa-solid fa-circle-info fs-5 text-info"></i>
                            <div>
                                <strong>Comprobación de Precios ({fechaPedido}):</strong> Los productos de la categoría <strong>Kits y Cirios</strong> se calculan a precios de fábrica según la tarifa vigente en Gestión de Precios para la fecha del pedido. Los <strong>Guantes</strong> se calculan a sus precios reales. Si un producto tuvo cambios de precio por fecha, se desglosa cada asignación separada por periodo.
                            </div>
                        </div>
                    </div>

                    {/* Resumen numérico */}
                    <div className="row g-2 mb-3">
                        <div className="col-12 col-md-4">
                            <div className="p-2 bg-light rounded-3 border text-center">
                                <span className="text-muted d-block small">Venta Total Trimestre</span>
                                <strong className="fs-6 text-dark">{formatearPrecio(auditoriaTrimestreModal?.ventas || 0)}</strong>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="p-2 bg-light rounded-3 border border-primary-subtle text-center">
                                <span className="text-primary d-block small">Kits (Precio Fábrica)</span>
                                <strong className="fs-6 text-primary">{formatearPrecio(auditoriaTrimestreModal?.ventasKits || 0)}</strong>
                                <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>({auditoriaTrimestreModal?.kits || 0} unds)</small>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="p-2 bg-light rounded-3 border border-purple-subtle text-center">
                                <span className="d-block small" style={{ color: '#7e22ce' }}>Guantes</span>
                                <strong className="fs-6" style={{ color: '#7e22ce' }}>{formatearPrecio(auditoriaTrimestreModal?.ventasGuantes || 0)}</strong>
                                <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>({auditoriaTrimestreModal?.guantes || 0} doc)</small>
                            </div>
                        </div>
                    </div>

                    {/* Tabla detallada */}
                    <div className="table-responsive border rounded-3">
                        <table className="table table-sm table-hover align-middle mb-0" style={{ fontSize: '0.78rem' }}>
                            <thead className="table-light text-muted">
                                <tr>
                                    <th>Grupo</th>
                                    <th>Producto</th>
                                    <th>Periodo / Fechas</th>
                                    <th className="text-center">Cant.</th>
                                    <th className="text-end">Precio Unit.</th>
                                    <th className="text-center">Tipo</th>
                                    <th className="text-end">Fórmula (Cant × Precio)</th>
                                    <th className="text-end">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(!auditoriaTrimestreModal?.auditoriaProductos || auditoriaTrimestreModal.auditoriaProductos.length === 0) ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-4 text-muted fst-italic">
                                            No hay productos registrados para este trimestre.
                                        </td>
                                    </tr>
                                ) : (
                                    auditoriaTrimestreModal.auditoriaProductos.map((prod) => (
                                        <React.Fragment key={prod.id}>
                                            {prod.desglosesPorPrecio.map((des, dIdx) => (
                                                <tr key={`${prod.id}-${dIdx}`}>
                                                    {dIdx === 0 ? (
                                                        <td rowSpan={prod.desglosesPorPrecio.length} className="fw-semibold align-top pt-2">
                                                            <span className={`badge ${prod.grupo === 'Kits' ? 'bg-primary-subtle text-primary border border-primary-subtle' : prod.grupo === 'Cirios' ? 'bg-info-subtle text-info-emphasis border border-info-subtle' : prod.grupo === 'Guantes' ? 'badge-purple' : 'bg-secondary-subtle text-secondary'}`} style={{ fontSize: '0.66rem' }}>
                                                                {prod.grupo}
                                                            </span>
                                                        </td>
                                                    ) : null}
                                                    {dIdx === 0 ? (
                                                        <td rowSpan={prod.desglosesPorPrecio.length} className="fw-bold align-top pt-2 text-dark">
                                                            {prod.nombre}
                                                            {prod.tieneMultiplesPrecios && (
                                                                <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle d-block mt-1" style={{ fontSize: '0.62rem' }}>
                                                                    <i className="fa-solid fa-clock-rotate-left me-1"></i>
                                                                    {prod.desglosesPorPrecio.length} asignaciones por fecha
                                                                </span>
                                                            )}
                                                        </td>
                                                    ) : null}
                                                    <td>
                                                        {des.rangoFechas ? (
                                                            <div>
                                                                <i className="fa-regular fa-calendar me-1 text-secondary"></i>
                                                                <span className="text-dark">{des.rangoFechas}</span>
                                                                {des.tarifaNombre && (
                                                                    <small className="d-block text-muted" style={{ fontSize: '0.66rem' }}>
                                                                        {des.tarifaNombre}
                                                                    </small>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted">Trimestre</span>
                                                        )}
                                                    </td>
                                                    <td className="text-center fw-bold text-dark">
                                                        {des.cantidad} <small className="text-muted fw-normal">{prod.unidad}</small>
                                                    </td>
                                                    <td className="text-end fw-semibold text-primary">
                                                        {formatearPrecio(des.precioUnitario)}
                                                    </td>
                                                    <td className="text-center">
                                                        {des.esPrecioFabrica ? (
                                                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: '0.65rem' }}>
                                                                <i className="fa-solid fa-industry me-1"></i> Fábrica
                                                            </span>
                                                        ) : (
                                                            <span className="badge bg-light text-secondary border" style={{ fontSize: '0.65rem' }}>
                                                                Venta Pedido
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="text-end text-muted font-monospace" style={{ fontSize: '0.74rem' }}>
                                                        {des.cantidad} × {formatearPrecio(des.precioUnitario)}
                                                    </td>
                                                    <td className="text-end fw-bold text-dark">
                                                        {formatearPrecio(des.subtotal)}
                                                    </td>
                                                </tr>
                                            ))}
                                            {prod.tieneMultiplesPrecios && (
                                                <tr className="bg-light-subtle">
                                                    <td colSpan={3} className="text-end fw-bold text-muted small py-1">
                                                        Total {prod.nombre}:
                                                    </td>
                                                    <td className="text-center fw-bold text-dark small py-1">
                                                        {prod.totalCantidad} {prod.unidad}
                                                    </td>
                                                    <td colSpan={3} className="py-1"></td>
                                                    <td className="text-end fw-bold text-primary small py-1">
                                                        {formatearPrecio(prod.totalVenta)}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                            <tfoot className="table-light fw-bold">
                                <tr>
                                    <td colSpan={3} className="text-end py-2">
                                        Total General Comprobado ({auditoriaTrimestreModal?.nombre}):
                                    </td>
                                    <td className="text-center py-2 text-dark">
                                        {auditoriaTrimestreModal?.prendas || 0} prods
                                    </td>
                                    <td colSpan={3} className="py-2 text-end text-muted small">
                                        {auditoriaTrimestreModal?.pedidos || 0} pedidos auditados
                                    </td>
                                    <td className="text-end py-2 text-success fs-6">
                                        {formatearPrecio(auditoriaTrimestreModal?.ventas || 0)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </Modal.Body>
                <Modal.Footer className="bg-light border-top py-2">
                    <Button variant="secondary" size="sm" onClick={() => setAuditoriaTrimestreModal(null)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </LayoutApp>
    );
};
