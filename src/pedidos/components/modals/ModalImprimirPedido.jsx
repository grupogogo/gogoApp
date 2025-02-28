import React, { useEffect, useRef } from 'react'
import { Button, Card, Col, Modal, Row, Table } from 'react-bootstrap'
import { useFuntions } from '../../../hooks';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Swal from 'sweetalert2';
import 'ldrs/quantum'




export const ModalImprimirPedido = ({ setShow, show, pedido }) => {
    const modalRef = useRef();
    const handleClose = () => { setShow(false) }
    const handleShow = () => { setShow(true) }
    const { buscarNombre, capitalize, convertirNumeroATexto } = useFuntions();


    const calcularTotalesPorCategoria = () => {
        const totales = [];
        const items = pedido?.itemPedido || [];

        items.forEach(({ itemPedido }) => {
            Object.entries(itemPedido).forEach(([categoria, { pedido }]) => {
                // Si la categoría es GUANTES, necesitamos agrupar por subcategorías (BLANCOS, NEGROS, MITON)            
                if (['KCG', 'KCP', 'KB', 'CC', 'CB'].includes(categoria)) {
                    // Inicializamos las variables para contar niños y niñas
                    let cantidadNinos = 0;
                    let cantidadNinas = 0;

                    // Procesamos cada item del pedido
                    pedido.forEach(item => {
                        // Revisamos si el item corresponde a 'inputSurtidoNino' o 'inputSurtidoNina'
                        if (item.nombreInput === 'inputSurtidoNino' || item.nombreInput.includes('O')) {
                            // Es niño
                            cantidadNinos += parseInt(item.cantidad);
                        }
                        if (item.nombreInput === 'inputSurtidoNina' || item.nombreInput.includes('A')) {
                            // Es niña
                            cantidadNinas += parseInt(item.cantidad);
                        }
                    });
                    // Agregamos al total la cantidad de niños y niñas
                    totales.push({
                        categoria,
                        producto: `Niños: ${cantidadNinos}, Niñas: ${cantidadNinas}`,
                        cantidad: cantidadNinas + cantidadNinos,
                        totalPrecio: (cantidadNinos + cantidadNinas) * parseInt(pedido[0]?.precioUnitario || 0),
                        precioUnitario: parseInt(pedido[0]?.precioUnitario || 0),
                        total: (cantidadNinos + cantidadNinas) * parseInt(pedido[0]?.precioUnitario || 0),
                    });

                } else if (categoria === 'GUANTES') {
                    const subcategorias = {};

                    pedido.forEach(item => {
                        const subcategoria = item.categoria; // BLANCOS, NEGROS, MITON
                        const talla = item.talla; // XS, S, M, L, XL

                        // Asegurar que la subcategoría existe
                        if (!subcategorias[subcategoria]) {
                            subcategorias[subcategoria] = {};
                        }

                        // Asegurar que la talla existe dentro de la subcategoría
                        if (!subcategorias[subcategoria][talla]) {
                            subcategorias[subcategoria][talla] = [];
                        }

                        // Agregar el item a la talla correspondiente dentro de la subcategoría
                        subcategorias[subcategoria][talla].push(item);
                    });

                    // Para cada subcategoría, calcular los totales por talla
                    Object.entries(subcategorias).forEach(([subcategoria, tallas]) => {
                        Object.entries(tallas).forEach(([talla, itemsTalla]) => {
                            const totalTalla = itemsTalla.reduce(
                                (acc, item) => ({
                                    producto: `GUANTES  ${subcategoria} ${talla.replace('T-', 'TALLA ')}`,
                                    categoria: `G${subcategoria.charAt(0)}`,
                                    cantidad: acc.cantidad + parseInt(item.cantidad),
                                    totalPrecio: acc.totalPrecio + (item.precioUnitario * parseInt(item.cantidad)),
                                    precioUnitario: item.precioUnitario,
                                }),
                                { cantidad: 0, totalPrecio: 0, precioUnitario: 0 }
                            );

                            totales.push({
                                producto: totalTalla.producto || '',
                                categoria: `G${subcategoria.charAt(0)}`,
                                cantidad: totalTalla.cantidad,
                                precioUnitario: totalTalla.precioUnitario,
                                total: totalTalla.totalPrecio || 0, // Aseguramos que `total` siempre sea un número
                            });
                        });
                    });
                }
                else if (categoria === 'OTR') {
                    // Si la categoría es OTR, no agrupamos, simplemente mostramos los valores tal cual
                    pedido.forEach(item => {
                        totales.push({
                            producto: item.producto || '',
                            categoria,
                            cantidad: parseInt(item.cantidad),
                            precioUnitario: item.precio,
                            total: (parseInt(item.cantidad) * parseInt(item.precio)) || 0,  // Aseguramos que `total` sea un número
                        });
                    });
                } else {
                    // Para otras categorías, procesamos como antes
                    const totalCategoria = pedido.reduce(
                        (acc, item) => ({
                            producto: item.producto || '',
                            categoria,
                            cantidad: acc.cantidad + parseInt(item.cantidad),
                            totalPrecio: acc.totalPrecio + ((categoria === 'OTR') ? item.precio : item.precioUnitario) * parseInt(item.cantidad),
                            precioUnitario: ((categoria === 'OTR') ? item.precio : item.precioUnitario),
                        }),
                        { cantidad: 0, totalPrecio: 0, precioUnitario: 0 }
                    );

                    totales.push({
                        producto: totalCategoria.producto || '',
                        categoria,
                        cantidad: totalCategoria.cantidad,
                        precioUnitario: totalCategoria.precioUnitario,
                        total: totalCategoria.totalPrecio || 0,  // Aseguramos que `total` sea un número
                    });
                }
            });
        });
        return totales;
    };


    // Llamada a la función
    const totalesPorCategoria = calcularTotalesPorCategoria();
    const granTotal = totalesPorCategoria.reduce((acc, item) => acc + (item.total || 0), 0);  // Aseguramos que `total` sea numérico en la suma
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
            pdf.save(`Remision #${(pedido?.id.slice(-6).toUpperCase())}.pdf`);
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
                        <span className='fw-semibold'>Imprimir pedido</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body ref={modalRef}>
                    {/* Información del cliente y fecha */}
                    <Card className="mb-1">
                        <Card.Body>
                            <Row>
                                <Col>
                                </Col>
                                <Col className=' card col-md-3 text-center text-white bg-secondary text-middle'>
                                    <span className='fw-bold fs-5'>Remisión:&nbsp; RM-{(pedido?.id) ? (pedido?.id).slice(-6).toUpperCase() : ''}</span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Row className='border-end'>
                                        <Col className='col-md-12'>
                                            <span className='fw-semibold'>Cliente:</span> {(pedido?.cliente?.nombre)}
                                        </Col>
                                        <Col className='col-md-12'>
                                            <span className='fw-semibold'>NIT / CC:</span> {pedido?.cliente?.nitCC}
                                        </Col>
                                        <Col className='col-md-12'>
                                            <span className='fw-semibold'>Ciudad:</span> {pedido?.cliente?.ciudad}
                                        </Col>
                                        <Col className='col-md-12'>
                                            <Row>
                                                <Col>
                                                    <span className='fw-semibold'>Dirección:</span> {pedido?.cliente?.direccion}
                                                </Col>
                                                <Col>
                                                    <span className='fw-semibold'>Teléfono:</span> {pedido?.cliente?.telefono}
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </Col>

                                <Col>
                                    <Row>
                                        <Col className='col-md-12'>
                                            <span className='fw-semibold'>Fecha emisión: &nbsp;
                                            </span>
                                            {new Date().toLocaleDateString('es-CO', { dateStyle: 'long' })}
                                        </Col>
                                        <Col className='col-md-12'>
                                            <span className='fw-semibold'>{pedido?.user?.name}</span>
                                        </Col>
                                        <Col className='col-md-12'>
                                            <span className='fw-semibold'>Dirección:&nbsp;</span> Carrera 6A # 76 - 23 sur Bogotá - Colombia
                                        </Col>
                                        <Col className='col-md-12'>
                                            <Row>
                                                <Col>
                                                    <span className='fw-semibold'>Telefono: </span>&nbsp; {pedido?.user?.telefono}
                                                </Col>
                                                <Col>
                                                    <span className='fw-semibold'>info@grupogogo.com</span>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    <Card className="mb-1" style={{ height: 'auto' }}>
                        <Card.Body className="d-flex flex-column" style={{ height: '100%' }}>
                            {/* Tabla con los productos */}
                            <Table className='table table-sm table-hover table-bordered'>
                                <thead className='table-secondary'>
                                    <tr>
                                        <th className='text-center'>#</th>
                                        <th className='text-center'>CÓDIGO</th>
                                        <th>PRODUCTO</th>
                                        <th>CANT</th>
                                        <th>PRECIO UNITARIO</th>
                                        <th>TOTAL</th>
                                    </tr>

                                </thead>
                                <tbody className='table-group-divider'>
                                    {totalesPorCategoria
                                        .slice()
                                        .sort((a, b) => a.categoria.localeCompare(b.categoria))
                                        .map((item, index) => (
                                            <tr key={index}>
                                                <td className='fw-bold text-center'>{index + 1}</td>
                                                <td className='fw-bold fs-6 text-center'>{item?.categoria}</td>
                                                <td className='text-left'>
                                                    {(['OTR', 'GM', 'GN', 'GB'].includes(item?.categoria)) ? (
                                                        (item?.producto).toUpperCase()
                                                    ) : (['KCG', 'KCP', 'KB', 'CB', 'CC'].includes(item?.categoria)) ? (
                                                        buscarNombre(item?.categoria) + '(' + (item?.producto) + ')'
                                                    ) : (
                                                        buscarNombre(item?.categoria)
                                                    )}
                                                </td>
                                                <td style={{ textAlign: 'center', fontVariantNumeric: 'tabular-nums', padding: '5px' }}>
                                                    {item?.cantidad}
                                                </td>
                                                <td className='text-center fw-semibold' style={{ textAlign: 'center', fontVariantNumeric: 'tabular-nums', padding: '5px' }}>
                                                    ${item?.precioUnitario.toLocaleString('es-CO')}
                                                </td>
                                                <td className='text-end fw-semibold'>
                                                    <span className='mr-2'>${item?.total.toLocaleString('es-CO')}</span>
                                                </td>
                                            </tr>
                                        ))}


                                    {/* Si hay menos de 12 filas, agrega filas vacías */}
                                     {totalesPorCategoria.length < 16 &&
                                        Array.from({ length: 11 - totalesPorCategoria.length }).map((_, index) => (
                                            <tr key={`empty-${index}`}>
                                                <td className='fw-bold text-center'>---</td>
                                                <td className='fw-bold fs-6 text-center'>---</td>
                                                <td className='text-center'>---</td>
                                                <td style={{ textAlign: 'center', fontVariantNumeric: 'tabular-nums', padding: '5px' }}>---</td>
                                                <td className='text-end fw-semibold text-center' style={{ textAlign: 'center', fontVariantNumeric: 'tabular-nums', padding: '5px' }}>---</td>
                                                <td className='text-end fw-semibold text-right'>---</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </Table>
                            {/* Aquí va el pie de la tabla */}
                            <div className="mt-auto d-flex justify-content-between align-items-center pb-2">
                                {/* Cuadro a la izquierda (ocupa todo el espacio disponible) */}
                                <div className="flex-grow-1 bg-light text-dark text-start m-2">Recibido por:</div>

                                {/* Cuadro a la derecha (solo el tamaño del contenido) */}
                                <div className="bg-secondary fw-semibold text-white text-end p-2">
                                    TOTAL REMISIÓN <span>${granTotal.toLocaleString('es-CO')}</span>
                                </div>
                            </div>

                            <div className='col-md-12 text-end text-secondary'>
                                ({capitalize((convertirNumeroATexto(granTotal)).toLowerCase())})
                            </div>

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


