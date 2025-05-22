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
            <div className="">
                <div>
                    <div className="col">                        
                        <TablaClientes handleShow={handleShow} />
                    </div>
                </div>
            </div>
            <ReusableModal show={showModal} handleClose={handleClose} />
        </LayoutApp>
    );
};
