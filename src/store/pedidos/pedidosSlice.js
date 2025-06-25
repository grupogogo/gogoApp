import { createSlice } from "@reduxjs/toolkit";
import { o } from "@table-library/react-table-library/styles-492c6342";


export const pedidosSlice = createSlice({
    name: 'pedidos',
    initialState: {
        isLoadingPedidos: true,
        pedidos: [],
        oldOrders: [],
        pedidosActivo: null,
        totalGuantes: 0
    },
    reducers: {
        setTotalGuantes: (state, { payload }) => {
            state.totalGuantes = payload
        },
        onLoadPedidos: (state, { payload }) => {
            state.isLoadingPedidos = false;
            state.pedidos = payload.pedidos;
        },
        onLoadOldOrders: (state, { payload }) => {
            state.isLoadingPedidos = false;
            state.oldOrders = payload.pedidos;
        },
        onLoadPedidosActivo: (state, { payload }) => {
            state.isLoadingPedidos = false;
            state.pedidosActivo = payload;
        },
        onUpdatePedido: (state, { payload }) => {
            state.pedidos = state.pedidos.map(ped => {
                if (ped.pedido_id === payload.pedido_id) {
                    return payload;
                }
                return ped;
            });
        },
        onDeletePedido: (state, { payload }) => {
            if (payload) {
                state.pedidos = state.pedidos.filter(ped => ped.pedido_id !== payload);
            }
        }
    }
});


export const { onLoadPedidos, pedidos, pedidosActivo, isLoadingPedidos, onUpdatePedido, onDeletePedido, onLoadPedidosActivo, setTotalGuantes, totalGuantes, onLoadOldOrders } = pedidosSlice.actions;