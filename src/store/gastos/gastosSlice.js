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
        onSaveGasto: (state) => {
            state.isLoadingGastos = true;
        },
        onUpdateGasto: (state, { payload }) => {
            state.gastos = state.gastos.map(gasto => {
                if (
                    (payload.gastos_id && (gasto.gastos_id === payload.gastos_id || gasto._id === payload.gastos_id)) ||
                    (payload._id && (gasto._id === payload._id || gasto.gastos_id === payload._id))
                ) {
                    return payload;
                }
                return gasto;
            });
            state.gastoActivo = null;
        },
    }
});
export const { onSetDefaultActiveGasto, onLoadGastos, gastos, gastoActivo, onSetGastoActivo, onSaveGasto, onUpdateGasto, isLoadingGastos } = gastosSlice.actions;