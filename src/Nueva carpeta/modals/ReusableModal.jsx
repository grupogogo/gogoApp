import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { ClientesForm } from '../clients/components/ClientesForm';
import { useState } from 'react';
import { useClientesStore } from '../hooks';
import Swal from 'sweetalert2';


export const ReusableModal = ({ show, handleClose }) => {
    const { startSavingClient, clienteActivo, startLoadingClientes } = useClientesStore();
    const [cliente, setCliente] = useState({});

    const saveClient = async () => {
        console.log(JSON.stringify(cliente))
        try {
            await startSavingClient(cliente);
            Swal.fire({
                title: "Cliente almacenado correctamente!",
                icon: "success",
                draggable: true,
            });

            startLoadingClientes();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: error,
                text: "Something went wrong!",
            });
        }
        handleClose();
    }
    const editClient = () => {

        if (cliente.nombre === '') {
            Swal.fire({
                icon: "error",
                title: "El nombre es obligatorio",
                text: "Completa los datos obligatorios!",
            });
            return;
        }
        if (cliente.ciudad === '') {
            Swal.fire({
                icon: "error",
                title: "La ciudad es obligatoria",
                text: "Completa los datos obligatorios!",
            });
            return;
        }

        try {
            startSavingClient(cliente);
            handleClose();
            Swal.fire({
                title: "Cliente almacenado correctamente!",
                icon: "success",
                draggable: true,
            });
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: error,
                text: "Something went wrong!",
            });
        }
    }

    return (
        <>
            <Modal className="modal-lg"
                show={show}
                onHide={handleClose}
                backdrop={true} // Controla si se puede cerrar clickeando fuera del modal
                keyboard={true} // Controla si se puede cerrar con Esc
                centered>
                <Modal.Header closeButton>
                    <Modal.Title className='ml-2 '>Crear Cliente</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ClientesForm setCliente={setCliente} cliente={cliente} />
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cerrar
                    </Button>
                    {(!clienteActivo)
                        ? (
                            <Button variant="primary" onClick={saveClient}>
                                Guardar cliente
                            </Button>
                        )
                        : (
                            <Button variant="primary" onClick={editClient}>
                                Editar cliente
                            </Button>
                        )
                    }
                </Modal.Footer>
            </Modal>
        </>
    );
};
