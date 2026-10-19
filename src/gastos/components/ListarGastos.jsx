import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useAuthStore, useFuntions } from '../../hooks';
import { getVisiblePageNumbers } from '../../helpers';
import { useGastosStore } from '../../hooks/useGastosStore'
import { Table, Header, HeaderRow, Body, Row, HeaderCell, Cell } from "@table-library/react-table-library/table";
import { useTheme } from "@table-library/react-table-library/theme";
import { usePagination } from "@table-library/react-table-library/pagination";
import { useSort, HeaderCellSort } from "@table-library/react-table-library/sort";
import { Modal, Button, Badge } from 'react-bootstrap';
import Swal from 'sweetalert2';

export const ListarGastos = ({ handleShow, setFechaActual, fechaActual }) => {
    const gastos = useSelector(state => state.gastos.gastos);
    const usuariosDisponibles = useSelector(state => state.tareas?.usuariosDisponibles || []);
    const { formatearPrecio, buscarNombre, convertirFechaIngles, limpiarFecha, number_format, capitalize, convertirFecha, aTitulo } = useFuntions();
    const [search, setSearch] = useState("");
    const [filtroKits, setFiltroKits] = useState(false);
    const [filtroGuantes, setFiltroGuantes] = useState(false);
    const [filtroMisGastos, setFiltroMisGastos] = useState(false);
    const { setGastoActivo, startDeleteGasto, startLoadingGastos } = useGastosStore();
    const { user } = useAuthStore();
    const [fechaGasto, setFechaGasto] = useState(new Date().getFullYear());
    const [itemsMostrar, setItemsMostrar] = useState(20);

    // Estados para el Modal de Detalle Organizado del Gasto y Comprobante
    const [modalDetalleGasto, setModalDetalleGasto] = useState({
        show: false,
        gasto: null
    });
    const [visorImagenGasto, setVisorImagenGasto] = useState(null);

    const handleAbrirDetalleGasto = (gasto) => {
        setModalDetalleGasto({
            show: true,
            gasto
        });
    };

    const handleCerrarDetalleGasto = () => {
        setModalDetalleGasto({
            show: false,
            gasto: null
        });
    };

    const obtenerNombreRegistrador = (userVal) => {
        if (!userVal) return 'No especificado';
        if (typeof userVal === 'object') {
            if (userVal.name) return userVal.name;
            if (userVal.nombre) return userVal.nombre;
            if (userVal.email) return userVal.email;
        }
        const id = String(userVal?._id || userVal?.uid || userVal?.id || userVal || '').trim();
        if (id === '6789ce1b48932f890985d1f7') return 'Leonardo';
        if (id === '679fce0ee8d1ed66d21d18c2') return 'Oscar';
        if (id === '68cc3a0265f2a9ce640ba630') return 'Karol';

        if (user && (user.uid === id || user._id === id)) {
            return user.name || user.nombre || 'Usuario actual';
        }

        if (Array.isArray(usuariosDisponibles) && usuariosDisponibles.length > 0) {
            const match = usuariosDisponibles.find(u => String(u._id || u.uid || u.id) === id);
            if (match) return match.name || match.nombre || match.email;
        }

        return id || 'Usuario';
    };

    const formatearFechaCompleta = (fechaRaw) => {
        if (!fechaRaw) return 'Fecha no registrada';

        if (fechaRaw instanceof Date) {
            if (isNaN(fechaRaw.getTime())) return 'Fecha inválida';
            return fechaRaw.toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }).replace(/^\w/, (c) => c.toUpperCase());
        }

        if (typeof fechaRaw === 'number') {
            const d = new Date(fechaRaw);
            if (!isNaN(d.getTime())) {
                return d.toLocaleDateString('es-CO', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }).replace(/^\w/, (c) => c.toUpperCase());
            }
        }

        if (typeof fechaRaw === 'string') {
            const str = fechaRaw.trim();
            // Si es ISO o convertible por Date
            if (str.includes('T') || /^\d{4}-\d{2}-\d{2}/.test(str)) {
                try {
                    const d = new Date(str);
                    if (!isNaN(d.getTime())) {
                        return d.toLocaleDateString('es-CO', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        }).replace(/^\w/, (c) => c.toUpperCase());
                    }
                } catch (e) {}
            }

            // Si es formato DD/MM/YYYY o DD-MM-YYYY
            const matchDMY = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(?:[,\s]+(\d{1,2}):(\d{2}))?/);
            if (matchDMY) {
                const dia = parseInt(matchDMY[1], 10);
                const mes = parseInt(matchDMY[2], 10) - 1;
                const anio = parseInt(matchDMY[3].length === 2 ? '20' + matchDMY[3] : matchDMY[3], 10);
                const hora = matchDMY[4] ? parseInt(matchDMY[4], 10) : 0;
                const min = matchDMY[5] ? parseInt(matchDMY[5], 10) : 0;
                const dateObj = new Date(anio, mes, dia, hora, min);
                if (!isNaN(dateObj.getTime())) {
                    return dateObj.toLocaleDateString('es-CO', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: matchDMY[4] ? '2-digit' : undefined,
                        minute: matchDMY[5] ? '2-digit' : undefined,
                        hour12: true
                    }).replace(/^\w/, (c) => c.toUpperCase());
                }
            }

            return str.charAt(0).toUpperCase() + str.slice(1);
        }

        return String(fechaRaw);
    };

    const isLeonardo = user.uid === '6789ce1b48932f890985d1f7';

    const searchLower = search.toLowerCase();
    const filteredGastos = [...gastos]
        .filter((gasto) => {
            const matchesSearch =
                (gasto.gasto && gasto.gasto.toLowerCase().includes(searchLower)) ||
                (gasto.proveedor && gasto.proveedor.toLowerCase().includes(searchLower)) ||
                (gasto.tipoGasto && gasto.tipoGasto.toLowerCase().includes(searchLower)) ||
                (gasto.fecha && gasto.fecha.toLowerCase().includes(searchLower)) ||
                (gasto.codigo && gasto.codigo.toLowerCase().includes(searchLower)) ||
                (Array.isArray(gasto.items) && gasto.items.some(it =>
                    (it.gasto && it.gasto.toLowerCase().includes(searchLower)) ||
                    (it.codigo && it.codigo.toLowerCase().includes(searchLower)) ||
                    (it.subCategoria && it.subCategoria.toLowerCase().includes(searchLower))
                ));

            return matchesSearch && (gasto.fecha && gasto.fecha.toLowerCase().includes(fechaGasto));
        })
        .sort((a, b) => {
            const fechaA = convertirFechaIngles(a.fecha);
            const fechaB = convertirFechaIngles(b.fecha);
            return fechaB - fechaA;
        })
        .map((gasto) => ({
            ...gasto,
            id: gasto.gasto_id || gasto._id,
        }));

    // Regla de negocio: En listar gastos, Leonardo solo debe ver los referentes a la categoría KITS ('K')
    const gastosBase = filteredGastos.filter(gasto => {
        if (isLeonardo) {
            // Leonardo solo ve la categoría KITS
            return gasto.categoria === 'K';
        }
        // Para otros usuarios, si el gasto pertenece a Leonardo, solo debe ser de KITS
        const gastoUserId = (gasto.user?._id || gasto.user)?.toString();
        if (gastoUserId === '6789ce1b48932f890985d1f7' && gasto.categoria !== 'K') {
            return false;
        }
        return true;
    });

    // Aplicar filtros adicionales (permite combinar Kits, Guantes y Mis Gastos simultáneamente)
    let finalGastos = gastosBase;

    // Filtro por categoría (Kits y/o Guantes)
    const hayFiltroCategoria = filtroKits || filtroGuantes;
    if (!isLeonardo && hayFiltroCategoria) {
        finalGastos = finalGastos.filter((node) => {
            if (filtroKits && node.categoria === "K") return true;
            if (filtroGuantes && node.categoria === "G") return true;
            return false;
        });
    }

    // Filtro por Mis Gastos (se combina simultáneamente con las categorías seleccionadas)
    if (filtroMisGastos) {
        finalGastos = finalGastos.filter((node) => {
            const gastoUserId = (node.user?._id || node.user)?.toString();
            return gastoUserId === user.uid;
        });
    }

    const isTodos = !filtroKits && !filtroGuantes && !filtroMisGastos;

    const handleLimpiarFiltros = () => {
        setFiltroKits(false);
        setFiltroGuantes(false);
        setFiltroMisGastos(false);
        pagination.fns.onSetPage(0);
    };

    const handleToggleKits = () => {
        setFiltroKits(prev => !prev);
        pagination.fns.onSetPage(0);
    };

    const handleToggleGuantes = () => {
        setFiltroGuantes(prev => !prev);
        pagination.fns.onSetPage(0);
    };

    const handleToggleMisGastos = () => {
        setFiltroMisGastos(prev => !prev);
        pagination.fns.onSetPage(0);
    };

    // =========================================================================
    // CÁLCULOS KPI GENERALES Y PERSONALES
    // =========================================================================
    const total = finalGastos.reduce((sum, gasto) => sum + (gasto.cantidad * gasto.precio), 0);
    const totalGastosKits = gastosBase.filter(g => g.categoria === 'K').reduce((sum, g) => sum + (g.cantidad * g.precio), 0);
    const totalGastosGuantes = isLeonardo ? 0 : gastosBase.filter(g => g.categoria === 'G').reduce((sum, g) => sum + (g.cantidad * g.precio), 0);

    // Gastos personales del usuario logueado
    const gastosPropiosList = gastosBase.filter(g => {
        const uid = (g.user?._id || g.user)?.toString();
        return uid === user.uid;
    });
    const totalGastosPropios = gastosPropiosList.reduce((sum, g) => sum + (g.cantidad * g.precio), 0);
    const cantComprasPropias = gastosPropiosList.length;

    // Desglose personal: Kits
    const misKitsList = gastosPropiosList.filter(g => g.categoria === 'K');
    const totalMisGastosKits = misKitsList.reduce((sum, g) => sum + (g.cantidad * g.precio), 0);
    const cantMisKits = misKitsList.length;

    // Desglose personal: Guantes
    const misGuantesList = gastosPropiosList.filter(g => g.categoria === 'G');
    const totalMisGastosGuantes = isLeonardo ? 0 : misGuantesList.reduce((sum, g) => sum + (g.cantidad * g.precio), 0);
    const cantMisGuantes = misGuantesList.length;

    // Métricas personales adicionales
    const promedioGastoPropio = cantComprasPropias > 0 ? Math.round(totalGastosPropios / cantComprasPropias) : 0;
    const totalGeneralAnio = gastosBase.reduce((sum, g) => sum + (g.cantidad * g.precio), 0);
    const porcentajeParticipacion = totalGeneralAnio > 0 ? ((totalGastosPropios / totalGeneralAnio) * 100).toFixed(1) : '0';

    const data = { nodes: finalGastos };

    const sort = useSort(
        data,
        {
            onChange: onSortChange,
        },
        {
            sortFns: {
                FECHA: (array) => array.sort((a, b) => convertirFechaIngles(a.fecha) - convertirFechaIngles(b.fecha)),
                TIPO: (array) => array.sort((a, b) => a.tipoGasto.localeCompare(b.tipoGasto)),
                PROVEEDOR: (array) => array.sort((a, b) => a.proveedor.localeCompare(b.proveedor)),
                GASTO: (array) => array.sort((a, b) => a.gasto.localeCompare(b.gasto)),
                CATEGORIA: (array) => array.sort((a, b) => a.subCategoria.localeCompare(b.subCategoria)),
                PRECIO: (array) => array.sort((a, b) => a.precio - b.precio),
                CANTIDAD: (array) => array.sort((a, b) => a.cantidad - b.cantidad),
                TOTAL: (array) => array.sort((a, b) => (a.cantidad * a.precio) - (b.cantidad * b.precio)),
            },
        }
    );

    function onSortChange(action, state) {
        // console.log(action, state);
    }

    const handleSearch = (event) => {
        setSearch(event.target.value);
    };

    const pagination = usePagination(finalGastos, {
        state: {
            page: 0,
            size: itemsMostrar,
        },
    });

    const marginTheme = {
        BaseCell: `
            padding: 6px 8px !important;
            vertical-align: middle !important;
        `,
        HeaderCell: `
            padding: 8px !important;
            background-color: #f8fafc !important;
            color: #475569 !important;
            font-weight: 600 !important;
            font-size: 0.8rem !important;
            border-bottom: 2px solid #e2e8f0 !important;
        `,
    };

    const sizeColumnTheme = {
        Table: `
            --data-table-library_grid-template-columns: 
                max-content max-content minmax(130px, 1fr) minmax(150px, 1.2fr) max-content max-content max-content max-content max-content !important;
        `,
    };

    const theme = useTheme([marginTheme, sizeColumnTheme]);

    const eliminarGasto = async (gasto) => {
        if (user.uid === gasto.user) {
            const result = await Swal.fire({
                icon: "warning",
                title: `Está seguro de ELIMINAR el gasto: "${gasto.gasto} | Proveedor: ${gasto.proveedor}"`,
                showCancelButton: true,
                cancelButtonColor: "#3085d6",
                confirmButtonColor: "red",
                confirmButtonText: "Eliminar",
            });

            if (result.isConfirmed) {
                await startDeleteGasto(gasto);
                await startLoadingGastos();
                Swal.fire("Eliminado!", "", "success");
            }
        } else {
            Swal.fire({
                title: "El usuario NO tiene permiso para eliminar un gasto que no ha creado",
                icon: "error",
                confirmButtonColor: "red",
            });
        }
    };

    useEffect(() => {
        startLoadingGastos();
    }, []);

    useEffect(() => {
        const nuevoAnio = parseInt(fechaGasto, 10);
        const fecha = new Date();

        const nuevaFecha = (fechaGasto === '2025')
            ? new Date(nuevoAnio, fecha.getMonth(), fecha.getDate(), fecha.getHours(), fecha.getMinutes(), fecha.getSeconds())
            : new Date(nuevoAnio, fecha.getMonth(), fecha.getDate(), 0, 0, 0);

        setFechaActual(nuevaFecha);
    }, [fechaGasto]);

    return (
        <div className="container-fluid px-0">
            {/* TARJETAS KPI DE GASTOS: GENERALES Y PERSONALES */}
            {isLeonardo ? (
                <div className="mb-4">
                    {/* Resumen General Leonardo */}
                    <div className="row g-3 mb-3">
                        <div className="col-12">
                            <div className="card border border-light-subtle shadow-sm rounded-4 p-3 bg-white">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className="p-2 bg-primary-subtle text-primary rounded-3">
                                        <i className="fas fa-box-open fa-lg"></i>
                                    </span>
                                    <span className="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1 small fw-semibold">
                                        {finalGastos.length} compras
                                    </span>
                                </div>
                                <small className="text-muted fw-medium">Total Gastos Generales Kits ({fechaGasto})</small>
                                <h4 className="fw-bolder text-dark mb-0 mt-1">{formatearPrecio(total)}</h4>
                            </div>
                        </div>
                    </div>

                    {/* Tarjetas Personales Leonardo (Más pequeñas) */}
                    <div className="p-3 rounded-4 bg-light bg-opacity-50 border border-light-subtle">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <div className="d-flex align-items-center gap-2">
                                <span className="p-1 rounded-2 bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
                                    <i className="fas fa-user text-info" style={{ fontSize: '0.75rem' }}></i>
                                </span>
                                <span className="fw-bold text-dark small text-uppercase" style={{ letterSpacing: '0.4px', fontSize: '0.78rem' }}>
                                    Mis Gastos Personales ({user.name || 'Leonardo'})
                                </span>
                            </div>
                            <span className="badge bg-info-subtle text-info border border-info-subtle rounded-pill px-2.5 py-1" style={{ fontSize: '0.72rem' }}>
                                Aporte: <strong>{porcentajeParticipacion}%</strong> de los Kits
                            </span>
                        </div>

                        <div className="row g-2">
                            <div className="col-12 col-sm-4">
                                <div className="card border-0 shadow-xs rounded-3 p-2.5 bg-white h-100">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <small className="text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>Mis Gastos en Kits</small>
                                        <span className="badge bg-info-subtle text-info px-1.5 py-0.5" style={{ fontSize: '0.68rem' }}>
                                            {cantMisKits} compras
                                        </span>
                                    </div>
                                    <h5 className="fw-bold text-dark mb-0">{formatearPrecio(totalMisGastosKits)}</h5>
                                    <small className="text-muted" style={{ fontSize: '0.68rem' }}>Registrado por ti en Kits</small>
                                </div>
                            </div>

                            <div className="col-12 col-sm-4">
                                <div className="card border-0 shadow-xs rounded-3 p-2.5 bg-white h-100">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <small className="text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>Promedio / Compra</small>
                                        <span className="badge bg-success-subtle text-success px-1.5 py-0.5" style={{ fontSize: '0.68rem' }}>
                                            Ticket medio
                                        </span>
                                    </div>
                                    <h5 className="fw-bold text-success mb-0">{formatearPrecio(promedioGastoPropio)}</h5>
                                    <small className="text-muted" style={{ fontSize: '0.68rem' }}>Gasto promedio por factura</small>
                                </div>
                            </div>

                            <div className="col-12 col-sm-4">
                                <div className="card border-0 shadow-xs rounded-3 p-2.5 bg-white h-100">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <small className="text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>Participación en Kits</small>
                                        <span className="badge bg-primary-subtle text-primary px-1.5 py-0.5" style={{ fontSize: '0.68rem' }}>
                                            {cantComprasPropias} de {gastosBase.length}
                                        </span>
                                    </div>
                                    <h5 className="fw-bold text-primary mb-0">{porcentajeParticipacion}%</h5>
                                    <small className="text-muted" style={{ fontSize: '0.68rem' }}>Porcentaje del total de Kits</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mb-4">
                    {/* FILA 1: TARJETAS GENERALES */}
                    <div className="row g-3 mb-3">
                        <div className="col-12 col-md-4">
                            <div className="card border border-light-subtle shadow-sm rounded-4 h-100 p-3 bg-white">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className="p-2 bg-primary-subtle text-primary rounded-3">
                                        <i className="fas fa-receipt fa-lg"></i>
                                    </span>
                                    <span className="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1 small fw-semibold">
                                        {finalGastos.length} compras
                                    </span>
                                </div>
                                <small className="text-muted fw-medium">Total Gastos ({fechaGasto})</small>
                                <h4 className="fw-bolder text-dark mb-0 mt-1">{formatearPrecio(total)}</h4>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="card border border-light-subtle shadow-sm rounded-4 h-100 p-3 bg-white">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className="p-2 bg-danger-subtle text-danger rounded-3">
                                        <i className="fas fa-box-open fa-lg"></i>
                                    </span>
                                    <span className="badge bg-danger-subtle text-danger rounded-pill px-2.5 py-1 small fw-semibold">
                                        {gastosBase.filter(g => g.categoria === 'K').length} compras
                                    </span>
                                </div>
                                <small className="text-muted fw-medium">Gastos Generales Kits</small>
                                <h4 className="fw-bolder text-dark mb-0 mt-1">{formatearPrecio(totalGastosKits)}</h4>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="card border border-light-subtle shadow-sm rounded-4 h-100 p-3 bg-white">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className="p-2 bg-warning-subtle text-warning rounded-3">
                                        <i className="fas fa-hand-sparkles fa-lg"></i>
                                    </span>
                                    <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-2.5 py-1 small fw-semibold">
                                        {gastosBase.filter(g => g.categoria === 'G').length} compras
                                    </span>
                                </div>
                                <small className="text-muted fw-medium">Gastos Generales Guantes</small>
                                <h4 className="fw-bolder text-dark mb-0 mt-1">{formatearPrecio(totalGastosGuantes)}</h4>
                            </div>
                        </div>
                    </div>

                    {/* FILA 2: MIS GASTOS PERSONALES (Cards más pequeñas) */}
                    <div className="p-3 rounded-4 bg-light bg-opacity-50 border border-light-subtle">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <div className="d-flex align-items-center gap-2">
                                <span className="p-1 rounded-2 bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
                                    <i className="fas fa-user text-info" style={{ fontSize: '0.75rem' }}></i>
                                </span>
                                <span className="fw-bold text-dark small text-uppercase" style={{ letterSpacing: '0.4px', fontSize: '0.78rem' }}>
                                    Mis Gastos Personales ({user.name || 'Mi Cuenta'})
                                </span>
                            </div>
                            <span className="badge bg-info-subtle text-info border border-info-subtle rounded-pill px-2.5 py-1" style={{ fontSize: '0.72rem' }}>
                                Aporte: <strong>{porcentajeParticipacion}%</strong> del total
                            </span>
                        </div>

                        <div className="row g-2">
                            {/* 1. Total Personal */}
                            <div className="col-6 col-md-3">
                                <div className="card border-0 shadow-xs rounded-3 p-2.5 bg-white h-100">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <small className="text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>Total Mis Gastos</small>
                                        <span className="badge bg-info-subtle text-info px-1.5 py-0.5" style={{ fontSize: '0.68rem' }}>
                                            {cantComprasPropias} compras
                                        </span>
                                    </div>
                                    <h5 className="fw-bold text-dark mb-0">{formatearPrecio(totalGastosPropios)}</h5>
                                    <small className="text-muted" style={{ fontSize: '0.68rem' }}>Total registrado por ti</small>
                                </div>
                            </div>

                            {/* 2. Mis Kits */}
                            <div className="col-6 col-md-3">
                                <div className="card border-0 shadow-xs rounded-3 p-2.5 bg-white h-100">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <small className="text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>Mis Gastos Kits</small>
                                        <span className="badge bg-danger-subtle text-danger px-1.5 py-0.5" style={{ fontSize: '0.68rem' }}>
                                            {cantMisKits} compras
                                        </span>
                                    </div>
                                    <h5 className="fw-bold text-danger mb-0">{formatearPrecio(totalMisGastosKits)}</h5>
                                    <small className="text-muted" style={{ fontSize: '0.68rem' }}>Materia prima e insumos Kits</small>
                                </div>
                            </div>

                            {/* 3. Mis Guantes */}
                            <div className="col-6 col-md-3">
                                <div className="card border-0 shadow-xs rounded-3 p-2.5 bg-white h-100">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <small className="text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>Mis Gastos Guantes</small>
                                        <span className="badge bg-warning-subtle text-warning-emphasis px-1.5 py-0.5" style={{ fontSize: '0.68rem' }}>
                                            {cantMisGuantes} compras
                                        </span>
                                    </div>
                                    <h5 className="fw-bold text-warning-emphasis mb-0">{formatearPrecio(totalMisGastosGuantes)}</h5>
                                    <small className="text-muted" style={{ fontSize: '0.68rem' }}>Inversión en Guantes</small>
                                </div>
                            </div>

                            {/* 4. Promedio por Compra */}
                            <div className="col-6 col-md-3">
                                <div className="card border-0 shadow-xs rounded-3 p-2.5 bg-white h-100">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <small className="text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>Promedio / Compra</small>
                                        <span className="badge bg-success-subtle text-success px-1.5 py-0.5" style={{ fontSize: '0.68rem' }}>
                                            Ticket medio
                                        </span>
                                    </div>
                                    <h5 className="fw-bold text-success mb-0">{formatearPrecio(promedioGastoPropio)}</h5>
                                    <small className="text-muted" style={{ fontSize: '0.68rem' }}>Gasto promedio personal</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TABLA PRINCIPAL DE GASTOS */}
            <div className="card border border-light-subtle shadow-sm rounded-4 p-3 bg-white mb-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-3 pb-2 border-bottom">
                    <div>
                        <h5 className="mb-0 fw-bold text-dark">
                            <i className="fas fa-file-invoice-dollar me-2 text-primary"></i>Listado de Gastos y Compras
                        </h5>
                        <small className="text-muted">Registro de compras de materia prima, insumos y servicios</small>
                    </div>
                    <div>
                        <button
                            onClick={() => {
                                setGastoActivo(null);
                                setFechaActual(new Date());
                                handleShow();
                            }}
                            className="btn btn-primary rounded-pill px-3 shadow-xs d-flex align-items-center gap-2"
                        >
                            <i className="fas fa-plus-circle"></i>
                            <span>Nuevo Gasto / Compra</span>
                        </button>
                    </div>
                </div>

                {/* FILTROS RÁPIDOS (Permite selección simultánea) */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
                    <div className="scroll-horizontal-touch d-flex align-items-center gap-1 w-100 w-md-auto">
                        <button
                            type="button"
                            className={`btn btn-sm rounded-pill px-3 text-nowrap ${isTodos ? 'btn-primary shadow-xs fw-semibold' : 'btn-light border text-secondary'}`}
                            onClick={handleLimpiarFiltros}
                            title="Mostrar todos los gastos sin filtros"
                        >
                            {isLeonardo ? 'Todos (Kits)' : 'Todos'}{' '}
                            <span className={`badge ms-1 ${isTodos ? 'bg-white text-primary' : 'bg-secondary-subtle text-dark'}`}>
                                {gastosBase.length}
                            </span>
                        </button>
                        {!isLeonardo && (
                            <>
                                <button
                                    type="button"
                                    className={`btn btn-sm rounded-pill px-3 text-nowrap ${filtroKits ? 'btn-danger text-white shadow-xs fw-semibold' : 'btn-light border text-secondary'}`}
                                    onClick={handleToggleKits}
                                    title={filtroKits ? "Quitar filtro de Kits" : "Filtrar por Kits (puede combinarse)"}
                                >
                                    <i className="fas fa-box-open me-1"></i>Kits{' '}
                                    <span className={`badge ms-1 ${filtroKits ? 'bg-white text-danger' : 'bg-danger-subtle text-dark'}`}>
                                        {gastosBase.filter(g => g.categoria === 'K').length}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-sm rounded-pill px-3 text-nowrap ${filtroGuantes ? 'btn-warning text-dark fw-bold shadow-xs' : 'btn-light border text-secondary'}`}
                                    onClick={handleToggleGuantes}
                                    title={filtroGuantes ? "Quitar filtro de Guantes" : "Filtrar por Guantes (puede combinarse)"}
                                >
                                    <i className="fas fa-hand-sparkles me-1 text-warning"></i>Guantes{' '}
                                    <span className={`badge ms-1 ${filtroGuantes ? 'bg-white text-dark' : 'bg-warning-subtle text-dark'}`}>
                                        {gastosBase.filter(g => g.categoria === 'G').length}
                                    </span>
                                </button>
                            </>
                        )}
                        <button
                            type="button"
                            className={`btn btn-sm rounded-pill px-3 text-nowrap ${filtroMisGastos ? 'btn-info text-white shadow-xs fw-semibold' : 'btn-light border text-secondary'}`}
                            onClick={handleToggleMisGastos}
                            title={filtroMisGastos ? "Quitar filtro de Mis Gastos" : "Filtrar por Mis Gastos (puede combinarse)"}
                        >
                            <i className="fas fa-user-check me-1"></i>Mis Gastos{' '}
                            <span className={`badge ms-1 ${filtroMisGastos ? 'bg-white text-info' : 'bg-info-subtle text-dark'}`}>
                                {gastosBase.filter(g => (g.user?._id || g.user)?.toString() === user.uid).length}
                            </span>
                        </button>
                        {!isTodos && (
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary rounded-pill px-2.5 py-1 d-flex align-items-center gap-1 ms-1 text-muted"
                                onClick={handleLimpiarFiltros}
                                title="Restablecer todos los filtros"
                                style={{ fontSize: '0.75rem' }}
                            >
                                <i className="fa-solid fa-rotate-left"></i>
                                <span>Restablecer</span>
                            </button>
                        )}
                    </div>

                    <div className="w-100" style={{ maxWidth: '350px' }}>
                        <div className="input-group input-group-sm">
                            <input
                                type="text"
                                className="form-control rounded-start-3 ps-3"
                                placeholder="Buscar proveedor, producto o fecha..."
                                value={search}
                                onChange={handleSearch}
                            />
                            <button className="btn btn-outline-secondary rounded-end-3" type="button">
                                <i className="fas fa-search" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="row align-items-center mb-3 g-2">
                    <div className="col-6 col-sm-4 col-md-3">
                        <div className="input-group input-group-sm">
                            <span className="input-group-text bg-light text-muted border-end-0">Año:</span>
                            <select
                                className="form-select form-select-sm rounded-end-3"
                                value={fechaGasto}
                                onChange={e => {
                                    setFechaGasto(e.target.value);
                                    pagination.fns.onSetPage(0);
                                }}
                            >
                                <option value="2026">2026</option>
                                <option value="2025">2025</option>
                                <option value="2024">2024</option>
                                <option value="2023">2023</option>
                                <option value="2022">2022</option>
                                <option value="2021">2021</option>
                                <option value="2020">2020</option>
                                <option value="2019">2019</option>
                                <option value="2018">2018</option>
                                <option value="2017">2017</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-6 col-sm-4 col-md-3">
                        <div className="input-group input-group-sm">
                            <span className="input-group-text bg-light text-muted border-end-0">Items:</span>
                            <select
                                className="form-select form-select-sm rounded-end-3"
                                value={itemsMostrar}
                                onChange={e => {
                                    const value = e.target.value === "todos" ? data.nodes.length : Number(e.target.value);
                                    setItemsMostrar(value);
                                    pagination.fns.onSetPage(0);
                                }}
                            >
                                <option value={10}>10 registros</option>
                                <option value={20}>20 registros</option>
                                <option value={50}>50 registros</option>
                                <option value={100}>100 registros</option>
                                <option value="todos">Todos</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="table-responsive table-hover text-start w-100 compact-table">
                    <Table
                        className="table table-hover compact-table align-middle mb-0"
                        data={data}
                        theme={theme}
                        pagination={pagination}
                        sort={sort}
                    >
                        {(tableList) => (
                            <>
                                <Header>
                                    <HeaderRow className="table-light text-start">
                                        <HeaderCellSort sortKey={'INGRESO'} className='text-start fw-semibold'>Fecha</HeaderCellSort>
                                        <HeaderCellSort sortKey={'TIPO'} className='text-center fw-semibold'>Tipo</HeaderCellSort>
                                        <HeaderCellSort sortKey={'PROVEEDOR'} className='text-start fw-semibold ps-2'>Proveedor</HeaderCellSort>
                                        <HeaderCellSort sortKey={'GASTO'} className='text-start fw-semibold ps-2'>Producto / Servicio</HeaderCellSort>
                                        <HeaderCellSort sortKey={'CATEGORIA'} className='text-center fw-semibold'>Categoría</HeaderCellSort>
                                        <HeaderCellSort sortKey={'PRECIO'} className='text-end fw-semibold'>Precio</HeaderCellSort>
                                        <HeaderCellSort sortKey={'CANTIDAD'} className='text-center fw-semibold'>Cant</HeaderCellSort>
                                        <HeaderCellSort sortKey={'TOTAL'} className='text-end pe-3 fw-semibold'>Total ($)</HeaderCellSort>
                                        <HeaderCell className='text-center fw-semibold'>Acciones</HeaderCell>
                                    </HeaderRow>
                                </Header>

                                <Body>
                                    {tableList.map((item, index) => (
                                        <Row key={index} item={item}>
                                            <Cell className="small text-muted" title={item.fecha}>{limpiarFecha(item.fecha)}</Cell>
                                            <Cell className="text-center">
                                                <span className={`badge rounded-pill px-2 py-1 ${item.user === user.uid ? 'bg-primary-subtle text-primary' : 'bg-light text-secondary border'}`} style={{ fontSize: '0.72rem' }}>
                                                    {item.tipoGasto}
                                                </span>
                                            </Cell>
                                            <Cell className="ps-2 fw-medium text-dark">{aTitulo(item.proveedor)}</Cell>
                                            <Cell className="ps-2">
                                                <div className="d-flex align-items-center gap-1.5 flex-wrap">
                                                    {Array.isArray(item.items) && item.items.length > 1 && (
                                                        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-1.5 py-0.5 fw-semibold" style={{ fontSize: '0.68rem' }}>
                                                            <i className="fa-solid fa-layer-group me-1"></i>{item.items.length} ítems
                                                        </span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-link text-decoration-none fw-semibold text-dark p-0 text-start text-truncate"
                                                        style={{ fontSize: '0.82rem', maxWidth: '280px' }}
                                                        onClick={() => {
                                                            setGastoActivo(item);
                                                            setFechaActual(new Date());
                                                            handleShow(item);
                                                        }}
                                                        title="Copiar datos a nuevo gasto con fecha actual"
                                                    >
                                                        {aTitulo(item.gasto)}
                                                    </button>
                                                </div>
                                            </Cell>
                                            <Cell className="text-center">
                                                <span className="badge bg-light text-dark border" style={{ fontSize: '0.72rem' }}>
                                                    {item.categoria} - {item.subCategoria}
                                                </span>
                                            </Cell>
                                            <Cell className="text-end small">
                                                {Array.isArray(item.items) && item.items.length > 1 ? (
                                                    <span className="text-muted fst-italic" title="Factura con varios ítems">Varios</span>
                                                ) : (
                                                    formatearPrecio(item.precio)
                                                )}
                                            </Cell>
                                            <Cell className="text-center">
                                                {Array.isArray(item.items) && item.items.length > 1 ? (
                                                    <span className="badge bg-light text-dark border px-2" title={`${item.items.reduce((s, it) => s + (Number(it.cantidad) || 0), 0)} unidades en total`}>
                                                        {number_format(item.items.reduce((s, it) => s + (Number(it.cantidad) || 0), 0))} un ({item.items.length})
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-light text-dark border px-2">{number_format(item.cantidad)}</span>
                                                )}
                                            </Cell>
                                            <Cell className="text-end pe-3 fw-bold text-dark">{formatearPrecio((item.cantidad) * (item.precio))}</Cell>
                                            <Cell className="text-center">
                                                <div className="d-flex align-items-center justify-content-center gap-1">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-light border text-info rounded-circle p-1 shadow-xs"
                                                        style={{ width: '32px', height: '32px', fontSize: '0.92rem', lineHeight: '1' }}
                                                        onClick={() => handleAbrirDetalleGasto(item)}
                                                        title="Ver detalle e información organizada del gasto"
                                                    >
                                                        <i className="fa-solid fa-eye"></i>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-light border text-primary rounded-circle p-1"
                                                        style={{ width: '32px', height: '32px', fontSize: '0.92rem', lineHeight: '1' }}
                                                        onClick={() => handleShow(item, true)}
                                                        title="Editar este gasto en la base de datos"
                                                    >
                                                        <i className="fa-solid fa-pen-to-square"></i>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-light border text-danger rounded-circle p-1"
                                                        style={{ width: '32px', height: '32px', fontSize: '0.92rem', lineHeight: '1' }}
                                                        onClick={() => eliminarGasto(item)}
                                                        title="Eliminar gasto"
                                                    >
                                                        <i className="fa fa-trash"></i>
                                                    </button>
                                                </div>
                                            </Cell>
                                        </Row>
                                    ))}
                                </Body>
                            </>
                        )}
                    </Table>
                </div>

                {/* PAGINACION */}
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mt-3 pt-2 border-top">
                    <div className="small text-muted">
                        Mostrando {finalGastos.length} gastos {isLeonardo ? '(Kits)' : ''} • Total: <strong className="text-dark">{formatearPrecio(total)}</strong> • Página {pagination.state.page + 1} de {pagination.state.getTotalPages(finalGastos) || 1}
                    </div>
                    <div className="d-flex align-items-center gap-1 flex-wrap">
                        {pagination.state.page > 0 && (
                            <button
                                className="btn btn-light btn-sm border rounded-pill px-3"
                                onClick={() => pagination.fns.onSetPage(pagination.state.page - 1)}
                            >
                                &laquo; Anterior
                            </button>
                        )}
                        {getVisiblePageNumbers(pagination.state.page, pagination.state.getTotalPages(finalGastos) || 1, 5).map((pageIndex) => (
                            <button
                                key={pageIndex}
                                className={`btn btn-sm rounded-circle px-2 py-1 ${pagination.state.page === pageIndex ? 'btn-primary' : 'btn-light border'}`}
                                style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}
                                onClick={() => pagination.fns.onSetPage(pageIndex)}
                            >
                                {pageIndex + 1}
                            </button>
                        ))}
                        {pagination.state.page < pagination.state.getTotalPages(finalGastos) - 1 && (
                            <button
                                className="btn btn-light btn-sm border rounded-pill px-3"
                                onClick={() => pagination.fns.onSetPage(pagination.state.page + 1)}
                            >
                                Siguiente &raquo;
                            </button>
                        )}
                </div>
            </div>

            {/* ================================================================= */}
            {/* MODAL DETALLE ORGANIZADO DEL GASTO */}
            {/* ================================================================= */}
            <Modal
                show={modalDetalleGasto.show}
                onHide={handleCerrarDetalleGasto}
                size="lg"
                centered
                className="rounded-4"
            >
                {modalDetalleGasto.gasto && (
                    <>
                        <Modal.Header closeButton className="bg-light py-3 border-bottom">
                            <div className="d-flex align-items-center gap-2.5">
                                <div className="bg-info bg-opacity-10 text-info rounded-circle p-2 d-flex align-items-center justify-content-center shadow-xs" style={{ width: 40, height: 40 }}>
                                    <i className="fa-solid fa-receipt fs-5"></i>
                                </div>
                                <div>
                                    <Modal.Title className="fs-6 fw-bolder text-dark mb-0">Detalle Completo del Gasto</Modal.Title>
                                    <small className="text-muted">Información contable, observaciones y comprobante</small>
                                </div>
                            </div>
                        </Modal.Header>

                        <Modal.Body className="p-3 p-md-4">
                            {/* Encabezado con Total y Tipo */}
                            <div className="p-3 mb-4 rounded-3 bg-light border d-flex flex-wrap align-items-center justify-content-between gap-3 shadow-xs">
                                <div>
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <span className={`badge ${modalDetalleGasto.gasto.tipoGasto === 'Servicio' ? 'bg-primary' : 'bg-success'} rounded-pill px-2.5 py-1 fw-bold`} style={{ fontSize: '0.75rem' }}>
                                            {modalDetalleGasto.gasto.tipoGasto === 'Servicio' ? (
                                                <><i className="fa-solid fa-screwdriver-wrench me-1"></i> SERVICIO</>
                                            ) : (
                                                <><i className="fa-solid fa-box-open me-1"></i> PRODUCTO</>
                                            )}
                                        </span>
                                        <span className="badge bg-white text-secondary border rounded-pill px-2.5 py-1 d-inline-flex align-items-center gap-1" style={{ fontSize: '0.74rem' }}>
                                            <i className="fa-regular fa-calendar-days text-primary"></i>
                                            <span>{formatearFechaCompleta(modalDetalleGasto.gasto.fecha)}</span>
                                        </span>
                                    </div>
                                    <h5 className="fw-bolder text-dark mb-0 mt-1">
                                        {aTitulo(modalDetalleGasto.gasto.gasto)}
                                    </h5>
                                </div>
                                <div className="text-sm-end">
                                    <div className="text-muted small">Total del Gasto:</div>
                                    <div className="fw-bolder text-primary fs-4">
                                        {formatearPrecio(modalDetalleGasto.gasto.cantidad * modalDetalleGasto.gasto.precio)}
                                    </div>
                                    <div className="text-muted small" style={{ fontSize: '0.74rem' }}>
                                        {Array.isArray(modalDetalleGasto.gasto.items) && modalDetalleGasto.gasto.items.length > 1 ? (
                                            <span>
                                                {modalDetalleGasto.gasto.items.length} productos • {modalDetalleGasto.gasto.items.reduce((s, it) => s + (Number(it.cantidad) || 0), 0)} unidades
                                            </span>
                                        ) : (
                                            <span>
                                                {number_format(modalDetalleGasto.gasto.cantidad)} {modalDetalleGasto.gasto.cantidad === 1 ? 'unidad' : 'unidades'} &times; {formatearPrecio(modalDetalleGasto.gasto.precio)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Desglose de Productos / Ítems de la Factura (si tiene items) */}
                            {Array.isArray(modalDetalleGasto.gasto.items) && modalDetalleGasto.gasto.items.length > 0 && (
                                <div className="card border rounded-3 p-3 bg-white mb-4 shadow-xs">
                                    <div className="d-flex align-items-center justify-content-between mb-2.5 pb-2 border-bottom">
                                        <div className="small fw-bold text-uppercase text-muted" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                                            <i className="fa-solid fa-boxes-stacked text-primary me-1.5"></i> Productos / Ítems de la Factura ({modalDetalleGasto.gasto.items.length})
                                        </div>
                                        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1" style={{ fontSize: '0.74rem' }}>
                                            Total: {modalDetalleGasto.gasto.items.reduce((s, it) => s + (Number(it.cantidad) || 0), 0)} unidades
                                        </span>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-sm table-hover align-middle mb-0" style={{ fontSize: '0.82rem' }}>
                                            <thead className="table-light">
                                                <tr>
                                                    <th className="text-muted text-center" style={{ width: '32px' }}>#</th>
                                                    <th className="text-muted">Código</th>
                                                    <th className="text-muted">Producto / Concepto</th>
                                                    <th className="text-muted text-center">Subcategoría</th>
                                                    <th className="text-muted text-center">Cant.</th>
                                                    <th className="text-muted text-end">P. Unitario</th>
                                                    <th className="text-muted text-end pe-2">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {modalDetalleGasto.gasto.items.map((it, idx) => {
                                                    const sub = (Number(it.cantidad) || 0) * (Number(it.precio) || 0);
                                                    return (
                                                        <tr key={idx}>
                                                            <td className="text-muted text-center small">{idx + 1}</td>
                                                            <td><span className="badge bg-light text-secondary border fw-medium">{it.codigo || 'S/C'}</span></td>
                                                            <td className="fw-semibold text-dark">{aTitulo(it.gasto)}</td>
                                                            <td className="text-center"><span className="badge bg-light text-dark border">{it.subCategoria || 'GENERAL'}</span></td>
                                                            <td className="text-center fw-medium">{number_format(it.cantidad)}</td>
                                                            <td className="text-end">{formatearPrecio(it.precio)}</td>
                                                            <td className="text-end fw-bold text-primary pe-2">${formatearPrecio(sub)}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                            <tfoot className="table-light border-top">
                                                <tr className="fw-bold">
                                                    <td colSpan={4} className="text-end text-muted small">Total Factura:</td>
                                                    <td className="text-center">
                                                        {modalDetalleGasto.gasto.items.reduce((s, it) => s + (Number(it.cantidad) || 0), 0)} un
                                                    </td>
                                                    <td></td>
                                                    <td className="text-end text-primary fs-6 pe-2">
                                                        ${formatearPrecio(modalDetalleGasto.gasto.items.reduce((s, it) => s + ((Number(it.cantidad) || 0) * (Number(it.precio) || 0)), 0))}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Grid de Información Organizada */}
                            <div className="row g-3 mb-4">
                                <div className="col-12 col-md-6">
                                    <div className="p-3 rounded-3 border bg-white h-100 shadow-xs">
                                        <div className="small fw-bold text-uppercase text-muted mb-2.5" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                                            <i className="fa-solid fa-building text-secondary me-1.5"></i> Datos Comerciales
                                        </div>
                                        <div className="mb-2">
                                            <span className="text-muted small d-block">Proveedor / Empresa:</span>
                                            <strong className="text-dark">{aTitulo(modalDetalleGasto.gasto.proveedor)}</strong>
                                        </div>
                                        <div className="mb-2">
                                            <span className="text-muted small d-block">Código / Referencia:</span>
                                            <span className="badge bg-light text-dark border fw-medium px-2 py-1">{modalDetalleGasto.gasto.codigo || 'S/C'}</span>
                                        </div>
                                        <div className="mb-2">
                                            <span className="text-muted small d-block">Fecha completa:</span>
                                            <strong className="text-dark small d-flex align-items-center gap-1.5 mt-0.5">
                                                <i className="fa-regular fa-clock text-primary"></i>
                                                <span>{formatearFechaCompleta(modalDetalleGasto.gasto.fecha)}</span>
                                            </strong>
                                        </div>
                                        <div>
                                            <span className="text-muted small d-block">Registrado por:</span>
                                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-2.5 py-1 fw-bold d-inline-flex align-items-center gap-1.5 mt-1" style={{ fontSize: '0.82rem' }}>
                                                <i className="fa-solid fa-user-check"></i>
                                                <span>{obtenerNombreRegistrador(modalDetalleGasto.gasto.user)}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-12 col-md-6">
                                    <div className="p-3 rounded-3 border bg-white h-100 shadow-xs">
                                        <div className="small fw-bold text-uppercase text-muted mb-2.5" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                                            <i className="fa-solid fa-folder-tree text-secondary me-1.5"></i> Clasificación Contable
                                        </div>
                                        <div className="mb-2">
                                            <span className="text-muted small d-block">Centro de Costos (Categoría):</span>
                                            <strong className="text-dark">
                                                {modalDetalleGasto.gasto.categoria === 'K' ? 'KITS' : (modalDetalleGasto.gasto.categoria === 'G' ? 'GUANTES' : 'OTROS')}
                                            </strong>
                                        </div>
                                        <div className="mb-2">
                                            <span className="text-muted small d-block">Subcategoría:</span>
                                            <span className="badge bg-light text-secondary border px-2 py-1">{modalDetalleGasto.gasto.subCategoria || 'GENERAL'}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted small d-block">Precio Unitario:</span>
                                            <span className="fw-semibold text-dark">{formatearPrecio(modalDetalleGasto.gasto.precio)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Observaciones / Detalles */}
                            <div className="p-3 rounded-3 border bg-white mb-4 shadow-xs">
                                <div className="small fw-bold text-uppercase text-muted mb-2" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                                    <i className="fa-regular fa-comment-dots text-secondary me-1.5"></i> Observaciones / Notas
                                </div>
                                <div className="text-dark small">
                                    {modalDetalleGasto.gasto.detalle?.trim() ? (
                                        <span>{modalDetalleGasto.gasto.detalle}</span>
                                    ) : (
                                        <span className="text-muted fst-italic">Sin observaciones adicionales registradas.</span>
                                    )}
                                </div>
                            </div>

                            {/* Comprobante de Pago */}
                            <div className="p-3 rounded-3 border bg-white shadow-xs">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <div className="small fw-bold text-uppercase text-muted" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                                        <i className="fa-solid fa-paperclip text-secondary me-1.5"></i> Comprobante de Pago / Factura
                                    </div>
                                    {modalDetalleGasto.gasto.comprobante && (
                                        <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill py-1 px-2.5 small">
                                            <i className="fa-solid fa-check me-1"></i> Comprobante adjunto
                                        </span>
                                    )}
                                </div>

                                {modalDetalleGasto.gasto.comprobante ? (
                                    (() => {
                                        const esImagen = modalDetalleGasto.gasto.comprobanteTipo?.startsWith('image/') || 
                                                       modalDetalleGasto.gasto.comprobante.startsWith('data:image/');
                                        const nombre = modalDetalleGasto.gasto.comprobanteNombre || 'Comprobante';

                                        return (
                                            <div className="border rounded-3 p-3 bg-light bg-opacity-50">
                                                {esImagen ? (
                                                    <div className="text-center">
                                                        <div 
                                                            className="position-relative d-inline-block rounded-3 overflow-hidden border shadow-xs mb-3 bg-white"
                                                            style={{ cursor: 'pointer', maxWidth: '100%', maxHeight: '320px' }}
                                                            onClick={() => setVisorImagenGasto({ url: modalDetalleGasto.gasto.comprobante, nombre })}
                                                            title="Clic para ampliar imagen"
                                                        >
                                                            <img 
                                                                src={modalDetalleGasto.gasto.comprobante} 
                                                                alt={nombre} 
                                                                style={{ maxHeight: '320px', maxWidth: '100%', objectFit: 'contain' }}
                                                                className="d-block"
                                                            />
                                                            <div className="position-absolute bottom-0 end-0 m-2 bg-dark bg-opacity-75 text-white px-2.5 py-1 rounded small" style={{ fontSize: '0.75rem' }}>
                                                                <i className="fa-solid fa-magnifying-glass me-1"></i> Ampliar
                                                            </div>
                                                        </div>
                                                        <div className="d-flex align-items-center justify-content-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline-primary"
                                                                className="rounded-pill px-3 py-1.5"
                                                                onClick={() => setVisorImagenGasto({ url: modalDetalleGasto.gasto.comprobante, nombre })}
                                                            >
                                                                <i className="fa-solid fa-eye me-1.5"></i> Ver en pantalla completa
                                                            </Button>
                                                            <a 
                                                                href={modalDetalleGasto.gasto.comprobante} 
                                                                download={nombre}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-1.5"
                                                            >
                                                                <i className="fa-solid fa-download"></i> Descargar imagen
                                                            </a>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="d-flex align-items-center justify-content-between p-3 bg-white border rounded-3">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <i className="fa-solid fa-file-pdf text-danger display-6"></i>
                                                            <div>
                                                                <div className="fw-bold text-dark">{nombre}</div>
                                                                <small className="text-muted">Documento PDF / Archivo adjunto</small>
                                                            </div>
                                                        </div>
                                                        <a 
                                                            href={modalDetalleGasto.gasto.comprobante} 
                                                            download={nombre}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-sm btn-primary rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-1.5 shadow-xs"
                                                        >
                                                            <i className="fa-solid fa-arrow-down"></i> Descargar / Ver
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()
                                ) : (
                                    <div className="p-4 text-center bg-light rounded-3 border">
                                        <i className="fa-regular fa-image text-muted display-6 d-block mb-2 opacity-50"></i>
                                        <span className="badge bg-secondary-subtle text-secondary border px-3 py-1.5 fw-semibold fs-7">
                                            <i className="fa-solid fa-ban me-1.5"></i> sin comprobante
                                        </span>
                                        <div className="text-muted small mt-1.5" style={{ fontSize: '0.78rem' }}>
                                            Este gasto no cuenta con un archivo o comprobante de pago adjunto.
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Modal.Body>

                        <Modal.Footer className="py-2.5 px-4 bg-light d-flex justify-content-between">
                            <Button variant="outline-secondary" size="sm" className="rounded-pill px-3" onClick={handleCerrarDetalleGasto}>
                                Cerrar
                            </Button>
                            <Button 
                                variant="primary" 
                                size="sm" 
                                className="rounded-pill px-3 fw-semibold shadow-xs"
                                onClick={() => {
                                    const g = modalDetalleGasto.gasto;
                                    handleCerrarDetalleGasto();
                                    handleShow(g, true);
                                }}
                            >
                                <i className="fa-solid fa-pen-to-square me-1.5"></i> Editar este gasto
                            </Button>
                        </Modal.Footer>
                    </>
                )}
            </Modal>

            {/* Visor de Imagen en Tamaño Completo para Comprobante de Gasto */}
            {visorImagenGasto && (
                <Modal
                    show={!!visorImagenGasto}
                    onHide={() => setVisorImagenGasto(null)}
                    size="xl"
                    centered
                >
                    <Modal.Header closeButton className="py-2">
                        <Modal.Title className="fs-6 fw-bold text-truncate" style={{ maxWidth: '80vw' }}>
                            <i className="fa-regular fa-image me-2 text-primary"></i>
                            {visorImagenGasto.nombre}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-1 text-center bg-dark">
                        <img 
                            src={visorImagenGasto.url} 
                            alt={visorImagenGasto.nombre} 
                            style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }} 
                        />
                    </Modal.Body>
                </Modal>
            )}
            </div>
        </div>
    );
};
