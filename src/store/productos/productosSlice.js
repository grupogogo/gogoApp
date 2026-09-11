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
            state.productos = payload || [];
        },
        setActiveProduct: (state, { payload }) => {
            state.productoActivo = payload;
        },
        onAddnewProducto: (state, { payload }) => {
            if (payload) {
                state.productos.push(payload);
            }
        },
        onUpdateProducto: (state, { payload }) => {
            if (payload) {
                const id = payload._id || payload.producto_id;
                state.productos = state.productos.map(p => {
                    if ((p._id || p.producto_id) === id) {
                        return { ...p, ...payload };
                    }
                    return p;
                });
            }
        },
        onDeleteProducto: (state, { payload }) => {
            if (payload) {
                state.productos = state.productos.filter(p => (p._id || p.producto_id) !== payload);
            }
        }
    }
});
export const { onAddnewProducto, onUpdateProducto, onDeleteProducto, onLoadProductos, setActiveProduct } = productosSlice.actions;