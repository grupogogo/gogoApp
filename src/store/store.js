import { pedidosSlice, uiSlice, calendarSlice, clientesSlice, authSlice, productosSlice } from "./";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
    reducer:{
        calendar: calendarSlice.reducer,
        ui: uiSlice.reducer,
        clientes: clientesSlice.reducer, //*1 crear Store        
        auth: authSlice.reducer,
        pedidos: pedidosSlice.reducer,
        productos: productosSlice.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    })
});