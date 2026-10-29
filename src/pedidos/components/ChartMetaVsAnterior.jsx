import React, { useMemo, useState } from "react";
import { useFuntions } from "../../hooks";
import {
    MONTH_LABELS,
    esCategoriaKits,
    esCategoriaGuantes,
    clasificarItemKit,
    obtenerSubcategoriaGuante,
    formatearTituloProducto,
} from "../helpers/historicalOrdersHelper";

const KITS_CONFIG = [
    { id: "KCG",  nombre: "Kit Com. Grande",    color: "#3b82f6", icon: "fa-box"  },
    { id: "KCP",  nombre: "Kit Com. Pequeño",   color: "#60a5fa", icon: "fa-box"  },
    { id: "KCE",  nombre: "Kit Com. Económico", color: "#93c5fd", icon: "fa-box"  },
    { id: "KB",   nombre: "Kit Bautizo",         color: "#10b981", icon: "fa-baby" },
    { id: "CC",   nombre: "Cirio Comunión",      color: "#f59e0b", icon: "fa-fire" },
    { id: "CB",   nombre: "Cirio Bautizo",       color: "#fbbf24", icon: "fa-fire" },
    { id: "CCON", nombre: "Cirio Confirmación",  color: "#f97316", icon: "fa-fire" },
];

const GUANTES_CONFIG = [
    { id: "G_BLANCOS",  nombre: "Guantes Blancos",  color: "#8b5cf6", icon: "fa-hand" },
    { id: "G_MITON",    nombre: "Guantes Mitón",    color: "#a855f7", icon: "fa-hand" },
    { id: "G_NEGROS",   nombre: "Guantes Negros",   color: "#475569", icon: "fa-hand" },
    { id: "G_ESPECIAL", nombre: "Guantes Especial", color: "#7c3aed", icon: "fa-hand" },
];

const GRUPOS = [
    { id: "Kits",    label: "Kits",    icon: "fa-boxes-packing", config: KITS_CONFIG    },
    { id: "Guantes", label: "Guantes", icon: "fa-hand",          config: GUANTES_CONFIG },
    { id: "Otros",   label: "Otros",   icon: "fa-tags",          config: null           },
];

const OTROS_PALETTE = [
    "#ec4899","#14b8a6","#f97316","#06b6d4",
    "#84cc16","#64748b","#d946ef","#0ea5e9","#a3e635","#fb923c",
];

/** Extrae unidades por producto de una lista de pedidos ya filtrados por mes (si aplica) */
function extraerUnidades(pedidos = []) {
    const map = {};
    pedidos.forEach(ord => {
        (ord.items || []).forEach(item => {
            const cant = Number(item.cantidad || 0);
            if (cant <= 0) return;

            // Prioridad 1: usar tipoKit ya estampado por aplicarPreciosFabricaAKits
            const tipoKitPrecalculado = item.tipoKit || null;

            const esGuante = esCategoriaGuantes(item.categoriaId, item.codigo, item.producto);
            const esKit = tipoKitPrecalculado ||
                esCategoriaKits(item.categoriaId, item.codigo) ||
                ["KCG","KCP","KCE","KB","CC","CB","CCON","K"].includes(String(item.categoriaId || "").toUpperCase()) ||
                String(item.producto || "").toLowerCase().includes("kit") ||
                String(item.producto || "").toLowerCase().includes("cirio");

            let id, nombre, grupo;
            if (!esGuante && esKit) {
                // Usar tipoKit precalculado o recalcularlo como fallback
                const tipoKit = tipoKitPrecalculado || clasificarItemKit(item);
                if (!tipoKit) return;
                const cfg = KITS_CONFIG.find(k => k.id === tipoKit);
                id = tipoKit; nombre = cfg?.nombre || ("Kit " + tipoKit); grupo = "Kits";
            } else if (esGuante) {
                const gInfo = obtenerSubcategoriaGuante(item.producto, item.subcategoria, item.codigo);
                id = gInfo.id || "GUANTES"; nombre = gInfo.nombre || "Guantes"; grupo = "Guantes";
            } else {
                const clean = item.producto || item.subcategoria || "Accesorio";
                const slug  = clean.toUpperCase().replace(/[^A-Z0-9]/g, "_").replace(/_+/g, "_").slice(0, 25);
                id = "OTR_" + slug; nombre = formatearTituloProducto(clean); grupo = "Otros";
            }
            if (!map[id]) map[id] = { id, nombre, grupo, unidades: 0 };
            map[id].unidades += cant;
        });
    });
    return map;
}

function getBarColor(pct, superado, sinMeta) {
    if (sinMeta)   return "#94a3b8";
    if (superado)  return "#10b981";
    if (pct >= 75) return "#3b82f6";
    if (pct >= 50) return "#f59e0b";
    return "#ef4444";
}

function getBadgeCls(pct, superado, sinMeta) {
    if (sinMeta)   return "bg-secondary-subtle text-secondary";
    if (superado)  return "bg-success-subtle text-success";
    if (pct >= 75) return "bg-primary-subtle text-primary";
    if (pct >= 50) return "bg-warning-subtle text-warning";
    return "bg-danger-subtle text-danger";
}

export const ChartMetaVsAnterior = ({
    pedidosAnioActual   = [],
    pedidosAnioAnterior = [],
    anioActual          = String(new Date().getFullYear()),
    anioAnterior        = String(new Date().getFullYear() - 1),
    filtroUsuario       = "GENERAL",
}) => {
    const { number_format } = useFuntions();

    // ── Estado de controles ──────────────────────────────────────────
    const [grupoActivo,   setGrupoActivo]   = useState("Kits");
    const [modoVista,     setModoVista]     = useState("anual");   // "anual" | "mensual"
    const [mesSelec,      setMesSelec]      = useState(new Date().getMonth()); // 0-indexed
    const [expandirOtros, setExpandirOtros] = useState(false);

    // ── Filtrar pedidos por mes si modo mensual ──────────────────────
    const pedidosActualFiltrados = useMemo(() => {
        if (modoVista === "anual") return pedidosAnioActual;
        return pedidosAnioActual.filter(o => o.mes === mesSelec);
    }, [pedidosAnioActual, modoVista, mesSelec]);

    const pedidosAnteriorFiltrados = useMemo(() => {
        if (modoVista === "anual") return pedidosAnioAnterior;
        return pedidosAnioAnterior.filter(o => o.mes === mesSelec);
    }, [pedidosAnioAnterior, modoVista, mesSelec]);

    // ── Calcular mapas de unidades ───────────────────────────────────
    const mapaActual   = useMemo(() => extraerUnidades(pedidosActualFiltrados),   [pedidosActualFiltrados]);
    const mapaAnterior = useMemo(() => extraerUnidades(pedidosAnteriorFiltrados), [pedidosAnteriorFiltrados]);

    // ── Etiquetas de periodo ─────────────────────────────────────────
    const labelActual   = modoVista === "mensual"
        ? `${MONTH_LABELS[mesSelec]} ${anioActual}`
        : anioActual;
    const labelAnterior = modoVista === "mensual"
        ? `${MONTH_LABELS[mesSelec]} ${anioAnterior}`
        : anioAnterior;

    // ── Construir filas por grupo ────────────────────────────────────
    const filas = useMemo(() => {
        if (grupoActivo === "Otros") {
            const ids = new Set([
                ...Object.keys(mapaActual).filter(k   => mapaActual[k].grupo   === "Otros"),
                ...Object.keys(mapaAnterior).filter(k => mapaAnterior[k].grupo === "Otros"),
            ]);
            return Array.from(ids).map((id, idx) => {
                const actual   = mapaActual[id]?.unidades   || 0;
                const anterior = mapaAnterior[id]?.unidades || 0;
                const nombre   = mapaActual[id]?.nombre || mapaAnterior[id]?.nombre || id;
                const pct      = anterior > 0 ? Math.min((actual / anterior) * 100, 100) : (actual > 0 ? 100 : 0);
                return { id, nombre, actual, anterior, pct,
                    faltan:  Math.max(anterior - actual, 0),
                    color:   OTROS_PALETTE[idx % OTROS_PALETTE.length],
                    icon:    "fa-tag",
                    superado: actual >= anterior && anterior > 0,
                    sinMeta:  anterior === 0 };
            }).filter(f => f.actual > 0 || f.anterior > 0)
              .sort((a, b) => b.anterior - a.anterior);
        }
        const cfg = GRUPOS.find(g => g.id === grupoActivo)?.config || [];
        return cfg.map(item => {
            const actual   = mapaActual[item.id]?.unidades   || 0;
            const anterior = mapaAnterior[item.id]?.unidades || 0;
            const pct      = anterior > 0 ? Math.min((actual / anterior) * 100, 100) : (actual > 0 ? 100 : 0);
            return { ...item, actual, anterior, pct,
                faltan:  Math.max(anterior - actual, 0),
                superado: actual >= anterior && anterior > 0,
                sinMeta:  anterior === 0 };
        });
    }, [grupoActivo, mapaActual, mapaAnterior]);

    // ── KPIs globales ────────────────────────────────────────────────
    const kpis = useMemo(() => {
        const totalActual   = filas.reduce((s, f) => s + f.actual,   0);
        const totalAnterior = filas.reduce((s, f) => s + f.anterior, 0);
        const pctTotal      = totalAnterior > 0 ? Math.min((totalActual / totalAnterior) * 100, 100) : 0;
        return { totalActual, totalAnterior, pctTotal,
            faltan:    Math.max(totalAnterior - totalActual, 0),
            superados: filas.filter(f => f.superado).length };
    }, [filas]);

    const filasVisibles = grupoActivo === "Otros" && !expandirOtros ? filas.slice(0, 6) : filas;

    // ────────────────────────────────────────────────────────────────
    return (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">

            {/* ── Header ── */}
            <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3">
                <div>
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                        <span className="badge bg-warning-subtle text-dark border border-warning-subtle px-2 py-1 rounded-pill small fw-bold">
                            <i className="fa-solid fa-bullseye me-1 text-warning-emphasis"></i>
                            Meta: Igualar {labelAnterior}
                        </span>
                        <span className="badge rounded-pill px-2.5 py-1 small fw-bold shadow-xs border" style={{ backgroundColor: filtroUsuario === 'GENERAL' ? '#1e293b' : '#2563eb', color: '#fff' }}>
                            <i className="fa-solid fa-users-gear me-1"></i>
                            {filtroUsuario === 'GENERAL' ? 'Consolidado General' : filtroUsuario === 'LEONARDO' ? 'Leonardo Gómez' : 'Oscar Gómez'}
                        </span>
                        <span className="badge bg-light text-dark border px-2.5 py-1 rounded-pill small fw-semibold">
                            <i className="fa-regular fa-calendar me-1 text-primary"></i>
                            {anioActual} vs {anioAnterior}
                        </span>
                    </div>
                    <h5 className="fw-bolder text-dark mb-1">
                        <i className="fa-solid fa-chart-gantt text-warning me-2"></i>
                        Progreso por Producto vs Año Anterior
                    </h5>
                    <p className="text-muted small mb-0">
                        Cuántas unidades lleva <strong>{labelActual}</strong> frente a <strong>{labelAnterior}</strong>.
                        <span className="ms-1 text-secondary" style={{ fontSize: "0.78rem" }}>
                            <i className="fa-solid fa-circle-info text-primary me-1"></i>
                            La barra llega al 100% cuando supera la cantidad de referencia.
                        </span>
                    </p>
                </div>

                {/* Controles: Vista + Grupo */}
                <div className="d-flex flex-column align-items-end gap-2">

                    {/* Toggle Anual / Mensual */}
                    <div className="btn-group btn-group-sm rounded-pill border p-1 bg-light" role="group">
                        <button type="button"
                            className={`btn btn-sm rounded-pill px-3 fw-semibold ${modoVista === "anual" ? "btn-dark text-white shadow-sm" : "btn-light text-secondary"}`}
                            onClick={() => setModoVista("anual")}>
                            <i className="fa-solid fa-calendar me-1"></i>Anual
                        </button>
                        <button type="button"
                            className={`btn btn-sm rounded-pill px-3 fw-semibold ${modoVista === "mensual" ? "btn-dark text-white shadow-sm" : "btn-light text-secondary"}`}
                            onClick={() => setModoVista("mensual")}>
                            <i className="fa-solid fa-calendar-days me-1"></i>Mensual
                        </button>
                    </div>

                    {/* Selector de Mes (solo en modo mensual) */}
                    {modoVista === "mensual" && (
                        <div className="d-flex align-items-center gap-2">
                            <i className="fa-solid fa-chevron-left text-muted" role="button"
                                onClick={() => setMesSelec(m => (m - 1 + 12) % 12)}
                                style={{ cursor: "pointer", fontSize: "0.8rem" }}>
                            </i>
                            <select
                                className="form-select form-select-sm rounded-pill border-0 shadow-sm fw-semibold"
                                style={{ minWidth: 140, background: "#f8fafc" }}
                                value={mesSelec}
                                onChange={e => setMesSelec(Number(e.target.value))}>
                                {MONTH_LABELS.map((m, i) => (
                                    <option key={i} value={i}>{m} — {anioActual} vs {anioAnterior}</option>
                                ))}
                            </select>
                            <i className="fa-solid fa-chevron-right text-muted" role="button"
                                onClick={() => setMesSelec(m => (m + 1) % 12)}
                                style={{ cursor: "pointer", fontSize: "0.8rem" }}>
                            </i>
                        </div>
                    )}

                    {/* Filtro de Grupo */}
                    <div className="btn-group btn-group-sm rounded-pill border p-1 bg-light" role="group">
                        {GRUPOS.map(g => (
                            <button key={g.id} type="button"
                                className={`btn btn-sm rounded-pill px-3 fw-semibold ${grupoActivo === g.id ? "btn-primary text-white shadow-sm" : "btn-light text-secondary"}`}
                                onClick={() => { setGrupoActivo(g.id); setExpandirOtros(false); }}>
                                <i className={`fa-solid ${g.icon} me-1`}></i>{g.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── KPI Cards ── */}
            <div className="row g-2 mb-4">
                {[
                    { bg: "#f0f9ff",
                      icon: "fa-circle-check text-success",
                      label: "Vendido " + labelActual,
                      valor: number_format(kpis.totalActual),
                      sub: "unidades totales" },
                    { bg: "#fefce8",
                      icon: "fa-flag-checkered text-warning",
                      label: "Meta (" + labelAnterior + ")",
                      valor: number_format(kpis.totalAnterior),
                      sub: "unidades referencia" },
                    { bg: kpis.pctTotal >= 75 ? "#f0fdf4" : "#fef2f2",
                      icon: "fa-percent " + (kpis.pctTotal >= 75 ? "text-success" : "text-danger"),
                      label: "Progreso Global",
                      valor: kpis.pctTotal.toFixed(1) + "%",
                      valClass: kpis.pctTotal >= 75 ? "text-success" : "text-danger",
                      sub: "del periodo anterior" },
                    { bg: kpis.faltan === 0 ? "#f0fdf4" : "#fff7ed",
                      icon: kpis.faltan === 0 ? "fa-trophy text-success" : "fa-hourglass-half text-warning",
                      label: kpis.faltan === 0 ? "¡Meta alcanzada!" : "Faltan",
                      valor: kpis.faltan === 0 ? kpis.superados + " productos" : number_format(kpis.faltan),
                      valClass: kpis.faltan === 0 ? "text-success" : "text-warning",
                      sub: kpis.faltan === 0 ? "productos superados" : "unidades para la meta" },
                ].map((k, i) => (
                    <div key={i} className="col-6 col-md-3">
                        <div className="p-3 rounded-3 border h-100" style={{ background: k.bg }}>
                            <span className="small text-muted d-block mb-1">
                                <i className={`fa-solid ${k.icon} me-1`}></i>{k.label}
                            </span>
                            <h5 className={`fw-bold mb-0 ${k.valClass || "text-dark"}`}>{k.valor}</h5>
                            <small className="text-muted" style={{ fontSize: "0.72rem" }}>{k.sub}</small>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Chip de periodo activo ── */}
            <div className="d-flex align-items-center gap-2 mb-3">
                <span className="badge rounded-pill border fw-semibold"
                    style={{ background: modoVista === "mensual" ? "#e0f2fe" : "#f1f5f9",
                             color: modoVista === "mensual" ? "#0284c7" : "#475569",
                             fontSize: "0.78rem", padding: "6px 14px" }}>
                    <i className={`fa-solid ${modoVista === "mensual" ? "fa-calendar-days" : "fa-calendar"} me-1`}></i>
                    {modoVista === "mensual"
                        ? `Comparando ${MONTH_LABELS[mesSelec]} ${anioActual} vs ${MONTH_LABELS[mesSelec]} ${anioAnterior}`
                        : `Comparando año completo ${anioActual} vs ${anioAnterior}`}
                </span>
            </div>

            {/* ── Barras por producto ── */}
            <div className="d-flex flex-column gap-3">
                {filasVisibles.length === 0 ? (
                    <div className="text-center text-muted py-4">
                        <i className="fa-solid fa-circle-info fs-3 mb-2 d-block text-secondary"></i>
                        Sin datos para <strong>{grupoActivo}</strong> en {labelActual} o {labelAnterior}
                    </div>
                ) : filasVisibles.map(fila => {
                    const bc  = getBarColor(fila.pct, fila.superado, fila.sinMeta);
                    const bdg = getBadgeCls(fila.pct, fila.superado, fila.sinMeta);
                    return (
                        <div key={fila.id} className="p-3 rounded-3 border bg-light">
                            {/* Cabecera fila */}
                            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                        style={{ width: 30, height: 30, background: bc + "22", border: `2px solid ${bc}` }}>
                                        <i className={`fa-solid ${fila.icon || "fa-box"}`} style={{ color: bc, fontSize: "0.65rem" }}></i>
                                    </span>
                                    <span className="fw-semibold text-dark small">{fila.nombre}</span>
                                    {fila.superado && (
                                        <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill" style={{ fontSize: "0.68rem" }}>
                                            <i className="fa-solid fa-trophy me-1"></i>¡Superado!
                                        </span>
                                    )}
                                    {fila.sinMeta && (
                                        <span className="badge bg-secondary-subtle text-secondary border rounded-pill" style={{ fontSize: "0.68rem" }}>
                                            Sin ref. {labelAnterior}
                                        </span>
                                    )}
                                </div>
                                <span className={`badge rounded-pill px-3 py-1 fw-bold ${bdg}`} style={{ fontSize: "0.82rem" }}>
                                    {fila.sinMeta ? "N/A" : fila.pct.toFixed(1) + "%"}
                                </span>
                            </div>

                            {/* Barra progreso */}
                            <div className="rounded-pill overflow-hidden mb-2" style={{ height: 13, background: "#e2e8f0" }}>
                                <div style={{
                                    width: fila.pct + "%", height: "100%", borderRadius: "inherit",
                                    background: fila.superado ? `linear-gradient(90deg, ${bc}, #34d399)` : bc,
                                    transition: "width 0.6s ease",
                                    minWidth: fila.actual > 0 ? "4px" : "0",
                                }}></div>
                            </div>

                            {/* Stats texto */}
                            <div className="d-flex flex-wrap gap-3 align-items-center" style={{ fontSize: "0.78rem" }}>
                                <span className="d-flex align-items-center gap-1">
                                    <i className="fa-solid fa-circle-check text-success"></i>
                                    <strong>{number_format(fila.actual)}</strong>
                                    <span className="text-muted">en {labelActual}</span>
                                </span>
                                <span className="text-muted">|</span>
                                <span className="d-flex align-items-center gap-1">
                                    <i className="fa-solid fa-flag text-warning"></i>
                                    <strong>{number_format(fila.anterior)}</strong>
                                    <span className="text-muted">meta ({labelAnterior})</span>
                                </span>
                                {!fila.sinMeta && !fila.superado && (
                                    <>
                                        <span className="text-muted">|</span>
                                        <span className="d-flex align-items-center gap-1 text-danger">
                                            <i className="fa-solid fa-arrow-trend-up"></i>
                                            <strong>{number_format(fila.faltan)}</strong>
                                            <span>faltan</span>
                                        </span>
                                    </>
                                )}
                                {fila.superado && (
                                    <>
                                        <span className="text-muted">|</span>
                                        <span className="d-flex align-items-center gap-1 text-success">
                                            <i className="fa-solid fa-plus-circle"></i>
                                            <strong>+{number_format(fila.actual - fila.anterior)}</strong>
                                            <span>sobre la meta</span>
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Ver más (Otros) */}
            {grupoActivo === "Otros" && filas.length > 6 && (
                <div className="text-center mt-3">
                    <button type="button"
                        className="btn btn-sm btn-outline-secondary rounded-pill px-4"
                        onClick={() => setExpandirOtros(p => !p)}>
                        <i className={`fa-solid ${expandirOtros ? "fa-chevron-up" : "fa-chevron-down"} me-1`}></i>
                        {expandirOtros ? "Ver menos" : "Ver " + (filas.length - 6) + " más"}
                    </button>
                </div>
            )}

            {/* Leyenda */}
            <div className="mt-4 pt-3 border-top d-flex flex-wrap gap-3 align-items-center" style={{ fontSize: "0.75rem" }}>
                <span className="fw-semibold text-muted me-1">Progreso:</span>
                {[
                    { color: "#10b981", label: "≥100% Superado" },
                    { color: "#3b82f6", label: "75–99%" },
                    { color: "#f59e0b", label: "50–74%" },
                    { color: "#ef4444", label: "<50%" },
                    { color: "#94a3b8", label: "Sin referencia" },
                ].map(l => (
                    <span key={l.label} className="d-flex align-items-center gap-1">
                        <span className="rounded-circle d-inline-block" style={{ width: 10, height: 10, background: l.color }}></span>
                        <span className="text-muted">{l.label}</span>
                    </span>
                ))}
            </div>
        </div>
    );
};

