import React, { useEffect, useRef } from 'react'
import { Button, Card, Col, Modal, Row, Table } from 'react-bootstrap'
import { useFuntions } from '../../../hooks';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Swal from 'sweetalert2';
import 'ldrs/quantum'




export const ModalGuia = ({ setShow, show, pedido }) => {
    const modalRef = useRef();
    const handleClose = () => { setShow(false) }
    const handleShow = () => { setShow(true) }

    const handleDownloadPDF = () => {
        let timerInterval;
        Swal.fire({
            title: "Generando PDF!",
            html: '<l-quantum   size="25"   speed="1.75"   color="black"  ></l-quantum>',
            timer: 2000,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
                const timer = Swal.getPopup().querySelector("b");
                timerInterval = setInterval(() => {
                    timer.textContent = `${Swal.getTimerLeft()}`;
                }, 100);
            },
            willClose: () => {
                clearInterval(timerInterval);
            }
        }).then((result) => {
            /* Read more about handling dismissals below */
            if (result.dismiss === Swal.DismissReason.timer) {
                console.log("I was closed by the timer");
            }
        });
        html2canvas(modalRef.current, { scale: 3 }).then(canvas => { // Aumenta la escala para más detalle
            const imgData = canvas.toDataURL("image/jpeg", 1); // Cambia a JPEG con calidad 90%
            const pdf = new jsPDF("p", "mm", "letter");

            const pageWidth = pdf.internal.pageSize.getWidth();
            const imgWidth = pageWidth - 10; // Deja margen de 5mm en cada lado
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, "JPEG", 5, 5, imgWidth, imgHeight);
            pdf.save(`Factura_${pedido?.id}.pdf`);
        });
    };

    useEffect(() => {

    }, [])

    return (
        <>
            <Modal
                size="xl"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={show}
                onHide={handleClose}
                className='modal-fullscreen-xl-down'
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <span className='fw-semibold'>Imprimir guia de despacho</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body ref={modalRef} >
                    {/* Información del cliente y fecha */}
                    <Card className="mb-1">
                        <Card.Body>
                            <Row>
                                <Col>
                                    <Row className='fs-4'>
                                        <Col className='col-md-12'>
                                            <span className='fw-bold text-danger fs-1'>REMITENTE</span>
                                        </Col>
                                        <hr className='col-md-10'/>
                                        <Col className='col-md-12'>
                                            <span className='fw-semibold fs-3'>{pedido?.user?.name}</span>
                                        </Col>
                                        <Col>
                                            <span className='fw-semibold'>CC: </span>{pedido?.user?.numIdentificacion}
                                        </Col>
                                        <Col className='col-md-12'>
                                            <span className='fw-semibold'>DIRECCIÓN:&nbsp;</span> Carrera 6A # 76 - 23 sur Bogotá - Colombia
                                        </Col>
                                        <Col className='col-md-12'>
                                            <Row>
                                                <Col>
                                                    <span className='fw-semibold'>TELEFONO: </span>&nbsp; {pedido?.user?.telefono}
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col>
                                    <Row className='border-end fs-4'>
                                        <Col className='col-md-12 text-danger'>
                                            <span className='fw-bold text-danger fs-1'>DESTINATARIO</span>
                                        </Col>
                                        <hr className='col-md-10' />
                                        <Col className='col-md-12'>
                                            <span className='fw-bold text-info fs-3'>{(pedido?.cliente?.nombre)}</span> 
                                        </Col>
                                        <Col className='col-md-12'>
                                            <span className='fw-semibold'>NÚMERO DE IDENTIFICACIÓN:</span> {pedido?.cliente?.nitCC}
                                        </Col>
                                        <Col className='col-md-12'>
                                            <span className='fw-semibold'>CIUDAD: </span>{pedido?.cliente?.ciudad}
                                        </Col>
                                        <Col className='col-md-12'>
                                            <Row>
                                                <Col>
                                                    <span className='fw-semibold'>DIRECCIÓN:</span> {pedido?.cliente?.direccion}
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col>
                                            <span className='fw-semibold'>TELÉFONO:</span> {pedido?.cliente?.telefono}
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Cerrar</Button>
                    <Button variant="primary" onClick={handleDownloadPDF}>Imprimir</Button>
                </Modal.Footer>
            </Modal >
        </>
    );
};


