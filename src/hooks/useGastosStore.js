import { useDispatch, useSelector } from "react-redux";
import { onSetGastoActivo, onLoadGastos, onSetDefaultActiveGasto, onSaveGasto } from "../store";
import { gogoApi } from "../api";


export const useGastosStore = () => {
    const { gastos } = useSelector(state => state.gastos);
    const { user } = useSelector(state => state.auth)
    const dispatch = useDispatch();

    const startLoadingGastos = async () => {
        dispatch(onSaveGasto())
        try {
            const { data } = await gogoApi.get('/gastos', { user });
            dispatch(onLoadGastos(data))
        } catch (error) {
            console.log(error)
        }
    }

    const setGastoActivo = (gasto) => { // nombre del metodo que exportara el metodo del slice         
        dispatch(onSetGastoActivo(gasto)) //metodo del slice        
    }

    const limpiarGastoActivo = () => {
        dispatch(onSetDefaultActiveGasto())
    }

    const startAddNewGasto = async (gasto) => {
        try {
            const { data } = await gogoApi.post('/gastos', { gasto, user })
        } catch (error) {
            console.log(error)
        }
    }

    const startDeleteGasto = async (gasto) => {
        //dispatch(onDeletePedido(pedido.pedido_id));
        //console.log(gasto)
        try {
            const { data } = await gogoApi.delete(`/gastos/${gasto.gastos_id}`);
        } catch (error) {
            console.log(error)
        }
    }
    return {
        gastos,
        startAddNewGasto,
        startLoadingGastos,
        setGastoActivo,
        limpiarGastoActivo,
        startDeleteGasto
    }
}