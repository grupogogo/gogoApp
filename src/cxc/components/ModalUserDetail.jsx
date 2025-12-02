import React from 'react';
import { Modal, Button, Table } from 'react-bootstrap';
import { useState } from 'react';
import { ModalOtrosDetail } from './ModalOtrosDetail';

export const ModalUserDetail = ({ show, handleClose, data, formatearPrecio, buscarNombre }) => {
    const { user, totals, grandTotal, allItems } = data || {};
    const [showOtrosModal, setShowOtrosModal] = useState(false);

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Detalle de: {user?.nombre || user?.email}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {data && (
                    <>
                        <div className="mb-4">
                            <h5 className="fw-bold text-success">Total General: {formatearPrecio(grandTotal)}</h5>
                        </div>
                        <div className="table-responsive">
                            <Table striped bordered hover size="sm">
                                <thead className="bg-light">
                                    <tr>
                                        <th>Categoría</th>
                                        <th className="text-end">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(totals).sort((a, b) => b[1] - a[1]).map(([key, value]) => (
                                        <tr key={key}>
                                            <td>
                                                {buscarNombre(key)} <small className='text-muted'>({key})</small>
                                            </td>
                                            <td className="text-end fw-semibold">{formatearPrecio(value)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="info" className="text-white me-auto" onClick={() => setShowOtrosModal(true)}>
                    Ver Detalle de Productos
                </Button>
                <Button variant="secondary" onClick={handleClose}>
                    Cerrar
                </Button>
            </Modal.Footer>

            <ModalOtrosDetail
                show={showOtrosModal}
                handleClose={() => setShowOtrosModal(false)}
                items={allItems}
                formatearPrecio={formatearPrecio}
            />
        </Modal>
    );
};
