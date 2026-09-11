import React from 'react';
import { Modal, Button, Table } from 'react-bootstrap';
import { useFuntions } from '../../hooks';

export const ModalOtrosDetail = ({ show, handleClose, items, formatearPrecio }) => {
    const { aTitulo } = useFuntions();

    // Group items by name
    const groupedItems = (items || []).reduce((acc, item) => {
        const name = item.nombre || 'Desconocido';
        if (!acc[name]) {
            acc[name] = { count: 0, total: 0 };
        }
        acc[name].count += (item.cantidad || 0);
        acc[name].total += ((item.cantidad || 0) * (item.precio || item.precioUnitario || 0));
        return acc;
    }, {});

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton className="border-bottom pb-3">
                <Modal.Title className="fw-bold text-dark fs-5">
                    <i className="fas fa-boxes me-2 text-info"></i>
                    Detalle de Productos (Otros y Especiales)
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <div className="table-responsive rounded-3 border">
                    <Table hover size="sm" className="align-middle mb-0">
                        <thead className="table-light">
                            <tr className="text-secondary small">
                                <th className="ps-3 py-2">Producto / Referencia</th>
                                <th className="text-center py-2">Cantidad</th>
                                <th className="text-end pe-3 py-2">Total ($)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(groupedItems).sort((a, b) => b[1].total - a[1].total).map(([name, data]) => (
                                <tr key={name}>
                                    <td className="ps-3 fw-medium text-dark">{aTitulo(name)}</td>
                                    <td className="text-center">
                                        <span className="badge bg-light text-dark border px-2">{data.count}</span>
                                    </td>
                                    <td className="text-end pe-3 fw-bold text-dark">{formatearPrecio(data.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </Modal.Body>
            <Modal.Footer className="border-top pt-3">
                <Button variant="light" className="border rounded-pill px-3" onClick={handleClose}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
