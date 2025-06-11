import { createSlice } from "@reduxjs/toolkit";


export const pedidosSlice = createSlice({
    name: 'pedidos',
    initialState: {
        isLoadingPedidos: true,
        pedidos: [],
        pedidosActivo: null,
        totalGuantes: 0
    },
    reducers: {
        setTotalGuantes: (state, {payload}) => {
            state.totalGuantes = payload
        },
        onLoadPedidos: (state, { payload }) => {
            state.isLoadingPedidos = false;
            console.log(payload)
            state.pedidos = payload.pedidos;
        },
        onLoadPedidosActivo: (state, { payload }) => {            
            state.isLoadingPedidos = false;
            state.pedidosActivo = payload;                        
        },
        onAddNewPedido: (state, { payload }) => {

        },
        setActivePedido: (state, { payload }) => {
        },
        onUpdatePedido: (state, { payload }) => {
            state.pedidos = state.pedidos.map(ped => {
                if (ped.pedido_id === payload.pedido_id) {
                    return payload;
                }
                return ped;
            });
            console.log(pedidos)

        },
        onDeletePedido: (state, { payload }) => {
            if (payload) {
                state.pedidos = state.pedidos.filter(ped => ped.pedido_id !== payload);
            }
        }
    }
});


export const { onLoadPedidos, pedidos, pedidosActivo, isLoadingPedidos, onUpdatePedido, onDeletePedido, onLoadPedidosActivo, setTotalGuantes, totalGuantes } = pedidosSlice.actions;