import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { ClientesForm } from '../clients/components/ClientesForm';
import { useState } from 'react';
import { useClientesStore } from '../hooks';
import Swal from 'sweetalert2';

export const ReusableModal = ({ show, handleClose }) => {
    const { startSavingClient, clienteActivo, startLoadingClientes } = useClientesStore();
    const [cliente, setCliente] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    const validarCampos = () => {
        if (!cliente.nombre || cliente.nombre.trim() === '') {
            Swal.fire({
                icon: "warning",
                title: "Nombre obligatorio",
                text: "Por favor ingresa la razón social o nombre del cliente.",
            });
            return false;
        }
        if (!cliente.ciudad || cliente.ciudad.trim() === '') {
            Swal.fire({
                icon: "warning",
                title: "Ciudad obligatoria",
                text: "Por favor ingresa la ciudad o municipio del cliente.",
            });
            return false;
        }
        return true;
    };

    const saveClient = async () => {
        if (!validarCampos()) return;

        try {
            setIsSaving(true);
            await startSavingClient(cliente);
            await startLoadingClientes();

            Swal.fire({
                title: "¡Cliente creado con éxito!",
                text: `${cliente.nombre} ha sido registrado en el sistema.`,
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
            });
            handleClose();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error al guardar",
                text: typeof error === 'string' ? error : "No fue posible guardar el cliente. Verifica los datos.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const editClient = async () => {
        if (!validarCampos()) return;

        try {
            setIsSaving(true);
            await startSavingClient(cliente);
            await startLoadingClientes();

            Swal.fire({
                title: "¡Cliente actualizado!",
                text: "Los cambios han sido guardados en la base de datos.",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
            });
            handleClose();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error al actualizar",
                text: typeof error === 'string' ? error : "No fue posible actualizar el cliente.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const isEdit = Boolean(clienteActivo?.cliente_id || clienteActivo?._id || clienteActivo?.id);

    return (
        <Modal
            className="modal-lg"
            show={show}
            onHide={handleClose}
            backdrop="static"
            keyboard={true}
            centered
        >
            <Modal.Header closeButton className="border-bottom pb-3 px-4 pt-3 bg-light">
                <div className="d-flex align-items-center gap-3">
                    <div
                        className={`p-3 rounded-circle d-flex align-items-center justify-content-center shadow-xs ${
                            isEdit ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary'
                        }`}
                        style={{ width: 44, height: 44 }}
                    >
                        <i className={`fa-solid ${isEdit ? 'fa-user-pen' : 'fa-user-plus'} fs-5`}></i>
                    </div>
                    <div>
                        <div className="d-flex align-items-center gap-2">
                            <Modal.Title className="fw-bold text-dark fs-5 mb-0">
                                {isEdit ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
                            </Modal.Title>
                            <span className={`badge rounded-pill px-2 py-1 small ${
                                isEdit ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-primary-subtle text-primary border border-primary-subtle'
                            }`}>
                                {isEdit ? 'Modo Edición' : 'Nuevo Registro'}
                            </span>
                        </div>
                        <small className="text-muted">
                            {isEdit
                                ? `Modificando datos y tarifas de ${clienteActivo?.nombre || 'cliente'}`
                                : 'Ingresa la información general y asigna tarifas para sus pedidos'
                            }
                        </small>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body className="p-4" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                <ClientesForm setCliente={setCliente} cliente={cliente} />
            </Modal.Body>

            <Modal.Footer className="border-top px-4 py-3 bg-light d-flex justify-content-between">
                <Button
                    variant="light"
                    className="border rounded-pill px-4 shadow-xs text-secondary"
                    onClick={handleClose}
                    disabled={isSaving}
                >
                    Cancelar
                </Button>

                {!isEdit ? (
                    <button
                        type="button"
                        className="btn btn-primary rounded-pill px-4 fw-semibold shadow-xs d-inline-flex align-items-center gap-2"
                        onClick={saveClient}
                        disabled={isSaving}
                    >
                        <i className={`fa-solid ${isSaving ? 'fa-spinner fa-spin' : 'fa-user-plus'}`}></i>
                        <span>{isSaving ? 'Guardando...' : 'Guardar Cliente'}</span>
                    </button>
                ) : (
                    <button
                        type="button"
                        className="btn btn-success rounded-pill px-4 fw-semibold shadow-xs d-inline-flex align-items-center gap-2"
                        onClick={editClient}
                        disabled={isSaving}
                    >
                        <i className={`fa-solid ${isSaving ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`}></i>
                        <span>{isSaving ? 'Actualizando...' : 'Guardar Cambios'}</span>
                    </button>
                )}
            </Modal.Footer>
        </Modal>
    );
};

