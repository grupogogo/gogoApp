import { createSlice } from '@reduxjs/toolkit';

export const uiSlice = createSlice({
    name: 'ui',
    initialState: { //aca estan los estados
        isDateModalOpen: false
    },
    reducers: {
        onOpenDateModal: (state, /* action */ ) => {//el state trae el estado inicial o actualizado
            state.isDateModalOpen = true;
        },
        onCloseDateModal: (state, /* action */ ) => {//el state trae el estado inicial o a actualizar
            state.isDateModalOpen = false;
        },
    }
});

export const { onOpenDateModal, onCloseDateModal } = uiSlice.actions;