import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useFuntions, usePreciosStore } from '../../hooks';
import { useTheme } from '../../context/ThemeContext';
import {
    SUB_CATEGORIAS_KITS_CONFIG,
    obtenerHistoricoKitsPorAnio
} from '../helpers/historicalOrdersHelper';

Chart.register(ChartDataLabels);

export const ChartKitsMultiAnual = ({
    oldOrders = [],
    pedidos = [],
    aniosDisponibles = [],
    filtrarPorEstadoPagado = null,
    filtroUsuario = 'GENERAL',
    historicoPrecalculado = null,
    listaPrecios: listaPreciosProp = null
}) => {
    const chartRef = useRef(null);
    const { formatearPrecio, number_format } = useFuntions();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Obtener lista de tarifas de fábrica desde Redux / MongoDB
    const reduxListaPrecios = useSelector(state => state.precios?.listaPrecios) || [];
    const listaPrecios = listaPreciosProp || reduxListaPrecios;
    const { startLoadingPrecios } = usePreciosStore();

    useEffect(() => {
        if ((!listaPrecios || listaPrecios.length === 0) && typeof startLoadingPrecios === 'function') {
            startLoadingPrecios();
        }
    }, [listaPrecios?.length]);

    // Estados interactivos
    const [metrica, setMetrica] = useState('ventas'); // 'ventas' ($) | 'unidades' (cantidades)
    const [tipoGrafico, setTipoGrafico] = useState('bar'); // 'bar' | 'line'
    const [verTabla, setVerTabla] = useState(false);

    // Calcular o usar datos precalculados con tarifas de vigencia dinámicas
    const historicoKits = useMemo(() => {
        if (historicoPrecalculado) return historicoPrecalculado;
        return obtenerHistoricoKitsPorAnio(
            oldOrders,
            pedidos,
            aniosDisponibles,
            filtrarPorEstadoPagado,
            filtroUsuario,
            listaPrecios
        );
    }, [oldOrders, pedidos, aniosDisponibles, filtrarPorEstadoPagado, filtroUsuario, historicoPrecalculado, listaPrecios]);

    const {
        anios,
        datosPorAnio,
        granTotalVenta,
        granTotalUnidades,
        maxVenta,
        acumuladoSubcategorias,
        liderSubcat,
        promedioVentaAnual
    } = historicoKits;

    // Colores y temas para Chart.js
    const textColor = isDark ? '#e0e0e0' : '#475569';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';

    // Construcción de datasets para Chart.js
    const chartData = useMemo(() => {
        if (!datosPorAnio || datosPorAnio.length === 0) {
            return { labels: [], datasets: [] };
        }

        const labels = datosPorAnio.map(d => [
            String(d.anio),
            formatearPrecio(d.totalVentaAnio)
        ]);

        if (tipoGrafico === 'bar') {
            // Gráfico de Barras Apiladas por Subcategoría
            const datasets = SUB_CATEGORIAS_KITS_CONFIG.map(sub => {
                const data = datosPorAnio.map(d => {
                    return metrica === 'ventas'
                        ? (d.subcatVentas[sub.id] || 0)
                        : (d.subcatUnidades[sub.id] || 0);
                });

                return {
                    label: sub.nombre,
                    data,
                    backgroundColor: sub.color,
                    borderColor: sub.color,
                    borderWidth: 1,
                    borderRadius: 4,
                    stack: 'kitsStack',
                };
            });

            return { labels, datasets };
        } else {
            // Gráfico de Líneas / Tendencia: Líneas de subcategorías + Línea de Total Categoría
            const datasets = SUB_CATEGORIAS_KITS_CONFIG.map(sub => {
                const data = datosPorAnio.map(d => {
                    return metrica === 'ventas'
                        ? (d.subcatVentas[sub.id] || 0)
                        : (d.subcatUnidades[sub.id] || 0);
                });

                return {
                    label: sub.shortName || sub.nombre,
                    data,
                    backgroundColor: sub.color,
                    borderColor: sub.color,
                    borderWidth: 2,
                    tension: 0.35,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    fill: false,
                };
            });

            // Agregar dataset de TOTAL de toda la categoría
            const totalData = datosPorAnio.map(d => {
                return metrica === 'ventas' ? d.totalVentaAnio : d.totalUnidadesAnio;
            });

            datasets.unshift({
                label: 'TOTAL CATEGORÍA KITS',
                data: totalData,
                backgroundColor: isDark ? '#38bdf8' : '#0f172a',
                borderColor: isDark ? '#38bdf8' : '#0f172a',
                borderWidth: 3,
                borderDash: [5, 5],
                tension: 0.3,
                pointRadius: 5,
                pointHoverRadius: 8,
                pointBackgroundColor: isDark ? '#38bdf8' : '#0f172a',
                fill: false,
            });

            return { labels, datasets };
        }
    }, [datosPorAnio, anios, metrica, tipoGrafico, isDark]);

    // Render del gráfico
    useEffect(() => {
        if (!chartRef.current || !chartData.labels || chartData.labels.length === 0) return;

        const ctx = chartRef.current.getContext('2d');

        if (chartRef.current.chartInstance) {
            chartRef.current.chartInstance.destroy();
        }

        const isBar = tipoGrafico === 'bar';

        chartRef.current.chartInstance = new Chart(ctx, {
            type: tipoGrafico,
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    datalabels: {
                        display: (context) => {
                            if (!isBar) return false;
                            const val = context.dataset.data[context.dataIndex];
                            if (!val || val === 0) return false;

                            // Solo mostrar etiqueta si representa una porción visible del año
                            const anioIndex = context.dataIndex;
                            const totalAnio = datosPorAnio[anioIndex]
                                ? (metrica === 'ventas' ? datosPorAnio[anioIndex].totalVentaAnio : datosPorAnio[anioIndex].totalUnidadesAnio)
                                : 0;
                            return totalAnio > 0 && (val / totalAnio) >= 0.12; // >=12% del total
                        },
                        color: '#ffffff',
                        font: {
                            weight: 'bold',
                            size: 11,
                        },
                        formatter: (value) => {
                            if (metrica === 'ventas') {
                                if (value >= 1000000) {
                                    return `$${(value / 1000000).toFixed(1)}M`;
                                }
                                return `$${Math.round(value / 1000)}k`;
                            }
                            return number_format(value);
                        }
                    },
                    tooltip: {
                        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#f8fafc',
                        bodyColor: '#f1f5f9',
                        borderColor: isDark ? '#334155' : '#cbd5e1',
                        borderWidth: 1,
                        padding: 12,
                        boxPadding: 6,
                        callbacks: {
                            title: (tooltipItems) => {
                                if (!tooltipItems || tooltipItems.length === 0) return '';
                                const dAnio = datosPorAnio[tooltipItems[0].dataIndex];
                                return `Año ${dAnio?.anio || ''} — Total Ventas Kits: ${formatearPrecio(dAnio?.totalVentaAnio || 0)}`;
                            },
                            label: (context) => {
                                const val = Number(context.raw || 0);
                                if (val === 0) return null;

                                const anioIndex = context.dataIndex;
                                const dAnio = datosPorAnio[anioIndex];
                                const totalAnio = dAnio
                                    ? (metrica === 'ventas' ? dAnio.totalVentaAnio : dAnio.totalUnidadesAnio)
                                    : 0;
                                const pct = totalAnio > 0 ? ((val / totalAnio) * 100).toFixed(1) : 0;

                                const formattedVal = metrica === 'ventas'
                                    ? formatearPrecio(val)
                                    : `${number_format(val)} kits/cirios`;

                                return `${context.dataset.label}: ${formattedVal} (${pct}%)`;
                            },
                            footer: (tooltipItems) => {
                                if (!tooltipItems || tooltipItems.length === 0) return '';
                                const anioIndex = tooltipItems[0].dataIndex;
                                const dAnio = datosPorAnio[anioIndex];
                                if (!dAnio) return '';

                                const totalStr = metrica === 'ventas'
                                    ? formatearPrecio(dAnio.totalVentaAnio)
                                    : `${number_format(dAnio.totalUnidadesAnio)} unidades`;

                                const yoyStr = dAnio.crecimientoYoY !== 0
                                    ? ` | YoY: ${dAnio.crecimientoYoY > 0 ? '+' : ''}${dAnio.crecimientoYoY.toFixed(1)}%`
                                    : '';

                                return `Total Categoría ${dAnio.anio}: ${totalStr}${yoyStr}`;
                            }
                        }
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            color: textColor,
                            usePointStyle: true,
                            pointStyle: isBar ? 'rectRounded' : 'circle',
                            padding: 15,
                            font: {
                                size: 12,
                                weight: '500'
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: isBar,
                        grid: {
                            color: gridColor,
                            drawBorder: false
                        },
                        ticks: {
                            color: textColor,
                            font: {
                                weight: 'bold',
                                size: 11
                            },
                            maxRotation: 0,
                            autoSkip: false
                        }
                    },
                    y: {
                        stacked: isBar,
                        grid: {
                            color: gridColor,
                            drawBorder: false
                        },
                        ticks: {
                            color: textColor,
                            callback: (value) => {
                                if (metrica === 'ventas') {
                                    if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
                                    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
                                    return `$${value}`;
                                }
                                return number_format(value);
                            }
                        }
                    }
                }
            }
        });

        return () => {
            if (chartRef.current?.chartInstance) {
                chartRef.current.chartInstance.destroy();
            }
        };
    }, [chartData, metrica, tipoGrafico, datosPorAnio, isDark]);

    return (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
            {/* Header del Card */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                <div>
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 rounded-pill small fw-bold">
                            <i className="fa-solid fa-boxes-packing me-1"></i> Categoría Completa
                        </span>
                        <span className="badge bg-warning-subtle text-dark border border-warning-subtle px-2.5 py-1 rounded-pill small fw-bold">
                            <i className="fa-solid fa-industry text-warning-emphasis me-1"></i> Precios de Fábrica (2025+) | <i className="fa-solid fa-receipt text-primary me-1"></i> Precios Reales de Pedidos (2017-2024)
                        </span>
                        {filtroUsuario !== 'GENERAL' && (
                            <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1 rounded-pill small">
                                Filtro: {filtroUsuario}
                            </span>
                        )}
                    </div>
                    <h5 className="fw-bolder text-dark mb-1">
                        <i className="fa-solid fa-chart-column text-primary me-2"></i>
                        Venta Histórica de Kits por Año (Toda la Categoría)
                    </h5>
                    <p className="text-muted small mb-0">
                        Consolidado integral año tras año de todas las líneas de kits: Comunión (Grande, Pequeño, Económico), Bautizo y Cirios.
                        <span className="d-block mt-1 text-secondary" style={{ fontSize: '0.78rem' }}>
                            <i className="fa-solid fa-circle-info text-primary me-1"></i>
                            <strong>Metodología de Precios:</strong> Los años <strong>2025 y 2026</strong> se calculan con los <strong>Precios de Fábrica</strong> (tarifas de producción vigentes en la base de datos según la fecha del pedido). Los años <strong>2017 a 2024</strong> se calculan con los <strong>Precios Reales Facturados en los Pedidos</strong> originales.
                        </span>
                    </p>
                </div>

                {/* Controles de Vista y Métrica */}
                <div className="d-flex flex-wrap align-items-center gap-2">
                    {/* Selector de Métrica */}
                    <div className="btn-group btn-group-sm shadow-xs rounded-pill border p-1 bg-light" role="group">
                        <button
                            type="button"
                            className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${metrica === 'ventas' ? 'btn-primary text-white shadow-sm' : 'btn-light text-secondary'}`}
                            onClick={() => setMetrica('ventas')}
                        >
                            <i className="fa-solid fa-dollar-sign me-1"></i> Ventas ($)
                        </button>
                        <button
                            type="button"
                            className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${metrica === 'unidades' ? 'btn-primary text-white shadow-sm' : 'btn-light text-secondary'}`}
                            onClick={() => setMetrica('unidades')}
                        >
                            <i className="fa-solid fa-cubes me-1"></i> Unidades
                        </button>
                    </div>

                    {/* Selector de Tipo de Gráfico */}
                    <div className="btn-group btn-group-sm shadow-xs rounded-pill border p-1 bg-light" role="group">
                        <button
                            type="button"
                            className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${tipoGrafico === 'bar' ? 'btn-dark text-white shadow-sm' : 'btn-light text-secondary'}`}
                            onClick={() => setTipoGrafico('bar')}
                            title="Barras Apiladas por Subcategoría"
                        >
                            <i className="fa-solid fa-chart-column me-1"></i> Apilado
                        </button>
                        <button
                            type="button"
                            className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${tipoGrafico === 'line' ? 'btn-dark text-white shadow-sm' : 'btn-light text-secondary'}`}
                            onClick={() => setTipoGrafico('line')}
                            title="Líneas de Tendencia"
                        >
                            <i className="fa-solid fa-chart-line me-1"></i> Tendencia
                        </button>
                    </div>

                    {/* Botón Ver Tabla */}
                    <button
                        type="button"
                        className={`btn btn-sm rounded-pill px-3 fw-semibold border d-flex align-items-center gap-1 ${verTabla ? 'btn-outline-primary active' : 'btn-outline-secondary'}`}
                        onClick={() => setVerTabla(prev => !prev)}
                    >
                        <i className={`fa-solid ${verTabla ? 'fa-table-cells-large' : 'fa-table'}`}></i>
                        <span>{verTabla ? 'Ocultar Tabla' : 'Ver Tabla'}</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards Resumen */}
            <div className="row g-3 mb-4">
                <div className="col-6 col-md-3">
                    <div className="p-3 bg-light rounded-3 border h-100">
                        <span className="small text-muted d-block mb-1">
                            <i className="fa-solid fa-sack-dollar text-success me-1"></i> Facturación Total Kits
                        </span>
                        <h5 className="fw-bold text-dark mb-0">{formatearPrecio(granTotalVenta)}</h5>
                        <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>
                            Precios Fábrica (2025+) | Pedidos (2017-2024)
                        </small>
                    </div>
                </div>

                <div className="col-6 col-md-3">
                    <div className="p-3 bg-light rounded-3 border h-100">
                        <span className="small text-muted d-block mb-1">
                            <i className="fa-solid fa-box-open text-primary me-1"></i> Kits y Cirios Producidos
                        </span>
                        <h5 className="fw-bold text-dark mb-0">{number_format(granTotalUnidades)}</h5>
                        <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                            Productos y unidades totales
                        </small>
                    </div>
                </div>

                <div className="col-6 col-md-3">
                    <div className="p-3 bg-light rounded-3 border h-100">
                        <span className="small text-muted d-block mb-1">
                            <i className="fa-solid fa-trophy text-warning me-1"></i> Año Récord en Kits
                        </span>
                        <h5 className="fw-bold text-dark mb-0">
                            {maxVenta.anio ? `Año ${maxVenta.anio}` : '-'}
                        </h5>
                        <small className="text-success fw-semibold" style={{ fontSize: '0.72rem' }}>
                            {maxVenta.total > 0 ? formatearPrecio(maxVenta.total) : ''}
                        </small>
                    </div>
                </div>

                <div className="col-6 col-md-3">
                    <div className="p-3 bg-light rounded-3 border h-100">
                        <span className="small text-muted d-block mb-1">
                            <i className="fa-solid fa-medal text-danger me-1"></i> Subcategoría Líder
                        </span>
                        <h6 className="fw-bold text-dark mb-0 text-truncate" title={liderSubcat.nombre}>
                            {liderSubcat.nombre}
                        </h6>
                        <small className="text-primary fw-semibold" style={{ fontSize: '0.72rem' }}>
                            {granTotalVenta > 0
                                ? `${((liderSubcat.total / granTotalVenta) * 100).toFixed(1)}% de la categoría`
                                : '-'}
                        </small>
                    </div>
                </div>
            </div>

            {/* Canvas del Gráfico */}
            <div style={{ position: 'relative', minHeight: 380, width: '100%' }}>
                <canvas ref={chartRef}></canvas>
            </div>

            {/* Totales en Ventas de Kits por Cada Año */}
            <div className="mt-3 pt-3 border-top">
                <div className="d-flex flex-wrap align-items-center gap-2 justify-content-center justify-content-md-start">
                    <span className="small fw-bold text-dark me-2 d-flex align-items-center gap-1">
                        <i className="fa-solid fa-tags text-primary"></i> Total Ventas Kits por Año:
                    </span>
                    {datosPorAnio.map(d => (
                        <div
                            key={d.anio}
                            className="badge bg-light text-dark border px-3 py-2 rounded-pill shadow-xs d-flex align-items-center gap-1.5"
                            style={{ fontSize: '0.78rem' }}
                        >
                            <span className="fw-bolder text-primary">{d.anio}:</span>
                            <span className="fw-bold">{formatearPrecio(d.totalVentaAnio)}</span>
                            <span className="text-muted" style={{ fontSize: '0.7rem' }}>({number_format(d.totalUnidadesAnio)} uds)</span>
                        </div>
                    ))}
                </div>
                <div className="text-muted small mt-2 text-center text-md-start" style={{ fontSize: '0.72rem' }}>
                    <i className="fa-solid fa-circle-info text-secondary me-1"></i>
                    *Nota: Los totales de <strong>2025 y 2026</strong> están calculados con <strong>Precios de Fábrica</strong> (tarifas de producción según fecha de pedido); los de <strong>2017 a 2024</strong> con <strong>Precios Reales Facturados en Pedidos</strong>.
                </div>
            </div>

            {/* Tabla Detallada Multianual (Desplegable) */}
            {verTabla && (
                <div className="mt-4 pt-3 border-top">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                        <h6 className="fw-bold text-dark mb-0">
                            <i className="fa-solid fa-table-list text-primary me-2"></i>
                            Matriz Detallada de Kits por Año
                        </h6>
                        <span className="small text-muted">
                            {metrica === 'ventas' 
                                ? 'Valores en Pesos ($): Precios de Fábrica (2025+) | Precios Reales de Pedidos (2017-2024)' 
                                : 'Unidades Físicas de Kits y Cirios'}
                        </span>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-sm table-hover table-bordered align-middle text-center mb-0">
                            <thead className="table-light small">
                                <tr>
                                    <th className="text-start ps-3">Año</th>
                                    <th>Kit Bautizo</th>
                                    <th>Kit Grande</th>
                                    <th>Kit Pequeño</th>
                                    <th>Kit Económico</th>
                                    <th>Cirio Bautizo</th>
                                    <th>Cirio Comunión</th>
                                    <th className="table-primary text-end pe-3">Total Kits ({metrica === 'ventas' ? '$' : 'Und'})</th>
                                    <th>Crecimiento YoY</th>
                                </tr>
                            </thead>
                            <tbody>
                                {datosPorAnio.map(row => (
                                    <tr key={row.anio}>
                                        <td className="fw-bold text-start ps-3">{row.anio}</td>
                                        <td>{metrica === 'ventas' ? formatearPrecio(row.subcatVentas.KB) : number_format(row.subcatUnidades.KB)}</td>
                                        <td>{metrica === 'ventas' ? formatearPrecio(row.subcatVentas.KCG) : number_format(row.subcatUnidades.KCG)}</td>
                                        <td>{metrica === 'ventas' ? formatearPrecio(row.subcatVentas.KCP) : number_format(row.subcatUnidades.KCP)}</td>
                                        <td>{metrica === 'ventas' ? formatearPrecio(row.subcatVentas.KCE) : number_format(row.subcatUnidades.KCE)}</td>
                                        <td>{metrica === 'ventas' ? formatearPrecio(row.subcatVentas.CB) : number_format(row.subcatUnidades.CB)}</td>
                                        <td>{metrica === 'ventas' ? formatearPrecio(row.subcatVentas.CC) : number_format(row.subcatUnidades.CC)}</td>
                                        <td className="table-primary fw-bold text-end pe-3">
                                            {metrica === 'ventas' ? formatearPrecio(row.totalVentaAnio) : number_format(row.totalUnidadesAnio)}
                                        </td>
                                        <td>
                                            {row.crecimientoYoY !== 0 ? (
                                                <span className={`badge rounded-pill ${row.crecimientoYoY > 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                                    <i className={`fa-solid ${row.crecimientoYoY > 0 ? 'fa-arrow-up' : 'fa-arrow-down'} me-1`}></i>
                                                    {Math.abs(row.crecimientoYoY).toFixed(1)}%
                                                </span>
                                            ) : (
                                                <span className="text-muted small">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="table-light fw-bold">
                                <tr>
                                    <td className="text-start ps-3">Gran Total</td>
                                    <td>{metrica === 'ventas' ? formatearPrecio(acumuladoSubcategorias.KCG.venta) : number_format(acumuladoSubcategorias.KCG.unidades)}</td>
                                    <td>{metrica === 'ventas' ? formatearPrecio(acumuladoSubcategorias.KCP.venta) : number_format(acumuladoSubcategorias.KCP.unidades)}</td>
                                    <td>{metrica === 'ventas' ? formatearPrecio(acumuladoSubcategorias.KCE.venta) : number_format(acumuladoSubcategorias.KCE.unidades)}</td>
                                    <td>{metrica === 'ventas' ? formatearPrecio(acumuladoSubcategorias.KB.venta) : number_format(acumuladoSubcategorias.KB.unidades)}</td>
                                    <td>{metrica === 'ventas' ? formatearPrecio(acumuladoSubcategorias.CC.venta) : number_format(acumuladoSubcategorias.CC.unidades)}</td>
                                    <td>{metrica === 'ventas' ? formatearPrecio(acumuladoSubcategorias.CB.venta) : number_format(acumuladoSubcategorias.CB.unidades)}</td>
                                    <td>{metrica === 'ventas' ? formatearPrecio(acumuladoSubcategorias.OTROS_KITS.venta) : number_format(acumuladoSubcategorias.OTROS_KITS.unidades)}</td>
                                    <td className="table-primary text-end pe-3">
                                        {metrica === 'ventas' ? formatearPrecio(granTotalVenta) : number_format(granTotalUnidades)}
                                    </td>
                                    <td>-</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
