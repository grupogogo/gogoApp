import { useNavigate } from "react-router-dom";
import { useClientesStore } from "../../hooks";
import { useState } from "react";
import { ReusableModal } from "../../modals/ReusableModal";

export const TablaClientes = () => {
    const [showModal, setShowModal] = useState(false);
    const { limpiarClienteActivo, clientes, setClienteActivo, startSavingClient } = useClientesStore();
    const navegar = useNavigate();    
    const handleClose = () => {
        setShowModal(false);
        limpiarClienteActivo()
    }
    const editarCliente = (cliente) => {
        startSavingClient(cliente);
        setClienteActivo(cliente);
        setShowModal(true);
    }
    const direccionarPedido = (cliente) => {
        setClienteActivo(cliente);
        navegar('/pedidos')
    }
    return (
        <div className="card shadow mb-4">
            <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">LISTADO DE CLIENTES</h6>
                <div>
                    
                </div>
            </div>
            <div className="table card p-3">
                <table className="table table-bordered table-hover" id="dataTable" width="100%" cellSpacing="0">
                    <thead className="table-primary">
                        <tr className="text-center align-middle ">
                            <th>NIT/CC</th>
                            <th>CLIENTE</th>
                            <th>DIRECCIÓN</th>
                            <th>TELEFONO</th>
                            <th>INGRESO</th>
                            <th>PED</th>
                            <th>EDIT</th>
                        </tr>
                    </thead>

                    <tbody>
                        {clientes.map((item, index) => (
                            <tr className="text-center align-middle" key={index}>
                                <td>{item.nitCC}</td>
                                <td>{item.nombre}</td>
                                <td>{item.direccion}</td>
                                <td>{item.telefono}</td>
                                <td>{(item.fechaCreacion)}</td>
                                <td>
                                    <div className="dropdown">
                                        <button
                                            className="btn btn-success"
                                            type="button"
                                            id="dropdownMenuButton1"
                                            data-toggle="dropdown"
                                            aria-haspopup="true"
                                            aria-expanded="false"
                                            onClick={() => direccionarPedido(item)}
                                        >
                                            <i className="fa fa-clipboard-list"></i>
                                        </button>
                                    </div>
                                </td>
                                <td>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => editarCliente(item)}
                                    >
                                        <i className="fa fa-edit"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ReusableModal show={showModal} handleClose={handleClose} />
        </div>
    )
}
