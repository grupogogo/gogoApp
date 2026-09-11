import { useDispatch, useSelector } from "react-redux";
import { onAddnewProducto, onUpdateProducto, onDeleteProducto, onLoadProductos } from "../store";
import { gogoApi } from "../api";

export const useProductosStore = () => {
    const { productos } = useSelector(state => state.productos);
    const { user } = useSelector(state => state.auth);
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
        try {
            const { data } = await gogoApi.post('/products', { producto, user });
            dispatch(onAddnewProducto(data));
            return data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    };

    const startUpdateProducto = async (id, producto) => {
        try {
            const { data } = await gogoApi.put(`/products/${id}`, { producto, user });
            dispatch(onUpdateProducto(data.producto || { ...producto, _id: id }));
            return data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    };

    const startDeleteProducto = async (id) => {
        try {
            await gogoApi.delete(`/products/${id}`);
            dispatch(onDeleteProducto(id));
        } catch (error) {
            console.log(error);
            throw error;
        }
    };

    return {
        productos,
        startAddNewProducto,
        startUpdateProducto,
        startDeleteProducto,
        startLoadingProductos
    };
};
