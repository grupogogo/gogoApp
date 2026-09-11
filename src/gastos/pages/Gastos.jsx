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
    cantidad: 0,
    precio: 0,
    gasto: '',
    proveedor: '',
    detalle: '',
    codigo: '',
    categoria: 'K',
    subCategoria: 'G',
}
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
    const { onInputNumbersChange, onInputChange, cantidad, precio, gasto, proveedor, categoria, subCategoria, detalle, codigo, setFormState, onResetForm } = useForm(formInicial);
    const gastos = useSelector(state => state.gastos.gastos);
    const [gastoUsuarios, setGastoUsuarios] = useState(0);
    const { user } = useAuthStore();

    const isLeonardo = user?.uid === '6789ce1b48932f890985d1f7';

    const cargarDatosGasto = (gastoObj) => {
        if (!gastoObj) return;
        const cat = isLeonardo ? 'K' : (gastoObj.categoria || 'K');
        setFormState({
            proveedor: gastoObj.proveedor || '',
            codigo: gastoObj.codigo || '',
            gasto: gastoObj.gasto || '',
            categoria: cat,
            subCategoria: gastoObj.subCategoria || 'G',
            precio: gastoObj.precio || 0,
            cantidad: gastoObj.cantidad || 0,
            detalle: gastoObj.detalle || '',
        });
        setCheck(gastoObj.tipoGasto === 'Servicio');

        if (cat === 'K') setSelCategoria(0);
        else if (cat === 'G') setSelCategoria(1);
        else setSelCategoria(2);
    };

    const handleClose = () => {
        setShow(false);
        setModoEdicion(false);
        setGastoAEditar(null);
        limpiarGastoActivo();
        onResetForm();
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
            cargarDatosGasto(item);
        } else if (item && item.gasto) {
            // PLANTILLA: copia datos pero con fecha actual
            setModoEdicion(false);
            setGastoAEditar(null);
            setFechaActual(new Date());
            cargarDatosGasto(item);
        } else if (gastoActivo) {
            setModoEdicion(false);
            setGastoAEditar(null);
            setFechaActual(new Date());
            cargarDatosGasto(gastoActivo);
        } else {
            // NUEVO GASTO
            setModoEdicion(false);
            setGastoAEditar(null);
            setFechaActual(new Date());
            setFormState(formInicial);
            setCheck(false);
            setSelCategoria(0);
        }
        setShow(true);
    };

    const handleCheck = () => {
        setCheck(!check);
    };

    const guardarGasto = async () => {
        const numCantidad = Number(cantidad) || 0;
        const numPrecio = Number(precio) || 0;

        if (!proveedor?.trim() || !gasto?.trim() || !codigo?.trim() || numCantidad <= 0 || numPrecio <= 0) {
            Swal.fire({
                title: "Datos incompletos",
                text: 'Por favor completa los campos obligatorios (Proveedor, Código, Producto/Servicio, Cantidad > 0 y Precio > 0)',
                icon: "warning"
            });
            return;
        }

        const gastoTotal = {
            tipoGasto: check ? 'Servicio' : 'Producto',
            fecha: formattedDate,
            proveedor: proveedor.trim(),
            categoria: isLeonardo ? 'K' : categoria,
            subCategoria,
            gasto: gasto.trim(),
            codigo: codigo.trim(),
            cantidad: numCantidad,
            precio: numPrecio,
            detalle: detalle?.trim() || ''
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
            subCategoria: "G"
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
            cargarDatosGasto(gastoActivo);
        }
    }, [gastoActivo, isLeonardo, modoEdicion]);

    const liveTotal = (Number(cantidad) || 0) * (Number(precio) || 0);

    return (
        <LayoutApp>
            <div className='m-3'>
                <Row>
                    <Modal
                        size="lg"
                        centered
                        show={show}
                        onHide={handleClose}
                    >
                        <Modal.Header closeButton className="border-bottom pb-3 px-4 pt-3 bg-light">
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

                        <Modal.Body className="p-4">
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

                            {/* Concepto / Nombre y Subcategoría */}
                            <Row className="g-3 mb-3">
                                <Col xs={12} md={7}>
                                    <Form.Group>
                                        <Form.Label className="small fw-semibold text-muted mb-1">
                                            <i className="fa-solid fa-tag text-secondary me-1"></i> {check ? 'Concepto del Servicio' : 'Nombre del Producto'} <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder={check ? "Ej: Mantenimiento correctivo..." : "Ej: Cajas de cartón corrugado..."}
                                            name="gasto"
                                            value={gasto}
                                            onChange={onInputChange}
                                            className="shadow-none"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={5}>
                                    <Form.Group>
                                        <Form.Label className="small fw-semibold text-muted mb-1">
                                            <i className="fa-solid fa-tags text-secondary me-1"></i> Subcategoría
                                        </Form.Label>
                                        <Form.Select
                                            name="subCategoria"
                                            value={subCategoria}
                                            onChange={onInputChange}
                                            className="shadow-none"
                                        >
                                            {selCategoria === 0 && (
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
                                            )}
                                            {selCategoria === 1 && (
                                                <>
                                                    <option value="G">GENERAL</option>
                                                    <option value="GB">G. BLANCOS</option>
                                                    <option value="GN">G. NEGROS</option>
                                                    <option value="GM">G. MITÓN</option>
                                                </>
                                            )}
                                            {selCategoria === 2 && (
                                                <option value="G">GENERAL</option>
                                            )}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* Código, Cantidad y Precio */}
                            <Row className="g-3 mb-3">
                                <Col xs={12} md={4}>
                                    <Form.Group>
                                        <Form.Label className="small fw-semibold text-muted mb-1">
                                            <i className="fa-solid fa-barcode text-secondary me-1"></i> Código / Ref <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Ej: KCG-01"
                                            name="codigo"
                                            value={codigo}
                                            onChange={onInputChange}
                                            className="shadow-none"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} sm={6} md={4}>
                                    <Form.Group>
                                        <Form.Label className="small fw-semibold text-muted mb-1">
                                            <i className="fa-solid fa-hashtag text-secondary me-1"></i> Cantidad <span className="text-danger">*</span>
                                        </Form.Label>
                                        <div className="input-group">
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() => {
                                                    const cur = Number(cantidad) || 0;
                                                    if (cur > 1) {
                                                        setFormState(prev => ({ ...prev, cantidad: cur - 1 }));
                                                    }
                                                }}
                                            >
                                                <i className="fa-solid fa-minus"></i>
                                            </button>
                                            <Form.Control
                                                type="text"
                                                className="text-center fw-bold shadow-none"
                                                name="cantidad"
                                                value={cantidad !== undefined ? cantidad : ''}
                                                onChange={onInputNumbersChange}
                                                onFocus={(e) => e.target.select()}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() => {
                                                    const cur = Number(cantidad) || 0;
                                                    setFormState(prev => ({ ...prev, cantidad: cur + 1 }));
                                                }}
                                            >
                                                <i className="fa-solid fa-plus"></i>
                                            </button>
                                        </div>
                                    </Form.Group>
                                </Col>
                                <Col xs={12} sm={6} md={4}>
                                    <Form.Group>
                                        <Form.Label className="small fw-semibold text-muted mb-1">
                                            <i className="fa-solid fa-dollar-sign text-secondary me-1"></i> Precio Unitario <span className="text-danger">*</span>
                                        </Form.Label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light text-muted fw-bold">$</span>
                                            <Form.Control
                                                type="text"
                                                className="text-end fw-semibold shadow-none"
                                                placeholder="0"
                                                name="precio"
                                                value={precio !== undefined ? precio : ''}
                                                onChange={onInputNumbersChange}
                                                onFocus={(e) => e.target.select()}
                                            />
                                        </div>
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* Banner Resumen Total en Vivo */}
                            <div className="card border-0 bg-primary bg-opacity-10 rounded-3 p-3 mb-3">
                                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                                    <div>
                                        <div className="text-uppercase fw-bold text-primary small d-flex align-items-center gap-1">
                                            <i className="fa-solid fa-calculator"></i>
                                            <span>Total del Gasto</span>
                                        </div>
                                        <div className="text-muted small">
                                            {(Number(cantidad) || 0)} unidades &times; ${formatearPrecio(Number(precio) || 0)}
                                        </div>
                                    </div>
                                    <div className="text-sm-end">
                                        <span className="display-6 fs-3 fw-bold text-primary">
                                            ${formatearPrecio(liveTotal)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Observaciones / Detalle */}
                            <Form.Group>
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
