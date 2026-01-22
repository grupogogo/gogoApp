import { createSlice } from '@reduxjs/toolkit';

export const productosSlice = createSlice({
    name: 'productos',
    initialState: {
        isLoadingProductos: true,
        productos: [],
        productoActivo: null,
    },
    reducers: {
        onLoadProductos: (state, { payload }) => {
            state.isLoadingProductos = false;
            state.productos = payload;
        },
        setActiveProduct: (state, { payload }) => {
        },
        onAddnewProducto: (state, { payload }) => {
            //console.log(JSON.stringify(payload));
            //state.productos.push(payload);
        },
        onDeleteProducto: (state, { payload }) => {
            /* if (payload) {
                state.pedidos = state.pedidos.filter(producto => producto.prodcuto_id !== payload);
            } */
        }
    }
});
export const { onAddnewProducto, onLoadProductos, productos, productoActivo } = productosSlice.actions;