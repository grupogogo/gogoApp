import { useDispatch, useSelector } from "react-redux";
import { onAddnewProducto, onLoadProductos } from "../store";
import { gogoApi } from "../api";


export const useProductosStore = () => {
    const { productos } = useSelector(state => state.productos);
    const { user } = useSelector(state => state.auth)
    const dispatch = useDispatch();

    const startLoadingProductos = async () => {
        try {
            console.log(user)
            const { data } = await gogoApi.get('/products', { user });
            dispatch(onLoadProductos(data))
        } catch (error) {
            console.log(error)
        }
    }
    const startAddNewProducto = async (producto) => {
        dispatch(onAddnewProducto(producto));
        console.log(producto)
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
