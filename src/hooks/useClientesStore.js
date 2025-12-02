import { useDispatch, useSelector } from "react-redux"
import { onAddNewClient, setActiveClient, onSetDefaultActiveClient, onUpdateClient, onLoadClientes } from "../store";
import gogoApi from "../api/gogoApi";


export const useClientesStore = () => {//* 3. Crear el hook que expone propiedades generales del slice

    const { clientes, clienteActivo } = useSelector(state => state.clientes);
    const { user } = useSelector(state => state.auth)
    const dispatch = useDispatch();

    const startLoadingClientes = async () => {
        try {
            const { data } = await gogoApi.get('/clientes');
            dispatch(onLoadClientes(data))
        } catch (error) {
            console.log(error)
        }
    }
    const setClienteActivo = (cliente) => { // nombre del metodo que exportara el metodo del slice         
        dispatch(setActiveClient(cliente)) //metodo del slice        
    }

    const limpiarClienteActivo = () => {
        dispatch(onSetDefaultActiveClient())
    }

    const startSavingClient = async (cliente) => {
        console.log(cliente)
        // TODO: Llegar al Backend        
        //*Si Todo bien          
        if (cliente.cliente_id) {
            try {
                const { data } = await gogoApi.put(`/clientes/${cliente.id}`, cliente)
                dispatch(onUpdateClient(cliente));
                return data;
            } catch (error) {
                console.log(error)
            }
        } else {
            try {
                const { data } = await gogoApi.post('/clientes', cliente);
                dispatch(onAddNewClient({ ...cliente, cliente_id: data.cliente.cliente_id, user }));
                return data;
            } catch (error) {
                console.log(error)
            }
        }
    }

    const startDeleteClient = async (cliente) => {
        // TODO: Llegar al Backend        
        //*Si Todo bien          
        if (cliente.cliente_id) {
            try {
                const { data } = await gogoApi.delete(`/clientes/${cliente.cliente_id}`);
                return data;
            } catch (error) {
                return error.response?.data || { ok: false, message: 'Error al eliminar' }; // ✅ Manejo de error seguro
            }
        }
    }
    return { //exposiciones al exterior
        //*Propiedades
        clientes,
        clienteActivo,

        //*Metodos
        setClienteActivo,
        limpiarClienteActivo,
        startSavingClient,
        startLoadingClientes,
        startDeleteClient
    }
}
