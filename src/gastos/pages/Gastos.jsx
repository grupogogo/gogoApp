import React, { useEffect, useState } from 'react'
import { LayoutApp } from '../../layout/LayoutApp'
import { ListarGastos } from '../components/ListarGastos'
import { useGastosStore } from '../../hooks/useGastosStore'
import { useAuthStore, useForm, useFuntions } from '../../hooks'
import { GastosLoadInput } from '../components/GastosLoadInput'

import { Button, Col, Container, InputGroup, Modal, Row, Form } from 'react-bootstrap'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import DatePicker from 'react-datepicker'
import Swal from 'sweetalert2'
import { useSelector } from 'react-redux'

const formInicial = {
    proveedor: '',
    detalle: '',
    categoria: 'K',
}

const crearItemVacio = () => ({
    id: Date.now() + Math.random(),
    gasto: '',
    subCategoria: 'G',
    codigo: '',
    cantidad: 1,
    precio: 0
});

export const Gastos = () => {
    const { formatearPrecio, limpiarFecha, convertirFechaIngles } = useFuntions()
    const [fechaActual, setFechaActual] = useState(new Date());
    const [show, setShow] = useState(false)
    const [check, setCheck] = useState(false);
    const [selCategoria, setSelCategoria] = useState(0)
    const [modoEdicion, setModoEdicion] = useState(false);
    const [gastoAEditar, setGastoAEditar] = useState(null);
    const { startAddNewGasto, startUpdateGasto, startLoadingGastos, limpiarGastoActivo } = useGastosStore();
    const gastoActivo = useSelector(state => state.gastos.gastoActivo);
    const formattedDate = format(fechaActual, "MMMM d, yyyy HH:mm", { locale: es });
    const { onInputChange, proveedor, categoria, detalle, setFormState, onResetForm } = useForm(formInicial);
    const gastos = useSelector(state => state.gastos.gastos);
    const [gastoUsuarios, setGastoUsuarios] = useState(0);
    const { user } = useAuthStore();

    // Estado para productos/ítems dinámicos de la factura de gasto
    const [itemsGasto, setItemsGasto] = useState([crearItemVacio()]);

    const [comprobanteData, setComprobanteData] = useState({
        data: null,
        nombre: '',
        tipo: ''
    });

    const isLeonardo = user?.uid === '6789ce1b48932f890985d1f7';

    // Funciones para manipular productos dinámicos
    const handleAddItem = () => {
        setItemsGasto(prev => [...prev, crearItemVacio()]);
    };

    const handleRemoveItem = (index) => {
        if (itemsGasto.length <= 1) return;
        setItemsGasto(prev => prev.filter((_, i) => i !== index));
    };

    const handleItemChange = (index, field, value) => {
        setItemsGasto(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    };

    const handleItemNumberChange = (index, field, rawValue) => {
        const clean = String(rawValue).replace(/[^0-9]/g, '');
        setItemsGasto(prev => prev.map((item, i) => i === index ? { ...item, [field]: clean === '' ? '' : Number(clean) } : item));
    };

    const handleItemCantidadStep = (index, step) => {
        setItemsGasto(prev => prev.map((item, i) => {
            if (i !== index) return item;
            const cur = Number(item.cantidad) || 0;
            return { ...item, cantidad: Math.max(1, cur + step) };
        }));
    };

    const renderSubcategoriaOptions = () => {
        if (selCategoria === 0) {
            return (
                <>
                    <option value="G">GENERAL</option>
                    <option value="KCG">KCG</option>
                    <option value="KCP">KCP</option>
                    <option value="KB">KB</option>
                    <option value="KCE">KCE</option>
                    <option value="CC">CC</option>
                    <option value="CB">CB</option>
                    <option value="CINTA-CO">CINTA CO</option>
                </>
            );
        }
        if (selCategoria === 1) {
            return (
                <>
                    <option value="G">GENERAL</option>
                    <option value="GB">G. BLANCOS</option>
                    <option value="GN">G. NEGROS</option>
                    <option value="GM">G. MITÓN</option>
                </>
            );
        }
        return <option value="G">GENERAL</option>;
    };

    const cargarDatosGasto = (gastoObj, esAutocompletar = false) => {
        if (!gastoObj) return;
        const cat = isLeonardo ? 'K' : (gastoObj.categoria || 'K');

        if (!esAutocompletar) {
            setFormState({
                proveedor: gastoObj.proveedor || '',
                categoria: cat,
                detalle: gastoObj.detalle || '',
            });
            setCheck(gastoObj.tipoGasto === 'Servicio');

            if (gastoObj.comprobante) {
                setComprobanteData({
                    data: gastoObj.comprobante,
                    nombre: gastoObj.comprobanteNombre || 'Comprobante',
                    tipo: gastoObj.comprobanteTipo || ''
                });
            } else {
                setComprobanteData({ data: null, nombre: '', tipo: '' });
            }

            if (cat === 'K') setSelCategoria(0);
            else if (cat === 'G') setSelCategoria(1);
            else setSelCategoria(2);

            // Cargar ítems
            if (Array.isArray(gastoObj.items) && gastoObj.items.length > 0) {
                setItemsGasto(gastoObj.items.map((it, idx) => ({
                    id: Date.now() + idx + Math.random(),
                    gasto: it.gasto || '',
                    codigo: it.codigo || '',
                    subCategoria: it.subCategoria || 'G',
                    cantidad: it.cantidad !== undefined ? it.cantidad : 1,
                    precio: it.precio !== undefined ? it.precio : 0
                })));
            } else {
                setItemsGasto([{
                    id: Date.now() + Math.random(),
                    gasto: gastoObj.gasto || '',
                    codigo: gastoObj.codigo || '',
                    subCategoria: gastoObj.subCategoria || 'G',
                    cantidad: gastoObj.cantidad !== undefined ? gastoObj.cantidad : 1,
                    precio: gastoObj.precio !== undefined ? gastoObj.precio : 0
                }]);
            }
        } else {
            // Plantilla o autocompletar rápido
            if (gastoObj.proveedor && !proveedor) {
                setFormState(prev => ({ ...prev, proveedor: gastoObj.proveedor }));
            }
            if (gastoObj.tipoGasto) {
                setCheck(gastoObj.tipoGasto === 'Servicio');
            }

            if (Array.isArray(gastoObj.items) && gastoObj.items.length > 0) {
                const nuevosItems = gastoObj.items.map((it, idx) => ({
                    id: Date.now() + idx + Math.random(),
                    gasto: it.gasto || '',
                    codigo: it.codigo || '',
                    subCategoria: it.subCategoria || 'G',
                    cantidad: it.cantidad !== undefined ? it.cantidad : 1,
                    precio: it.precio !== undefined ? it.precio : 0
                }));

                setItemsGasto(prev => {
                    if (prev.length === 1 && !prev[0].gasto?.trim() && !prev[0].codigo?.trim() && (Number(prev[0].precio) || 0) === 0) {
                        return nuevosItems;
                    }
                    return [...prev, ...nuevosItems];
                });
            } else if (gastoObj.gasto) {
                const nuevoItem = {
                    id: Date.now() + Math.random(),
                    gasto: gastoObj.gasto || '',
                    codigo: gastoObj.codigo || '',
                    subCategoria: gastoObj.subCategoria || 'G',
                    cantidad: gastoObj.cantidad !== undefined ? gastoObj.cantidad : 1,
                    precio: gastoObj.precio !== undefined ? gastoObj.precio : 0
                };

                setItemsGasto(prev => {
                    if (prev.length === 1 && !prev[0].gasto?.trim() && !prev[0].codigo?.trim() && (Number(prev[0].precio) || 0) === 0) {
                        return [nuevoItem];
                    }
                    return [...prev, nuevoItem];
                });
            }
        }
    };

    const handleComprobanteChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const MAX_SIZE = 15 * 1024 * 1024; // 15MB
        if (file.size > MAX_SIZE) {
            Swal.fire('Archivo muy grande', 'El archivo supera los 15MB. Por favor selecciona uno más liviano.', 'warning');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setComprobanteData({
                data: event.target.result,
                nombre: file.name,
                tipo: file.type || 'application/octet-stream'
            });
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleQuitarComprobante = () => {
        setComprobanteData({ data: null, nombre: '', tipo: '' });
    };

    const handleClose = () => {
        setShow(false);
        setModoEdicion(false);
        setGastoAEditar(null);
        setComprobanteData({ data: null, nombre: '', tipo: '' });
        limpiarGastoActivo();
        onResetForm();
        setItemsGasto([crearItemVacio()]);
        setFechaActual(new Date());
    };

    const handleShow = (item = null, esEdicion = false) => {
        if (esEdicion && item) {
            // MODO EDICIÓN: carga el gasto original y conserva su fecha original
            setModoEdicion(true);
            setGastoAEditar(item);
            if (item.fecha) {
                try {
                    const parsed = convertirFechaIngles(item.fecha);
                    setFechaActual(isNaN(parsed.getTime()) ? new Date() : parsed);
                } catch {
                    setFechaActual(new Date());
                }
            } else {
                setFechaActual(new Date());
            }
            cargarDatosGasto(item, false);
        } else if (item && item.gasto) {
            // PLANTILLA: copia datos pero con fecha actual
            setModoEdicion(false);
            setGastoAEditar(null);
            setFechaActual(new Date());
            cargarDatosGasto(item, false);
        } else if (gastoActivo) {
            setModoEdicion(false);
            setGastoAEditar(null);
            setFechaActual(new Date());
            cargarDatosGasto(gastoActivo, false);
        } else {
            // NUEVO GASTO
            setModoEdicion(false);
            setGastoAEditar(null);
            setComprobanteData({ data: null, nombre: '', tipo: '' });
            setFechaActual(new Date());
            setFormState(formInicial);
            setItemsGasto([crearItemVacio()]);
            setCheck(false);
            setSelCategoria(0);
            limpiarGastoActivo();
        }
        setShow(true);
    };

    const handleCheck = () => {
        setCheck(!check);
    };

    // Cálculos de totales en vivo
    const liveTotal = itemsGasto.reduce((sum, it) => sum + ((Number(it.cantidad) || 0) * (Number(it.precio) || 0)), 0);
    const liveTotalUnidades = itemsGasto.reduce((sum, it) => sum + (Number(it.cantidad) || 0), 0);

    const guardarGasto = async () => {
        if (!proveedor?.trim()) {
            Swal.fire({
                title: "Proveedor requerido",
                text: 'Por favor ingresa el nombre del proveedor o empresa.',
                icon: "warning"
            });
            return;
        }

        if (!itemsGasto || itemsGasto.length === 0) {
            Swal.fire({
                title: "Sin productos",
                text: 'Debes agregar al menos un producto o servicio al gasto.',
                icon: "warning"
            });
            return;
        }

        // Validar cada ítem
        for (let i = 0; i < itemsGasto.length; i++) {
            const it = itemsGasto[i];
            const numCant = Number(it.cantidad) || 0;
            const numPrec = Number(it.precio) || 0;

            if (!it.gasto?.trim() || !it.codigo?.trim() || numCant <= 0 || numPrec <= 0) {
                Swal.fire({
                    title: `Ítem #${i + 1} incompleto`,
                    text: `Por favor completa los campos del Ítem #${i + 1} (Código, ${check ? 'Concepto' : 'Nombre del Producto'}, Cantidad > 0 y Precio > 0).`,
                    icon: "warning"
                });
                return;
            }
        }

        const formattedItems = itemsGasto.map(it => ({
            gasto: it.gasto.trim(),
            codigo: it.codigo.trim(),
            subCategoria: it.subCategoria || 'G',
            cantidad: Number(it.cantidad) || 1,
            precio: Number(it.precio) || 0
        }));

        let gastoPrincipal = '';
        let codigoPrincipal = '';
        let subCatPrincipal = 'G';
        let cantidadPrincipal = 1;
        let precioPrincipal = 0;

        if (formattedItems.length === 1) {
            gastoPrincipal = formattedItems[0].gasto;
            codigoPrincipal = formattedItems[0].codigo;
            subCatPrincipal = formattedItems[0].subCategoria;
            cantidadPrincipal = formattedItems[0].cantidad;
            precioPrincipal = formattedItems[0].precio;
        } else {
            gastoPrincipal = formattedItems.map(it => it.gasto).join(', ');
            codigoPrincipal = formattedItems.map(it => it.codigo).filter(Boolean).join(' / ');
            const primeraSub = formattedItems[0].subCategoria;
            subCatPrincipal = formattedItems.every(it => it.subCategoria === primeraSub) ? primeraSub : 'VARIOS';
            cantidadPrincipal = 1;
            precioPrincipal = liveTotal;
        }

        const gastoTotal = {
            tipoGasto: check ? 'Servicio' : 'Producto',
            fecha: formattedDate,
            proveedor: proveedor.trim(),
            categoria: isLeonardo ? 'K' : categoria,
            subCategoria: subCatPrincipal,
            gasto: gastoPrincipal,
            codigo: codigoPrincipal,
            cantidad: cantidadPrincipal,
            precio: precioPrincipal,
            detalle: detalle?.trim() || '',
            comprobante: comprobanteData.data || null,
            comprobanteNombre: comprobanteData.nombre || '',
            comprobanteTipo: comprobanteData.tipo || '',
            items: formattedItems
        };

        if (modoEdicion && gastoAEditar) {
            // Validar si el gasto original es de hace más de un mes (30 días)
            let esAntiguo = false;
            try {
                if (gastoAEditar.fecha) {
                    const parsedOrig = convertirFechaIngles(gastoAEditar.fecha);
                    if (!isNaN(parsedOrig.getTime())) {
                        const diferenciaDias = (new Date().getTime() - parsedOrig.getTime()) / (1000 * 60 * 60 * 24);
                        esAntiguo = diferenciaDias > 30;
                    }
                }
            } catch {
                esAntiguo = false;
            }

            if (esAntiguo) {
                // Confirmación reforzada para gastos antiguos (> 1 mes)
                const confirmacion = await Swal.fire({
                    title: '⚠️ ¿Cambiar este gasto antiguo?',
                    html: `
                        <div class="text-start">
                            <p class="text-danger fw-semibold mb-2">
                                <i class="fa-solid fa-triangle-exclamation me-1"></i>
                                Este gasto fue registrado hace más de 1 mes (<strong>${limpiarFecha(gastoAEditar.fecha)}</strong>).
                            </p>
                            <p class="small text-muted mb-0">
                                Modificarlo afectará los balances e informes contables de periodos anteriores. ¿Realmente estás seguro de cambiar este gasto en la base de datos?
                            </p>
                        </div>
                    `,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#dc3545',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: '<i class="fa-solid fa-check me-1"></i> Sí, cambiar gasto antiguo',
                    cancelButtonText: 'Cancelar'
                });

                if (!confirmacion.isConfirmed) return;
            } else {
                // Confirmación estándar para gastos recientes (<= 1 mes)
                const confirmacion = await Swal.fire({
                    title: '¿Confirmar actualización?',
                    text: '¿Deseas guardar los cambios realizados en este gasto?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#0d6efd',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: '<i class="fa-solid fa-floppy-disk me-1"></i> Sí, actualizar',
                    cancelButtonText: 'Cancelar'
                });

                if (!confirmacion.isConfirmed) return;
            }

            const idAActualizar = gastoAEditar.gastos_id || gastoAEditar._id;
            await startUpdateGasto(idAActualizar, gastoTotal);
            Swal.fire({
                title: "¡Gasto modificado!",
                text: "El gasto se ha actualizado correctamente en la base de datos.",
                icon: "success",
                timer: 1600,
                showConfirmButton: false
            });
        } else {
            // Registro de nuevo gasto
            await startAddNewGasto(gastoTotal);
            Swal.fire({
                title: "¡Gasto registrado!",
                text: "Los datos se han almacenado correctamente en la base de datos.",
                icon: "success",
                timer: 1600,
                showConfirmButton: false
            });
        }

        startLoadingGastos();
        onResetForm();
        handleClose();
    };

    const onInputChangeCategoaria = (e) => {
        const selCategoria = e.target.value;
        const { name, value } = e.target;

        setFormState((prev) => ({
            ...prev,
            [name]: value,
        }));

        switch (selCategoria) {
            case 'K':
                setSelCategoria(0);
                break;
            case 'G':
                setSelCategoria(1);
                break;
            case 'O':
                setSelCategoria(2);
                break;
            default:
                break;
        }
        onInputChange(e);
    };

    const cargarGastos = async () => {
        await startLoadingGastos();
    };

    useEffect(() => {
        cargarGastos();
    }, []);

    useEffect(() => {
        if (gastoActivo && !modoEdicion) {
            cargarDatosGasto(gastoActivo, true);
        }
    }, [gastoActivo, isLeonardo, modoEdicion]);

    return (
        <LayoutApp>
            <div className='m-1 m-sm-3'>
                <Row>
                    <Modal
                        size="lg"
                        centered
                        show={show}
                        onHide={handleClose}
                    >
                        <Modal.Header closeButton className="border-bottom pb-3 px-3 px-sm-4 pt-3 bg-light">
                            <div className="d-flex align-items-center gap-3">
                                <div className={`rounded-3 p-2 d-flex align-items-center justify-content-center shadow-xs ${modoEdicion ? 'bg-warning bg-opacity-10 text-warning' : 'bg-primary bg-opacity-10 text-primary'}`} style={{ width: 44, height: 44 }}>
                                    <i className={`${modoEdicion ? 'fa-solid fa-pen-to-square' : 'fa-solid fa-file-invoice-dollar'} fs-5`}></i>
                                </div>
                                <div>
                                    <Modal.Title className="fs-5 fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                                        <span>{modoEdicion ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}</span>
                                        {modoEdicion && (
                                             <span className="badge bg-warning text-dark border border-warning-subtle py-1 px-2 fw-semibold" style={{ fontSize: '0.72rem' }}>
                                                <i className="fa-solid fa-pen me-1"></i> Modo Edición
                                            </span>
                                        )}
                                    </Modal.Title>
                                    <small className="text-muted">
                                        {modoEdicion ? 'Modifica los campos del gasto seleccionado en la base de datos' : 'Ingresa los detalles de la compra o servicio'}
                                    </small>
                                </div>
                            </div>
                        </Modal.Header>

                        <Modal.Body className="p-3 p-sm-4">
                            {/* Selector de Tipo y Fecha */}
                            <Row className="g-3 align-items-end mb-3">
                                <Col xs={12} sm={6}>
                                    <Form.Label className="small fw-semibold text-muted mb-1">
                                        <i className="fa-solid fa-layer-group me-1 text-primary"></i> Tipo de Gasto
                                    </Form.Label>
                                    <div className="btn-group w-100 shadow-xs" role="group">
                                        <button
                                            type="button"
                                            className={`btn btn-sm py-2 fw-semibold ${!check ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            onClick={() => setCheck(false)}
                                        >
                                            <i className="fa-solid fa-box-open me-1"></i> PRODUCTO
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn btn-sm py-2 fw-semibold ${check ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            onClick={() => setCheck(true)}
                                        >
                                            <i className="fa-solid fa-screwdriver-wrench me-1"></i> SERVICIO
                                        </button>
                                    </div>
                                </Col>
                                <Col xs={12} sm={6}>
                                    <Form.Label className="small fw-semibold text-muted mb-1">
                                        <i className="fa-regular fa-calendar-days me-1 text-primary"></i> Fecha y Hora
                                    </Form.Label>
                                    <div className="input-group">
                                        <DatePicker
                                            className="form-control text-center fw-medium"
                                            selected={fechaActual}
                                            dateFormat="PP HH:mm"
                                            locale="es"
                                            onChange={(date) => setFechaActual(date)}
                                        />
                                        <span className="input-group-text bg-light text-muted">
                                            <i className="fa-solid fa-clock"></i>
                                        </span>
                                    </div>
                                </Col>
                            </Row>

                            {/* Cargar Gasto Frecuente (solo si no es modo edición) */}
                            {!modoEdicion && (
                                <div className="p-3 bg-light rounded-3 border border-dashed mb-3">
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <span className="small fw-bold text-secondary text-uppercase" style={{ letterSpacing: '0.5px' }}>
                                            <i className="fa-solid fa-bolt text-warning me-1"></i> Plantilla rápida / Autocompletar
                                        </span>
                                        {gastoActivo && (
                                            <span className="badge bg-success-subtle text-success border border-success-subtle py-1 px-2">
                                                <i className="fa-solid fa-check me-1"></i> Datos cargados
                                            </span>
                                        )}
                                    </div>
                                    <GastosLoadInput />
                                </div>
                            )}

                            {/* Proveedor y Categoría */}
                            <Row className="g-3 mb-3">
                                <Col xs={12} md={7}>
                                    <Form.Group>
                                        <Form.Label className="small fw-semibold text-muted mb-1">
                                            <i className="fa-solid fa-building text-secondary me-1"></i> Proveedor / Empresa <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Nombre del proveedor o empresa"
                                            name="proveedor"
                                            value={proveedor}
                                            onChange={onInputChange}
                                            className="shadow-none"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={5}>
                                    <Form.Group>
                                        <Form.Label className="small fw-semibold text-muted mb-1">
                                            <i className="fa-solid fa-folder-tree text-secondary me-1"></i> Centro de Costos <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Select
                                            name="categoria"
                                            value={isLeonardo ? 'K' : categoria}
                                            onChange={onInputChangeCategoaria}
                                            className="fw-semibold text-dark shadow-none"
                                            disabled={isLeonardo}
                                        >
                                            <option value="K">KITS</option>
                                            {!isLeonardo && (
                                                <>
                                                    <option value="G">GUANTES</option>
                                                    <option value="O">OTROS</option>
                                                </>
                                            )}
                                        </Form.Select>
                                        {isLeonardo && (
                                            <small className="text-muted fst-italic d-block mt-1">
                                                Restringido a KITS para tu usuario
                                            </small>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* SECCIÓN DINÁMICA DE PRODUCTOS / ÍTEMS */}
                            <div className="mb-3">
                                <div className="d-flex align-items-center justify-content-between mb-2.5 pb-2 border-bottom">
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="small fw-bold text-dark text-uppercase" style={{ letterSpacing: '0.5px' }}>
                                            <i className="fa-solid fa-boxes-stacked text-primary me-1.5"></i>
                                            {check ? 'Servicios / Ítems de la Factura' : 'Productos / Ítems de la Factura'}
                                        </span>
                                        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-2.5 py-0.5 fw-semibold" style={{ fontSize: '0.74rem' }}>
                                            {itemsGasto.length} {itemsGasto.length === 1 ? 'ítem' : 'ítems'}
                                        </span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline-primary"
                                        size="sm"
                                        className="rounded-pill px-3 py-1 fw-semibold d-flex align-items-center gap-1.5 shadow-xs"
                                        style={{ fontSize: '0.8rem' }}
                                        onClick={handleAddItem}
                                    >
                                        <i className="fa-solid fa-plus"></i>
                                        <span>Agregar Ítem</span>
                                    </Button>
                                </div>

                                {/* Lista de Tarjetas de Ítems */}
                                <div className="d-flex flex-column gap-3">
                                    {itemsGasto.map((item, index) => {
                                        const subtotalItem = (Number(item.cantidad) || 0) * (Number(item.precio) || 0);

                                        return (
                                            <div
                                                key={item.id}
                                                className="p-3 rounded-3 border bg-light bg-opacity-50 position-relative shadow-xs"
                                                style={{ borderLeft: '4px solid #0d6efd' }}
                                            >
                                                {/* Encabezado del Ítem */}
                                                <div className="d-flex align-items-center justify-content-between mb-2.5 pb-2 border-bottom border-light-subtle">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="badge bg-primary text-white rounded-pill px-2.5 py-1 fw-bold" style={{ fontSize: '0.74rem' }}>
                                                            Ítem #{index + 1}
                                                        </span>
                                                        <span className="small fw-medium text-secondary">
                                                            {check ? 'Detalle del Servicio' : 'Detalle del Producto'}
                                                        </span>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="badge bg-white text-primary border border-primary-subtle px-2.5 py-1 fw-bold shadow-2xs" style={{ fontSize: '0.8rem' }}>
                                                            Subtotal: ${formatearPrecio(subtotalItem)}
                                                        </span>
                                                        {itemsGasto.length > 1 && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center"
                                                                style={{ width: '28px', height: '28px', fontSize: '0.78rem' }}
                                                                onClick={() => handleRemoveItem(index)}
                                                                title="Quitar este ítem"
                                                            >
                                                                <i className="fa-solid fa-trash-can"></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Fila 1: Nombre y Subcategoría */}
                                                <Row className="g-2 mb-2">
                                                    <Col xs={12} md={7}>
                                                        <Form.Group>
                                                            <Form.Label className="small fw-semibold text-muted mb-1" style={{ fontSize: '0.78rem' }}>
                                                                <i className="fa-solid fa-tag text-secondary me-1"></i> {check ? 'Concepto del Servicio' : 'Nombre del Producto'} <span className="text-danger">*</span>
                                                            </Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                size="sm"
                                                                placeholder={check ? "Ej: Mantenimiento correctivo..." : "Ej: Cajas de cartón corrugado..."}
                                                                value={item.gasto}
                                                                onChange={(e) => handleItemChange(index, 'gasto', e.target.value)}
                                                                className="shadow-none bg-white"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={5}>
                                                        <Form.Group>
                                                            <Form.Label className="small fw-semibold text-muted mb-1" style={{ fontSize: '0.78rem' }}>
                                                                <i className="fa-solid fa-tags text-secondary me-1"></i> Subcategoría
                                                            </Form.Label>
                                                            <Form.Select
                                                                size="sm"
                                                                value={item.subCategoria}
                                                                onChange={(e) => handleItemChange(index, 'subCategoria', e.target.value)}
                                                                className="shadow-none bg-white"
                                                            >
                                                                {renderSubcategoriaOptions()}
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                {/* Fila 2: Código, Cantidad y Precio */}
                                                <Row className="g-2 align-items-end">
                                                    <Col xs={12} md={4}>
                                                        <Form.Group>
                                                            <Form.Label className="small fw-semibold text-muted mb-1" style={{ fontSize: '0.78rem' }}>
                                                                <i className="fa-solid fa-barcode text-secondary me-1"></i> Código / Ref <span className="text-danger">*</span>
                                                            </Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                size="sm"
                                                                placeholder="Ej: KCG-01"
                                                                value={item.codigo}
                                                                onChange={(e) => handleItemChange(index, 'codigo', e.target.value)}
                                                                className="shadow-none bg-white"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} sm={6} md={4}>
                                                        <Form.Group>
                                                            <Form.Label className="small fw-semibold text-muted mb-1" style={{ fontSize: '0.78rem' }}>
                                                                <i className="fa-solid fa-hashtag text-secondary me-1"></i> Cantidad <span className="text-danger">*</span>
                                                            </Form.Label>
                                                            <div className="input-group input-group-sm">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-secondary bg-white"
                                                                    onClick={() => handleItemCantidadStep(index, -1)}
                                                                >
                                                                    <i className="fa-solid fa-minus"></i>
                                                                </button>
                                                                <Form.Control
                                                                    type="text"
                                                                    className="text-center fw-bold shadow-none bg-white"
                                                                    value={item.cantidad !== undefined ? item.cantidad : ''}
                                                                    onChange={(e) => handleItemNumberChange(index, 'cantidad', e.target.value)}
                                                                    onFocus={(e) => e.target.select()}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-secondary bg-white"
                                                                    onClick={() => handleItemCantidadStep(index, 1)}
                                                                >
                                                                    <i className="fa-solid fa-plus"></i>
                                                                </button>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} sm={6} md={4}>
                                                        <Form.Group>
                                                            <Form.Label className="small fw-semibold text-muted mb-1" style={{ fontSize: '0.78rem' }}>
                                                                <i className="fa-solid fa-dollar-sign text-secondary me-1"></i> Precio Unitario <span className="text-danger">*</span>
                                                            </Form.Label>
                                                            <div className="input-group input-group-sm">
                                                                <span className="input-group-text bg-white text-muted fw-bold">$</span>
                                                                <Form.Control
                                                                    type="text"
                                                                    className="text-end fw-semibold shadow-none bg-white"
                                                                    placeholder="0"
                                                                    value={item.precio !== undefined ? item.precio : ''}
                                                                    onChange={(e) => handleItemNumberChange(index, 'precio', e.target.value)}
                                                                    onFocus={(e) => e.target.select()}
                                                                />
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Botón para agregar otro ítem */}
                                <div className="mt-2.5">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary w-100 py-2 border-2 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-2xs"
                                        style={{ borderStyle: 'dashed' }}
                                        onClick={handleAddItem}
                                    >
                                        <i className="fa-solid fa-plus-circle fs-6"></i>
                                        <span>+ Agregar otro producto / ítem a esta factura</span>
                                    </button>
                                </div>
                            </div>

                            {/* Banner Resumen Total en Vivo */}
                            <div className="card border-0 bg-primary bg-opacity-10 rounded-3 p-3 mb-3 shadow-xs">
                                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                                    <div>
                                        <div className="text-uppercase fw-bold text-primary small d-flex align-items-center gap-1.5">
                                            <i className="fa-solid fa-file-invoice-dollar fs-6"></i>
                                            <span>Total Factura del Gasto</span>
                                        </div>
                                        <div className="text-muted small mt-0.5">
                                            <strong>{itemsGasto.length}</strong> {itemsGasto.length === 1 ? 'producto/ítem' : 'productos/ítems'} • <strong>{liveTotalUnidades}</strong> {liveTotalUnidades === 1 ? 'unidad' : 'unidades en total'}
                                        </div>
                                    </div>
                                    <div className="text-sm-end">
                                        <span className="display-6 fs-3 fw-bolder text-primary">
                                            ${formatearPrecio(liveTotal)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Observaciones / Detalle */}
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-semibold text-muted mb-1">
                                    <i className="fa-regular fa-comment-dots text-secondary me-1"></i> Observaciones / Detalles
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    placeholder="Notas adicionales, factura, condiciones del pago o entrega..."
                                    name="detalle"
                                    value={detalle}
                                    onChange={onInputChange}
                                    className="shadow-none"
                                />
                            </Form.Group>

                            {/* Campo para Subir Comprobante de Pago */}
                            <Form.Group>
                                <Form.Label className="small fw-semibold text-muted mb-1 d-flex align-items-center justify-content-between">
                                    <span>
                                        <i className="fa-solid fa-paperclip text-secondary me-1"></i> Comprobante de Pago / Factura
                                    </span>
                                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>Opcional (Foto, Recibo o PDF)</span>
                                </Form.Label>
                                
                                {!comprobanteData.data ? (
                                    <div className="border border-2 border-dashed rounded-3 p-3 text-center bg-light bg-opacity-50">
                                        <input
                                            type="file"
                                            id="input-comprobante-gasto"
                                            className="d-none"
                                            accept="image/*,application/pdf"
                                            onChange={handleComprobanteChange}
                                        />
                                        <label htmlFor="input-comprobante-gasto" className="mb-0 w-100" style={{ cursor: 'pointer' }}>
                                            <i className="fa-solid fa-cloud-arrow-up text-primary fs-3 mb-1"></i>
                                            <div className="fw-semibold text-dark small">Haz clic aquí para adjuntar el comprobante</div>
                                            <div className="text-muted" style={{ fontSize: '0.74rem' }}>
                                                Formatos soportados: JPG, PNG, WEBP o PDF (máx. 15MB)
                                            </div>
                                        </label>
                                    </div>
                                ) : (
                                    <div className="border rounded-3 p-2.5 bg-light d-flex align-items-center justify-content-between gap-2 shadow-xs">
                                        <div className="d-flex align-items-center gap-2.5 overflow-hidden">
                                            {comprobanteData.tipo?.startsWith('image/') || comprobanteData.data?.startsWith('data:image/') ? (
                                                <img
                                                    src={comprobanteData.data}
                                                    alt={comprobanteData.nombre}
                                                    className="rounded border"
                                                    style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div className="bg-white border rounded d-flex align-items-center justify-content-center text-danger" style={{ width: '48px', height: '48px' }}>
                                                    <i className="fa-solid fa-file-pdf fs-4"></i>
                                                </div>
                                            )}
                                            <div className="overflow-hidden">
                                                <div className="fw-bold text-dark small text-truncate" style={{ maxWidth: '260px' }} title={comprobanteData.nombre}>
                                                    {comprobanteData.nombre || 'Comprobante adjunto'}
                                                </div>
                                                <span className="badge bg-success-subtle text-success border border-success-subtle py-0.5 px-2" style={{ fontSize: '0.68rem' }}>
                                                    <i className="fa-solid fa-check me-1"></i> Comprobante cargado
                                                </span>
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-center gap-1">
                                            <label htmlFor="input-comprobante-gasto-cambiar" className="btn btn-sm btn-outline-secondary py-1 px-2 mb-0" title="Cambiar archivo" style={{ cursor: 'pointer', fontSize: '0.78rem' }}>
                                                <i className="fa-solid fa-arrows-rotate me-1"></i> Cambiar
                                                <input
                                                    type="file"
                                                    id="input-comprobante-gasto-cambiar"
                                                    className="d-none"
                                                    accept="image/*,application/pdf"
                                                    onChange={handleComprobanteChange}
                                                />
                                            </label>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger py-1 px-2"
                                                onClick={handleQuitarComprobante}
                                                title="Quitar comprobante"
                                                style={{ fontSize: '0.78rem' }}
                                            >
                                                <i className="fa-solid fa-trash-can"></i>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </Form.Group>
                        </Modal.Body>

                        <Modal.Footer className="border-top px-4 py-3 bg-light d-flex justify-content-between">
                            <Button
                                variant="outline-secondary"
                                className="rounded-pill px-4"
                                onClick={handleClose}
                            >
                                <i className="fa-solid fa-xmark me-1"></i> Cerrar
                            </Button>
                            <Button
                                variant={modoEdicion ? "warning" : "primary"}
                                className={`rounded-pill px-4 fw-semibold shadow-sm ${modoEdicion ? 'text-dark' : ''}`}
                                onClick={guardarGasto}
                            >
                                <i className={`${modoEdicion ? 'fa-solid fa-pen-to-square' : 'fa-solid fa-floppy-disk'} me-2`}></i>
                                {modoEdicion ? 'Actualizar Gasto' : 'Guardar Gasto'}
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </Row>
                <Row>
                    <ListarGastos handleShow={handleShow} setFechaActual={setFechaActual} fechaActual={fechaActual} />
                </Row>
            </div>
        </LayoutApp>
    )
}
