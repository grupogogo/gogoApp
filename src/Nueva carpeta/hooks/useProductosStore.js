import { useDispatch, useSelector } from "react-redux";
import { onAddnewProducto, onLoadProductos } from "../store";
import { gogoApi } from "../api";


export const useProductosStore = () => {
    const { productos } = useSelector(state => state.productos);
    const { user } = useSelector(state => state.auth)
    const dispatch = useDispatch();

    const startLoadingProductos = async () => {
        try {
            const { data } = await gogoApi.get('/products', {
                headers: { 'x-user-id': user.uid } // Enviar UID en headers
            });
            dispatch(onLoadProductos(data));
        } catch (error) {
            console.log(error);
        }
    };
    const startAddNewProducto = async (producto) => {
        dispatch(onAddnewProducto(producto));
        try {
            const { data } = await gogoApi.post('/products', { producto, user })
        } catch (error) {
            console.log(error)
        }
    }

    return {
        productos,
        startAddNewProducto,
        startLoadingProductos
    }
}
