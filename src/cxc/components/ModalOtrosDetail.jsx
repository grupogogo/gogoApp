import React from 'react';
import { Modal, Button, Table } from 'react-bootstrap';

export const ModalOtrosDetail = ({ show, handleClose, items, formatearPrecio }) => {
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
            <Modal.Header closeButton>
                <Modal.Title>Detalle de Productos</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="table-responsive">
                    <Table striped bordered hover size="sm">
                        <thead className="bg-light">
                            <tr>
                                <th>Producto</th>
                                <th className="text-center">Cantidad</th>
                                <th className="text-end">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(groupedItems).sort((a, b) => b[1].total - a[1].total).map(([name, data]) => (
                                <tr key={name}>
                                    <td>{name}</td>
                                    <td className="text-center">{data.count}</td>
                                    <td className="text-end fw-semibold">{formatearPrecio(data.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
