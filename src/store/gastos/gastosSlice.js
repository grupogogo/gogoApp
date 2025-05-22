import { createSlice } from '@reduxjs/toolkit';

export const gastosSlice = createSlice({
    name: 'gastos',
    initialState: {
        isLoadingGastos: true,
        gastos: [],
        gastoActivo: null,
    },
    reducers: {
        onLoadGastos: (state, { payload }) => {
            state.isLoadingGastos = false;
            state.gastos = payload;
        },
        onSetGastoActivo: (state, { payload }) => {
            state.gastoActivo = { ...payload };
        },       
        onSetDefaultActiveGasto: (state) => {
            state.gastoActivo = null;
        },
    }
});
export const { onSetDefaultActiveGasto, onLoadGastos, gastos, gastoActivo, onSetGastoActivo } = gastosSlice.actions;