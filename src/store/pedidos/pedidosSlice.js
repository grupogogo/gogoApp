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
                const pedId = ped.pedido_id || ped._id;
                const payId = payload.pedido_id || payload._id;
                if (pedId && payId && pedId === payId) {
                    return { ...ped, ...payload, pedido_id: pedId };
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