import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { ClientesForm } from '../clients/components/ClientesForm';
import { useState } from 'react';
import { useClientesStore } from '../hooks';
import Swal from 'sweetalert2';


export const ReusableModal = ({ show, handleClose }) => {
    const { startSavingClient, clienteActivo } = useClientesStore();
    const [cliente, setCliente] = useState({});

    const saveClient = async () => {
        try {

            await startSavingClient(cliente);
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
        handleClose();
    }
    const editClient = () => {
        startSavingClient(cliente);
        handleClose();
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
                    {(!clienteActivo.cliente_id)
                        ?
                        <Button variant="primary" onClick={saveClient}>
                            Guardar cliente
                        </Button>
                        :
                        <Button variant="primary" onClick={editClient}>
                            Editar cliente
                        </Button>
                    }

                </Modal.Footer>
            </Modal>
        </>
    );
};
