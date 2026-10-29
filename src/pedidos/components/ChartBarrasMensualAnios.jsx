import React, { useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useFuntions } from '../../hooks';
import { useTheme } from '../../context/ThemeContext';
import {
    MONTH_LABELS,
    obtenerPedidosPorAnio,
    aplicarPreciosFabricaAKits,
    filtrarPedidosYGastosPorUsuario
} from '../helpers/historicalOrdersHelper';

Chart.register(ChartDataLabels);

// Paleta visual distintiva y elegante para los años
const PALETA_ANIOS = {
    actual: {
        bg: 'rgba(37, 99, 235, 0.85)',
        border: '#1d4ed8',
        badge: 'bg-primary text-white',
        text: '#2563eb'
    },
    top1: {
        bg: 'rgba(16, 185, 129, 0.85)',
        border: '#059669',
        badge: 'bg-success text-white',
        text: '#10b981'
    },
    top2: {
        bg: 'rgba(245, 158, 11, 0.85)',
        border: '#d97706',
        badge: 'bg-warning text-dark',
        text: '#d97706'
    },
    top3: {
        bg: 'rgba(139, 92, 246, 0.85)',
        border: '#7c3aed',
        badge: 'bg-purple text-white',
        text: '#8b5cf6'
    },
    otros: [
        { bg: 'rgba(6, 182, 212, 0.8)', border: '#0891b2', text: '#0891b2' },
        { bg: 'rgba(244, 63, 94, 0.8)', border: '#e11d48', text: '#e11d48' },
        { bg: 'rgba(100, 116, 139, 0.8)', border: '#475569', text: '#475569' },
        { bg: 'rgba(236, 72, 153, 0.8)', border: '#db2777', text: '#db2777' },
    ]
};

export const ChartBarrasMensualAnios = ({
    oldOrders = [],
    pedidos = [],
    aniosDisponibles = [],
    anioActual = '2026',
    filtroCategoria = 'KITS',
    filtroUsuario = 'GENERAL',
    filtrarPorEstadoPagado = null,
    listaPrecios = [],
    esLeonardo = false
}) => {
    const chartRef = useRef(null);
    const { formatearPrecio, number_format } = useFuntions();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Estados interactivos
    const [metrica, setMetrica] = useState('ventas'); // 'ventas' ($) | 'unidades' (uds)
    const [verTabla, setVerTabla] = useState(false);
    const [aniosSeleccionados, setAniosSeleccionados] = useState([]);

    // 1. Procesamiento de datos de todos los años disponibles
    const datosTodosLosAnios = useMemo(() => {
        const mapa = {};

        aniosDisponibles.forEach(yr => {
            const yrStr = String(yr);
            const raw = obtenerPedidosPorAnio(oldOrders, pedidos, yrStr);
            const filtrados = typeof filtrarPorEstadoPagado === 'function' ? filtrarPorEstadoPagado(raw) : raw;
            const conPrecios = aplicarPreciosFabricaAKits(filtrados, listaPrecios);
            const { pedidosFiltrados } = filtrarPedidosYGastosPorUsuario(conPrecios, [], filtroUsuario, esLeonardo, filtroCategoria);

            const ventasMensuales = Array(12).fill(0);
            const unidadesMensuales = Array(12).fill(0);

            pedidosFiltrados.forEach(p => {
                if (p.mes !== null && p.mes >= 0 && p.mes <= 11) {
                    ventasMensuales[p.mes] += (Number(p.total) || 0);
                    unidadesMensuales[p.mes] += (Number(p.cantidadPrendas) || 0);
                }
            });

            const totalVentas = ventasMensuales.reduce((a, b) => a + b, 0);
            const totalUnidades = unidadesMensuales.reduce((a, b) => a + b, 0);

            // Mes pico
            let mesPicoIdx = 0;
            let maxMesValor = 0;
            ventasMensuales.forEach((v, idx) => {
                if (v > maxMesValor) {
                    maxMesValor = v;
                    mesPicoIdx = idx;
                }
            });

            mapa[yrStr] = {
                anio: yrStr,
                ventasMensuales,
                unidadesMensuales,
                totalVentas,
                totalUnidades,
                mesPicoNombre: MONTH_LABELS[mesPicoIdx] || 'N/A',
                mesPicoValor: maxMesValor,
                pedidosCount: pedidosFiltrados.length
            };
        });

        return mapa;
    }, [aniosDisponibles, oldOrders, pedidos, filtrarPorEstadoPagado, listaPrecios, filtroUsuario, esLeonardo, filtroCategoria]);

    // 2. Determinar los 3 años de mayores ventas anteriores al año actual
    const top3AnterioresInfo = useMemo(() => {
        const strActual = String(anioActual);
        const anteriores = aniosDisponibles
            .map(String)
            .filter(y => y !== strActual && datosTodosLosAnios[y])
            .map(y => datosTodosLosAnios[y]);

        // Ordenar descendentemente por total de ventas
        anteriores.sort((a, b) => b.totalVentas - a.totalVentas);

        const top3 = anteriores.slice(0, 3);
        const top3Anios = top3.map(d => d.anio);

        return {
            top3,
            top3Anios
        };
    }, [aniosDisponibles, anioActual, datosTodosLosAnios]);

    // 3. Inicializar o sincronizar años seleccionados por defecto: Top 3 anteriores + Año actual
    useEffect(() => {
        const strActual = String(anioActual);
        const top3 = top3AnterioresInfo.top3Anios;
        const defaultAnios = [...top3, strActual];
        // Ordenar cronológicamente para que las barras se lean de izquierda a derecha en orden temporal
        defaultAnios.sort((a, b) => Number(a) - Number(b));
        setAniosSeleccionados(defaultAnios);
    }, [anioActual, top3AnterioresInfo.top3Anios]);

    // Función para alternar la selección de un año
    const toggleAnio = (yrStr) => {
        setAniosSeleccionados(prev => {
            if (prev.includes(yrStr)) {
                if (prev.length === 1) return prev; // Mantener al menos un año activo
                return prev.filter(y => y !== yrStr);
            } else {
                const next = [...prev, yrStr];
                next.sort((a, b) => Number(a) - Number(b));
                return next;
            }
        });
    };

    const restablecerTop3 = () => {
        const strActual = String(anioActual);
        const defaultAnios = [...top3AnterioresInfo.top3Anios, strActual];
        defaultAnios.sort((a, b) => Number(a) - Number(b));
        setAniosSeleccionados(defaultAnios);
    };

    // 4. Configurar datasets de Chart.js
    const chartData = useMemo(() => {
        const strActual = String(anioActual);
        const top3 = top3AnterioresInfo.top3Anios;

        const datasets = aniosSeleccionados.map((yrStr, index) => {
            const dataYr = datosTodosLosAnios[yrStr];
            if (!dataYr) return null;

            const isCurrent = yrStr === strActual;
            const topIndex = top3.indexOf(yrStr);

            let style = null;
            let tag = '';
            if (isCurrent) {
                style = PALETA_ANIOS.actual;
                tag = ' (Actual)';
            } else if (topIndex === 0) {
                style = PALETA_ANIOS.top1;
                tag = ' (Top 1)';
            } else if (topIndex === 1) {
                style = PALETA_ANIOS.top2;
                tag = ' (Top 2)';
            } else if (topIndex === 2) {
                style = PALETA_ANIOS.top3;
                tag = ' (Top 3)';
            } else {
                style = PALETA_ANIOS.otros[index % PALETA_ANIOS.otros.length];
            }

            const dataPoints = metrica === 'ventas' ? dataYr.ventasMensuales : dataYr.unidadesMensuales;
            const totalSum = metrica === 'ventas' ? dataYr.totalVentas : dataYr.totalUnidades;
            const totalStr = metrica === 'ventas' ? formatearPrecio(totalSum) : `${number_format(totalSum)} uds`;

            return {
                label: `Año ${yrStr}${tag}: ${totalStr}`,
                data: dataPoints,
                backgroundColor: style.bg,
                borderColor: style.border,
                borderWidth: isCurrent ? 2 : 1,
                borderRadius: 5,
                borderSkipped: false,
                isCurrent,
                yrStr,
                tag
            };
        }).filter(Boolean);

        return {
            labels: MONTH_LABELS,
            datasets
        };
    }, [aniosSeleccionados, anioActual, top3AnterioresInfo.top3Anios, datosTodosLosAnios, metrica, formatearPrecio, number_format]);

    // 5. Renderizar o actualizar gráfico con Chart.js
    useEffect(() => {
        if (!chartRef.current || !chartData.labels || chartData.datasets.length === 0) return;

        const ctx = chartRef.current.getContext('2d');
        if (chartRef.current.chartInstance) {
            chartRef.current.chartInstance.destroy();
        }

        const textColor = isDark ? '#e2e8f0' : '#475569';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';

        chartRef.current.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                categoryPercentage: 0.85,
                barPercentage: 0.9,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    x: {
                        grid: {
                            color: gridColor,
                            drawBorder: false,
                        },
                        ticks: {
                            color: textColor,
                            font: {
                                size: 12,
                                weight: '600',
                            },
                        },
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: gridColor,
                            drawBorder: false,
                        },
                        ticks: {
                            color: textColor,
                            font: {
                                size: 11,
                            },
                            callback: (val) => {
                                if (metrica === 'ventas') {
                                    if (val >= 1000000) return `$ ${(val / 1000000).toFixed(0)}M`;
                                    if (val >= 1000) return `$ ${(val / 1000).toFixed(0)}k`;
                                    return `$ ${val}`;
                                }
                                return number_format(val);
                            },
                        },
                    },
                },
                plugins: {
                    datalabels: {
                        display: false // Mantener limpio para barras agrupadas de múltiples años
                    },
                    legend: {
                        position: 'top',
                        align: 'end',
                        labels: {
                            color: textColor,
                            boxWidth: 14,
                            boxHeight: 14,
                            usePointStyle: true,
                            pointStyle: 'rectRounded',
                            font: {
                                size: 12,
                                weight: '600'
                            },
                            padding: 14
                        }
                    },
                    tooltip: {
                        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
                        titleColor: isDark ? '#f8fafc' : '#0f172a',
                        bodyColor: isDark ? '#cbd5e1' : '#334155',
                        borderColor: isDark ? '#334155' : '#e2e8f0',
                        borderWidth: 1,
                        padding: 12,
                        boxPadding: 6,
                        usePointStyle: true,
                        callbacks: {
                            title: (items) => {
                                if (!items || items.length === 0) return '';
                                return `Mes de ${items[0].label}`;
                            },
                            label: (context) => {
                                const val = context.parsed.y || 0;
                                const ds = context.dataset;
                                const valFormatted = metrica === 'ventas' ? formatearPrecio(val) : `${number_format(val)} uds`;
                                return ` ${ds.label.split(':')[0]}: ${valFormatted}`;
                            }
                        }
                    }
                }
            }
        });

        return () => {
            if (chartRef.current && chartRef.current.chartInstance) {
                chartRef.current.chartInstance.destroy();
            }
        };
    }, [chartData, isDark, metrica, formatearPrecio, number_format]);

    // Resumen descriptivo de la categoría
    const textoCategoria = useMemo(() => {
        if (filtroCategoria === 'KITS') {
            return {
                titulo: 'Categoría KITS a Precios de Fábrica',
                detalle: 'Exclusivamente Kits de Bautizo, Comunión y Cirios valorados con tarifas vigentes de fábrica (sin Guantes ni Otros).',
                badgeColor: 'bg-primary-subtle text-primary border border-primary-subtle',
                icon: 'fa-boxes-stacked'
            };
        }
        if (filtroCategoria === 'GUANTES') {
            return {
                titulo: 'Categoría GUANTES',
                detalle: 'Exclusivamente Guantes (Blancos, Negros, Mitón, Especiales) a precios de venta.',
                badgeColor: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle',
                icon: 'fa-mitten'
            };
        }
        if (filtroCategoria === 'OTROS') {
            return {
                titulo: 'Categoría OTROS / ACCESORIOS',
                detalle: 'Exclusivamente Cajas, Libros, Cintas y complementos.',
                badgeColor: 'bg-info-subtle text-info-emphasis border border-info-subtle',
                icon: 'fa-tags'
            };
        }
        return {
            titulo: 'TODAS LAS CATEGORÍAS (Consolidado)',
            detalle: 'Kits a precio de fábrica + Guantes y Otros a precios reales de venta.',
            badgeColor: 'bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle',
            icon: 'fa-layer-group'
        };
    }, [filtroCategoria]);

    const infoActual = datosTodosLosAnios[String(anioActual)];
    const top1Info = top3AnterioresInfo.top3[0];
    const top2Info = top3AnterioresInfo.top3[1];
    const top3Info = top3AnterioresInfo.top3[2];

    return (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
            {/* Cabecera y Título */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                <div>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <h5 className="fw-bolder text-dark mb-0 d-flex align-items-center gap-2">
                            <i className="fa-solid fa-chart-column text-primary"></i>
                            <span>Comparativa Mensual de Ventas por Años (Eje X por Meses)</span>
                        </h5>
                        <span className={`badge ${textoCategoria.badgeColor} small py-1 px-2 fw-semibold`}>
                            <i className={`fa-solid ${textoCategoria.icon} me-1`}></i>
                            {textoCategoria.titulo}
                        </span>
                    </div>
                    <p className="text-muted small mb-0 mt-1">
                        {textoCategoria.detalle} Mostrando el año actual (<strong>{anioActual}</strong>) comparado mes a mes contra los <strong>3 años de mayores ventas históricas anteriores</strong>.
                    </p>
                </div>

                {/* Controles de Métrica y Tabla */}
                <div className="d-flex align-items-center gap-2 flex-wrap">
                    <div className="btn-group btn-group-sm rounded-3 shadow-xs" role="group">
                        <button
                            type="button"
                            className={`btn fw-semibold px-3 ${metrica === 'ventas' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => setMetrica('ventas')}
                        >
                            <i className="fa-solid fa-dollar-sign me-1"></i>
                            Ventas ($)
                        </button>
                        <button
                            type="button"
                            className={`btn fw-semibold px-3 ${metrica === 'unidades' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => setMetrica('unidades')}
                        >
                            <i className="fa-solid fa-shirt me-1"></i>
                            Unidades (Uds)
                        </button>
                    </div>

                    <button
                        type="button"
                        className={`btn btn-sm rounded-3 fw-semibold d-flex align-items-center gap-1 ${verTabla ? 'btn-dark text-white' : 'btn-outline-secondary'}`}
                        onClick={() => setVerTabla(!verTabla)}
                    >
                        <i className="fa-solid fa-table me-1"></i>
                        {verTabla ? 'Ocultar Datos' : 'Ver Tabla'}
                    </button>
                </div>
            </div>

            {/* Tarjetas KPI de los Años Comparados (Año Actual + Top 3 Históricos) */}
            <div className="row g-2 mb-3">
                {/* Año Actual */}
                {infoActual && (
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="p-3 rounded-4 border border-2 border-primary bg-primary bg-opacity-10 h-100 position-relative">
                            <div className="d-flex justify-content-between align-items-start mb-1">
                                <span className="badge bg-primary text-white fw-bold">
                                    Año Actual ({anioActual})
                                </span>
                                <span className="small text-muted">Mes pico: <strong>{infoActual.mesPicoNombre}</strong></span>
                            </div>
                            <h4 className="fw-bolder text-primary mb-0 mt-2">
                                {metrica === 'ventas' ? formatearPrecio(infoActual.totalVentas) : `${number_format(infoActual.totalUnidades)} uds`}
                            </h4>
                            <small className="text-muted d-block" style={{ fontSize: '0.74rem' }}>
                                Pico mensual: {metrica === 'ventas' ? formatearPrecio(infoActual.mesPicoValor) : `${number_format(infoActual.mesPicoValor)} uds`}
                            </small>
                        </div>
                    </div>
                )}

                {/* Top 1 Histórico */}
                {top1Info && (
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="p-3 rounded-4 border bg-white h-100 shadow-xs border-start border-4 border-success">
                            <div className="d-flex justify-content-between align-items-start mb-1">
                                <span className="badge bg-success-subtle text-success border border-success-subtle fw-bold">
                                    Top 1 Histórico: {top1Info.anio}
                                </span>
                                <span className="small text-muted">Mes pico: <strong>{top1Info.mesPicoNombre}</strong></span>
                            </div>
                            <h4 className="fw-bolder text-dark mb-0 mt-2">
                                {metrica === 'ventas' ? formatearPrecio(top1Info.totalVentas) : `${number_format(top1Info.totalUnidades)} uds`}
                            </h4>
                            <small className="text-muted d-block" style={{ fontSize: '0.74rem' }}>
                                Pico mensual: {metrica === 'ventas' ? formatearPrecio(top1Info.mesPicoValor) : `${number_format(top1Info.mesPicoValor)} uds`}
                            </small>
                        </div>
                    </div>
                )}

                {/* Top 2 Histórico */}
                {top2Info && (
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="p-3 rounded-4 border bg-white h-100 shadow-xs border-start border-4 border-warning">
                            <div className="d-flex justify-content-between align-items-start mb-1">
                                <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle fw-bold">
                                    Top 2 Histórico: {top2Info.anio}
                                </span>
                                <span className="small text-muted">Mes pico: <strong>{top2Info.mesPicoNombre}</strong></span>
                            </div>
                            <h4 className="fw-bolder text-dark mb-0 mt-2">
                                {metrica === 'ventas' ? formatearPrecio(top2Info.totalVentas) : `${number_format(top2Info.totalUnidades)} uds`}
                            </h4>
                            <small className="text-muted d-block" style={{ fontSize: '0.74rem' }}>
                                Pico mensual: {metrica === 'ventas' ? formatearPrecio(top2Info.mesPicoValor) : `${number_format(top2Info.mesPicoValor)} uds`}
                            </small>
                        </div>
                    </div>
                )}

                {/* Top 3 Histórico */}
                {top3Info && (
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="p-3 rounded-4 border bg-white h-100 shadow-xs border-start border-4" style={{ borderLeftColor: '#8b5cf6 !important' }}>
                            <div className="d-flex justify-content-between align-items-start mb-1">
                                <span className="badge border fw-bold" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#7c3aed', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
                                    Top 3 Histórico: {top3Info.anio}
                                </span>
                                <span className="small text-muted">Mes pico: <strong>{top3Info.mesPicoNombre}</strong></span>
                            </div>
                            <h4 className="fw-bolder text-dark mb-0 mt-2">
                                {metrica === 'ventas' ? formatearPrecio(top3Info.totalVentas) : `${number_format(top3Info.totalUnidades)} uds`}
                            </h4>
                            <small className="text-muted d-block" style={{ fontSize: '0.74rem' }}>
                                Pico mensual: {metrica === 'ventas' ? formatearPrecio(top3Info.mesPicoValor) : `${number_format(top3Info.mesPicoValor)} uds`}
                            </small>
                        </div>
                    </div>
                )}
            </div>

            {/* Barra de Filtro de Años (Pills Interactivas) */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 p-2 px-3 rounded-3 bg-light border mb-3">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="small text-muted fw-bold">Años visibles en la gráfica:</span>
                    {aniosDisponibles.map(yr => {
                        const yrStr = String(yr);
                        const isSelected = aniosSeleccionados.includes(yrStr);
                        const isCurrent = yrStr === String(anioActual);
                        const topIdx = top3AnterioresInfo.top3Anios.indexOf(yrStr);

                        return (
                            <button
                                key={yrStr}
                                type="button"
                                className={`btn btn-xs rounded-pill px-3 py-1 fw-semibold transition-all ${
                                    isSelected
                                        ? isCurrent
                                            ? 'btn-primary shadow-xs'
                                            : topIdx === 0
                                                ? 'btn-success text-white'
                                                : topIdx === 1
                                                    ? 'btn-warning text-dark'
                                                    : topIdx === 2
                                                        ? 'btn-info text-white'
                                                        : 'btn-dark'
                                        : 'btn-outline-secondary'
                                }`}
                                onClick={() => toggleAnio(yrStr)}
                                style={{ fontSize: '0.78rem' }}
                            >
                                {isCurrent && <i className="fa-solid fa-star me-1 text-warning"></i>}
                                {yrStr}
                                {topIdx === 0 && <span className="badge bg-white text-success ms-1 p-0 px-1">Top 1</span>}
                                {topIdx === 1 && <span className="badge bg-white text-dark ms-1 p-0 px-1">Top 2</span>}
                                {topIdx === 2 && <span className="badge bg-white text-purple ms-1 p-0 px-1">Top 3</span>}
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    className="btn btn-sm btn-link text-decoration-none text-primary p-0 fw-semibold"
                    onClick={restablecerTop3}
                    title="Restablecer selección a los 3 años de mayor venta + Año Actual"
                >
                    <i className="fa-solid fa-rotate-left me-1"></i>
                    Restablecer a Top 3 + Actual
                </button>
            </div>

            {/* Contenedor del Gráfico de Barras */}
            <div style={{ position: 'relative', height: '420px', width: '100%' }}>
                <canvas ref={chartRef}></canvas>
            </div>

            {/* Tabla Detallada Mes a Mes (Colapsable) */}
            {verTabla && (
                <div className="mt-4 pt-3 border-top">
                    <h6 className="fw-bold text-dark mb-2">
                        <i className="fa-solid fa-table-list text-primary me-2"></i>
                        Detalle Mes a Mes ({metrica === 'ventas' ? 'Ventas en $' : 'Unidades en Uds'})
                    </h6>
                    <div className="table-responsive rounded-3 border">
                        <table className="table table-sm table-hover align-middle mb-0 text-center" style={{ fontSize: '0.82rem' }}>
                            <thead className="table-light">
                                <tr>
                                    <th className="text-start ps-3">Mes</th>
                                    {aniosSeleccionados.map(yrStr => {
                                        const isCurrent = yrStr === String(anioActual);
                                        return (
                                            <th key={yrStr} className={isCurrent ? 'bg-primary-subtle text-primary fw-bold' : ''}>
                                                {yrStr} {isCurrent && '(Actual)'}
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {MONTH_LABELS.map((mesNombre, mIdx) => (
                                    <tr key={mesNombre}>
                                        <td className="text-start ps-3 fw-bold text-muted">{mesNombre}</td>
                                        {aniosSeleccionados.map(yrStr => {
                                            const dataYr = datosTodosLosAnios[yrStr];
                                            const val = metrica === 'ventas' ? (dataYr?.ventasMensuales[mIdx] || 0) : (dataYr?.unidadesMensuales[mIdx] || 0);
                                            const isCurrent = yrStr === String(anioActual);
                                            const isPico = val > 0 && val === dataYr?.mesPicoValor && metrica === 'ventas';

                                            return (
                                                <td key={yrStr} className={isCurrent ? 'bg-primary bg-opacity-10 fw-semibold' : ''}>
                                                    {metrica === 'ventas' ? formatearPrecio(val) : number_format(val)}
                                                    {isPico && <span className="badge bg-warning text-dark ms-1" style={{ fontSize: '0.62rem' }}>Pico</span>}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="table-light fw-bold">
                                <tr>
                                    <td className="text-start ps-3">TOTAL ANUAL</td>
                                    {aniosSeleccionados.map(yrStr => {
                                        const dataYr = datosTodosLosAnios[yrStr];
                                        const total = metrica === 'ventas' ? (dataYr?.totalVentas || 0) : (dataYr?.totalUnidades || 0);
                                        const isCurrent = yrStr === String(anioActual);
                                        return (
                                            <td key={yrStr} className={isCurrent ? 'bg-primary text-white' : 'text-primary'}>
                                                {metrica === 'ventas' ? formatearPrecio(total) : `${number_format(total)} uds`}
                                            </td>
                                        );
                                    })}
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
