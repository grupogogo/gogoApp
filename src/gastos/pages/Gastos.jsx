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
    precio: 0,
    detalle: '',
    codigo: '',
    categoria: 'K',
    subCategoria: 'G',
}
export const Gastos = () => {
    const { formatearPrecio } = useFuntions()
    const [fechaActual, setFechaActual] = useState(new Date());
    const [show, setShow] = useState(false)
    const [check, setCheck] = useState(false);
    const [selCategoria, setSelCategoria] = useState(0)
    const { startAddNewGasto, startLoadingGastos, limpiarGastoActivo } = useGastosStore();
    const gastoActivo = useSelector(state => state.gastos.gastoActivo);
    const formattedDate = format(fechaActual, "MMMM d, yyyy HH:mm", { locale: es });
    const { onInputNumbersChange, onInputChange, cantidad, precio, gasto, proveedor, categoria, subCategoria, detalle, codigo, setFormState, onResetForm } = useForm(formInicial);
    const gastos = useSelector(state => state.gastos.gastos);
    const [gastoUsuarios, setGastoUsuarios] = useState(0);
    const { user } = useAuthStore();



    const handleClose = () => {
        setShow(false);
        limpiarGastoActivo();
        setFechaActual(new Date());
    }
    const handleShow = () => {
        setFormState(formInicial)
        setShow(true)
    }

    const handleCheck = () => {
        setCheck(!check)
    }

    const guardarGasto = async () => {

        if (proveedor === '' || cantidad === 0 || precio === 0 || gasto === '' || codigo === '') {
            Swal.fire({
                title: "Datos incompletos",
                text: 'Campos incompletos, agregue los datos faltantes',
                icon: "warning"
            })
            return;
        }

        const gastoTotal = {
            tipoGasto: check ? 'Servicio' : 'Producto',
            fecha: formattedDate,
            proveedor,
            categoria,
            subCategoria,
            gasto,
            codigo,
            cantidad,
            precio,
            detalle
        }
        await startAddNewGasto(gastoTotal)
        startLoadingGastos();
        onResetForm()
        handleClose()
        setFechaActual(new Date());
        Swal.fire({
            title: "Se han almacenado los datos correctamente!",
            icon: "success",
            draggable: true,
            timer: 1500
        });
    }

    const onInputChangeCategoaria = (e) => {
        const selCategoria = e.target.value;
        const { name, value } = e.target;

        setFormState((prev) => ({
            ...prev,
            [name]: value, // Actualiza la categoría
            subCategoria: "G" // Reinicia subCategoría a "GENERAL"
        }));

        switch (selCategoria) {
            case 'K':
                setSelCategoria(0)
                break;
            case 'G':
                setSelCategoria(1)
                break
            case 'O':
                setSelCategoria(2)
                break
            default:
                break;
        }
        onInputChange(e);
    }

    const cargarGastos = async () => {
        await startLoadingGastos();
    }

    useEffect(() => {
        cargarGastos();
    }, []); // 🔹 Se ejecuta solo una vez al montar el componente

    useEffect(() => {
        if (gastos.length === 0) return; // Si no hay datos, no hacer cálculos

        const now = new Date();
        const mesActual = now.getMonth(); // Mes actual (0 = enero, 11 = diciembre)
        const añoActual = now.getFullYear(); // Año actual

        // Función para convertir "marzo 30, 2025 21:12" a un objeto Date
        const convertirFecha = (fechaStr) => {
            const meses = {
                enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
                julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
            };

            const regex = /(\w+) (\d+), (\d+) (\d+):(\d+)/; // Expresión para extraer datos
            const match = fechaStr.match(regex);

            if (!match) return null; // Si el formato no es válido, retorna null

            const [, mesTexto, dia, año, horas, minutos] = match;
            const mes = meses[mesTexto.toLowerCase()]; // Convertir el mes a número

            return new Date(año, mes, dia, horas, minutos);
        };

        // Filtrar solo los gastos del mes en curso
        const gastosDelMes = gastos.filter(gasto => {
            const fecha = convertirFecha(gasto.fecha);
            return fecha && fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
        });
        const gastosDelMesUsuario = gastos.filter(gasto => {
            const fecha = convertirFecha(gasto.fecha);
            return gasto.user === user.uid && fecha && fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
        });

        // Calcular los gastos del usuario
        const gastoUsuario1 = gastos
            .filter(gasto => gasto.user === user.uid)
            .reduce((sum, gasto) => sum + (gasto.cantidad * gasto.precio), 0) || 0;

        const gastoUsuario2 = gastos
            .filter(gasto => gasto.user !== user.uid)
            .reduce((sum, gasto) => sum + (gasto.cantidad * gasto.precio), 0) || 0;

        // Calcular el total de gastos del mes
        const totalGastosMes = gastosDelMes.reduce((sum, gasto) => sum + (gasto.cantidad * gasto.precio), 0) || 0;
        const totalGastosMesUsuario = gastosDelMesUsuario.reduce((sum, gasto) => sum + (gasto.cantidad * gasto.precio), 0) || 0;

        setGastoUsuarios({
            user1: gastoUsuario1,
            user2: gastoUsuario2,
            gastosMes: totalGastosMes, // Nueva constante con los gastos del mes actual
            gastosMesUsuario: totalGastosMesUsuario
        });
    }, [gastos]);


    useEffect(() => {
        if (gastoActivo) {
            setFormState({
                proveedor: gastoActivo.proveedor || '',
                codigo: gastoActivo.codigo || '',
                gasto: gastoActivo.gasto || '',
                categoria: gastoActivo.categoria || '',
                subCategoria: gastoActivo.subCategoria || '',
                precio: gastoActivo.precio || 0,
                cantidad: gastoActivo.cantidad || 0,
                detalle: gastoActivo.detalle || '',

            });
            setCheck(gastoActivo.tipoGasto === 'Servicio');
        }
    }, [gastoActivo, setFormState]);


    return (
        <LayoutApp>
            <div className='m-3'>
                <Row>{/* Estadisticas de gastos */}
                    {/* gastos del año usuario logueado */}
                    <div className="col-xl-3 col-md-6 mb-4 col-6">
                        <div className="card border-start-custom shadow h-100 py-2" style={{ borderColor: "#4e73df" }}>
                            <div className="card-body">
                                <div className="row align-items-center">
                                    <div className="col">
                                        <div className="text-xs fw-bold text-primary text-uppercase mb-1">
                                            Gastos del año {user.name}
                                        </div>
                                        <div className="h5 mb-0 fw-bold text-center">
                                            <span className="badge text-bg-primary text-light">
                                                {formatearPrecio(gastoUsuarios.user1) || 0}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-auto">
                                        <i className="fas fa-dollar-sign fa-2x text-primary" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Gstos del mes usuario */}
                    <div className="col-xl-3 col-md-6 mb-4 col-6">
                        <div className="card border-start-custom shadow h-100 py-2" style={{ borderColor: "#f6c23e" }}>
                            <div className="card-body">
                                <div className="row align-items-center">
                                    <div className="col">
                                        <div className="text-xs fw-bold text-warning text-uppercase mb-1">
                                            Gastos del mes de {user.name}
                                        </div>
                                        <div className="h5 mb-0 fw-bold text-center">
                                            <span className="badge text-bg-warning text-light">
                                                {formatearPrecio(gastoUsuarios.gastosMesUsuario) || 0}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-auto">
                                        <i className="fas fa-dollar-sign fa-2x text-warning" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Gastos del mes generales */}
                    <div className="col-xl-3 col-md-6 mb-4 col-6">
                        <div className="card border-start-custom shadow h-100 py-2" style={{ borderColor: "red" }}>
                            <div className="card-body">
                                <div className="row align-items-center">
                                    <div className="col">
                                        <div className="text-xs fw-bold text-danger text-uppercase mb-1">
                                            Gastos del mes
                                        </div>
                                        <div className="h5 mb-0 fw-bold text-center">
                                            <span className="badge text-bg-danger text-light">
                                                {formatearPrecio(gastoUsuarios.gastosMes) || 0}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-auto">
                                        <i className="fas fa-dollar-sign fa-2x text-danger" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Gastos del año totales */}
                    <div className="col-xl-3 col-md-6 mb-4 col-6">
                        <div className="card border-start-custom shadow h-100 py-2" style={{ borderColor: "#1cc88a" }}>
                            <div className="card-body">
                                <div className="row align-items-center">
                                    <div className="col">
                                        <div className="text-xs fw-bold text-success text-uppercase mb-1">
                                            Gastos totales
                                        </div>
                                        <div className="h5 mb-0 fw-bold text-center">
                                            <span className="badge text-bg-success text-light">
                                                {formatearPrecio(gastoUsuarios.user1 + gastoUsuarios.user2) || 0}

                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-auto">
                                        <i className="fas fa-dollar-sign fa-2x text-success" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Row>
                <Row>
                    <Modal
                        size="lg"
                        aria-labelledby="contained-modal-title-vcenter"
                        centered
                        show={show}
                        onHide={handleClose}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title id="contained-modal-title-vcenter">
                                Ingresar una Compra / Servicio
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className='card m-3 shadow'>
                            <Container fluid>
                                <Row>
                                    <Col xs lg="5">
                                        <Form className='fs-4'>
                                            <Form.Check // prettier-ignore
                                                type="switch"
                                                id="custom-switch"
                                                label={check ? "SERVICIO" : "PRODUCTO"}
                                                checked={check}
                                                onChange={handleCheck}
                                            />
                                        </Form>
                                    </Col>
                                    <Col xs lg="7" className="d-flex justify-content-end">
                                        <div className='text-end'>
                                            <InputGroup size="md">
                                                <DatePicker
                                                    className="form-control text-center"
                                                    selected={fechaActual}
                                                    dateFormat="PP HH:mm" // Formato de fecha y hora
                                                    locale="es" // Idioma español
                                                    onChange={(date) => setFechaActual(date)}
                                                />
                                                <InputGroup.Text id="inputGroup-sizing-sm" className='fw-semibold'>
                                                    <span>
                                                        <i className="fas fa-calendar"></i>
                                                    </span>
                                                </InputGroup.Text>
                                            </InputGroup>
                                        </div>
                                    </Col>
                                </Row>
                                <hr className="border border-primary border-3 opacity-80" />
                                <GastosLoadInput />

                                <hr className="border border-primary border-3 opacity-80" />
                                {/* PRODUCTOS */}
                                <div>
                                    <Row>
                                        <Col xs lg="7">
                                            <InputGroup size="" className="mb-1">
                                                <Form.Label column sm="auto" lg="3.5">Proveedor</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name='proveedor'
                                                    value={proveedor}
                                                    onChange={onInputChange}
                                                    aria-label="Small"
                                                    aria-describedby="inputGroup-sizing-sm"
                                                />
                                            </InputGroup>
                                        </Col>
                                        <Col>
                                            <InputGroup size="md" className="mb-1">
                                                <Form.Label column lg="6">Centro costos</Form.Label>
                                                <Form.Select
                                                    className='text-center'
                                                    onChange={onInputChangeCategoaria}
                                                    name='categoria'
                                                    value={categoria}>
                                                    <option value="K">KITS</option>
                                                    <option value="G">GUANTES</option>
                                                    <option value="O">OTROS</option>
                                                </Form.Select>
                                            </InputGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs lg="7">
                                            <InputGroup size="md" className="mb-1">
                                                <Form.Label column sm="auto" lg="3">{check ? 'Servicio' : 'Producto'}</Form.Label>
                                                <Form.Control
                                                    type='text'
                                                    name='gasto'
                                                    value={gasto}
                                                    onChange={onInputChange}
                                                    aria-label="Small"
                                                    aria-describedby="inputGroup-sizing-sm"
                                                />
                                            </InputGroup>
                                        </Col>
                                        <Col>
                                            <InputGroup size="md" className="mb-1">
                                                <Form.Label column sm="auto" lg="6">SubCategoria</Form.Label>
                                                <Form.Select
                                                    className='text-center'
                                                    onChange={onInputChange}
                                                    name='subCategoria'
                                                    value={subCategoria}
                                                >
                                                    {selCategoria === 0 && (
                                                        <>
                                                            <option value="G">GENERAL</option>
                                                            <option value="KCG">KCG</option>
                                                            <option value="KCP">KCP</option>
                                                            <option value="KB">KB</option>
                                                            <option value="CC">CC</option>
                                                            <option value="CB">CB</option>
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
                                                        <>
                                                            <option value="G">GENERAL</option>
                                                        </>
                                                    )}
                                                </Form.Select>
                                            </InputGroup>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col xs lg="7">
                                            <Row>
                                                <Col xs lg="12">
                                                    <InputGroup size="md" className="mb-1">
                                                        <Form.Label column sm="auto" lg="3">Código</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name='codigo'
                                                            value={codigo}
                                                            onChange={onInputChange}
                                                            aria-label="Small"
                                                            aria-describedby="inputGroup-sizing-sm"
                                                        />
                                                    </InputGroup>
                                                </Col>
                                                <Col xs lg="12">
                                                    <InputGroup size="md" className="mb-1">
                                                        <Form.Label column sm="auto" lg="6">Precio</Form.Label>
                                                        <Form.Control
                                                            className='text-end'
                                                            type="text"
                                                            value={precio | 0}
                                                            name='precio'
                                                            onFocus={(e) => e.target.select()}
                                                            onChange={onInputNumbersChange}
                                                            aria-label="Small"
                                                            aria-describedby="inputGroup-sizing-sm"
                                                            min="0"
                                                            step="any"
                                                        />
                                                    </InputGroup>
                                                </Col>
                                                <Col xs lg="12">
                                                    <InputGroup size="md" className="mb-1">
                                                        <Form.Label column sm="auto" lg="6">Cantidad</Form.Label>
                                                        <Form.Control
                                                            className='text-end'
                                                            onChange={onInputNumbersChange}
                                                            value={cantidad | 0}
                                                            name='cantidad'
                                                            onFocus={(e) => e.target.select()}
                                                            type="text"
                                                            aria-label="Small"
                                                            aria-describedby="inputGroup-sizing-sm"
                                                        />
                                                    </InputGroup>
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col>
                                            <Row>
                                                <Col>
                                                    <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                                        <Form.Label column sm="auto" lg="auto">Detalle</Form.Label>
                                                        <Form.Control as="textarea" rows={3}
                                                            value={detalle}
                                                            name='detalle'
                                                            onChange={onInputChange}
                                                            aria-label="With textarea"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs lg="7" className="text-end">
                                            <InputGroup size="md" className="mb-1">
                                                <Form.Label column sm="auto" lg="6" className='fw-bold'>Total</Form.Label>
                                                <Form.Control
                                                    className='text-end fw-semibold'
                                                    value={formatearPrecio(cantidad * precio) || 0}
                                                    disabled
                                                    type="text"
                                                    aria-label="Small"
                                                    aria-describedby="inputGroup-sizing-sm"
                                                />
                                            </InputGroup>
                                        </Col>
                                    </Row>
                                </div>

                            </Container>
                        </Modal.Body>

                        <Modal.Footer>
                            <Button onClick={handleClose}>Cerrar</Button>
                            <Button variant='success' onClick={guardarGasto}>Guardar</Button>
                        </Modal.Footer>
                    </Modal>
                </Row>
                <Row>
                    <ListarGastos handleShow={handleShow} />
                </Row>
            </div>
        </LayoutApp>
    )
}
