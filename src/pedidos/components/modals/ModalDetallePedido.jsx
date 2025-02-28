import { useEffect, useState } from 'react'
import { Modal, Button, Row, Col, Card } from 'react-bootstrap'
import Table from 'react-bootstrap/Table';
import { useFuntions } from '../../../hooks/useFuntions';
import useImage from '../../../hooks/useImage';
import { useAuthStore } from '../../../hooks';

export const ModalDetallePedido = ({ setShow, show, pedido }) => {
    const { capitalize, formatearPrecio, obtenerImagen } = useFuntions();
    const [totalGen, setTotalGeneral] = useState(0)
    const { buscarNombre } = useFuntions()
    let totalGeneral = 0;
    const handleClose = () => { setShow(false) }
    const handleShow = () => { setShow(true) }
    const [selectedRows, setSelectedRows] = useState({});
    const { user } = useAuthStore();

    const handleCheck = (key) => {
        setSelectedRows((prev) => ({
            ...prev,
            [key]: !prev[key], // Alterna entre seleccionado y no seleccionado
        }));
    };



    useEffect(() => {
        if (pedido?.itemPedido) {
            // Calcular el total general
            const total = pedido.itemPedido.reduce((acc, item) => {
                const totalPorItem = Object.values(item?.itemPedido || {}).reduce((subAcc, { pedido }) => {
                    const totalPorCategoria = pedido?.reduce((catAcc, pedidoItem) => {
                        const total = pedidoItem?.precioUnitario
                            ? pedidoItem?.precioUnitario * pedidoItem?.cantidad
                            : pedidoItem?.precio * pedidoItem?.cantidad || 0;
                        return catAcc + total;
                    }, 0);
                    return subAcc + totalPorCategoria;
                }, 0);
                return acc + totalPorItem;
            }, 0);
            setTotalGeneral(total);
        }
    }, [pedido]);

    return (
        <>
            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={show}
                onHide={handleClose}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <span>Pedido ID:</span> <span className='text-end'>{(pedido?.pedido_id) ? (pedido?.pedido_id).toUpperCase() : ''}</span>
                    </Modal.Title>
                    <Modal.Title>

                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className='overflow-auto'>

                    {/* Información general del pedido */}
                    <Card className="mb-3 position-sticky top-0 z-index-50 p-3 bg-white shadow">
                        <Card.Body className='overflow-auto'>
                            <Row className='text-info fs-4 fw-bold'>
                                <Col className='col-md-8 col-sm-5'>{pedido?.cliente?.nombre || ''}</Col>
                                <Col className='col-md-4'><div
                                    disabled="disabled"
                                    className={`text-center rounded ${pedido.estado === 'pendiente'
                                        ? 'border-danger text-danger'
                                        : pedido.estado === 'preparado'
                                            ? 'border-secondary text-secondary'
                                            : pedido.estado === 'enviado'
                                                ? 'border-info text-info'
                                                : pedido.estado === 'entregado'
                                                    ? 'border-success text-success'
                                                    : pedido.estado === 'anulado'
                                                        ? 'border-dark text-dark'
                                                        : pedido.estado === 'devuelto'
                                                            ? 'border-warning text-warning'
                                                            : pedido.estado === 'pagado'
                                                                ? 'border-success text-success'
                                                                : 'border-light text-light'
                                        }`}>{capitalize(pedido?.estado || '')}</div></Col>
                            </Row>
                            <Row>
                                <p>{pedido.cliente?.ciudad}</p>
                            </Row>
                            <hr className="border border-primary border-3 opacity-80 mt-0" />
                            <Row>
                                <Col><strong>Fecha de Creación:</strong> {capitalize(pedido?.fechaCreacion) || ''}</Col>
                                <Col><strong>Vendedor:</strong> {pedido?.user?.name || ''}</Col>
                            </Row>
                            <Row>
                                <Col><strong>Forma de pago:</strong> {capitalize(pedido?.formaPago || '')}</Col>
                                <Col><strong>Tipo de entrega:</strong> {capitalize(pedido?.tipoDespacho || '')}</Col>
                            </Row>
                            <Row>
                                {(pedido.costoEnvio !== '0') && (
                                    <Col><strong>Costo de Envío:</strong> {formatearPrecio(pedido?.costoEnvio) || ''}</Col>
                                )}
                                {(pedido.numeroGuia) && (
                                    <Col><strong>Número de Guía:</strong> {pedido?.numeroGuia || ''}</Col>
                                )}
                            </Row>
                            {(pedido?.detalleEstado) && (
                                <Row>
                                    <Col><strong>Detalle Estado:</strong> {pedido?.detalleEstado || ''}</Col>
                                </Row>
                            )}
                            <Row>
                            </Row>
                            {(pedido?.detalleGeneral) && (
                                <Row>
                                    <strong>Detalle General:</strong> {pedido?.detalleGeneral || ''}
                                </Row>
                            )}
                            <br />
                            <Row>

                                <Col className='text-center text-middle card'>
                                    <span className="fs-3 fw-bold text-info">
                                        {user.rol !== "planta" && (
                                            formatearPrecio(totalGen)
                                        )}
                                    </span>
                                </Col>

                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Detalles de cada categoría de itemPedido */}
                    {pedido?.itemPedido?.map((item, index) => (
                        <Card className="mb-3" key={item._id || index}>
                            <Card.Body>
                                <Card.Title className="text-center text-success fw-bold">LISTADO DE PEDIDO POR CATEGORIA</Card.Title>

                                {/* Mapeo de los pedidos dentro de cada categoría */}
                                {Object.entries(item?.itemPedido || {}).map(([categoria, detalles], idx) => {
                                    // Calcular el total por categoría
                                    const totalPorCategoria = detalles?.pedido?.reduce((acc, pedidoItem) => {
                                        const total = pedidoItem?.precioUnitario
                                            ? pedidoItem?.precioUnitario * pedidoItem?.cantidad
                                            : pedidoItem?.precio * pedidoItem?.cantidad || 0;
                                        return acc + total;
                                    }, 0);

                                    // Sumar al total general
                                    totalGeneral += totalPorCategoria;

                                    return (
                                        <Card className="shadow p-3 mb-3 rounded" key={`${categoria}-${idx}`}>
                                            <Card.Title className="ml-2 mt-2">
                                                <figure>
                                                    <blockquote className="blockquote">
                                                        <p className="fw-bold text-secondary">{buscarNombre(categoria)}</p>
                                                    </blockquote>
                                                    <figcaption className="blockquote-footer">
                                                        Detalle: <cite title="Source Title">{detalles?.detalleGeneral}</cite>
                                                    </figcaption>
                                                </figure>
                                            </Card.Title>
                                            <Card.Body>
                                                <Table className="table table-striped table-sm table-hover table-bordered">
                                                    <thead>
                                                        <tr className="text-center table-light">
                                                            <th></th>
                                                            <th>Motivo</th>
                                                            {(categoria === 'KCG' || categoria === 'GUANTES') && <th>Talla</th>}
                                                            <th>Cantidad</th>
                                                            {categoria !== 'OTR' && <th>Precio Unitario</th>}
                                                            {user.rol !== "planta" && (
                                                                <th>SubTotal</th>
                                                            )}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {detalles?.pedido?.map((pedidoItem, i) => (
                                                            <>
                                                                <tr key={pedidoItem._id || `${categoria}-${idx}-${i}`}
                                                                    className={`text-center ${selectedRows[`${categoria}-${idx}-${i}`] ? "table-success" : ""}`}
                                                                >
                                                                    <td>
                                                                        <div className="form-check">
                                                                            <input
                                                                                className="form-check-input"
                                                                                type="checkbox"
                                                                                onChange={() => handleCheck(`${categoria}-${idx}-${i}`)}
                                                                                checked={!!selectedRows[`${categoria}-${idx}-${i}`]}
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        {categoria === 'GUANTES' && (
                                                                            (pedidoItem?.nombreInput).split('-').pop()
                                                                        )}
                                                                        {categoria === 'OTR' && (
                                                                            pedidoItem?.producto
                                                                        )}
                                                                        {(categoria === 'KCG' || categoria === 'CC' || categoria === 'KCP') && (
                                                                            pedidoItem?.nombreInput.includes('inputSurtidoNino')
                                                                                ? (<span dangerouslySetInnerHTML={{
                                                                                    __html: 'Surtido <span class="badge text-bg-primary">Niño</span>'
                                                                                }} />)
                                                                                : pedidoItem?.nombreInput.includes('inputSurtidoNina') ? (
                                                                                    <span dangerouslySetInnerHTML={{
                                                                                        __html: 'Surtido <span class="badge text-bg-danger">Niña</span>'
                                                                                    }} />
                                                                                )
                                                                                    : (
                                                                                        <img
                                                                                            className="rounded img-fluid"
                                                                                            src={useImage(obtenerImagen(categoria, pedidoItem.genero), parseInt((pedidoItem.nombreInput).split('-')[1]))}
                                                                                            style={{ width: "auto", height: "110px" }}
                                                                                            loading="lazy"
                                                                                        />
                                                                                    )
                                                                        )}
                                                                        {(categoria === 'KB' || categoria === 'CB') && (
                                                                            (pedidoItem?.nombreInput.includes('inputSurtidoNino'))
                                                                                ? (<span dangerouslySetInnerHTML={{
                                                                                    __html: 'Surtido <span class="badge text-bg-primary">Niño</span>'
                                                                                }} />)
                                                                                : pedidoItem?.nombreInput.includes('inputSurtidoNina')
                                                                                    ? (<span dangerouslySetInnerHTML={{
                                                                                        __html: 'Surtido <span class="badge text-bg-danger">Niña</span>'
                                                                                    }} />
                                                                                    )
                                                                                    : (<img
                                                                                        className="rounded img-fluid"
                                                                                        src={useImage(obtenerImagen(categoria, pedidoItem.genero), parseInt((pedidoItem.nombreInput).split('-')[1]))}
                                                                                        style={{ width: "auto", height: "110px" }}
                                                                                        loading="lazy"
                                                                                    />)
                                                                        )}
                                                                    </td>
                                                                    {(categoria === 'KCG' || categoria === 'GUANTES') && (
                                                                        (pedidoItem?.talla === 't0') ? <td> Surtido </td> : <td>{capitalize(pedidoItem?.talla || '')}</td>
                                                                    )}
                                                                    <td className='fw-semibold'>{pedidoItem?.cantidad || ''}</td>
                                                                    {pedidoItem?.precioUnitario && (
                                                                        <td>{formatearPrecio(pedidoItem?.precioUnitario)}</td>
                                                                    )}
                                                                    {user.rol !== "planta" && (
                                                                        <td className="text-right fw-semibold">
                                                                            {formatearPrecio(
                                                                                (pedidoItem?.precioUnitario || pedidoItem?.precio) *
                                                                                (pedidoItem?.cantidad || 0)
                                                                            )}
                                                                        </td>
                                                                    )}
                                                                </tr>
                                                            </>
                                                        ))}
                                                    </tbody>
                                                    <tfoot>
                                                        {user.rol !== "planta" && (
                                                            <tr className="fw-bold text-center table-dark">
                                                                {(categoria === 'OTR') && (
                                                                    <>
                                                                        <td colSpan={3}>
                                                                            Total {buscarNombre(categoria)}
                                                                        </td>
                                                                        <td className='text-right'>{formatearPrecio(totalPorCategoria)}</td>
                                                                    </>
                                                                )}
                                                                {(categoria === 'GUANTES' || categoria === 'KCG') && (
                                                                    <>
                                                                        <td colSpan={5}>
                                                                            Total {buscarNombre(categoria)}
                                                                        </td>
                                                                        <td className='text-right'>{formatearPrecio(totalPorCategoria)}</td>
                                                                    </>
                                                                )}
                                                                {(categoria === 'CC' || categoria === 'KCP' || categoria === 'CB' || categoria === 'KB') && (
                                                                    <>
                                                                        <td colSpan={4}>
                                                                            Total {buscarNombre(categoria)}
                                                                        </td>
                                                                        <td className='text-right'>{formatearPrecio(totalPorCategoria)}</td>
                                                                    </>
                                                                )}
                                                            </tr>
                                                        )}
                                                    </tfoot>
                                                </Table>
                                            </Card.Body>
                                        </Card>
                                    );
                                })}
                            </Card.Body>
                        </Card>
                    ))}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Cerrar</Button>
                </Modal.Footer>
            </Modal>


        </>
    )
}
