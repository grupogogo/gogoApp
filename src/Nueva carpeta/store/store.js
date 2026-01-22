import { pedidosSlice, uiSlice, calendarSlice, clientesSlice, authSlice, productosSlice, gastosSlice,preciosSlice } from "./";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
    reducer: {
        calendar: calendarSlice.reducer,
        ui: uiSlice.reducer,
        clientes: clientesSlice.reducer, //*1 crear Store        
        auth: authSlice.reducer,
        pedidos: pedidosSlice.reducer,
        productos: productosSlice.reducer,
        gastos: gastosSlice.reducer,
        precios: preciosSlice.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    })
});