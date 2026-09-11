import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useAuthStore, useFuntions } from '../../hooks';
import { getVisiblePageNumbers } from '../../helpers';
import { useGastosStore } from '../../hooks/useGastosStore'
import { Table, Header, HeaderRow, Body, Row, HeaderCell, Cell } from "@table-library/react-table-library/table";
import { useTheme } from "@table-library/react-table-library/theme";
import { usePagination } from "@table-library/react-table-library/pagination";
import { useSort, HeaderCellSort } from "@table-library/react-table-library/sort";
import Swal from 'sweetalert2';

export const ListarGastos = ({ handleShow, setFechaActual, fechaActual }) => {
    const gastos = useSelector(state => state.gastos.gastos);
    const { formatearPrecio, buscarNombre, convertirFechaIngles, limpiarFecha, number_format, capitalize, convertirFecha, aTitulo } = useFuntions();
    const [search, setSearch] = useState("");
    const [filtroKits, setFiltroKits] = useState(false);
    const [filtroGuantes, setFiltroGuantes] = useState(false);
    const [filtroMisGastos, setFiltroMisGastos] = useState(false);
    const { setGastoActivo, startDeleteGasto, startLoadingGastos } = useGastosStore();
    const { user } = useAuthStore();
    const [fechaGasto, setFechaGasto] = useState(new Date().getFullYear());
    const [itemsMostrar, setItemsMostrar] = useState(20);

    const isLeonardo = user.uid === '6789ce1b48932f890985d1f7';

    const filteredGastos = [...gastos]
        .filter((gasto) =>
            (
                gasto.gasto.toLowerCase().includes(search.toLowerCase()) ||
                gasto.proveedor.toLowerCase().includes(search.toLowerCase()) ||
                gasto.tipoGasto.toLowerCase().includes(search.toLowerCase()) ||
                gasto.fecha.toLowerCase().includes(search.toLowerCase())
            ) &&
            gasto.fecha.toLowerCase().includes(fechaGasto)
        )
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
                    <div className="d-flex align-items-center gap-1 flex-wrap">
                        <button
                            type="button"
                            className={`btn btn-sm rounded-pill px-3 ${isTodos ? 'btn-primary shadow-xs fw-semibold' : 'btn-light border text-secondary'}`}
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
                                    className={`btn btn-sm rounded-pill px-3 ${filtroKits ? 'btn-danger text-white shadow-xs fw-semibold' : 'btn-light border text-secondary'}`}
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
                                    className={`btn btn-sm rounded-pill px-3 ${filtroGuantes ? 'btn-warning text-dark fw-bold shadow-xs' : 'btn-light border text-secondary'}`}
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
                            className={`btn btn-sm rounded-pill px-3 ${filtroMisGastos ? 'btn-info text-white shadow-xs fw-semibold' : 'btn-light border text-secondary'}`}
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
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-link text-decoration-none fw-semibold text-dark p-0 text-start"
                                                    style={{ fontSize: '0.82rem' }}
                                                    onClick={() => {
                                                        setGastoActivo(item);
                                                        setFechaActual(new Date());
                                                        handleShow(item);
                                                    }}
                                                    title="Copiar datos a nuevo gasto con fecha actual"
                                                >
                                                    {aTitulo(item.gasto)}
                                                </button>
                                            </Cell>
                                            <Cell className="text-center">
                                                <span className="badge bg-light text-dark border" style={{ fontSize: '0.72rem' }}>
                                                    {item.categoria} - {item.subCategoria}
                                                </span>
                                            </Cell>
                                            <Cell className="text-end small">{formatearPrecio(item.precio)}</Cell>
                                            <Cell className="text-center">
                                                <span className="badge bg-light text-dark border px-2">{number_format(item.cantidad)}</span>
                                            </Cell>
                                            <Cell className="text-end pe-3 fw-bold text-dark">{formatearPrecio((item.cantidad) * (item.precio))}</Cell>
                                            <Cell className="text-center">
                                                <div className="d-flex align-items-center justify-content-center gap-1">
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
            </div>
        </div>
    );
};
