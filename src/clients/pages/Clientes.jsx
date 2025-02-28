import { LayoutApp } from "../../layout/LayoutApp"

import { TablaClientes } from "../components/TablaClientes";
import { useClientesStore, useForm } from "../../hooks";
import { ReusableModal } from "../../modals/ReusableModal";
import { useEffect } from "react";

export const Clientes = () => {
    const { handleClose, handleShow, showModal } = useForm();
    const { startLoadingClientes } = useClientesStore()

    useEffect(() => {
      startLoadingClientes()
    }, [])
    
    return (
        <LayoutApp>
            <div className="container-fluid">                
                <div>
                    <div className="col">
                        <div className="mb-4">
                            <div className="text-end">
                                <button className="btn btn-success btn-icon-split" onClick={handleShow}>
                                    <span className="">
                                        <i className="fas fa-user"></i>
                                    </span>
                                    <span className="text">Nuevo Cliente</span>
                                </button>
                            </div>
                        </div>
                        <TablaClientes />
                    </div>
                </div>
            </div>
            <ReusableModal show={showModal} handleClose={handleClose} />
        </LayoutApp>
    );
};
