import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import {
    Container,
    Row,
    Col,
    Card,
    Table,
    Badge,
    Form,
    InputGroup,
    Button,
    ButtonGroup,
    OverlayTrigger,
    Tooltip,
    Collapse
} from 'react-bootstrap';
import { usePedidosStore, useGastosStore, usePreciosStore, useAuthStore, useFuntions, useAnticiposStore } from '../../hooks';
import { LayoutApp } from '../../layout/LayoutApp';
import {
    obtenerPedidosPorAnio,
    obtenerGastosPorAnio,
    obtenerTarifaVigente,
    obtenerPrecioFabricaItem,
    obtenerPrecioFabricaGuante,
    esUsuarioLeo,
    esUsuarioOscar,
    esUsuarioKarol,
    esOrdenDeLeonardo,
    esOrdenDeOscar,
    PRECIOS_FABRICA_KITS_DEFAULT,
    esItemKit,
    esItemGuante,
    esItemOtro,
    esOtrDeKit,
    clasificarItemKit,
    obtenerSubcategoriaGuante,
    formatearTituloProducto,
    parsearFechaSegura,
    esGastoCategoriaKits,
    MONTH_NAMES_FULL
} from '../helpers/historicalOrdersHelper';

const STORAGE_KEY_OTROS = 'gogo_precios_fabrica_otros';

const NOMBRES_CANONICOS_KITS = {
    KCG: 'Kit Comunión Grande',
    KCP: 'Kit Comunión Pequeño',
    KCE: 'Kit Comunión Económico',
    KB: 'Kit de Bautizo',
    CC: 'Cirio de Comunión',
    CB: 'Cirio de Bautizo'
};

export const CruceCuentas = () => {
    // Stores
    const { startLoadingOldOrders, startLoadingPedidos } = usePedidosStore();
    const { startLoadingGastos } = useGastosStore();
    const { startLoadingPrecios, startLoadingPreciosOtros, startGuardarPrecioOtro, startGuardarCategoriaOtro } = usePreciosStore();
    const {
        anticipos,
        isLoadingAnticipos,
        startLoadingAnticipos,
        startCrearAnticipo,
        startEliminarAnticipo
    } = useAnticiposStore();

    const oldOrders = useSelector(state => state.pedidos.oldOrders) || [];
    const pedidos = useSelector(state => state.pedidos.pedidos) || [];
    const gastos = useSelector(state => state.gastos.gastos) || [];
    const listaPrecios = useSelector(state => state.precios?.listaPrecios) || [];
    const { user } = useAuthStore();

    // Utilities
    const { formatearPrecio, aTitulo } = useFuntions();
    const printRef = useRef();

    // Filtros de estado
    const anioActual = String(new Date().getFullYear());
    const [anioSeleccionado, setAnioSeleccionado] = useState(anioActual);
    const [mesSeleccionado, setMesSeleccionado] = useState('TODOS');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('TODOS'); // 'TODOS' | 'VALIDOS' | 'pagado' | 'entregado' | 'despacho' | 'preparado' | 'pendiente'
    const [busqueda, setBusqueda] = useState('');
    const [filtroCategoriaOtros, setFiltroCategoriaOtros] = useState('KITS'); // 'KITS' habilitado por defecto | 'GUANTES' | 'TODOS'

    // Precios de Fábrica y Categorías para "Otros" persistentes
    const [preciosOtros, setPreciosOtros] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_OTROS);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    });
    const [guardandoKey, setGuardandoKey] = useState(null);
    const [guardadosDb, setGuardadosDb] = useState({});
    const [categoriasOtrosDb, setCategoriasOtrosDb] = useState({});

    // Estados para el CRUD de Anticipos (Item 5 a todo lo ancho)
    const [nuevoAnticipo, setNuevoAnticipo] = useState({
        detalle: '',
        cantidad: 1,
        valor: '',
        total: '',
        tipo: 'OSCAR_A_LEO' // 'OSCAR_A_LEO' | 'LEO_A_OSCAR'
    });
    const [isGuardandoAnticipo, setIsGuardandoAnticipo] = useState(false);
    const [openAnticipos, setOpenAnticipos] = useState(true);

    // Estados para hacer que cada ítem sea desplegable / colapsable
    const [openItemsLeo, setOpenItemsLeo] = useState({
        kits: true,
        cirios: true,
        guantes: true,
        otros: true,
        karol: true
    });

    const [openItemsOscar, setOpenItemsOscar] = useState({
        kits: true,
        cirios: true,
        otros: true,
        guantes: true
    });

    const toggleLeoItem = (key) => {
        setOpenItemsLeo(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleOscarItem = (key) => {
        setOpenItemsOscar(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const allLeoOpen = Object.values(openItemsLeo).every(Boolean);
    const allOscarOpen = Object.values(openItemsOscar).every(Boolean);

    const setAllLeoItems = (isOpen) => {
        setOpenItemsLeo({
            kits: isOpen,
            cirios: isOpen,
            guantes: isOpen,
            otros: isOpen,
            karol: isOpen
        });
    };

    const setAllOscarItems = (isOpen) => {
        setOpenItemsOscar({
            kits: isOpen,
            cirios: isOpen,
            otros: isOpen,
            guantes: isOpen
        });
    };

    // Manejo de cálculo automático de total = cantidad * valor
    const handleAnticipoCantidadChange = (val) => {
        const cantNum = val === '' ? '' : Number(val);
        const valorNum = Number(nuevoAnticipo.valor) || 0;
        let nuevoTot = nuevoAnticipo.total;

        if (cantNum !== '' && !isNaN(cantNum) && valorNum > 0) {
            nuevoTot = cantNum * valorNum;
        }

        setNuevoAnticipo(p => ({
            ...p,
            cantidad: val,
            total: nuevoTot
        }));
    };

    const handleAnticipoValorChange = (val) => {
        const valorNum = val === '' ? '' : Number(val);
        const cantNum = Number(nuevoAnticipo.cantidad) > 0 ? Number(nuevoAnticipo.cantidad) : 1;
        const tot = (valorNum !== '' && !isNaN(valorNum)) ? (cantNum * valorNum) : '';

        setNuevoAnticipo(p => ({
            ...p,
            valor: val,
            total: tot
        }));
    };

    const handleAnticipoTotalChange = (val) => {
        const totalNum = val === '' ? '' : Number(val);
        const cantNum = Number(nuevoAnticipo.cantidad) > 0 ? Number(nuevoAnticipo.cantidad) : 1;
        let valorUnit = nuevoAnticipo.valor;

        if (totalNum !== '' && !isNaN(totalNum) && cantNum > 0) {
            valorUnit = Math.round(totalNum / cantNum);
        }

        setNuevoAnticipo(p => ({
            ...p,
            total: val,
            valor: valorUnit
        }));
    };

    // Cargar anticipos al cambiar el año seleccionado
    useEffect(() => {
        startLoadingAnticipos(anioSeleccionado);
    }, [anioSeleccionado, startLoadingAnticipos]);

    const handleAgregarAnticipo = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!nuevoAnticipo.detalle || !nuevoAnticipo.detalle.trim()) {
            Swal.fire('Atención', 'Por favor ingresa el detalle o motivo del anticipo', 'warning');
            return;
        }
        const cantNum = Number(nuevoAnticipo.cantidad) > 0 ? Number(nuevoAnticipo.cantidad) : 1;
        let valorNum = Number(nuevoAnticipo.valor) >= 0 ? Number(nuevoAnticipo.valor) : 0;
        let totalNum = Number(nuevoAnticipo.total) > 0 
            ? Number(nuevoAnticipo.total) 
            : (cantNum * valorNum);

        if (totalNum <= 0) {
            Swal.fire('Atención', 'Por favor ingresa un valor o monto total mayor a 0', 'warning');
            return;
        }

        if (valorNum <= 0 && totalNum > 0 && cantNum > 0) {
            valorNum = Math.round(totalNum / cantNum);
        }

        setIsGuardandoAnticipo(true);
        const anio = (anioSeleccionado && anioSeleccionado !== 'TODOS') ? Number(anioSeleccionado) : new Date().getFullYear();
        const res = await startCrearAnticipo({
            detalle: nuevoAnticipo.detalle.trim(),
            cantidad: cantNum,
            valor: valorNum,
            total: totalNum,
            tipo: nuevoAnticipo.tipo,
            anio
        });

        if (res) {
            setNuevoAnticipo(prev => ({
                detalle: '',
                cantidad: 1,
                valor: '',
                total: '',
                tipo: prev.tipo
            }));
        }
        setIsGuardandoAnticipo(false);
    };

    // Cargar precios de fábrica y categorías de "Otros" guardados en la BD al montar el componente
    useEffect(() => {
        let isMounted = true;
        const cargarPreciosOtrosDb = async () => {
            const items = await startLoadingPreciosOtros();
            if (isMounted && items && items.length > 0) {
                const mapDb = {};
                const mapCats = {};
                const estadoGuardado = {};
                items.forEach(it => {
                    mapDb[it.key] = it.precioFabrica;
                    estadoGuardado[it.key] = true;
                    if (it.categoria) {
                        mapCats[it.key] = it.categoria;
                    }
                });
                setGuardadosDb(prev => ({ ...prev, ...estadoGuardado }));
                setCategoriasOtrosDb(prev => ({ ...prev, ...mapCats }));
                setPreciosOtros(prev => {
                    const combinado = { ...prev, ...mapDb };
                    try {
                        localStorage.setItem(STORAGE_KEY_OTROS, JSON.stringify(combinado));
                    } catch (e) {
                        console.error('Error guardando en localStorage', e);
                    }
                    return combinado;
                });
            }
        };
        cargarPreciosOtrosDb();
        return () => {
            isMounted = false;
        };
    }, []);

    const handlePrecioOtroChange = (key, val) => {
        const numVal = Math.max(0, Number(val) || 0);
        const actualizados = {
            ...preciosOtros,
            [key]: numVal
        };
        setPreciosOtros(actualizados);
        setGuardadosDb(prev => ({
            ...prev,
            [key]: false
        }));
        try {
            localStorage.setItem(STORAGE_KEY_OTROS, JSON.stringify(actualizados));
        } catch (e) {
            console.error('Error guardando precios otros en localStorage', e);
        }
    };

    const handleGuardarPrecioOtro = async (key, nombre, val) => {
        const numVal = Math.max(0, Number(val) || 0);
        const yaTieneDato = Boolean(guardadosDb[key] || (preciosOtros[key] && Number(preciosOtros[key]) > 0));

        const confirmacion = await Swal.fire({
            title: yaTieneDato ? '¿Actualizar precio de fábrica?' : '¿Guardar precio de fábrica?',
            html: `
                <div style="text-align: left; padding: 4px 6px; font-size: 0.92rem;">
                    <div style="margin-bottom: 10px;">
                        <span style="color: #64748b; font-size: 0.8rem; display: block; font-weight: 600; text-transform: uppercase;">Producto</span>
                        <strong style="color: #1e293b; font-size: 1.05rem;">${nombre}</strong>
                    </div>
                    <div style="margin-bottom: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px;">
                        <span style="color: #64748b; font-size: 0.8rem; display: block;">Precio unitario a registrar en BD:</span>
                        <span style="color: #0284c7; font-size: 1.35rem; font-weight: 700;">${formatearPrecio(numVal)}</span>
                    </div>
                    <p style="color: #64748b; font-size: 0.82rem; margin: 0;">
                        <i class="fa-solid fa-circle-info" style="color: #3b82f6; margin-right: 4px;"></i>
                        ${yaTieneDato ? 'Se actualizará el valor en la base de datos para los cálculos del cruce de cuentas.' : 'Se registrará este precio en la base de datos.'}
                    </p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#64748b',
            confirmButtonText: yaTieneDato ? '<i class="fa-solid fa-pen-to-square me-1"></i> Sí, actualizar' : '<i class="fa-solid fa-floppy-disk me-1"></i> Sí, guardar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });

        if (!confirmacion.isConfirmed) return;

        setGuardandoKey(key);
        const anio = (anioSeleccionado && anioSeleccionado !== 'TODOS') ? Number(anioSeleccionado) : new Date().getFullYear();
        const categoriaActual = categoriasOtrosDb[key] || 'Kits';
        const res = await startGuardarPrecioOtro({
            key,
            nombre,
            precioFabrica: numVal,
            anio,
            categoria: categoriaActual
        });
        if (res) {
            setGuardadosDb(prev => ({
                ...prev,
                [key]: true
            }));
        }
        setGuardandoKey(null);
    };

    // Cambiar categoría de negocio (Kits vs Guantes) para un producto de Otros
    const handleCambiarCategoriaOtro = (key, nombre, categoriaActual) => {
        const nuevaCategoria = categoriaActual === 'Kits' ? 'Guantes' : 'Kits';
        Swal.fire({
            title: '¿Cambiar categoría del producto?',
            html: `
                <div style="text-align: left; padding: 4px 6px; font-size: 0.92rem;">
                    <div style="margin-bottom: 12px;">
                        <span style="color: #64748b; font-size: 0.8rem; display: block; font-weight: 600; text-transform: uppercase;">Producto</span>
                        <strong style="color: #1e293b; font-size: 1.05rem;">${nombre}</strong>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-around; margin-bottom: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                        <div style="text-align: center;">
                            <span style="color: #64748b; font-size: 0.76rem; display: block; text-transform: uppercase; font-weight: 600;">Actual</span>
                            <span class="badge ${categoriaActual === 'Kits' ? 'bg-primary' : 'bg-warning text-dark'}" style="font-size: 0.86rem; padding: 5px 12px; margin-top: 4px;">
                                ${categoriaActual}
                            </span>
                        </div>
                        <i class="fa-solid fa-arrow-right text-muted fs-5"></i>
                        <div style="text-align: center;">
                            <span style="color: #64748b; font-size: 0.76rem; display: block; text-transform: uppercase; font-weight: 600;">Nueva Categoría</span>
                            <span class="badge ${nuevaCategoria === 'Kits' ? 'bg-primary' : 'bg-warning text-dark'}" style="font-size: 0.86rem; padding: 5px 12px; margin-top: 4px;">
                                ${nuevaCategoria}
                            </span>
                        </div>
                    </div>
                    <div class="alert alert-info py-2 px-3 mb-0 small" style="border-radius: 8px;">
                        <i class="fa-solid fa-circle-info me-1"></i>
                        Al confirmar, este producto quedará categorizado como <strong>${nuevaCategoria}</strong> en la base de datos y se actualizarán automáticamente las cuentas y filtros.
                    </div>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: nuevaCategoria === 'Kits' ? '#2563eb' : '#f59e0b',
            cancelButtonColor: '#64748b',
            confirmButtonText: `<i class="fa-solid fa-check me-1"></i> Sí, cambiar a ${nuevaCategoria}`,
            cancelButtonText: '<i class="fa-solid fa-xmark me-1"></i> Cancelar',
            reverseButtons: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                await startGuardarCategoriaOtro({ key, nombre, categoria: nuevaCategoria });
                setCategoriasOtrosDb(prev => ({
                    ...prev,
                    [key]: nuevaCategoria
                }));
            }
        });
    };

    // Cargar datos si aún no están en el store
    useEffect(() => {
        startLoadingOldOrders();
        startLoadingPedidos();
        startLoadingGastos();
        startLoadingPrecios();
    }, []);

    // Años disponibles
    const aniosDisponibles = useMemo(() => {
        const setAnios = new Set([2026, 2025, 2024, 2023, 2022, 2021]);
        oldOrders.forEach(o => {
            const y = o.anio || (o.fecha ? new Date(o.fecha).getFullYear() : null);
            if (y && y >= 2018) setAnios.add(y);
        });
        pedidos.forEach(p => {
            const d = p.fecha || p.createdAt;
            if (d) {
                const y = new Date(d).getFullYear();
                if (y && y >= 2018) setAnios.add(y);
            }
        });
        return Array.from(setAnios).sort((a, b) => b - a);
    }, [oldOrders, pedidos]);

    // Pedidos y gastos del año base
    const rawOrdersDelAnio = useMemo(() => {
        return obtenerPedidosPorAnio(oldOrders, pedidos, anioSeleccionado);
    }, [oldOrders, pedidos, anioSeleccionado]);

    const rawGastosDelAnio = useMemo(() => {
        return obtenerGastosPorAnio(gastos, anioSeleccionado);
    }, [gastos, anioSeleccionado]);

    // Aplicar filtros de fecha, mes y estado
    const pedidosFiltrados = useMemo(() => {
        return rawOrdersDelAnio.filter(ord => {
            // Filtro por Estado
            if (filtroEstado === 'VALIDOS') {
                const est = (ord.estado || '').toLowerCase();
                if (est === 'cancelado' || est === 'anulado') return false;
            } else if (filtroEstado !== 'TODOS') {
                if ((ord.estado || '').toLowerCase() !== filtroEstado.toLowerCase()) return false;
            }

            // Filtro por Mes
            if (mesSeleccionado !== 'TODOS') {
                const m = parseInt(mesSeleccionado, 10);
                if (ord.mes !== m) return false;
            }

            // Filtro por Rango de Fechas
            if (fechaDesde && ord.fecha) {
                const dDesde = new Date(`${fechaDesde}T00:00:00`);
                if (ord.fecha < dDesde) return false;
            }
            if (fechaHasta && ord.fecha) {
                const dHasta = new Date(`${fechaHasta}T23:59:59`);
                if (ord.fecha > dHasta) return false;
            }

            return true;
        });
    }, [rawOrdersDelAnio, filtroEstado, mesSeleccionado, fechaDesde, fechaHasta]);

    const gastosFiltrados = useMemo(() => {
        const lista = rawGastosDelAnio.lista || [];
        return lista.filter(g => {
            // Regla de negocio: En el cruce de cuentas sólo se computan gastos referentes a KITS
            if (!esGastoCategoriaKits(g.categoria)) return false;

            const f = parsearFechaSegura(g.fecha || g.createdAt);
            if (!f) return true;

            if (mesSeleccionado !== 'TODOS') {
                const m = parseInt(mesSeleccionado, 10);
                if (f.getMonth() !== m) return false;
            }
            if (fechaDesde) {
                const dDesde = new Date(`${fechaDesde}T00:00:00`);
                if (f < dDesde) return false;
            }
            if (fechaHasta) {
                const dHasta = new Date(`${fechaHasta}T23:59:59`);
                if (f > dHasta) return false;
            }
            return true;
        });
    }, [rawGastosDelAnio, mesSeleccionado, fechaDesde, fechaHasta]);

    // Anticipos filtrados por año, mes y rango de fechas
    const anticiposFiltrados = useMemo(() => {
        return (anticipos || []).filter(ant => {
            if (anioSeleccionado && anioSeleccionado !== 'TODOS') {
                if (ant.anio && Number(ant.anio) !== Number(anioSeleccionado)) return false;
            }
            if (mesSeleccionado !== 'TODOS') {
                const m = parseInt(mesSeleccionado, 10);
                const f = parsearFechaSegura(ant.fecha || ant.createdAt);
                if (f && f.getMonth() !== m) return false;
            }
            if (fechaDesde && ant.fecha) {
                const dDesde = new Date(`${fechaDesde}T00:00:00`);
                if (new Date(ant.fecha) < dDesde) return false;
            }
            if (fechaHasta && ant.fecha) {
                const dHasta = new Date(`${fechaHasta}T23:59:59`);
                if (new Date(ant.fecha) > dHasta) return false;
            }
            return true;
        });
    }, [anticipos, anioSeleccionado, mesSeleccionado, fechaDesde, fechaHasta]);

    // =========================================================================
    // PROCESAMIENTO Y CRUCE DE CUENTAS POR SOCIO
    // =========================================================================
    const liquidacionData = useMemo(() => {
        // Estructuras de acumulación
        // Leonardo
        const leoKitsMap = {};
        const leoCiriosMap = {};
        const leoGuantesMap = {};
        const leoOtrosMap = {};
        let totalUnidadesKitsLeo = 0;
        let totalFabricaKitsLeo = 0;
        let totalUnidadesCiriosLeo = 0;
        let totalFabricaCiriosLeo = 0;
        let totalUnidadesGuantesLeo = 0;
        let totalFabricaGuantesLeo = 0;
        let totalUnidadesOtrosLeo = 0;
        let totalFabricaOtrosLeo = 0;

        // Karol (Cliente de Leonardo)
        const karolKitsMap = {};
        const karolCiriosMap = {};
        const karolOtrosMap = {};
        let totalUnidadesKitsKarol = 0;
        let totalFabricaKitsKarol = 0;
        let totalUnidadesCiriosKarol = 0;
        let totalFabricaCiriosKarol = 0;
        let totalUnidadesOtrosKarol = 0;
        let totalFabricaOtrosKarol = 0;

        // Oscar
        const oscarKitsMap = {};
        const oscarCiriosMap = {};
        const oscarOtrosMap = {};
        let totalUnidadesKitsOscar = 0;
        let totalFabricaKitsOscar = 0;
        let totalUnidadesCiriosOscar = 0;
        let totalFabricaCiriosOscar = 0;
        let totalUnidadesOtrosOscar = 0;
        let totalFabricaOtrosOscar = 0;

        // Iterar pedidos y desglosar ítems
        pedidosFiltrados.forEach(order => {
            const userObj = order.user || order.raw?.user;
            // En 2024 hacia atrás: BRAND DESIGN SAS son ventas de Leonardo, el resto de Oscar
            const esLeo = esOrdenDeLeonardo(order);
            const esOscar = esOrdenDeOscar(order);
            const esKarol = esUsuarioKarol(userObj);

            // Obtener tarifa vigente a la fecha del pedido
            const tarifaVigente = obtenerTarifaVigente(order.fecha, listaPrecios);

            (order.items || []).forEach(it => {
                const cant = Number(it.cantidad) || 0;
                if (cant <= 0) return;

                const cId = String(it.categoriaId || '').toUpperCase().trim();
                const codStr = String(it.codigo || '').toUpperCase().trim();
                const matStr = String(it.idMatriz || '').toUpperCase().trim();
                const catStr = String(it.categoria || '').toUpperCase().trim();

                // 1. Detección explícita de Otros / Accesorios
                const esExplicitOtro = (
                    cId === 'OTR' || cId === 'OTROS' ||
                    codStr === 'OTR' || codStr.startsWith('OTR') ||
                    matStr.startsWith('OTR') ||
                    catStr === 'OTR' || catStr === 'OTROS'
                );

                // 2. Guantes
                const esGuante = !esExplicitOtro && esItemGuante(it);

                // 3. Clasificación de Kit/Cirio
                const clasifKit = (!esExplicitOtro && !esGuante) ? clasificarItemKit(it) : null;

                // Cirios
                const esCirio = !esExplicitOtro && !esGuante && (
                    clasifKit === 'CC' || clasifKit === 'CB' ||
                    ['CC', 'CB', 'CCNA', 'CCA', 'CBNA', 'CBA'].includes(cId) ||
                    ['CC', 'CB', 'CCNA', 'CCA', 'CBNA', 'CBA'].includes(codStr) ||
                    String(it.producto || it.nombreItem || '').toLowerCase().includes('cirio')
                );

                // Kits: ÚNICA Y EXCLUSIVAMENTE los 4 kits oficiales ('KCG', 'KCP', 'KCE', 'KB')
                // Bajo ningún concepto un 'OTR' o accesorio entra en kits
                const esKit = !esExplicitOtro && !esGuante && !esCirio && (
                    ['KCG', 'KCP', 'KCE', 'KB'].includes(clasifKit) ||
                    ['KCG', 'KCP', 'KCE', 'KB'].includes(cId) ||
                    ['KCG', 'KCP', 'KCE', 'KB', 'KGCA', 'KGCO', 'KPCA', 'KPCO', 'KBNA', 'KBNO'].includes(codStr)
                );

                let tipoKit = null;
                if (esKit) {
                    tipoKit = clasifKit || (['KCG', 'KCP', 'KCE', 'KB'].includes(cId) ? cId : null);
                    if (!tipoKit) {
                        if (codStr.startsWith('KGC') || codStr.startsWith('KCG')) tipoKit = 'KCG';
                        else if (codStr.startsWith('KPC') || codStr.startsWith('KCP')) tipoKit = 'KCP';
                        else if (codStr.startsWith('KCE')) tipoKit = 'KCE';
                        else if (codStr.startsWith('KB')) tipoKit = 'KB';
                        else tipoKit = 'KCG';
                    }
                }

                const codCirio = esCirio
                    ? ((clasifKit === 'CB' || String(it.producto || it.nombreItem || '').toLowerCase().includes('bautiz') || cId.includes('CB') || codStr.includes('CB')) ? 'CB' : 'CC')
                    : null;

                // Cualquier producto que no sea Kit, Cirio o Guante pasa automáticamente a OTROS
                const esOtro = !esKit && !esCirio && !esGuante;
                const esDeKit = esOtrDeKit(it);

                // Clasificar según socio y categoría
                if (esLeo) {
                    if (esKit) {
                        const pFabrica = obtenerPrecioFabricaItem(tipoKit, tarifaVigente) || PRECIOS_FABRICA_KITS_DEFAULT[tipoKit] || 0;
                        const sub = cant * pFabrica;
                        const key = tipoKit;
                        const nombreKit = NOMBRES_CANONICOS_KITS[tipoKit] || it.producto || it.subcategoria || key;
                        if (!leoKitsMap[key]) {
                            leoKitsMap[key] = {
                                codigo: key,
                                nombre: nombreKit,
                                cantidad: 0,
                                precioFabrica: pFabrica,
                                total: 0
                            };
                        }
                        leoKitsMap[key].cantidad += cant;
                        leoKitsMap[key].total += sub;
                        if (!leoKitsMap[key].precioFabrica && pFabrica > 0) {
                            leoKitsMap[key].precioFabrica = pFabrica;
                        }
                        totalUnidadesKitsLeo += cant;
                        totalFabricaKitsLeo += sub;
                    } else if (esCirio) {
                        const pFabrica = obtenerPrecioFabricaItem(codCirio, tarifaVigente) || PRECIOS_FABRICA_KITS_DEFAULT[codCirio] || 0;
                        const sub = cant * pFabrica;
                        const key = codCirio;
                        const nombreCirio = NOMBRES_CANONICOS_KITS[codCirio] || it.producto || (codCirio === 'CC' ? 'Cirio de Comunión' : 'Cirio de Bautizo');
                        if (!leoCiriosMap[key]) {
                            leoCiriosMap[key] = {
                                codigo: key,
                                nombre: nombreCirio,
                                cantidad: 0,
                                precioFabrica: pFabrica,
                                total: 0
                            };
                        }
                        leoCiriosMap[key].cantidad += cant;
                        leoCiriosMap[key].total += sub;
                        if (!leoCiriosMap[key].precioFabrica && pFabrica > 0) {
                            leoCiriosMap[key].precioFabrica = pFabrica;
                        }
                        totalUnidadesCiriosLeo += cant;
                        totalFabricaCiriosLeo += sub;
                    } else if (esGuante) {
                        const subcat = obtenerSubcategoriaGuante(it.producto, it.subcategoria, it.codigo, it.categoriaId);
                        const pFabrica = obtenerPrecioFabricaGuante(it, tarifaVigente);
                        const sub = cant * pFabrica;
                        const key = subcat.id;
                        if (!leoGuantesMap[key]) {
                            leoGuantesMap[key] = {
                                codigo: key,
                                nombre: subcat.nombre,
                                cantidad: 0,
                                precioFabrica: pFabrica,
                                total: 0
                            };
                        }
                        leoGuantesMap[key].cantidad += cant;
                        leoGuantesMap[key].total += sub;
                        if (!leoGuantesMap[key].precioFabrica && pFabrica > 0) {
                            leoGuantesMap[key].precioFabrica = pFabrica;
                        }
                        totalUnidadesGuantesLeo += cant;
                        totalFabricaGuantesLeo += sub;
                    } else if (esOtro) {
                        const cleanName = formatearTituloProducto(it.producto || it.nombreItem || 'Producto');
                        const key = `OTR_${cleanName.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 30)}`;
                        const categoriaNegocio = categoriasOtrosDb[key] || (esDeKit ? 'Kits' : 'Guantes');
                        if (filtroCategoriaOtros === 'TODOS' || 
                            (filtroCategoriaOtros === 'KITS' && categoriaNegocio === 'Kits') || 
                            (filtroCategoriaOtros === 'GUANTES' && categoriaNegocio === 'Guantes')) {
                            const pFabrica = Number(preciosOtros[key] || 0);
                            const sub = cant * pFabrica;
                            const subVenta = cant * Number(it.precio || 0);
                            if (!leoOtrosMap[key]) {
                                leoOtrosMap[key] = {
                                    key,
                                    nombre: cleanName,
                                    categoriaNegocio,
                                    cantidad: 0,
                                    precioFabrica: pFabrica,
                                    total: 0,
                                    totalVenta: 0,
                                    precioVentaPromedio: 0
                                };
                            }
                            leoOtrosMap[key].cantidad += cant;
                            leoOtrosMap[key].total += sub;
                            leoOtrosMap[key].totalVenta += subVenta;
                            totalUnidadesOtrosLeo += cant;
                            totalFabricaOtrosLeo += sub;
                        }
                    }
                } else if (esKarol) {
                    // Karol actúa como cliente de Leonardo: SÓLO KITS, CIRIOS Y OTROS (Guantes de Karol no entran aquí)
                    if (esKit) {
                        const pFabrica = obtenerPrecioFabricaItem(tipoKit, tarifaVigente) || PRECIOS_FABRICA_KITS_DEFAULT[tipoKit] || 0;
                        const sub = cant * pFabrica;
                        const key = tipoKit;
                        const nombreKit = NOMBRES_CANONICOS_KITS[tipoKit] || it.producto || it.subcategoria || key;
                        if (!karolKitsMap[key]) {
                            karolKitsMap[key] = {
                                codigo: key,
                                nombre: nombreKit,
                                cantidad: 0,
                                precioFabrica: pFabrica,
                                total: 0
                            };
                        }
                        karolKitsMap[key].cantidad += cant;
                        karolKitsMap[key].total += sub;
                        if (!karolKitsMap[key].precioFabrica && pFabrica > 0) {
                            karolKitsMap[key].precioFabrica = pFabrica;
                        }
                        totalUnidadesKitsKarol += cant;
                        totalFabricaKitsKarol += sub;
                    } else if (esCirio) {
                        const pFabrica = obtenerPrecioFabricaItem(codCirio, tarifaVigente) || PRECIOS_FABRICA_KITS_DEFAULT[codCirio] || 0;
                        const sub = cant * pFabrica;
                        const key = codCirio;
                        const nombreCirio = NOMBRES_CANONICOS_KITS[codCirio] || it.producto || (codCirio === 'CC' ? 'Cirio de Comunión' : 'Cirio de Bautizo');
                        if (!karolCiriosMap[key]) {
                            karolCiriosMap[key] = {
                                codigo: key,
                                nombre: nombreCirio,
                                cantidad: 0,
                                precioFabrica: pFabrica,
                                total: 0
                            };
                        }
                        karolCiriosMap[key].cantidad += cant;
                        karolCiriosMap[key].total += sub;
                        if (!karolCiriosMap[key].precioFabrica && pFabrica > 0) {
                            karolCiriosMap[key].precioFabrica = pFabrica;
                        }
                        totalUnidadesCiriosKarol += cant;
                        totalFabricaCiriosKarol += sub;
                    } else if (esOtro) {
                        const cleanName = formatearTituloProducto(it.producto || it.nombreItem || 'Producto');
                        const key = `OTR_${cleanName.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 30)}`;
                        const categoriaNegocio = categoriasOtrosDb[key] || (esDeKit ? 'Kits' : 'Guantes');
                        if (filtroCategoriaOtros === 'TODOS' || 
                            (filtroCategoriaOtros === 'KITS' && categoriaNegocio === 'Kits') || 
                            (filtroCategoriaOtros === 'GUANTES' && categoriaNegocio === 'Guantes')) {
                            const pFabrica = Number(preciosOtros[key] || 0);
                            const sub = cant * pFabrica;
                            const subVenta = cant * Number(it.precio || 0);
                            if (!karolOtrosMap[key]) {
                                karolOtrosMap[key] = {
                                    key,
                                    nombre: cleanName,
                                    categoriaNegocio,
                                    cantidad: 0,
                                    precioFabrica: pFabrica,
                                    total: 0,
                                    totalVenta: 0,
                                    precioVentaPromedio: 0
                                };
                            }
                            karolOtrosMap[key].cantidad += cant;
                            karolOtrosMap[key].total += sub;
                            karolOtrosMap[key].totalVenta += subVenta;
                            totalUnidadesOtrosKarol += cant;
                            totalFabricaOtrosKarol += sub;
                        }
                    }
                } else if (esOscar) {
                    // Oscar: Kits, Cirios y Otros (los guantes vendidos por Oscar NO van en esta parte)
                    if (esKit) {
                        const pFabrica = obtenerPrecioFabricaItem(tipoKit, tarifaVigente) || PRECIOS_FABRICA_KITS_DEFAULT[tipoKit] || 0;
                        const sub = cant * pFabrica;
                        const key = tipoKit;
                        const nombreKit = NOMBRES_CANONICOS_KITS[tipoKit] || it.producto || it.subcategoria || key;
                        if (!oscarKitsMap[key]) {
                            oscarKitsMap[key] = {
                                codigo: key,
                                nombre: nombreKit,
                                cantidad: 0,
                                precioFabrica: pFabrica,
                                total: 0
                            };
                        }
                        oscarKitsMap[key].cantidad += cant;
                        oscarKitsMap[key].total += sub;
                        if (!oscarKitsMap[key].precioFabrica && pFabrica > 0) {
                            oscarKitsMap[key].precioFabrica = pFabrica;
                        }
                        totalUnidadesKitsOscar += cant;
                        totalFabricaKitsOscar += sub;
                    } else if (esCirio) {
                        const pFabrica = obtenerPrecioFabricaItem(codCirio, tarifaVigente) || PRECIOS_FABRICA_KITS_DEFAULT[codCirio] || 0;
                        const sub = cant * pFabrica;
                        const key = codCirio;
                        const nombreCirio = NOMBRES_CANONICOS_KITS[codCirio] || it.producto || (codCirio === 'CC' ? 'Cirio de Comunión' : 'Cirio de Bautizo');
                        if (!oscarCiriosMap[key]) {
                            oscarCiriosMap[key] = {
                                codigo: key,
                                nombre: nombreCirio,
                                cantidad: 0,
                                precioFabrica: pFabrica,
                                total: 0
                            };
                        }
                        oscarCiriosMap[key].cantidad += cant;
                        oscarCiriosMap[key].total += sub;
                        if (!oscarCiriosMap[key].precioFabrica && pFabrica > 0) {
                            oscarCiriosMap[key].precioFabrica = pFabrica;
                        }
                        totalUnidadesCiriosOscar += cant;
                        totalFabricaCiriosOscar += sub;
                    } else if (esOtro) {
                        const cleanName = formatearTituloProducto(it.producto || it.nombreItem || 'Producto');
                        const key = `OTR_${cleanName.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 30)}`;
                        const categoriaNegocio = categoriasOtrosDb[key] || (esDeKit ? 'Kits' : 'Guantes');
                        if (filtroCategoriaOtros === 'TODOS' || 
                            (filtroCategoriaOtros === 'KITS' && categoriaNegocio === 'Kits') || 
                            (filtroCategoriaOtros === 'GUANTES' && categoriaNegocio === 'Guantes')) {
                            const pFabrica = Number(preciosOtros[key] || 0);
                            const sub = cant * pFabrica;
                            const subVenta = cant * Number(it.precio || 0);
                            if (!oscarOtrosMap[key]) {
                                oscarOtrosMap[key] = {
                                    key,
                                    nombre: cleanName,
                                    categoriaNegocio,
                                    cantidad: 0,
                                    precioFabrica: pFabrica,
                                    total: 0,
                                    totalVenta: 0,
                                    precioVentaPromedio: 0
                                };
                            }
                            oscarOtrosMap[key].cantidad += cant;
                            oscarOtrosMap[key].total += sub;
                            oscarOtrosMap[key].totalVenta += subVenta;
                            totalUnidadesOtrosOscar += cant;
                            totalFabricaOtrosOscar += sub;
                        }
                    }
                }
            });
        });

        // Calcular precio de venta promedio de referencia para cada producto de Otros
        Object.values(leoOtrosMap).forEach(o => {
            o.precioVentaPromedio = o.cantidad > 0 ? (o.totalVenta / o.cantidad) : 0;
        });
        Object.values(karolOtrosMap).forEach(o => {
            o.precioVentaPromedio = o.cantidad > 0 ? (o.totalVenta / o.cantidad) : 0;
        });
        Object.values(oscarOtrosMap).forEach(o => {
            o.precioVentaPromedio = o.cantidad > 0 ? (o.totalVenta / o.cantidad) : 0;
        });

        // =====================================================================
        // GASTOS DEDUCIBLES (Exclusivamente categoría Kits)
        // =====================================================================
        let gastosLeoKits = 0;
        let gastosOscarKits = 0;

        gastosFiltrados.forEach(g => {
            if (!esGastoCategoriaKits(g.categoria)) return;

            const sub = Number(g.precio || 0) * Number(g.cantidad || 1);
            const esLeo = esUsuarioLeo(g.user);
            const esOscar = esUsuarioOscar(g.user);
            const esKarol = esUsuarioKarol(g.user);

            if (esLeo) {
                gastosLeoKits += sub;
            } else if (esKarol) {
                gastosLeoKits += sub;
            } else if (esOscar) {
                gastosOscarKits += sub;
            } else {
                gastosLeoKits += sub;
            }
        });

        const totalGastosLeo = gastosLeoKits;
        const totalGastosOscar = gastosOscarKits;

        // =====================================================================
        // TOTALIZACIÓN POR SOCIO
        // =====================================================================
        const ventaFabricaKitsLeonardoTotal = totalFabricaKitsLeo + totalFabricaCiriosLeo + totalFabricaOtrosLeo + totalFabricaKitsKarol + totalFabricaCiriosKarol + totalFabricaOtrosKarol;
        const totalUnidadesKitsLeonardoTotal = totalUnidadesKitsLeo + totalUnidadesCiriosLeo + totalUnidadesOtrosLeo + totalUnidadesKitsKarol + totalUnidadesCiriosKarol + totalUnidadesOtrosKarol;

        // Resultado Operativo de Kits de Leonardo
        const resultadoNetoKitsLeo = ventaFabricaKitsLeonardoTotal - totalGastosLeo;

        // Total Guantes Leonardo a Precio de Fábrica (Anticipo / Deuda a Oscar)
        const totalAnticipoGuantesLeo = totalFabricaGuantesLeo;

        // Oscar acumula sus kits propios + sus cirios + sus otros
        const ventaFabricaKitsOscarTotal = totalFabricaKitsOscar + totalFabricaCiriosOscar + totalFabricaOtrosOscar;
        const totalUnidadesKitsOscarTotal = totalUnidadesKitsOscar + totalUnidadesCiriosOscar + totalUnidadesOtrosOscar;

        // Resultado Operativo de Kits de Oscar
        const resultadoNetoKitsOscar = ventaFabricaKitsOscarTotal - totalGastosOscar;

        // =====================================================================
        // ANTICIPOS O ADELANTOS DE DINERO (ITEM 5)
        // =====================================================================
        let totalAnticiposOscarALeo = 0;
        let totalAnticiposLeoAOscar = 0;

        anticiposFiltrados.forEach(ant => {
            const m = Number(ant.total || 0);
            if (ant.tipo === 'LEO_A_OSCAR') {
                totalAnticiposLeoAOscar += m;
            } else {
                totalAnticiposOscarALeo += m;
            }
        });

        // Neto de anticipos: lo que Oscar adelantó a Leo le corresponde cobrar a Oscar (+).
        // Lo que Leo adelantó a Oscar le corresponde cobrar a Leo (- en la deuda de Leo a Oscar).
        const netoAnticiposAOscar = totalAnticiposOscarALeo - totalAnticiposLeoAOscar;

        // =====================================================================
        // GRAN CONSOLIDADO Y LIQUIDACIÓN ENTRE SOCIOS (50% / 50%)
        // =====================================================================
        const ventaFabricaTotalKitsConjunto = ventaFabricaKitsLeonardoTotal + ventaFabricaKitsOscarTotal;
        const totalGastosKitsConjunto = totalGastosLeo + totalGastosOscar;
        const utilidadConjuntaKits = ventaFabricaTotalKitsConjunto - totalGastosKitsConjunto;
        const cuotaEquitativa50Kits = utilidadConjuntaKits / 2;

        const diferenciaKitsLeo = resultadoNetoKitsLeo - cuotaEquitativa50Kits;
        const deudaGuantesLeoAOscar = totalAnticipoGuantesLeo;
        const saldoNetoLeoAOscar = diferenciaKitsLeo + deudaGuantesLeoAOscar + netoAnticiposAOscar;

        let saldoAFavorDe = 'EQUILIBRIO';
        let montoTransferencia = 0;
        let mensajeCruce = '';

        if (saldoNetoLeoAOscar < -0.01) {
            saldoAFavorDe = 'LEO';
            montoTransferencia = Math.abs(saldoNetoLeoAOscar);
            mensajeCruce = `Saldo a favor de Leonardo: ${formatearPrecio(montoTransferencia)}`;
        } else if (saldoNetoLeoAOscar > 0.01) {
            saldoAFavorDe = 'OSCAR';
            montoTransferencia = saldoNetoLeoAOscar;
            mensajeCruce = `Saldo a favor de Oscar: ${formatearPrecio(montoTransferencia)}`;
        } else {
            saldoAFavorDe = 'EQUILIBRIO';
            montoTransferencia = 0;
            mensajeCruce = 'Cuentas conciliadas en equilibrio ($ 0)';
        }

        return {
            leo: {
                kits: Object.values(leoKitsMap),
                cirios: Object.values(leoCiriosMap),
                guantes: Object.values(leoGuantesMap),
                otros: Object.values(leoOtrosMap),
                totalUnidadesKitsLeo,
                totalFabricaKitsLeo,
                totalUnidadesCiriosLeo,
                totalFabricaCiriosLeo,
                totalUnidadesGuantesLeo,
                totalFabricaGuantesLeo,
                totalUnidadesOtrosLeo,
                totalFabricaOtrosLeo,
                gastosKits: gastosLeoKits,
                totalGastos: totalGastosLeo,
                ventaFabricaKitsLeonardoTotal,
                totalUnidadesKitsLeonardoTotal,
                resultadoNetoKitsLeo,
                totalAnticipoGuantesLeo,
                totalAnticiposRecibidosDeOscar: totalAnticiposOscarALeo,
                totalAnticiposEntregadosAOscar: totalAnticiposLeoAOscar
            },
            karol: {
                kits: Object.values(karolKitsMap),
                cirios: Object.values(karolCiriosMap),
                otros: Object.values(karolOtrosMap),
                totalUnidadesKitsKarol,
                totalFabricaKitsKarol,
                totalUnidadesCiriosKarol,
                totalFabricaCiriosKarol,
                totalUnidadesOtrosKarol,
                totalFabricaOtrosKarol,
                totalFabricaKarol: totalFabricaKitsKarol + totalFabricaCiriosKarol + totalFabricaOtrosKarol,
                totalUnidadesKarol: totalUnidadesKitsKarol + totalUnidadesCiriosKarol + totalUnidadesOtrosKarol
            },
            oscar: {
                kits: Object.values(oscarKitsMap),
                cirios: Object.values(oscarCiriosMap),
                otros: Object.values(oscarOtrosMap),
                totalUnidadesKitsOscar,
                totalFabricaKitsOscar,
                totalUnidadesCiriosOscar,
                totalFabricaCiriosOscar,
                totalUnidadesOtrosOscar,
                totalFabricaOtrosOscar,
                ventaFabricaKitsOscarTotal,
                totalUnidadesKitsOscarTotal,
                gastosKits: gastosOscarKits,
                totalGastos: totalGastosOscar,
                resultadoNetoKitsOscar,
                totalAnticiposEntregadosALeo: totalAnticiposOscarALeo,
                totalAnticiposRecibidosDeLeo: totalAnticiposLeoAOscar
            },
            consolidado: {
                ventaFabricaTotalKitsConjunto,
                totalGastosKitsConjunto,
                utilidadConjuntaKits,
                cuotaEquitativa50Kits,
                diferenciaKitsLeo,
                deudaGuantesLeoAOscar,
                totalAnticiposOscarALeo,
                totalAnticiposLeoAOscar,
                netoAnticiposAOscar,
                saldoNetoLeoAOscar,
                saldoAFavorDe,
                quienDebe: saldoAFavorDe === 'LEO' ? 'OSCAR_A_LEO' : saldoAFavorDe === 'OSCAR' ? 'LEO_A_OSCAR' : 'PAZ_Y_SALVO',
                montoTransferencia,
                mensajeCruce
            }
        };
    }, [pedidosFiltrados, gastosFiltrados, anticiposFiltrados, listaPrecios, preciosOtros, filtroCategoriaOtros, formatearPrecio, categoriasOtrosDb]);

    // Filtrar tablas si hay término de búsqueda
    const filtroBusqueda = (arr = []) => {
        if (!busqueda) return arr;
        const term = busqueda.toLowerCase().trim();
        return arr.filter(it => (it.nombre || '').toLowerCase().includes(term) || (it.codigo || '').toLowerCase().includes(term));
    };

    // Filtrar anticipos si hay término de búsqueda
    const anticiposBusqueda = useMemo(() => {
        if (!busqueda) return anticiposFiltrados;
        const term = busqueda.toLowerCase().trim();
        return anticiposFiltrados.filter(it => (it.detalle || '').toLowerCase().includes(term));
    }, [anticiposFiltrados, busqueda]);

    return (
        <LayoutApp>
            <Container fluid className="px-3 px-md-4 py-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            {/* ENCABEZADO Y TÍTULO DE LA VISTA */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 rounded-pill fw-bold">
                            <i className="fa-solid fa-scale-balanced me-1"></i> Liquidación Socios
                        </span>
                        <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2.5 py-1 rounded-pill fw-bold">
                            <i className="fa-solid fa-industry me-1"></i> Precios de Fábrica
                        </span>
                    </div>
                    <h3 className="fw-bolder text-dark mb-0">Cruce de Cuentas: Leonardo & Oscar</h3>
                    <p className="text-muted small mb-0">
                        Estado de resultados y liquidación equitativa (50/50) a precios de fábrica con anticipo de guantes y deducción de gastos.
                    </p>
                </div>

                <div className="d-flex align-items-center gap-2">
                    <Button
                        variant="outline-secondary"
                        className="rounded-pill px-3 shadow-xs d-flex align-items-center gap-2"
                        onClick={() => window.print()}
                        title="Imprimir informe de liquidación"
                    >
                        <i className="fa-solid fa-print"></i>
                        <span>Imprimir</span>
                    </Button>
                </div>
            </div>

            {/* BARRA DE FILTROS SUPERIOR */}
            <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white">
                <Card.Body className="p-3">
                    <Row className="g-3 align-items-center">
                        {/* Selector de Año */}
                        <Col xs={12} sm={6} md={3} lg={2}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-secondary mb-1">
                                    <i className="fa-solid fa-calendar me-1"></i> Año
                                </Form.Label>
                                <Form.Select
                                    size="sm"
                                    className="rounded-pill fw-bold"
                                    value={anioSeleccionado}
                                    onChange={(e) => setAnioSeleccionado(e.target.value)}
                                >
                                    {aniosDisponibles.map(y => (
                                        <option key={y} value={y}>Año {y}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {/* Selector de Mes */}
                        <Col xs={12} sm={6} md={3} lg={2}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-secondary mb-1">
                                    <i className="fa-solid fa-calendar-week me-1"></i> Mes
                                </Form.Label>
                                <Form.Select
                                    size="sm"
                                    className="rounded-pill"
                                    value={mesSeleccionado}
                                    onChange={(e) => setMesSeleccionado(e.target.value)}
                                >
                                    <option value="TODOS">Todos los Meses</option>
                                    {MONTH_NAMES_FULL.map((nombre, i) => (
                                        <option key={i} value={i}>{nombre}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {/* Estado del Pedido */}
                        <Col xs={12} sm={6} md={3} lg={3}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-secondary mb-1">
                                    <i className="fa-solid fa-tags me-1"></i> Estado Pedido
                                </Form.Label>
                                <Form.Select
                                    size="sm"
                                    className="rounded-pill"
                                    value={filtroEstado}
                                    onChange={(e) => setFiltroEstado(e.target.value)}
                                >
                                    <option value="TODOS">Todos los Estados (Histórico Completo)</option>
                                    <option value="VALIDOS">Válidos (No Anulados)</option>
                                    <option value="pagado">Solo Pagados</option>
                                    <option value="entregado">Solo Entregados</option>
                                    <option value="despacho">Solo Despachados</option>
                                    <option value="preparado">Solo Preparados</option>
                                    <option value="pendiente">Solo Pendientes</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {/* Búsqueda */}
                        <Col xs={12} sm={6} md={3} lg={3}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-secondary mb-1">
                                    <i className="fa-solid fa-magnifying-glass me-1"></i> Buscar Producto
                                </Form.Label>
                                <Form.Control
                                    size="sm"
                                    type="text"
                                    placeholder="Filtrar por ítem o código..."
                                    className="rounded-pill"
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                />
                            </Form.Group>
                        </Col>

                        {/* Filtro Categoría de Otros */}
                        <Col xs={12} sm={6} md={4} lg={3}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-secondary mb-1 d-flex align-items-center justify-content-between">
                                    <span><i className="fa-solid fa-filter me-1"></i> Filtro en Otros</span>
                                    <small className="text-muted fw-normal">Por defecto: Kits</small>
                                </Form.Label>
                                <ButtonGroup size="sm" className="w-100 shadow-sm rounded-pill overflow-hidden border">
                                    <Button
                                        variant={filtroCategoriaOtros === 'KITS' ? 'primary' : 'light'}
                                        className={`fw-bold border-0 ${filtroCategoriaOtros === 'KITS' ? '' : 'text-secondary'}`}
                                        onClick={() => setFiltroCategoriaOtros('KITS')}
                                    >
                                        <i className="fa-solid fa-box-open me-1"></i> Kits
                                    </Button>
                                    <Button
                                        variant={filtroCategoriaOtros === 'GUANTES' ? 'warning' : 'light'}
                                        className={`fw-bold border-0 ${filtroCategoriaOtros === 'GUANTES' ? 'text-dark' : 'text-secondary'}`}
                                        onClick={() => setFiltroCategoriaOtros('GUANTES')}
                                    >
                                        <i className="fa-solid fa-mitten me-1"></i> Guantes
                                    </Button>
                                    <Button
                                        variant={filtroCategoriaOtros === 'TODOS' ? 'dark' : 'light'}
                                        className={`fw-bold border-0 ${filtroCategoriaOtros === 'TODOS' ? '' : 'text-secondary'}`}
                                        onClick={() => setFiltroCategoriaOtros('TODOS')}
                                    >
                                        Todos
                                    </Button>
                                </ButtonGroup>
                            </Form.Group>
                        </Col>

                        {/* Botón de limpiar filtros */}
                        {(fechaDesde || fechaHasta || mesSeleccionado !== 'TODOS' || filtroEstado !== 'TODOS' || busqueda || filtroCategoriaOtros !== 'KITS') && (
                            <Col xs={12} sm={6} md={3} lg={2} className="d-flex align-items-end">
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    className="rounded-pill w-100 fw-bold"
                                    onClick={() => {
                                        setMesSeleccionado('TODOS');
                                        setFechaDesde('');
                                        setFechaHasta('');
                                        setFiltroEstado('TODOS');
                                        setBusqueda('');
                                        setFiltroCategoriaOtros('KITS');
                                    }}
                                >
                                    <i className="fa-solid fa-xmark me-1"></i> Limpiar Filtros
                                </Button>
                            </Col>
                        )}
                    </Row>
                </Card.Body>
            </Card>

            {/* ================================================================= */}
            {/* WIDGET DESTACADO: GRAN CONSOLIDADO & BALANCE DE LIQUIDACIÓN 50/50 */}
            {/* ================================================================= */}
            <Card
                className="border-0 rounded-4 overflow-hidden mb-4 shadow-lg"
                style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 12px 30px -6px rgba(15, 23, 42, 0.35)',
                    color: '#ffffff'
                }}
            >
                <Card.Body className="p-4">
                    <Row className="align-items-center g-4">
                        {/* Resolución Central */}
                        <Col xs={12} lg={6}>
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <span className="badge rounded-pill px-3 py-1 fw-bold text-uppercase" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', border: '1px solid rgba(147, 197, 253, 0.3)', letterSpacing: '0.5px' }}>
                                    <i className="fa-solid fa-scale-balanced me-1"></i> Balance de Liquidación {anioSeleccionado}
                                </span>
                                <span className="small text-white-50">Reparto Equitativo al 50%</span>
                            </div>

                            <h2 className="display-6 fw-bolder text-white mb-2">
                                {liquidacionData.consolidado.saldoAFavorDe === 'LEO' && (
                                    <>
                                        Saldo a favor de Leonardo:{' '}
                                        <span className="text-warning text-nowrap">
                                            {formatearPrecio(liquidacionData.consolidado.montoTransferencia)}
                                        </span>
                                    </>
                                )}
                                {liquidacionData.consolidado.saldoAFavorDe === 'OSCAR' && (
                                    <>
                                        Saldo a favor de Oscar:{' '}
                                        <span className="text-warning text-nowrap">
                                            {formatearPrecio(liquidacionData.consolidado.montoTransferencia)}
                                        </span>
                                    </>
                                )}
                                {liquidacionData.consolidado.saldoAFavorDe === 'EQUILIBRIO' && (
                                    <>Cuentas en Equilibrio ($ 0)</>
                                )}
                            </h2>

                            <p className="text-white-50 mb-0 small">
                                {liquidacionData.consolidado.saldoAFavorDe === 'LEO'
                                    ? 'Resultado neto favorable para Leonardo tras conciliar la utilidad de Kits al 50%, cruzar los guantes suministrados por Oscar y computar los anticipos de dinero.'
                                    : liquidacionData.consolidado.saldoAFavorDe === 'OSCAR'
                                        ? 'Resultado neto favorable para Oscar tras conciliar la utilidad de Kits al 50%, cruzar los guantes suministrados a Leonardo y computar los anticipos de dinero.'
                                        : 'Ambos socios cuentan con balance equitativo tras compensar kits, guantes y anticipos de dinero.'
                                }
                            </p>
                        </Col>

                        {/* Desglose de los Conceptos de Liquidación */}
                        <Col xs={12} lg={6}>
                            <div className="rounded-4 p-3 border" style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                                <h6 className="fw-bold text-white mb-3 d-flex align-items-center justify-content-between">
                                    <span><i className="fa-solid fa-calculator me-1.5 text-warning"></i> Conciliación Paso a Paso</span>
                                    <span className="small text-white-50">Año {anioSeleccionado}</span>
                                </h6>

                                <div className="d-flex flex-column gap-2 small">
                                    {/* 1. Kits */}
                                    <div className="d-flex justify-content-between align-items-center pb-2 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                                        <span>
                                            1. Compensación Utilidad Kits (50% / 50%):
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={
                                                    <Tooltip id="tt-kits">
                                                        Utilidad Neta Kits Total: {formatearPrecio(liquidacionData.consolidado.utilidadConjuntaKits)}.
                                                        Cuota de cada socio: {formatearPrecio(liquidacionData.consolidado.cuotaEquitativa50Kits)}.
                                                    </Tooltip>
                                                }
                                            >
                                                <i className="fa-solid fa-circle-info ms-1 text-white-50 cursor-pointer"></i>
                                            </OverlayTrigger>
                                        </span>
                                        <strong className="text-white">
                                            {liquidacionData.consolidado.diferenciaKitsLeo < 0
                                                ? `Saldo a favor de Leonardo: ${formatearPrecio(Math.abs(liquidacionData.consolidado.diferenciaKitsLeo))}`
                                                : liquidacionData.consolidado.diferenciaKitsLeo > 0
                                                    ? `Saldo a favor de Oscar: ${formatearPrecio(liquidacionData.consolidado.diferenciaKitsLeo)}`
                                                    : 'Equitativo ($ 0)'
                                            }
                                        </strong>
                                    </div>

                                    {/* 2. Anticipo Guantes */}
                                    <div className="d-flex justify-content-between align-items-center pb-2 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                                        <span>
                                            2. Guantes Fábrica (Suministrados por Oscar):
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={
                                                    <Tooltip id="tt-guantes">
                                                        Como Oscar suministra los guantes a Leonardo a costo de fábrica, este valor se acredita a favor de Oscar en el cruce.
                                                    </Tooltip>
                                                }
                                            >
                                                <i className="fa-solid fa-circle-info ms-1 text-white-50 cursor-pointer"></i>
                                            </OverlayTrigger>
                                        </span>
                                        <strong className="text-warning">
                                            + {formatearPrecio(liquidacionData.consolidado.deudaGuantesLeoAOscar)} (a favor de Oscar)
                                        </strong>
                                    </div>

                                    {/* 3. Anticipos de Dinero (Item 5) */}
                                    <div className="d-flex justify-content-between align-items-center pb-2 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                                        <span>
                                            3. Anticipos / Adelantos de Dinero:
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={
                                                    <Tooltip id="tt-anticipos">
                                                        Oscar adelantó a Leo: {formatearPrecio(liquidacionData.consolidado.totalAnticiposOscarALeo)}.
                                                        Leo adelantó a Oscar: {formatearPrecio(liquidacionData.consolidado.totalAnticiposLeoAOscar)}.
                                                    </Tooltip>
                                                }
                                            >
                                                <i className="fa-solid fa-circle-info ms-1 text-white-50 cursor-pointer"></i>
                                            </OverlayTrigger>
                                        </span>
                                        <strong className={liquidacionData.consolidado.netoAnticiposAOscar > 0 ? 'text-warning' : liquidacionData.consolidado.netoAnticiposAOscar < 0 ? 'text-info' : 'text-white'}>
                                            {liquidacionData.consolidado.netoAnticiposAOscar > 0
                                                ? `+ ${formatearPrecio(liquidacionData.consolidado.netoAnticiposAOscar)} (a favor de Oscar)`
                                                : liquidacionData.consolidado.netoAnticiposAOscar < 0
                                                    ? `- ${formatearPrecio(Math.abs(liquidacionData.consolidado.netoAnticiposAOscar))} (a favor de Leonardo)`
                                                    : 'Equitativo ($ 0)'
                                            }
                                        </strong>
                                    </div>

                                    {/* 4. Gran Total */}
                                    <div className="d-flex justify-content-between align-items-center pt-1 fs-6 fw-bold">
                                        <span className="text-white">
                                            SALDO NETO FINAL{' '}
                                            {liquidacionData.consolidado.saldoAFavorDe === 'LEO' && '(A FAVOR DE LEONARDO):'}
                                            {liquidacionData.consolidado.saldoAFavorDe === 'OSCAR' && '(A FAVOR DE OSCAR):'}
                                            {liquidacionData.consolidado.saldoAFavorDe === 'EQUILIBRIO' && '(EN EQUILIBRIO):'}
                                        </span>
                                        <span className="badge bg-warning text-dark px-3 py-1.5 rounded-pill fs-6 fw-bolder">
                                            {formatearPrecio(liquidacionData.consolidado.montoTransferencia)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* ================================================================= */}
            {/* RESUMEN COMPARATIVO EN 4 KPIs */}
            {/* ================================================================= */}
            <Row className="g-3 mb-4">
                <Col xs={12} sm={6} lg={3}>
                    <Card className="border-0 rounded-4 shadow-sm bg-white h-100">
                        <Card.Body className="p-3">
                            <span className="small text-muted d-block mb-1">
                                <i className="fa-solid fa-boxes-stacked text-primary me-1"></i> Ventas Fábrica Kits Total
                            </span>
                            <h4 className="fw-bolder text-dark mb-0">
                                {formatearPrecio(liquidacionData.consolidado.ventaFabricaTotalKitsConjunto)}
                            </h4>
                            <small className="text-muted" style={{ fontSize: '0.74rem' }}>
                                Leo ({formatearPrecio(liquidacionData.leo.ventaFabricaKitsLeonardoTotal)}) + Oscar ({formatearPrecio(liquidacionData.oscar.ventaFabricaKitsOscarTotal)})
                            </small>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xs={12} sm={6} lg={3}>
                    <Card className="border-0 rounded-4 shadow-sm bg-white h-100">
                        <Card.Body className="p-3">
                            <span className="small text-muted d-block mb-1">
                                <i className="fa-solid fa-receipt text-danger me-1"></i> Gastos Deducidos de Kits
                            </span>
                            <h4 className="fw-bolder text-danger mb-0">
                                {formatearPrecio(liquidacionData.consolidado.totalGastosKitsConjunto)}
                            </h4>
                            <small className="text-muted" style={{ fontSize: '0.74rem' }}>
                                Leo ({formatearPrecio(liquidacionData.leo.totalGastos)}) + Oscar ({formatearPrecio(liquidacionData.oscar.totalGastos)})
                            </small>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xs={12} sm={6} lg={3}>
                    <Card className="border-0 rounded-4 shadow-sm bg-white h-100">
                        <Card.Body className="p-3">
                            <span className="small text-muted d-block mb-1">
                                <i className="fa-solid fa-chart-line text-success me-1"></i> Utilidad Neta Kits Conjunta
                            </span>
                            <h4 className="fw-bolder text-success mb-0">
                                {formatearPrecio(liquidacionData.consolidado.utilidadConjuntaKits)}
                            </h4>
                            <small className="text-success fw-bold" style={{ fontSize: '0.74rem' }}>
                                Cuota 50%: {formatearPrecio(liquidacionData.consolidado.cuotaEquitativa50Kits)} cada uno
                            </small>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xs={12} sm={6} lg={3}>
                    <Card className="border-0 rounded-4 shadow-sm bg-white h-100">
                        <Card.Body className="p-3">
                            <span className="small text-muted d-block mb-1">
                                <i className="fa-solid fa-mitten text-warning me-1"></i> Guantes Fábrica (a favor de Oscar)
                            </span>
                            <h4 className="fw-bolder text-warning-emphasis mb-0">
                                {formatearPrecio(liquidacionData.consolidado.deudaGuantesLeoAOscar)}
                            </h4>
                            <small className="text-muted" style={{ fontSize: '0.74rem' }}>
                                {liquidacionData.leo.totalUnidadesGuantesLeo} docenas vendidas a precio fábrica
                            </small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* ================================================================= */}
            {/* DOS SECCIONES PRINCIPALES: LEONARDO & OSCAR */}
            {/* ================================================================= */}
            <Row className="g-4 mb-4">
                {/* ------------------------------------------------------------- */}
                {/* SOCIO 1: LEONARDO GÓMEZ */}
                {/* ------------------------------------------------------------- */}
                <Col xs={12} xl={6}>
                    <div className="d-flex flex-column gap-4">
                        {/* Header de Leonardo */}
                        <Card
                            className="rounded-4 overflow-hidden bg-white shadow-sm"
                            style={{
                                border: '1.5px solid #93c5fd',
                                borderLeft: '6px solid #2563eb'
                            }}
                        >
                            <Card.Header className="bg-primary-subtle py-3 px-3 d-flex flex-wrap align-items-center justify-content-between gap-2 border-0">
                                <div className="d-flex align-items-center gap-2">
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center bg-white text-primary shadow-xs"
                                        style={{ width: '40px', height: '40px' }}
                                    >
                                        <i className="fa-solid fa-user-tie fs-5"></i>
                                    </div>
                                    <div>
                                        <h5 className="fw-bolder text-dark mb-0">Socio: Leonardo Gómez</h5>
                                        <small className="text-muted">Kits propios + Cirios + Guantes de Leo + Otros / Accesorios + Ventas de Karol</small>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="rounded-pill py-0.5 px-2.5 bg-white border shadow-xs fw-semibold"
                                        style={{ fontSize: '0.74rem' }}
                                        onClick={() => setAllLeoItems(!allLeoOpen)}
                                    >
                                        <i className={`fa-solid ${allLeoOpen ? 'fa-compress' : 'fa-expand'} me-1`}></i>
                                        {allLeoOpen ? 'Plegar todo' : 'Desplegar todo'}
                                    </Button>
                                    <span className="badge bg-primary rounded-pill px-3 py-1.5 fw-bold fs-7">
                                        Total Fábrica: {formatearPrecio(liquidacionData.leo.ventaFabricaKitsLeonardoTotal + liquidacionData.leo.totalFabricaGuantesLeo)}
                                    </span>
                                </div>
                            </Card.Header>

                            <Card.Body className="p-3 d-flex flex-column gap-4">
                                {/* TABLA 1: KITS VENDIDOS POR LEONARDO */}
                                <div>
                                    <div 
                                        className="d-flex align-items-center justify-content-between mb-2 p-1 rounded-2"
                                        style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                                        onClick={() => toggleLeoItem('kits')}
                                    >
                                        <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                                            <i className="fa-solid fa-box-archive text-primary"></i>
                                            1. Kits Propios (Leonardo)
                                            <i className={`fa-solid fa-chevron-${openItemsLeo.kits ? 'up' : 'down'} text-muted ms-1 small`} style={{ fontSize: '0.75rem' }}></i>
                                        </h6>
                                        <Badge bg="light" className="text-dark border rounded-pill px-2.5 py-1">
                                            {liquidacionData.leo.totalUnidadesKitsLeo} productos
                                        </Badge>
                                    </div>

                                    <Collapse in={openItemsLeo.kits}>
                                        <div>
                                            <div className="table-responsive">
                                                <Table hover bordered size="sm" className="align-middle mb-0 text-center" style={{ borderColor: '#e2e8f0', fontSize: '0.84rem' }}>
                                                    <thead className="table-light">
                                                        <tr className="text-secondary small fw-bold">
                                                            <th className="text-start ps-3">Kit / Referencia</th>
                                                            <th style={{ width: '90px' }}>Cantidad</th>
                                                            <th style={{ width: '130px' }} className="text-end">Precio Fábrica</th>
                                                            <th style={{ width: '140px' }} className="text-end pe-3">Total Fábrica</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filtroBusqueda(liquidacionData.leo.kits).length === 0 ? (
                                                            <tr>
                                                                <td colSpan={4} className="text-muted py-3">No hay kits registrados en este periodo</td>
                                                            </tr>
                                                        ) : (
                                                            filtroBusqueda(liquidacionData.leo.kits).map((it, idx) => (
                                                                <tr key={idx}>
                                                                    <td className="text-start ps-3 fw-semibold text-dark">
                                                                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle me-2">
                                                                            {it.codigo}
                                                                        </span>
                                                                        {it.nombre}
                                                                    </td>
                                                                    <td className="fw-bold">{it.cantidad.toLocaleString()}</td>
                                                                    <td className="text-end text-muted">{formatearPrecio(it.precioFabrica)}</td>
                                                                    <td className="text-end pe-3 fw-bold text-dark">{formatearPrecio(it.total)}</td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                    <tfoot className="table-secondary fw-bold" style={{ fontSize: '0.94rem' }}>
                                                        <tr>
                                                            <td className="text-start ps-3 fs-6">Subtotal Kits Leonardo</td>
                                                            <td className="fs-6">{liquidacionData.leo.totalUnidadesKitsLeo.toLocaleString()}</td>
                                                            <td>-</td>
                                                            <td className="text-end pe-3 text-primary fs-6 fw-bolder">{formatearPrecio(liquidacionData.leo.totalFabricaKitsLeo)}</td>
                                                        </tr>
                                                    </tfoot>
                                                </Table>
                                            </div>
                                        </div>
                                    </Collapse>
                                </div>

                                {/* TABLA 2: CIRIOS VENDIDOS POR LEONARDO */}
                                <div>
                                    <div 
                                        className="d-flex align-items-center justify-content-between mb-2 p-1 rounded-2"
                                        style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                                        onClick={() => toggleLeoItem('cirios')}
                                    >
                                        <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                                            <i className="fa-solid fa-fire-flame-curved" style={{ color: '#7c3aed' }}></i>
                                            2. Cirios Propios (Leonardo)
                                            <i className={`fa-solid fa-chevron-${openItemsLeo.cirios ? 'up' : 'down'} text-muted ms-1 small`} style={{ fontSize: '0.75rem' }}></i>
                                        </h6>
                                        <Badge bg="light" className="text-dark border rounded-pill px-2.5 py-1">
                                            {liquidacionData.leo.totalUnidadesCiriosLeo} productos
                                        </Badge>
                                    </div>

                                    <Collapse in={openItemsLeo.cirios}>
                                        <div>
                                            <div className="table-responsive">
                                                <Table hover bordered size="sm" className="align-middle mb-0 text-center" style={{ borderColor: '#e2e8f0', fontSize: '0.84rem' }}>
                                                    <thead className="table-light">
                                                        <tr className="text-secondary small fw-bold">
                                                            <th className="text-start ps-3">Cirio / Referencia</th>
                                                            <th style={{ width: '90px' }}>Cantidad</th>
                                                            <th style={{ width: '130px' }} className="text-end">Precio Fábrica</th>
                                                            <th style={{ width: '140px' }} className="text-end pe-3">Total Fábrica</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filtroBusqueda(liquidacionData.leo.cirios).length === 0 ? (
                                                            <tr>
                                                                <td colSpan={4} className="text-muted py-3">No hay cirios registrados en este periodo</td>
                                                            </tr>
                                                        ) : (
                                                            filtroBusqueda(liquidacionData.leo.cirios).map((it, idx) => (
                                                                <tr key={idx}>
                                                                    <td className="text-start ps-3 fw-semibold text-dark">
                                                                        <span className="badge bg-purple-subtle text-purple border me-2" style={{ backgroundColor: '#f3e8ff', color: '#7c3aed', borderColor: '#e9d5ff' }}>
                                                                            {it.codigo}
                                                                        </span>
                                                                        {it.nombre}
                                                                    </td>
                                                                    <td className="fw-bold">{it.cantidad.toLocaleString()}</td>
                                                                    <td className="text-end text-muted">{formatearPrecio(it.precioFabrica)}</td>
                                                                    <td className="text-end pe-3 fw-bold text-dark">{formatearPrecio(it.total)}</td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                    <tfoot className="table-secondary fw-bold" style={{ fontSize: '0.94rem' }}>
                                                        <tr>
                                                            <td className="text-start ps-3 fs-6">Subtotal Cirios Leonardo</td>
                                                            <td className="fs-6">{liquidacionData.leo.totalUnidadesCiriosLeo.toLocaleString()}</td>
                                                            <td>-</td>
                                                            <td className="text-end pe-3 fs-6 fw-bolder" style={{ color: '#7c3aed' }}>{formatearPrecio(liquidacionData.leo.totalFabricaCiriosLeo)}</td>
                                                        </tr>
                                                    </tfoot>
                                                </Table>
                                            </div>
                                        </div>
                                    </Collapse>
                                </div>

                                {/* TABLA 3: GUANTES VENDIDOS POR LEONARDO (ANTICIPO DE OSCAR) */}
                                <div>
                                    <div 
                                        className="d-flex align-items-center justify-content-between mb-2 p-1 rounded-2"
                                        style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                                        onClick={() => toggleLeoItem('guantes')}
                                    >
                                        <div>
                                            <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                                                <i className="fa-solid fa-mitten text-warning"></i>
                                                3. Guantes Vendidos por Leonardo
                                                <i className={`fa-solid fa-chevron-${openItemsLeo.guantes ? 'up' : 'down'} text-muted ms-1 small`} style={{ fontSize: '0.75rem' }}></i>
                                            </h6>
                                            <small className="text-warning-emphasis fw-semibold d-block" style={{ fontSize: '0.72rem' }}>
                                                <i className="fa-solid fa-triangle-exclamation me-1"></i>
                                                Oscar suministra estos guantes a Leonardo a precio de fábrica (Anticipo a pagar a Oscar)
                                            </small>
                                        </div>
                                        <Badge bg="warning-subtle" className="text-warning-emphasis border border-warning-subtle rounded-pill px-2.5 py-1">
                                            {liquidacionData.leo.totalUnidadesGuantesLeo} docenas
                                        </Badge>
                                    </div>

                                    <Collapse in={openItemsLeo.guantes}>
                                        <div>
                                            <div className="table-responsive">
                                                <Table hover bordered size="sm" className="align-middle mb-0 text-center" style={{ borderColor: '#e2e8f0', fontSize: '0.84rem' }}>
                                                    <thead className="table-light">
                                                        <tr className="text-secondary small fw-bold">
                                                            <th className="text-start ps-3">Tipo de Guante</th>
                                                            <th style={{ width: '90px' }}>Docenas</th>
                                                            <th style={{ width: '130px' }} className="text-end">Precio Fábrica</th>
                                                            <th style={{ width: '140px' }} className="text-end pe-3">Total a Pagar</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filtroBusqueda(liquidacionData.leo.guantes).length === 0 ? (
                                                            <tr>
                                                                <td colSpan={4} className="text-muted py-3">No hay guantes registrados para Leonardo</td>
                                                            </tr>
                                                        ) : (
                                                            filtroBusqueda(liquidacionData.leo.guantes).map((it, idx) => (
                                                                <tr key={idx}>
                                                                    <td className="text-start ps-3 fw-semibold text-dark">{it.nombre}</td>
                                                                    <td className="fw-bold">{it.cantidad.toLocaleString()}</td>
                                                                    <td className="text-end text-muted">{formatearPrecio(it.precioFabrica)}</td>
                                                                    <td className="text-end pe-3 fw-bold text-warning-emphasis">{formatearPrecio(it.total)}</td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                    <tfoot className="table-warning bg-opacity-25 fw-bold" style={{ fontSize: '0.94rem' }}>
                                                        <tr>
                                                            <td className="text-start ps-3 fs-6">Total Anticipo Guantes (Leo a Oscar)</td>
                                                            <td className="fs-6">{liquidacionData.leo.totalUnidadesGuantesLeo.toLocaleString()}</td>
                                                            <td>-</td>
                                                            <td className="text-end pe-3 text-warning-emphasis fs-6 fw-bolder">{formatearPrecio(liquidacionData.leo.totalFabricaGuantesLeo)}</td>
                                                        </tr>
                                                    </tfoot>
                                                </Table>
                                            </div>
                                        </div>
                                    </Collapse>
                                </div>

                                {/* TABLA 4: OTROS CON CATEGORÍA KITS / GUANTES DE LEONARDO (CON CASILLA EDITABLE) */}
                                <div>
                                    <div 
                                        className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2 p-1 rounded-2"
                                        style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                                        onClick={() => toggleLeoItem('otros')}
                                    >
                                        <div>
                                            <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                                                <i className="fa-solid fa-tags text-success"></i>
                                                4. Otros (Leonardo)
                                                <i className={`fa-solid fa-chevron-${openItemsLeo.otros ? 'up' : 'down'} text-muted ms-1 small`} style={{ fontSize: '0.75rem' }}></i>
                                            </h6>
                                            <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                                                Ingrese el precio unitario de fábrica en la casilla editable para calcular el total
                                            </small>
                                        </div>
                                        <div className="d-flex align-items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            <ButtonGroup size="sm" className="shadow-sm rounded-pill overflow-hidden border">
                                                <Button 
                                                    variant={filtroCategoriaOtros === 'KITS' ? 'primary' : 'light'}
                                                    className={`fw-bold py-0.5 px-2.5 border-0 ${filtroCategoriaOtros === 'KITS' ? '' : 'text-secondary'}`}
                                                    style={{ fontSize: '0.74rem' }}
                                                    onClick={() => setFiltroCategoriaOtros('KITS')}
                                                >
                                                    <i className="fa-solid fa-box-open me-1"></i> Kits
                                                </Button>
                                                <Button 
                                                    variant={filtroCategoriaOtros === 'GUANTES' ? 'warning' : 'light'}
                                                    className={`fw-bold py-0.5 px-2.5 border-0 ${filtroCategoriaOtros === 'GUANTES' ? 'text-dark' : 'text-secondary'}`}
                                                    style={{ fontSize: '0.74rem' }}
                                                    onClick={() => setFiltroCategoriaOtros('GUANTES')}
                                                >
                                                    <i className="fa-solid fa-mitten me-1"></i> Guantes
                                                </Button>
                                                <Button 
                                                    variant={filtroCategoriaOtros === 'TODOS' ? 'dark' : 'light'}
                                                    className={`fw-bold py-0.5 px-2.5 border-0 ${filtroCategoriaOtros === 'TODOS' ? '' : 'text-secondary'}`}
                                                    style={{ fontSize: '0.74rem' }}
                                                    onClick={() => setFiltroCategoriaOtros('TODOS')}
                                                >
                                                    Todos
                                                </Button>
                                            </ButtonGroup>
                                            <Badge bg="light" className="text-dark border rounded-pill px-2.5 py-1">
                                                {filtroBusqueda(liquidacionData.leo.otros).length} productos
                                            </Badge>
                                        </div>
                                    </div>

                                    <Collapse in={openItemsLeo.otros}>
                                        <div>
                                            <div className="table-responsive">
                                                <Table hover bordered size="sm" className="align-middle mb-0 text-center" style={{ borderColor: '#e2e8f0', fontSize: '0.84rem' }}>
                                                    <thead className="table-light">
                                                        <tr className="text-secondary small fw-bold">
                                                            <th className="text-start ps-3">Producto</th>
                                                            <th style={{ width: '75px' }}>Cant.</th>
                                                            <th style={{ width: '130px' }} className="text-end" title="Precio unitario al que se vendió en pedidos (referencia)">P. Venta Ref.</th>
                                                            <th style={{ width: '160px' }}>Precio Fábrica Unit. ($)</th>
                                                            <th style={{ width: '130px' }} className="text-end pe-3">Total Fábrica</th>
                                                            <th style={{ width: '60px' }}>Acción</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filtroBusqueda(liquidacionData.leo.otros).length === 0 ? (
                                                            <tr>
                                                                <td colSpan={6} className="text-muted py-2">No hay productos en 'Otros' registrados</td>
                                                            </tr>
                                                        ) : (
                                                            filtroBusqueda(liquidacionData.leo.otros).map((it, idx) => (
                                                                <tr key={idx}>
                                                                    <td className="text-start ps-3 fw-semibold text-dark">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleCambiarCategoriaOtro(it.key, it.nombre, it.categoriaNegocio)}
                                                                            className={`btn btn-sm py-0 px-2 me-2 border rounded-pill shadow-sm fw-bold ${
                                                                                it.categoriaNegocio === 'Kits' 
                                                                                    ? 'btn-outline-primary bg-primary-subtle text-primary border-primary-subtle' 
                                                                                    : 'btn-outline-warning bg-warning-subtle text-dark border-warning-subtle'
                                                                            }`}
                                                                            style={{ fontSize: '0.72rem', cursor: 'pointer' }}
                                                                            title={`Categoría: ${it.categoriaNegocio}. Clic para cambiar de categoría`}
                                                                        >
                                                                            <i className="fa-solid fa-pen-to-square me-1" style={{ fontSize: '0.65rem' }}></i>
                                                                            {it.categoriaNegocio}
                                                                        </button>
                                                                        {it.nombre}
                                                                    </td>
                                                                    <td className="fw-bold">{it.cantidad.toLocaleString()}</td>
                                                                    <td className="text-end">
                                                                        <span className="badge bg-secondary-subtle text-secondary border px-2 py-1" style={{ fontSize: '0.78rem' }} title="Precio al que se vendió en pedidos">
                                                                            {formatearPrecio(it.precioVentaPromedio || 0)}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <InputGroup size="sm">
                                                                            <InputGroup.Text className="bg-light text-muted px-2">$</InputGroup.Text>
                                                                            <Form.Control
                                                                                type="number"
                                                                                min="0"
                                                                                step="100"
                                                                                value={preciosOtros[it.key] ?? ''}
                                                                                placeholder="0"
                                                                                className="fw-bold text-end"
                                                                                onChange={(e) => handlePrecioOtroChange(it.key, e.target.value)}
                                                                                title="Precio de fábrica unitario asignado a este producto"
                                                                            />
                                                                        </InputGroup>
                                                                    </td>
                                                                    <td className="text-end pe-3 fw-bold text-dark">{formatearPrecio(it.total)}</td>
                                                                    <td>
                                                                        <Button
                                                                            size="sm"
                                                                            variant={(guardadosDb[it.key] || Number(preciosOtros[it.key] || 0) > 0) ? "outline-primary" : "primary"}
                                                                            className="d-inline-flex align-items-center justify-content-center p-0 shadow-sm"
                                                                            style={{ width: '32px', height: '32px', borderRadius: '6px' }}
                                                                            disabled={guardandoKey === it.key}
                                                                            onClick={() => handleGuardarPrecioOtro(it.key, it.nombre, preciosOtros[it.key])}
                                                                            title={(guardadosDb[it.key] || Number(preciosOtros[it.key] || 0) > 0) ? "Editar precio de fábrica en base de datos" : "Guardar precio de fábrica en base de datos"}
                                                                        >
                                                                            {guardandoKey === it.key ? (
                                                                                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '0.85rem' }}></i>
                                                                            ) : (guardadosDb[it.key] || Number(preciosOtros[it.key] || 0) > 0) ? (
                                                                                <i className="fa-solid fa-pen-to-square" style={{ fontSize: '0.85rem' }}></i>
                                                                            ) : (
                                                                                <i className="fa-solid fa-floppy-disk" style={{ fontSize: '0.85rem' }}></i>
                                                                            )}
                                                                        </Button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                    <tfoot className="table-secondary fw-bold" style={{ fontSize: '0.94rem' }}>
                                                        <tr>
                                                            <td className="text-start ps-3 fs-6">Subtotal Otros Leonardo</td>
                                                            <td className="fs-6">{liquidacionData.leo.totalUnidadesOtrosLeo.toLocaleString()}</td>
                                                            <td>-</td>
                                                            <td>-</td>
                                                            <td className="text-end pe-3 text-success fs-6 fw-bolder">{formatearPrecio(liquidacionData.leo.totalFabricaOtrosLeo)}</td>
                                                            <td>-</td>
                                                        </tr>
                                                    </tfoot>
                                                </Table>
                                            </div>
                                        </div>
                                    </Collapse>
                                </div>

                                {/* CARD ANIDADA: KAROL GÓMEZ (CLIENTE DE LEONARDO) */}
                                <Card className="border border-info-subtle rounded-4 overflow-hidden bg-info-subtle bg-opacity-10">
                                    <Card.Header 
                                        className="bg-info-subtle py-2.5 px-3 d-flex align-items-center justify-content-between border-0"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => toggleLeoItem('karol')}
                                    >
                                        <div className="d-flex align-items-center gap-2">
                                            <i className="fa-solid fa-handshake text-info"></i>
                                            <div>
                                                <strong className="text-dark d-flex align-items-center gap-1.5">
                                                    Karol Gómez (Cliente de Leonardo)
                                                    <i className={`fa-solid fa-chevron-${openItemsLeo.karol ? 'up' : 'down'} text-muted small`} style={{ fontSize: '0.72rem' }}></i>
                                                </strong>
                                                <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>
                                                    Solo Kits, Cirios y Otros (se suman a Leonardo; los guantes se excluyen)
                                                </small>
                                            </div>
                                        </div>
                                        <Badge bg="info" className="rounded-pill px-3 py-1">
                                            +{formatearPrecio(liquidacionData.karol.totalFabricaKarol)}
                                        </Badge>
                                    </Card.Header>
                                    <Collapse in={openItemsLeo.karol}>
                                        <div>
                                            <Card.Body className="p-3">
                                                <div className="table-responsive">
                                                    <Table hover bordered size="sm" className="align-middle mb-0 text-center bg-white" style={{ borderColor: '#e2e8f0', fontSize: '0.82rem' }}>
                                                        <thead className="table-light">
                                                            <tr className="text-secondary small fw-bold">
                                                                <th className="text-start ps-3">1. Kits de Karol</th>
                                                                <th style={{ width: '80px' }}>Cant.</th>
                                                                <th style={{ width: '120px' }} className="text-end">Precio Fábrica</th>
                                                                <th style={{ width: '130px' }} className="text-end pe-3">Subtotal</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {filtroBusqueda(liquidacionData.karol.kits).length === 0 ? (
                                                                <tr>
                                                                    <td colSpan={4} className="text-muted py-2">No hay kits de Karol en este periodo</td>
                                                                </tr>
                                                            ) : (
                                                                filtroBusqueda(liquidacionData.karol.kits).map((it, idx) => (
                                                                    <tr key={idx}>
                                                                        <td className="text-start ps-3 fw-semibold text-dark">
                                                                            <span className="badge bg-secondary-subtle text-secondary me-1.5">{it.codigo}</span>
                                                                            {it.nombre}
                                                                        </td>
                                                                        <td className="fw-bold">{it.cantidad.toLocaleString()}</td>
                                                                        <td className="text-end text-muted">{formatearPrecio(it.precioFabrica)}</td>
                                                                        <td className="text-end pe-3 fw-bold text-dark">{formatearPrecio(it.total)}</td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                        <tfoot className="table-light fw-bold" style={{ fontSize: '0.94rem', borderTop: '2px solid #cbd5e1' }}>
                                                            <tr>
                                                                <td className="text-start ps-3 fs-6">Subtotal Kits Karol</td>
                                                                <td className="fs-6">{liquidacionData.karol.totalUnidadesKitsKarol.toLocaleString()}</td>
                                                                <td>-</td>
                                                                <td className="text-end pe-3 text-info fs-6 fw-bolder">{formatearPrecio(liquidacionData.karol.totalFabricaKitsKarol)}</td>
                                                            </tr>
                                                        </tfoot>
                                                    </Table>
                                                </div>

                                                {/* TABLA 2: CIRIOS DE KAROL SI EXISTEN */}
                                                {liquidacionData.karol.cirios && liquidacionData.karol.cirios.length > 0 && (
                                                    <div className="mt-3">
                                                        <h6 className="fw-bold text-dark small mb-1.5 d-flex align-items-center gap-1.5">
                                                            <i className="fa-solid fa-fire-flame-curved" style={{ color: '#7c3aed' }}></i>
                                                            2. Cirios de Karol
                                                        </h6>
                                                        <div className="table-responsive">
                                                            <Table hover bordered size="sm" className="align-middle mb-0 text-center bg-white" style={{ borderColor: '#e2e8f0', fontSize: '0.82rem' }}>
                                                                <thead className="table-light">
                                                                    <tr className="text-secondary small fw-bold">
                                                                        <th className="text-start ps-3">Cirio / Referencia</th>
                                                                        <th style={{ width: '80px' }}>Cant.</th>
                                                                        <th style={{ width: '120px' }} className="text-end">Precio Fábrica</th>
                                                                        <th style={{ width: '130px' }} className="text-end pe-3">Subtotal</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {filtroBusqueda(liquidacionData.karol.cirios).map((it, idx) => (
                                                                        <tr key={idx}>
                                                                            <td className="text-start ps-3 fw-semibold text-dark">
                                                                                <span className="badge bg-purple-subtle text-purple border me-1.5" style={{ backgroundColor: '#f3e8ff', color: '#7c3aed', borderColor: '#e9d5ff' }}>
                                                                                    {it.codigo}
                                                                                </span>
                                                                                {it.nombre}
                                                                            </td>
                                                                            <td className="fw-bold">{it.cantidad.toLocaleString()}</td>
                                                                            <td className="text-end text-muted">{formatearPrecio(it.precioFabrica)}</td>
                                                                            <td className="text-end pe-3 fw-bold text-dark">{formatearPrecio(it.total)}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                                <tfoot className="table-light fw-bold" style={{ fontSize: '0.94rem', borderTop: '2px solid #cbd5e1' }}>
                                                                    <tr>
                                                                        <td className="text-start ps-3 fs-6">Subtotal Cirios Karol</td>
                                                                        <td className="fs-6">{liquidacionData.karol.totalUnidadesCiriosKarol.toLocaleString()}</td>
                                                                        <td>-</td>
                                                                        <td className="text-end pe-3 text-info fs-6 fw-bolder">{formatearPrecio(liquidacionData.karol.totalFabricaCiriosKarol)}</td>
                                                                    </tr>
                                                                </tfoot>
                                                            </Table>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* TABLA 3: OTROS DE KAROL SI EXISTEN */}
                                                {liquidacionData.karol.otros.length > 0 && (
                                                    <div className="mt-3">
                                                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-1.5">
                                                            <h6 className="fw-bold text-dark small mb-0 d-flex align-items-center gap-1.5">
                                                                <i className="fa-solid fa-tags text-info"></i>
                                                                3. Otros (Karol)
                                                            </h6>
                                                            <div className="d-flex align-items-center gap-2">
                                                                <ButtonGroup size="sm" className="shadow-sm rounded-pill overflow-hidden border">
                                                                    <Button 
                                                                        variant={filtroCategoriaOtros === 'KITS' ? 'primary' : 'light'}
                                                                        className={`fw-bold py-0.5 px-2 border-0 ${filtroCategoriaOtros === 'KITS' ? '' : 'text-secondary'}`}
                                                                        style={{ fontSize: '0.72rem' }}
                                                                        onClick={() => setFiltroCategoriaOtros('KITS')}
                                                                    >
                                                                        <i className="fa-solid fa-box-open me-1"></i> Kits
                                                                    </Button>
                                                                    <Button 
                                                                        variant={filtroCategoriaOtros === 'GUANTES' ? 'warning' : 'light'}
                                                                        className={`fw-bold py-0.5 px-2 border-0 ${filtroCategoriaOtros === 'GUANTES' ? 'text-dark' : 'text-secondary'}`}
                                                                        style={{ fontSize: '0.72rem' }}
                                                                        onClick={() => setFiltroCategoriaOtros('GUANTES')}
                                                                    >
                                                                        <i className="fa-solid fa-mitten me-1"></i> Guantes
                                                                    </Button>
                                                                    <Button 
                                                                        variant={filtroCategoriaOtros === 'TODOS' ? 'dark' : 'light'}
                                                                        className={`fw-bold py-0.5 px-2 border-0 ${filtroCategoriaOtros === 'TODOS' ? '' : 'text-secondary'}`}
                                                                        style={{ fontSize: '0.72rem' }}
                                                                        onClick={() => setFiltroCategoriaOtros('TODOS')}
                                                                    >
                                                                        Todos
                                                                    </Button>
                                                                </ButtonGroup>
                                                                <Badge bg="light" className="text-dark border rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>
                                                                    {filtroBusqueda(liquidacionData.karol.otros).length} productos
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <div className="table-responsive">
                                                            <Table hover bordered size="sm" className="align-middle mb-0 text-center bg-white" style={{ borderColor: '#e2e8f0', fontSize: '0.82rem' }}>
                                                                <thead className="table-light">
                                                                    <tr className="text-secondary small fw-bold">
                                                                        <th className="text-start ps-3">Producto</th>
                                                                        <th style={{ width: '75px' }}>Cant.</th>
                                                                        <th style={{ width: '130px' }} className="text-end">P. Venta Ref.</th>
                                                                        <th style={{ width: '160px' }}>Precio Fábrica Unit. ($)</th>
                                                                        <th style={{ width: '130px' }} className="text-end pe-3">Total Fábrica</th>
                                                                        <th style={{ width: '60px' }}>Acción</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {filtroBusqueda(liquidacionData.karol.otros).map((it, idx) => (
                                                                        <tr key={idx}>
                                                                            <td className="text-start ps-3 fw-semibold text-dark">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleCambiarCategoriaOtro(it.key, it.nombre, it.categoriaNegocio)}
                                                                                    className={`btn btn-sm py-0 px-2 me-2 border rounded-pill shadow-sm fw-bold ${
                                                                                        it.categoriaNegocio === 'Kits' 
                                                                                            ? 'btn-outline-primary bg-primary-subtle text-primary border-primary-subtle' 
                                                                                            : 'btn-outline-warning bg-warning-subtle text-dark border-warning-subtle'
                                                                                    }`}
                                                                                    style={{ fontSize: '0.72rem', cursor: 'pointer' }}
                                                                                    title={`Categoría: ${it.categoriaNegocio}. Clic para cambiar de categoría`}
                                                                                >
                                                                                    <i className="fa-solid fa-pen-to-square me-1" style={{ fontSize: '0.65rem' }}></i>
                                                                                    {it.categoriaNegocio}
                                                                                </button>
                                                                                {it.nombre}
                                                                            </td>
                                                                            <td className="fw-bold">{it.cantidad.toLocaleString()}</td>
                                                                            <td className="text-end">
                                                                                <span className="badge bg-secondary-subtle text-secondary border px-2 py-1" style={{ fontSize: '0.78rem' }}>
                                                                                    {formatearPrecio(it.precioVentaPromedio || 0)}
                                                                                </span>
                                                                            </td>
                                                                            <td>
                                                                                <InputGroup size="sm">
                                                                                    <InputGroup.Text className="bg-light text-muted px-2">$</InputGroup.Text>
                                                                                    <Form.Control
                                                                                        type="number"
                                                                                        min="0"
                                                                                        step="100"
                                                                                        value={preciosOtros[it.key] ?? ''}
                                                                                        placeholder="0"
                                                                                        className="fw-bold text-end"
                                                                                        onChange={(e) => handlePrecioOtroChange(it.key, e.target.value)}
                                                                                        title="Precio de fábrica unitario asignado a este producto"
                                                                                    />
                                                                                </InputGroup>
                                                                            </td>
                                                                            <td className="text-end pe-3 fw-bold text-dark">{formatearPrecio(it.total)}</td>
                                                                            <td>
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant={(guardadosDb[it.key] || Number(preciosOtros[it.key] || 0) > 0) ? "outline-primary" : "primary"}
                                                                                    className="d-inline-flex align-items-center justify-content-center p-0 shadow-sm"
                                                                                    style={{ width: '32px', height: '32px', borderRadius: '6px' }}
                                                                                    disabled={guardandoKey === it.key}
                                                                                    onClick={() => handleGuardarPrecioOtro(it.key, it.nombre, preciosOtros[it.key])}
                                                                                    title={(guardadosDb[it.key] || Number(preciosOtros[it.key] || 0) > 0) ? "Editar precio de fábrica en base de datos" : "Guardar precio de fábrica en base de datos"}
                                                                                >
                                                                                    {guardandoKey === it.key ? (
                                                                                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '0.85rem' }}></i>
                                                                                    ) : (guardadosDb[it.key] || Number(preciosOtros[it.key] || 0) > 0) ? (
                                                                                        <i className="fa-solid fa-pen-to-square" style={{ fontSize: '0.85rem' }}></i>
                                                                                    ) : (
                                                                                        <i className="fa-solid fa-floppy-disk" style={{ fontSize: '0.85rem' }}></i>
                                                                                    )}
                                                                                </Button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                                <tfoot className="table-light fw-bold" style={{ fontSize: '0.94rem', borderTop: '2px solid #cbd5e1' }}>
                                                                    <tr>
                                                                        <td className="text-start ps-3 fs-6">Subtotal Otros Karol</td>
                                                                        <td className="fs-6">{liquidacionData.karol.totalUnidadesOtrosKarol.toLocaleString()}</td>
                                                                        <td>-</td>
                                                                        <td>-</td>
                                                                        <td className="text-end pe-3 text-info fs-6 fw-bolder">{formatearPrecio(liquidacionData.karol.totalFabricaOtrosKarol)}</td>
                                                                        <td>-</td>
                                                                    </tr>
                                                                </tfoot>
                                                            </Table>
                                                        </div>
                                                    </div>
                                                )}
                                            </Card.Body>
                                        </div>
                                    </Collapse>
                                </Card>

                                {/* TOTALIZACIÓN Y DEDUCCIÓN DE GASTOS DE LEONARDO */}
                                <div className="p-3 rounded-4 bg-light border">
                                    <h6 className="fw-bold text-dark mb-2">Liquidación Operativa de Leonardo</h6>
                                    <div className="d-flex flex-column gap-1.5 small">
                                        <div className="d-flex justify-content-between">
                                            <span>Venta Total Kits a Fábrica (Propios + Karol + Otros):</span>
                                            <strong className="text-primary">{formatearPrecio(liquidacionData.leo.ventaFabricaKitsLeonardoTotal)}</strong>
                                        </div>
                                        <div className="d-flex justify-content-between text-danger">
                                            <span>(-) Gastos Deducibles de Kits (Leonardo):</span>
                                            <strong>- {formatearPrecio(liquidacionData.leo.totalGastos)}</strong>
                                        </div>
                                        <hr className="my-1" />
                                        <div className="d-flex justify-content-between fs-6 fw-bold">
                                            <span className="text-dark">Resultado Neto Kits Leonardo:</span>
                                            <span className={liquidacionData.leo.resultadoNetoKitsLeo >= 0 ? 'text-success' : 'text-danger'}>
                                                {formatearPrecio(liquidacionData.leo.resultadoNetoKitsLeo)}
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between pt-1 text-warning-emphasis">
                                            <span>(+) Guantes Fábrica a favor de Oscar:</span>
                                            <strong>{formatearPrecio(liquidacionData.leo.totalAnticipoGuantesLeo)}</strong>
                                        </div>
                                        {liquidacionData.consolidado.totalAnticiposOscarALeo > 0 && (
                                            <div className="d-flex justify-content-between pt-1 text-danger">
                                                <span>(-) Anticipos Recibidos de Oscar (a reintegrar a Oscar):</span>
                                                <strong>- {formatearPrecio(liquidacionData.consolidado.totalAnticiposOscarALeo)}</strong>
                                            </div>
                                        )}
                                        {liquidacionData.consolidado.totalAnticiposLeoAOscar > 0 && (
                                            <div className="d-flex justify-content-between pt-1 text-success">
                                                <span>(+) Anticipos Entregados a Oscar (a favor de Leo):</span>
                                                <strong>+ {formatearPrecio(liquidacionData.consolidado.totalAnticiposLeoAOscar)}</strong>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                </Col>

                {/* ------------------------------------------------------------- */}
                {/* SOCIO 2: OSCAR GÓMEZ */}
                {/* ------------------------------------------------------------- */}
                <Col xs={12} xl={6}>
                    <div className="d-flex flex-column gap-4">
                        {/* Header de Oscar */}
                        <Card
                            className="rounded-4 overflow-hidden bg-white shadow-sm"
                            style={{
                                border: '1.5px solid #fcd34d',
                                borderLeft: '6px solid #d97706'
                            }}
                        >
                            <Card.Header className="bg-warning-subtle py-3 px-3 d-flex flex-wrap align-items-center justify-content-between gap-2 border-0">
                                <div className="d-flex align-items-center gap-2">
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center bg-white text-warning-emphasis shadow-xs"
                                        style={{ width: '40px', height: '40px' }}
                                    >
                                        <i className="fa-solid fa-user-tie fs-5"></i>
                                    </div>
                                    <div>
                                        <h5 className="fw-bolder text-dark mb-0">Socio: Oscar Gómez</h5>
                                        <small className="text-muted">Kits de Oscar + Cirios + Otros de Kits + Acreencia Guantes + Anticipos</small>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <Button
                                        variant="outline-warning"
                                        size="sm"
                                        className="rounded-pill py-0.5 px-2.5 bg-white border shadow-xs fw-semibold text-dark"
                                        style={{ fontSize: '0.74rem' }}
                                        onClick={() => setAllOscarItems(!allOscarOpen)}
                                    >
                                        <i className={`fa-solid ${allOscarOpen ? 'fa-compress' : 'fa-expand'} me-1`}></i>
                                        {allOscarOpen ? 'Plegar todo' : 'Desplegar todo'}
                                    </Button>
                                    <span className="badge bg-warning text-dark rounded-pill px-3 py-1.5 fw-bold fs-7">
                                        Total Fábrica: {formatearPrecio(liquidacionData.oscar.ventaFabricaKitsOscarTotal)}
                                    </span>
                                </div>
                            </Card.Header>

                            <Card.Body className="p-3 d-flex flex-column gap-4">
                                {/* TABLA 1: KITS VENDIDOS POR OSCAR */}
                                <div>
                                    <div 
                                        className="d-flex align-items-center justify-content-between mb-2 p-1 rounded-2"
                                        style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                                        onClick={() => toggleOscarItem('kits')}
                                    >
                                        <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                                            <i className="fa-solid fa-box-archive text-warning"></i>
                                            1. Kits Vendidos por Oscar
                                            <i className={`fa-solid fa-chevron-${openItemsOscar.kits ? 'up' : 'down'} text-muted ms-1 small`} style={{ fontSize: '0.75rem' }}></i>
                                        </h6>
                                        <Badge bg="light" className="text-dark border rounded-pill px-2.5 py-1">
                                            {liquidacionData.oscar.totalUnidadesKitsOscar} productos
                                        </Badge>
                                    </div>

                                    <Collapse in={openItemsOscar.kits}>
                                        <div>
                                            <div className="table-responsive">
                                                <Table hover bordered size="sm" className="align-middle mb-0 text-center" style={{ borderColor: '#e2e8f0', fontSize: '0.84rem' }}>
                                                    <thead className="table-light">
                                                        <tr className="text-secondary small fw-bold">
                                                            <th className="text-start ps-3">Kit / Referencia</th>
                                                            <th style={{ width: '90px' }}>Cantidad</th>
                                                            <th style={{ width: '130px' }} className="text-end">Precio Fábrica</th>
                                                            <th style={{ width: '140px' }} className="text-end pe-3">Total Fábrica</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filtroBusqueda(liquidacionData.oscar.kits).length === 0 ? (
                                                            <tr>
                                                                <td colSpan={4} className="text-muted py-3">No hay kits registrados para Oscar en este periodo</td>
                                                            </tr>
                                                        ) : (
                                                            filtroBusqueda(liquidacionData.oscar.kits).map((it, idx) => (
                                                                <tr key={idx}>
                                                                    <td className="text-start ps-3 fw-semibold text-dark">
                                                                        <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle me-2">
                                                                            {it.codigo}
                                                                        </span>
                                                                        {it.nombre}
                                                                    </td>
                                                                    <td className="fw-bold">{it.cantidad.toLocaleString()}</td>
                                                                    <td className="text-end text-muted">{formatearPrecio(it.precioFabrica)}</td>
                                                                    <td className="text-end pe-3 fw-bold text-dark">{formatearPrecio(it.total)}</td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                    <tfoot className="table-secondary fw-bold" style={{ fontSize: '0.94rem' }}>
                                                        <tr>
                                                            <td className="text-start ps-3 fs-6">Subtotal Kits Oscar</td>
                                                            <td className="fs-6">{liquidacionData.oscar.totalUnidadesKitsOscar.toLocaleString()}</td>
                                                            <td>-</td>
                                                            <td className="text-end pe-3 text-primary fs-6 fw-bolder">{formatearPrecio(liquidacionData.oscar.totalFabricaKitsOscar)}</td>
                                                        </tr>
                                                    </tfoot>
                                                </Table>
                                            </div>
                                        </div>
                                    </Collapse>
                                </div>

                                {/* TABLA 2: CIRIOS VENDIDOS POR OSCAR */}
                                <div>
                                    <div 
                                        className="d-flex align-items-center justify-content-between mb-2 p-1 rounded-2"
                                        style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                                        onClick={() => toggleOscarItem('cirios')}
                                    >
                                        <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                                            <i className="fa-solid fa-fire-flame-curved" style={{ color: '#7c3aed' }}></i>
                                            2. Cirios Vendidos por Oscar
                                            <i className={`fa-solid fa-chevron-${openItemsOscar.cirios ? 'up' : 'down'} text-muted ms-1 small`} style={{ fontSize: '0.75rem' }}></i>
                                        </h6>
                                        <Badge bg="light" className="text-dark border rounded-pill px-2.5 py-1">
                                            {liquidacionData.oscar.totalUnidadesCiriosOscar} productos
                                        </Badge>
                                    </div>

                                    <Collapse in={openItemsOscar.cirios}>
                                        <div>
                                            <div className="table-responsive">
                                                <Table hover bordered size="sm" className="align-middle mb-0 text-center" style={{ borderColor: '#e2e8f0', fontSize: '0.84rem' }}>
                                                    <thead className="table-light">
                                                        <tr className="text-secondary small fw-bold">
                                                            <th className="text-start ps-3">Cirio / Referencia</th>
                                                            <th style={{ width: '90px' }}>Cantidad</th>
                                                            <th style={{ width: '130px' }} className="text-end">Precio Fábrica</th>
                                                            <th style={{ width: '140px' }} className="text-end pe-3">Total Fábrica</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filtroBusqueda(liquidacionData.oscar.cirios).length === 0 ? (
                                                            <tr>
                                                                <td colSpan={4} className="text-muted py-3">No hay cirios registrados para Oscar en este periodo</td>
                                                            </tr>
                                                        ) : (
                                                            filtroBusqueda(liquidacionData.oscar.cirios).map((it, idx) => (
                                                                <tr key={idx}>
                                                                    <td className="text-start ps-3 fw-semibold text-dark">
                                                                        <span className="badge bg-purple-subtle text-purple border me-2" style={{ backgroundColor: '#f3e8ff', color: '#7c3aed', borderColor: '#e9d5ff' }}>
                                                                            {it.codigo}
                                                                        </span>
                                                                        {it.nombre}
                                                                    </td>
                                                                    <td className="fw-bold">{it.cantidad.toLocaleString()}</td>
                                                                    <td className="text-end text-muted">{formatearPrecio(it.precioFabrica)}</td>
                                                                    <td className="text-end pe-3 fw-bold text-dark">{formatearPrecio(it.total)}</td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                    <tfoot className="table-secondary fw-bold" style={{ fontSize: '0.94rem' }}>
                                                        <tr>
                                                            <td className="text-start ps-3 fs-6">Subtotal Cirios Oscar</td>
                                                            <td className="fs-6">{liquidacionData.oscar.totalUnidadesCiriosOscar.toLocaleString()}</td>
                                                            <td>-</td>
                                                            <td className="text-end pe-3 fs-6 fw-bolder" style={{ color: '#7c3aed' }}>{formatearPrecio(liquidacionData.oscar.totalFabricaCiriosOscar)}</td>
                                                        </tr>
                                                    </tfoot>
                                                </Table>
                                            </div>
                                        </div>
                                    </Collapse>
                                </div>

                                {/* TABLA 3: OTROS CON CATEGORÍA KITS / GUANTES DE OSCAR */}
                                <div>
                                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                                        <div 
                                            className="d-flex align-items-center gap-2 p-1 rounded-2"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => toggleOscarItem('otros')}
                                        >
                                            <div>
                                                <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                                                    <i className="fa-solid fa-tags text-success"></i>
                                                    3. Otros (Oscar)
                                                    <i className={`fa-solid fa-chevron-${openItemsOscar.otros ? 'up' : 'down'} text-muted ms-1 small`} style={{ fontSize: '0.75rem' }}></i>
                                                </h6>
                                                <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                                                    Comparte el precio unitario de fábrica asignado en la casilla editable
                                                </small>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <ButtonGroup size="sm" className="shadow-sm rounded-pill overflow-hidden border">
                                                <Button 
                                                    variant={filtroCategoriaOtros === 'KITS' ? 'primary' : 'light'}
                                                    className={`fw-bold py-0.5 px-2.5 border-0 ${filtroCategoriaOtros === 'KITS' ? '' : 'text-secondary'}`}
                                                    style={{ fontSize: '0.74rem' }}
                                                    onClick={() => setFiltroCategoriaOtros('KITS')}
                                                >
                                                    <i className="fa-solid fa-box-open me-1"></i> Kits
                                                </Button>
                                                <Button 
                                                    variant={filtroCategoriaOtros === 'GUANTES' ? 'warning' : 'light'}
                                                    className={`fw-bold py-0.5 px-2.5 border-0 ${filtroCategoriaOtros === 'GUANTES' ? 'text-dark' : 'text-secondary'}`}
                                                    style={{ fontSize: '0.74rem' }}
                                                    onClick={() => setFiltroCategoriaOtros('GUANTES')}
                                                >
                                                    <i className="fa-solid fa-mitten me-1"></i> Guantes
                                                </Button>
                                                <Button 
                                                    variant={filtroCategoriaOtros === 'TODOS' ? 'dark' : 'light'}
                                                    className={`fw-bold py-0.5 px-2.5 border-0 ${filtroCategoriaOtros === 'TODOS' ? '' : 'text-secondary'}`}
                                                    style={{ fontSize: '0.74rem' }}
                                                    onClick={() => setFiltroCategoriaOtros('TODOS')}
                                                >
                                                    Todos
                                                </Button>
                                            </ButtonGroup>
                                            <Badge bg="light" className="text-dark border rounded-pill px-2.5 py-1">
                                                {filtroBusqueda(liquidacionData.oscar.otros).length} productos
                                            </Badge>
                                        </div>
                                    </div>

                                    <Collapse in={openItemsOscar.otros}>
                                        <div>
                                            <div className="table-responsive">
                                                <Table hover bordered size="sm" className="align-middle mb-0 text-center" style={{ borderColor: '#e2e8f0', fontSize: '0.84rem' }}>
                                                    <thead className="table-light">
                                                        <tr className="text-secondary small fw-bold">
                                                            <th className="text-start ps-3">Producto</th>
                                                            <th style={{ width: '75px' }}>Cant.</th>
                                                            <th style={{ width: '130px' }} className="text-end" title="Precio unitario al que se vendió en pedidos (referencia)">P. Venta Ref.</th>
                                                            <th style={{ width: '160px' }}>Precio Fábrica Unit. ($)</th>
                                                            <th style={{ width: '130px' }} className="text-end pe-3">Total Fábrica</th>
                                                            <th style={{ width: '60px' }}>Acción</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filtroBusqueda(liquidacionData.oscar.otros).length === 0 ? (
                                                            <tr>
                                                                <td colSpan={6} className="text-muted py-2">No hay productos en 'Otros' registrados para Oscar</td>
                                                            </tr>
                                                        ) : (
                                                            filtroBusqueda(liquidacionData.oscar.otros).map((it, idx) => (
                                                                <tr key={idx}>
                                                                    <td className="text-start ps-3 fw-semibold text-dark">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleCambiarCategoriaOtro(it.key, it.nombre, it.categoriaNegocio)}
                                                                            className={`btn btn-sm py-0 px-2 me-2 border rounded-pill shadow-sm fw-bold ${
                                                                                it.categoriaNegocio === 'Kits' 
                                                                                    ? 'btn-outline-primary bg-primary-subtle text-primary border-primary-subtle' 
                                                                                    : 'btn-outline-warning bg-warning-subtle text-dark border-warning-subtle'
                                                                            }`}
                                                                            style={{ fontSize: '0.72rem', cursor: 'pointer' }}
                                                                            title={`Categoría: ${it.categoriaNegocio}. Clic para cambiar de categoría`}
                                                                        >
                                                                            <i className="fa-solid fa-pen-to-square me-1" style={{ fontSize: '0.65rem' }}></i>
                                                                            {it.categoriaNegocio}
                                                                        </button>
                                                                        {it.nombre}
                                                                    </td>
                                                                    <td className="fw-bold">{it.cantidad.toLocaleString()}</td>
                                                                    <td className="text-end">
                                                                        <span className="badge bg-secondary-subtle text-secondary border px-2 py-1" style={{ fontSize: '0.78rem' }} title="Precio al que se vendió en pedidos">
                                                                            {formatearPrecio(it.precioVentaPromedio || 0)}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <InputGroup size="sm">
                                                                            <InputGroup.Text className="bg-light text-muted px-2">$</InputGroup.Text>
                                                                            <Form.Control
                                                                                type="number"
                                                                                min="0"
                                                                                step="100"
                                                                                value={preciosOtros[it.key] ?? ''}
                                                                                placeholder="0"
                                                                                className="fw-bold text-end"
                                                                                onChange={(e) => handlePrecioOtroChange(it.key, e.target.value)}
                                                                                title="Precio de fábrica unitario asignado a este producto"
                                                                            />
                                                                        </InputGroup>
                                                                    </td>
                                                                    <td className="text-end pe-3 fw-bold text-dark">{formatearPrecio(it.total)}</td>
                                                                    <td>
                                                                        <Button
                                                                            size="sm"
                                                                            variant={(guardadosDb[it.key] || Number(preciosOtros[it.key] || 0) > 0) ? "outline-primary" : "primary"}
                                                                            className="d-inline-flex align-items-center justify-content-center p-0 shadow-sm"
                                                                            style={{ width: '32px', height: '32px', borderRadius: '6px' }}
                                                                            disabled={guardandoKey === it.key}
                                                                            onClick={() => handleGuardarPrecioOtro(it.key, it.nombre, preciosOtros[it.key])}
                                                                            title={(guardadosDb[it.key] || Number(preciosOtros[it.key] || 0) > 0) ? "Editar precio de fábrica en base de datos" : "Guardar precio de fábrica en base de datos"}
                                                                        >
                                                                            {guardandoKey === it.key ? (
                                                                                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '0.85rem' }}></i>
                                                                            ) : (guardadosDb[it.key] || Number(preciosOtros[it.key] || 0) > 0) ? (
                                                                                <i className="fa-solid fa-pen-to-square" style={{ fontSize: '0.85rem' }}></i>
                                                                            ) : (
                                                                                <i className="fa-solid fa-floppy-disk" style={{ fontSize: '0.85rem' }}></i>
                                                                            )}
                                                                        </Button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                    <tfoot className="table-secondary fw-bold" style={{ fontSize: '0.94rem' }}>
                                                        <tr>
                                                            <td className="text-start ps-3 fs-6">Subtotal Otros Oscar</td>
                                                            <td className="fs-6">{liquidacionData.oscar.totalUnidadesOtrosOscar.toLocaleString()}</td>
                                                            <td>-</td>
                                                            <td>-</td>
                                                            <td className="text-end pe-3 text-success fs-6 fw-bolder">{formatearPrecio(liquidacionData.oscar.totalFabricaOtrosOscar)}</td>
                                                            <td>-</td>
                                                        </tr>
                                                    </tfoot>
                                                </Table>
                                            </div>
                                        </div>
                                    </Collapse>
                                </div>

                                {/* CARD INFORMATIVA DEL COBRO DE GUANTES A FAVOR DE OSCAR */}
                                <Card className="border border-warning-subtle rounded-4 overflow-hidden bg-warning-subtle bg-opacity-10">
                                    <Card.Header 
                                        className="bg-warning-subtle py-2.5 px-3 d-flex align-items-center justify-content-between border-0"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => toggleOscarItem('guantes')}
                                    >
                                        <div className="d-flex align-items-center gap-2">
                                            <i className="fa-solid fa-mitten text-warning-emphasis"></i>
                                            <div>
                                                <strong className="text-dark">
                                                    4. Acreencia de Guantes a Favor de Oscar
                                                    <i className={`fa-solid fa-chevron-${openItemsOscar.guantes ? 'up' : 'down'} text-muted ms-1.5 small`} style={{ fontSize: '0.75rem' }}></i>
                                                </strong>
                                                <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>
                                                    Suministro de guantes a Leonardo a precio de fábrica (Anticipo a recibir)
                                                </small>
                                            </div>
                                        </div>
                                        <Badge bg="warning" className="text-dark rounded-pill px-3 py-1 fw-bold">
                                            +{formatearPrecio(liquidacionData.leo.totalAnticipoGuantesLeo)}
                                        </Badge>
                                    </Card.Header>
                                    <Collapse in={openItemsOscar.guantes}>
                                        <div>
                                            <Card.Body className="p-3">
                                                <div className="d-flex justify-content-between align-items-center small">
                                                    <span>Docenas de guantes vendidos por Leonardo:</span>
                                                    <strong>{liquidacionData.leo.totalUnidadesGuantesLeo} doc.</strong>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center small mt-1">
                                                    <span>Monto total a cobrar a Leonardo por los guantes:</span>
                                                    <strong className="text-warning-emphasis fs-6">{formatearPrecio(liquidacionData.leo.totalAnticipoGuantesLeo)}</strong>
                                                </div>
                                            </Card.Body>
                                        </div>
                                    </Collapse>
                                </Card>

                                {/* TOTALIZACIÓN Y DEDUCCIÓN DE GASTOS DE OSCAR */}
                                <div className="p-3 rounded-4 bg-light border">
                                    <h6 className="fw-bold text-dark mb-2">Liquidación Operativa de Oscar</h6>
                                    <div className="d-flex flex-column gap-1.5 small">
                                        <div className="d-flex justify-content-between">
                                            <span>Venta Total Kits a Fábrica de Oscar:</span>
                                            <strong className="text-primary">{formatearPrecio(liquidacionData.oscar.ventaFabricaKitsOscarTotal)}</strong>
                                        </div>
                                        <div className="d-flex justify-content-between text-danger">
                                            <span>(-) Gastos Deducibles de Kits (Oscar):</span>
                                            <strong>- {formatearPrecio(liquidacionData.oscar.totalGastos)}</strong>
                                        </div>
                                        <hr className="my-1" />
                                        <div className="d-flex justify-content-between fs-6 fw-bold">
                                            <span className="text-dark">Resultado Neto Kits Oscar:</span>
                                            <span className={liquidacionData.oscar.resultadoNetoKitsOscar >= 0 ? 'text-success' : 'text-danger'}>
                                                {formatearPrecio(liquidacionData.oscar.resultadoNetoKitsOscar)}
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between pt-1 text-warning-emphasis">
                                            <span>(+) Guantes Fábrica a favor de Oscar:</span>
                                            <strong>+{formatearPrecio(liquidacionData.leo.totalAnticipoGuantesLeo)}</strong>
                                        </div>
                                        {liquidacionData.consolidado.totalAnticiposOscarALeo > 0 && (
                                            <div className="d-flex justify-content-between pt-1 text-success">
                                                <span>(+) Anticipos Entregados a Leonardo (a favor de Oscar):</span>
                                                <strong>+ {formatearPrecio(liquidacionData.consolidado.totalAnticiposOscarALeo)}</strong>
                                            </div>
                                        )}
                                        {liquidacionData.consolidado.totalAnticiposLeoAOscar > 0 && (
                                            <div className="d-flex justify-content-between pt-1 text-danger">
                                                <span>(-) Anticipos Recibidos de Leonardo (a reintegrar a Leo):</span>
                                                <strong>- {formatearPrecio(liquidacionData.consolidado.totalAnticiposLeoAOscar)}</strong>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                </Col>
            </Row>

            {/* ================================================================= */}
            {/* ITEM 5: ANTICIPOS O ADELANTOS DE DINERO ENTRE SOCIOS (A TODO EL ANCHO) */}
            {/* ================================================================= */}
            <Card className="rounded-4 overflow-hidden bg-white shadow-sm border-0 mb-4" style={{ border: '1.5px solid #86efac' }}>
                <Card.Header 
                    className="bg-success-subtle py-3 px-3 d-flex flex-wrap align-items-center justify-content-between gap-2 border-0"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setOpenAnticipos(prev => !prev)}
                >
                    <div className="d-flex align-items-center gap-2">
                        <div
                            className="rounded-circle d-flex align-items-center justify-content-center bg-white text-success shadow-xs"
                            style={{ width: '40px', height: '40px' }}
                        >
                            <i className="fa-solid fa-money-bill-transfer fs-5"></i>
                        </div>
                        <div>
                            <div className="d-flex align-items-center gap-2">
                                <h5 className="fw-bolder text-dark mb-0">5. Anticipos o Adelantos de Dinero entre Socios</h5>
                                <i className={`fa-solid fa-chevron-${openAnticipos ? 'up' : 'down'} text-muted ms-1 small`} style={{ fontSize: '0.85rem' }}></i>
                            </div>
                            <small className="text-muted">Registro de dinero adelantado o suministrado entre Leonardo y Oscar para conciliar en el saldo neto final</small>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <Badge bg="success" className="rounded-pill px-3 py-1.5 fw-bold fs-7 shadow-xs">
                            {anticiposFiltrados.length} registros
                        </Badge>
                        <span className="badge bg-white text-dark border rounded-pill px-3 py-1.5 fw-bold fs-7 shadow-xs">
                            Neto: {formatearPrecio(Math.abs(liquidacionData.consolidado.netoAnticiposAOscar))}
                            <span className="ms-1 text-muted" style={{ fontSize: '0.72rem' }}>
                                ({liquidacionData.consolidado.netoAnticiposAOscar >= 0 ? 'a favor de Oscar' : 'a favor de Leonardo'})
                            </span>
                        </span>
                    </div>
                </Card.Header>

                <Collapse in={openAnticipos}>
                    <div>
                        <Card.Body className="p-3 p-md-4">
                            {/* Formulario a todo el ancho */}
                            <Card className="border border-success-subtle rounded-3 mb-4 bg-light bg-opacity-50 shadow-xs">
                                <Card.Body className="p-3">
                                    <Form onSubmit={handleAgregarAnticipo}>
                                        <Row className="g-3 align-items-end">
                                            {/* Selector Quién entregó el dinero */}
                                            <Col xs={12} sm={6} md={3} lg={3}>
                                                <Form.Label className="small fw-bold text-secondary mb-1.5">
                                                    ¿Quién entregó el dinero?
                                                </Form.Label>
                                                <ButtonGroup size="sm" className="w-100 shadow-xs">
                                                    <Button
                                                        type="button"
                                                        variant={nuevoAnticipo.tipo === 'OSCAR_A_LEO' ? 'primary' : 'outline-secondary'}
                                                        className="fw-bold py-1.5"
                                                        style={{ fontSize: '0.78rem' }}
                                                        onClick={() => setNuevoAnticipo(p => ({ ...p, tipo: 'OSCAR_A_LEO' }))}
                                                    >
                                                        <i className="fa-solid fa-arrow-right me-1"></i> Oscar → Leo
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={nuevoAnticipo.tipo === 'LEO_A_OSCAR' ? 'warning' : 'outline-secondary'}
                                                        className="fw-bold py-1.5"
                                                        style={{ fontSize: '0.78rem' }}
                                                        onClick={() => setNuevoAnticipo(p => ({ ...p, tipo: 'LEO_A_OSCAR' }))}
                                                    >
                                                        <i className="fa-solid fa-arrow-left me-1"></i> Leo → Oscar
                                                    </Button>
                                                </ButtonGroup>
                                            </Col>

                                            {/* Detalle / Motivo */}
                                            <Col xs={12} sm={6} md={3} lg={3}>
                                                <Form.Label className="small fw-bold text-secondary mb-1.5">
                                                    Detalle / Motivo del Anticipo
                                                </Form.Label>
                                                <Form.Control
                                                    size="sm"
                                                    type="text"
                                                    placeholder="Ej: Adelanto efectivo, salud, etc."
                                                    value={nuevoAnticipo.detalle}
                                                    onChange={(e) => setNuevoAnticipo(p => ({ ...p, detalle: e.target.value }))}
                                                    className="fw-medium"
                                                />
                                            </Col>

                                            {/* Cantidad */}
                                            <Col xs={6} sm={4} md={2} lg={1.5}>
                                                <Form.Label className="small fw-bold text-secondary mb-1.5">
                                                    Cantidad
                                                </Form.Label>
                                                <Form.Control
                                                    size="sm"
                                                    type="number"
                                                    min="1"
                                                    placeholder="1"
                                                    value={nuevoAnticipo.cantidad}
                                                    onChange={(e) => handleAnticipoCantidadChange(e.target.value)}
                                                    className="fw-bold text-center"
                                                />
                                            </Col>

                                            {/* Valor Unitario ($) */}
                                            <Col xs={6} sm={4} md={2} lg={2}>
                                                <Form.Label className="small fw-bold text-secondary mb-1.5">
                                                    Valor Unit. ($)
                                                </Form.Label>
                                                <InputGroup size="sm">
                                                    <InputGroup.Text className="bg-white text-muted px-2">$</InputGroup.Text>
                                                    <Form.Control
                                                        type="number"
                                                        min="0"
                                                        step="1000"
                                                        placeholder="0"
                                                        value={nuevoAnticipo.valor}
                                                        onChange={(e) => handleAnticipoValorChange(e.target.value)}
                                                        className="fw-bold text-end"
                                                    />
                                                </InputGroup>
                                                {Number(nuevoAnticipo.valor) > 0 && (
                                                    <div className="text-muted text-end small" style={{ fontSize: '0.72rem', marginTop: '3px' }}>
                                                        {formatearPrecio(nuevoAnticipo.valor)} c/u
                                                    </div>
                                                )}
                                            </Col>

                                            {/* Total ($) - Calculado automáticamente pero editable */}
                                            <Col xs={8} sm={4} md={2} lg={2.5}>
                                                <Form.Label className="small fw-bold text-success mb-1.5 d-flex justify-content-between align-items-center">
                                                    <span>Total ($)</span>
                                                    <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '0.68rem' }}>
                                                        Cant × Valor
                                                    </span>
                                                </Form.Label>
                                                <InputGroup size="sm">
                                                    <InputGroup.Text className="bg-success-subtle text-success-emphasis px-2 fw-bold">$</InputGroup.Text>
                                                    <Form.Control
                                                        type="number"
                                                        min="0"
                                                        step="1000"
                                                        placeholder="0"
                                                        value={nuevoAnticipo.total}
                                                        onChange={(e) => handleAnticipoTotalChange(e.target.value)}
                                                        className="fw-bolder text-end bg-white border-success-subtle"
                                                    />
                                                </InputGroup>
                                                {Number(nuevoAnticipo.total) > 0 && (
                                                    <div className="text-success fw-bold text-end small" style={{ fontSize: '0.74rem', marginTop: '3px' }}>
                                                        = {formatearPrecio(nuevoAnticipo.total)}
                                                    </div>
                                                )}
                                            </Col>

                                            {/* Botón Agregar */}
                                            <Col xs={4} sm={12} md={12} lg={true} className="d-grid">
                                                <Button
                                                    type="submit"
                                                    size="sm"
                                                    variant="success"
                                                    className="fw-bold d-flex align-items-center justify-content-center gap-1.5 shadow-sm py-1.5"
                                                    disabled={isGuardandoAnticipo}
                                                    title="Agregar anticipo"
                                                >
                                                    {isGuardandoAnticipo ? (
                                                        <i className="fa-solid fa-spinner fa-spin"></i>
                                                    ) : (
                                                        <>
                                                            <i className="fa-solid fa-plus"></i>
                                                            <span>Agregar</span>
                                                        </>
                                                    )}
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Card.Body>
                            </Card>

                            {/* Listado inferior a todo el ancho */}
                            <div className="table-responsive">
                                <Table hover bordered size="sm" className="align-middle mb-0 text-center" style={{ borderColor: '#e2e8f0', fontSize: '0.88rem' }}>
                                    <thead className="table-light">
                                        <tr className="text-secondary small fw-bold">
                                            <th style={{ width: '150px' }}>Dirección</th>
                                            <th className="text-start ps-3">Detalle / Motivo</th>
                                            <th style={{ width: '90px' }}>Cant.</th>
                                            <th style={{ width: '160px' }} className="text-end">Valor Unitario ($)</th>
                                            <th style={{ width: '170px' }} className="text-end pe-3">Total ($)</th>
                                            <th style={{ width: '70px' }}>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {anticiposBusqueda.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="text-muted py-4">No hay anticipos o adelantos registrados en este periodo</td>
                                            </tr>
                                        ) : (
                                            anticiposBusqueda.map((ant, idx) => {
                                                const cant = ant.cantidad || 1;
                                                const valorUnit = (ant.valor !== undefined && ant.valor !== null && Number(ant.valor) > 0)
                                                    ? Number(ant.valor)
                                                    : (cant > 0 ? Number(ant.total) / cant : Number(ant.total));

                                                return (
                                                    <tr key={ant._id || ant.id || idx}>
                                                        <td>
                                                            {ant.tipo === 'OSCAR_A_LEO' ? (
                                                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2.5 py-1" style={{ fontSize: '0.78rem' }}>
                                                                    <i className="fa-solid fa-arrow-right me-1"></i> Oscar a Leo
                                                                </span>
                                                            ) : (
                                                                <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-2.5 py-1" style={{ fontSize: '0.78rem' }}>
                                                                    <i className="fa-solid fa-arrow-left me-1"></i> Leo a Oscar
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="text-start ps-3 fw-semibold text-dark">
                                                            {ant.detalle}
                                                        </td>
                                                        <td className="fw-bold">{cant}</td>
                                                        <td className="text-end text-muted fw-medium">
                                                            {formatearPrecio(valorUnit)}
                                                        </td>
                                                        <td className="text-end fw-bold text-dark pe-3 fs-6">
                                                            {formatearPrecio(ant.total)}
                                                        </td>
                                                        <td>
                                                            <Button
                                                                size="sm"
                                                                variant="outline-danger"
                                                                className="d-inline-flex align-items-center justify-content-center p-0 shadow-xs"
                                                                style={{ width: '32px', height: '32px', borderRadius: '6px' }}
                                                                onClick={() => startEliminarAnticipo(ant._id || ant.id, ant.detalle)}
                                                                title="Eliminar anticipo"
                                                            >
                                                                <i className="fa-solid fa-trash-can" style={{ fontSize: '0.85rem' }}></i>
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                    <tfoot className="table-secondary fw-bold" style={{ fontSize: '0.92rem' }}>
                                        <tr>
                                            <td colSpan={2} className="text-start ps-3">
                                                Resumen de Anticipos:
                                            </td>
                                            <td className="text-muted">{anticiposFiltrados.length} reg.</td>
                                            <td className="text-end text-muted">-</td>
                                            <td className="text-end pe-3">
                                                <div className="text-primary small" title="Oscar adelantó a Leonardo">
                                                    Oscar a Leo: {formatearPrecio(liquidacionData.consolidado.totalAnticiposOscarALeo)}
                                                </div>
                                                <div className="text-warning-emphasis small" title="Leonardo adelantó a Oscar">
                                                    Leo a Oscar: {formatearPrecio(liquidacionData.consolidado.totalAnticiposLeoAOscar)}
                                                </div>
                                                <div className="border-top pt-1 text-dark fs-6 fw-bolder">
                                                    Neto: {formatearPrecio(Math.abs(liquidacionData.consolidado.netoAnticiposAOscar))}
                                                    <span className="ms-1 text-muted" style={{ fontSize: '0.74rem' }}>
                                                        ({liquidacionData.consolidado.netoAnticiposAOscar >= 0 ? 'a favor de Oscar' : 'a favor de Leonardo'})
                                                    </span>
                                                </div>
                                            </td>
                                            <td>-</td>
                                        </tr>
                                    </tfoot>
                                </Table>
                            </div>
                        </Card.Body>
                    </div>
                </Collapse>
            </Card>

            {/* NOTA METODOLÓGICA Y AUDITORÍA AL PIE */}
            <div className="card border-0 rounded-4 shadow-sm p-3 bg-white mb-4">
                <div className="d-flex align-items-start gap-2">
                    <i className="fa-solid fa-circle-info text-primary mt-1"></i>
                    <div className="small text-muted">
                        <strong>Metodología de Cruce de Cuentas:</strong>
                        <ul className="mb-0 ps-3 mt-1">
                            <li><strong>Precios de Fábrica:</strong> Se obtienen de la tarifa vigente según la fecha de cada pedido registrada en la tabla de precios de fábrica.</li>
                            <li><strong>Guantes:</strong> Funcionan como anticipo/suministro directo de Oscar hacia Leonardo a precio de fábrica; por ende, Leonardo debe pagarle ese valor a Oscar.</li>
                            <li><strong>Otros de Kits:</strong> Incluye los accesorios clasificados como Kits. La casilla editable permite ingresar el costo de fábrica y se almacena en su navegador.</li>
                            <li><strong>Kits de Karol Gómez:</strong> Se integran al volumen de Leonardo (Karol actúa como su cliente en Kits).</li>
                            <li><strong>Gastos Deducibles de Kits:</strong> Exclusivamente se computan los egresos registrados con categoría Kits ('K'). Se descartan gastos de guantes y otros que no correspondan a la producción de kits.</li>
                            <li><strong>Anticipos o Adelantos de Dinero:</strong> Registro de dinero directo transferido o adelantado entre los socios (Oscar a Leonardo o Leonardo a Oscar). Se concilian sumando o deduciendo directamente del saldo neto final de la liquidación.</li>
                            <li><strong>Reparto 50/50:</strong> La utilidad conjunta de Kits (Ventas Fábrica Totales de Kits - Gastos Totales de Kits) se reparte por mitades iguales entre ambos socios.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </Container>
    </LayoutApp>
    );
};
export default CruceCuentas;
