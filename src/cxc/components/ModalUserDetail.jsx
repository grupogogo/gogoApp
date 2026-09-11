import React, { useState } from 'react';
import { Modal, Button, Table } from 'react-bootstrap';
import { ModalOtrosDetail } from './ModalOtrosDetail';
import { useFuntions } from '../../hooks';

export const ModalUserDetail = ({ show, handleClose, data, formatearPrecio, buscarNombre }) => {
    const { user, totals, quantities, grandTotal, allItems } = data || {};
    const [showOtrosModal, setShowOtrosModal] = useState(false);
    const { aTitulo } = useFuntions();

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton className="border-bottom pb-3">
                <Modal.Title className="fw-bold text-dark fs-5">
                    <i className="fas fa-user-circle me-2 text-primary"></i>
                    Detalle de Cartera: {aTitulo(user?.nombre || user?.email || '')}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                {data && (
                    <>
                        <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-primary-subtle rounded-3 border border-primary-subtle">
                            <span className="text-muted fw-semibold">Total Cartera Pendiente</span>
                            <h4 className="fw-bolder text-primary mb-0">{formatearPrecio(grandTotal)}</h4>
                        </div>
                        <div className="table-responsive rounded-3 border">
                            <Table hover size="sm" className="align-middle mb-0">
                                <thead className="table-light">
                                    <tr className="text-secondary small">
                                        <th className="ps-3 py-2">Categoría</th>
                                        <th className="text-center py-2">Cantidad</th>
                                        <th className="text-end pe-3 py-2">Total ($)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(totals).sort((a, b) => b[1] - a[1]).map(([key, value]) => (
                                        <tr key={key}>
                                            <td className="ps-3 fw-medium text-dark">
                                                {buscarNombre(key)} <span className="badge bg-light text-muted border ms-1">{key}</span>
                                            </td>
                                            <td className="text-center">
                                                <span className="badge bg-light text-dark border px-2">{quantities[key]}</span>
                                            </td>
                                            <td className="text-end pe-3 fw-bold text-dark">{formatearPrecio(value)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer className="border-top pt-3">
                <Button variant="info" className="text-white rounded-pill px-3 me-auto" onClick={() => setShowOtrosModal(true)}>
                    <i className="fas fa-list-ul me-1"></i> Ver Detalle de Productos
                </Button>
                <Button variant="light" className="border rounded-pill px-3" onClick={handleClose}>
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
