import { useEffect, useRef } from 'react'
import { Button, Col, Modal, Row } from 'react-bootstrap'
import { useFuntions } from '../../../hooks';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Swal from 'sweetalert2';
import 'ldrs/quantum'

export const ModalGuia = ({ setShow, show, pedido }) => {
    const modalRef = useRef();
    const handleClose = () => { setShow(false) }
    const { calculaTotalPedido, fechaCorta, limpiarFecha } = useFuntions();

    const handleDownloadPDF = () => {
        let timerInterval;
        Swal.fire({
            title: "Generando Guía PDF...",
            html: '<div class="py-2"><l-quantum size="35" speed="1.75" color="#3b82f6"></l-quantum></div><div class="text-muted small">Preparando formato 1/4 carta vertical</div>',
            timer: 2000,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
                const timer = Swal.getPopup().querySelector("b");
                timerInterval = setInterval(() => {
                    if (timer) timer.textContent = `${Swal.getTimerLeft()}`;
                }, 100);
            },
            willClose: () => {
                clearInterval(timerInterval);
            }
        });

        html2canvas(modalRef.current, {
            scale: 3,
            backgroundColor: '#ffffff',
            useCORS: true,
            logging: false
        }).then(canvas => {
            const imgData = canvas.toDataURL("image/jpeg", 1);
            const pdf = new jsPDF("p", "mm", "letter");

            // Tamaño carta en mm
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Márgenes de 5mm en cada lado solicitados para evitar que la impresora corte el marco negro
            const marginLeft = 5;
            const marginTop = 5;
            const marginRight = 5;
            const marginBottom = 5;

            const imgWidth = pageWidth - marginLeft - marginRight;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let finalHeight = imgHeight;
            if (finalHeight > pageHeight - marginTop - marginBottom) {
                finalHeight = pageHeight - marginTop - marginBottom;
            }

            pdf.addImage(imgData, "JPEG", marginLeft, marginTop, imgWidth, finalHeight);
            pdf.save(`GuiaDespacho_${pedido?.pedido_id || pedido?.id || "pedido"}.pdf`);
        });
    };

    useEffect(() => {
    }, []);

    const tienePagoContraEntrega = pedido?.formaPago === 'pCasa' || pedido?.formaPago === 'alCobro';
    const codigoPedido = (pedido?.pedido_id || pedido?.id || '').toString().slice(-6).toUpperCase();

    return (
        <Modal
            size="xl"
            aria-labelledby="modal-guia-despacho"
            centered
            show={show}
            onHide={handleClose}
            className='modal-fullscreen-xl-down'
        >
            {/* Cabecera del Modal con estilo moderno */}
            <Modal.Header
                closeButton
                closeVariant="white"
                style={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    color: '#ffffff',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '14px 20px'
                }}
            >
                <div className="d-flex align-items-center gap-2">
                    <span
                        className="rounded-circle d-flex align-items-center justify-content-center text-white"
                        style={{
                            width: '32px',
                            height: '32px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            fontSize: '0.9rem'
                        }}
                    >
                        <i className="fas fa-truck-fast"></i>
                    </span>
                    <div>
                        <Modal.Title style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                            Guía de Despacho
                        </Modal.Title>
                        <small className="text-white-50" style={{ fontSize: '0.75rem' }}>
                            Vista previa de impresión (1/4 hoja carta vertical • Margen 5 mm)
                        </small>
                    </div>
                </div>

                <div className="d-none d-sm-flex align-items-center gap-2 me-3">
                    <span className="badge rounded-pill bg-danger bg-opacity-25 border border-danger border-opacity-50 text-white px-2 py-1" style={{ fontSize: '0.72rem' }}>
                        <i className="fas fa-shield-halved me-1"></i> DELICADO
                    </span>
                    <span className="badge rounded-pill bg-primary bg-opacity-25 border border-primary border-opacity-50 text-white px-2 py-1" style={{ fontSize: '0.72rem' }}>
                        <i className="fas fa-file-invoice me-1"></i>
                        Pedido #{codigoPedido || '---'}
                    </span>
                    <span className="badge rounded-pill bg-light text-dark px-2 py-1" style={{ fontSize: '0.72rem' }}>
                        1/4 Carta Vertical
                    </span>
                </div>
            </Modal.Header>

            {/* Contenedor del Modal con fondo de previsualización */}
            <Modal.Body
                style={{
                    backgroundColor: '#0b1120',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                {/* 
                  Área Imprimible Capturada por html2canvas (modalRef)
                  IMPORTANTE: Mantiene el fondo 100% blanco y dimensiones exactas para 1/4 carta vertical
                */}
                <div
                    ref={modalRef}
                    style={{
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        width: '100%',
                        borderRadius: '6px',
                        border: '2.5px solid #000000',
                        padding: '14px 18px',
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
                        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
                    }}
                >
                    {/* BANDA SUPERIOR: ENCABEZADO Y ADVERTENCIA 'DELICADO' */}
                    <div
                        className="d-flex flex-wrap align-items-center justify-content-between pb-2 mb-3"
                        style={{
                            borderBottom: '2.5px solid #000000',
                            gap: '8px'
                        }}
                    >
                        {/* Identificación de Empresa y Pedido */}
                        <div className="d-flex align-items-center gap-2">
                            <span
                                className="badge bg-dark text-white text-uppercase"
                                style={{
                                    fontSize: '0.9rem',
                                    fontWeight: 900,
                                    letterSpacing: '0.04em',
                                    padding: '6px 12px'
                                }}
                            >
                                GRUPO GOGO
                            </span>
                            <span className="fw-bolder" style={{ fontSize: '1rem', color: '#000000' }}>
                                GUÍA DE DESPACHO #{codigoPedido}
                            </span>
                            {pedido?.fechaCreacion && (
                                <span className="text-secondary fw-semibold small d-none d-sm-inline">
                                    • {fechaCorta ? fechaCorta(limpiarFecha ? limpiarFecha(pedido.fechaCreacion) : pedido.fechaCreacion) : ''}
                                </span>
                            )}
                        </div>

                        {/* Banner Destacado DELICADO */}
                        <div
                            className="d-flex align-items-center gap-2 px-3 py-1 rounded"
                            style={{
                                border: '2px solid #dc2626',
                                backgroundColor: '#fef2f2',
                                color: '#b91c1c',
                                fontWeight: 900,
                                fontSize: '0.92rem',
                                letterSpacing: '0.04em',
                                boxShadow: '0 1px 3px rgba(220, 38, 38, 0.15)'
                            }}
                        >
                            <i className="fas fa-wine-glass-crack fs-5 text-danger"></i>
                            <span>FRÁGIL • DELICADO • MANEJAR CON CUIDADO</span>
                            <i className="fas fa-box-open fs-5 text-danger"></i>
                        </div>
                    </div>

                    {/* CUERPO PRINCIPAL: 2 COLUMNAS (REMITENTE Y DESTINATARIO) */}
                    <Row className="g-4 align-items-stretch">
                        {/* COLUMNA IZQUIERDA: REMITENTE */}
                        <Col xs={12} md={6} style={{ borderRight: '2px dashed #94a3b8' }} className="pe-md-4">
                            <div className="d-flex flex-column h-100 justify-content-between">
                                <div>
                                    {/* Etiqueta Remitente */}
                                    <div className="d-flex align-items-center justify-content-between mb-2 pb-1 border-bottom border-2 border-danger">
                                        <span
                                            className="badge text-uppercase"
                                            style={{
                                                backgroundColor: '#dc2626',
                                                color: '#ffffff',
                                                fontSize: '0.9rem',
                                                letterSpacing: '0.06em',
                                                padding: '5px 12px',
                                                fontWeight: 900
                                            }}
                                        >
                                            <i className="fas fa-boxes-packing me-1"></i> REMITENTE
                                        </span>
                                        <small className="fw-bolder text-dark" style={{ fontSize: '0.78rem' }}>
                                            GRUPO GOGO COMERCIAL
                                        </small>
                                    </div>

                                    {/* Nombre de Remitente (Más grande y legible) */}
                                    <h4
                                        className="fw-bolder mb-3 text-black"
                                        style={{
                                            fontSize: '1.28rem',
                                            lineHeight: 1.25,
                                            letterSpacing: '-0.01em'
                                        }}
                                    >
                                        {pedido?.user?.name || 'Asesor Comercial'}
                                    </h4>

                                    {/* Datos Remitente */}
                                    <div className="d-flex flex-column gap-2" style={{ fontSize: '1rem', color: '#000000' }}>
                                        <div>
                                            <span className="fw-bolder text-muted">CC / NIT: </span>
                                            <span className="fw-bold fs-5">{pedido?.user?.numIdentificacion || '---'}</span>
                                        </div>
                                        <div>
                                            <span className="fw-bolder text-muted">DIRECCIÓN: </span>
                                            <span className="fw-bold">Carrera 8A # 76 sur - 23</span>
                                        </div>
                                        <div>
                                            <span className="fw-bolder text-muted">TELÉFONO: </span>
                                            <span className="fw-bolder fs-5 text-dark">{pedido?.user?.telefono || '---'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Banner de Cobro / Pago Contra Entrega (si aplica) */}
                                {tienePagoContraEntrega && (
                                    <div
                                        className="mt-3 text-center text-white rounded py-2 px-3"
                                        style={{
                                            backgroundColor: '#dc2626',
                                            border: '2px solid #991b1b',
                                            boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)'
                                        }}
                                    >
                                        {pedido?.formaPago === 'pCasa' && (
                                            <div className="fw-bolder" style={{ fontSize: '1.05rem', letterSpacing: '0.02em' }}>
                                                💵 PAGO EN CASA: {calculaTotalPedido(pedido)}
                                            </div>
                                        )}
                                        {pedido?.formaPago === 'alCobro' && (
                                            <div className="fw-bolder" style={{ fontSize: '1.05rem', letterSpacing: '0.02em' }}>
                                                💵 AL COBRO CON ENVÍO: {calculaTotalPedido(pedido, parseInt(pedido?.costoEnvio || 0))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Col>

                        {/* COLUMNA DERECHA: DESTINATARIO */}
                        <Col xs={12} md={6} className="ps-md-4">
                            <div className="d-flex flex-column h-100 justify-content-between">
                                <div>
                                    {/* Etiqueta Destinatario */}
                                    <div className="d-flex align-items-center justify-content-between mb-2 pb-1 border-bottom border-2 border-primary">
                                        <span
                                            className="badge text-uppercase"
                                            style={{
                                                backgroundColor: '#1d4ed8',
                                                color: '#ffffff',
                                                fontSize: '0.9rem',
                                                letterSpacing: '0.06em',
                                                padding: '5px 12px',
                                                fontWeight: 900
                                            }}
                                        >
                                            <i className="fas fa-location-dot me-1"></i> DESTINATARIO
                                        </span>
                                        <small className="fw-bolder text-dark" style={{ fontSize: '0.78rem' }}>
                                            ENTREGA INMEDIATA
                                        </small>
                                    </div>

                                    {/* Nombre de Cliente / Destinatario (Más grande y legible) */}
                                    <h4
                                        className="fw-bolder mb-3 text-black"
                                        style={{
                                            fontSize: '1.35rem',
                                            lineHeight: 1.25,
                                            letterSpacing: '-0.01em'
                                        }}
                                    >
                                        {pedido?.cliente?.nombre || 'Cliente Particular'}
                                    </h4>

                                    {/* Datos Destinatario */}
                                    <div className="d-flex flex-column gap-2" style={{ fontSize: '1rem', color: '#000000' }}>
                                        <div>
                                            <span className="fw-bolder text-muted">NIT o CC: </span>
                                            <span className="fw-bold fs-5">{pedido?.cliente?.nitCC || '---'}</span>
                                        </div>

                                        {/* Ciudad destacada en grande para transportadores */}
                                        <div className="my-1 d-flex align-items-center gap-2 flex-wrap">
                                            <span className="fw-bolder text-muted">CIUDAD: </span>
                                            <span
                                                className="badge text-uppercase text-start"
                                                style={{
                                                    backgroundColor: '#f1f5f9',
                                                    color: '#000000',
                                                    border: '2px solid #000000',
                                                    fontSize: '1.12rem',
                                                    fontWeight: 900,
                                                    padding: '5px 12px',
                                                    letterSpacing: '0.02em'
                                                }}
                                            >
                                                {pedido?.cliente?.ciudad || '---'}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="fw-bolder text-muted">DIRECCIÓN: </span>
                                            <span className="fw-bold">{pedido?.cliente?.direccion || '---'}</span>
                                        </div>
                                        <div>
                                            <span className="fw-bolder text-muted">TELÉFONO: </span>
                                            <span className="fw-bolder fs-5 text-dark">{pedido?.cliente?.telefono || '---'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </Modal.Body>

            {/* Pie de Acciones del Modal */}
            <Modal.Footer
                style={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '12px 20px'
                }}
            >
                <Button
                    variant="outline-light"
                    size="sm"
                    onClick={handleClose}
                    className="px-3 rounded-pill"
                    style={{ fontSize: '0.85rem' }}
                >
                    <i className="fas fa-xmark me-1"></i> Cerrar
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={handleDownloadPDF}
                    className="px-3 rounded-pill d-flex align-items-center gap-1 shadow-sm"
                    style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        border: 'none',
                        fontSize: '0.88rem',
                        fontWeight: 700
                    }}
                >
                    <i className="fas fa-print"></i> Descargar e Imprimir PDF (1/4 Carta)
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
