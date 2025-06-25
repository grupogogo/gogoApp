import { useDispatch, useSelector } from 'react-redux'
import { gogoApi } from '../api';
import { onLoadPedidos, onDeletePedido, onUpdatePedido, onLoadPedidosActivo, setTotalGuantes, totalGuantes, onLoadOldOrders } from '../store';



export const usePedidosStore = () => {

    const { pedidos, pedidosActivo } = useSelector(state => state.pedidos);
    const dispatch = useDispatch();

    const comenzarGuardarPedido = async (pedido) => {
        try {
            const { data } = await gogoApi.post(`/pedidos`, pedido);
            return data;
        } catch (error) {

        }
    }
    const startLoadingPedidos = async () => {
        try {
            const { data } = await gogoApi.get('/pedidos');
            dispatch(onLoadPedidos(data));
        } catch (error) {
            console.log(error);
        }
    }
    const startLoadingOldOrders = async () => {
        try {
            const { data } = await gogoApi.get('/pedidos/oldOrders');
            dispatch(onLoadOldOrders(data)); 
        } catch (error) {
            console.log(error);
        }
    }
    const getPedidosCliente = async (cliente_id) => {
        try {
            // Realizar la solicitud al backend
            const { data } = await gogoApi.get(`/pedidos/cliente/${cliente_id}`);

            //ok
            // Manejar los datos recibidos            
            dispatch(onLoadPedidosActivo(data.pedidos));
        } catch (error) {
            console.error('Error al cargar pedidos del cliente:', error);
        }
    };
    const startEditarPedido = async (pedido) => {
        dispatch(onUpdatePedido(pedido));
        try {
            const { data } = await gogoApi.put(`/pedidos/${pedido.pedido_id}`, pedido);
        } catch (error) {

        }
    }
    const startDeletePedido = async (pedido) => {
        dispatch(onDeletePedido(pedido.pedido_id));
        console.log('llego')
        try {
            const { data } = await gogoApi.delete(`/pedidos/${pedido.pedido_id}`);
        } catch (error) {
            console.log(error)
        }
    }
    const startSetGuantes = async (total) => {
        dispatch(setTotalGuantes(total));
    }

    return {
        //*Propiedades
        pedidosActivo,
        pedidos,
        totalGuantes,

        //*Metodos
        comenzarGuardarPedido,
        startLoadingPedidos,
        startEditarPedido,
        startDeletePedido,
        getPedidosCliente,
        startSetGuantes,
        startLoadingOldOrders
    }

}
