import { createSlice } from '@reduxjs/toolkit';

export const tareasSlice = createSlice({
    name: 'tareas',
    initialState: {
        isLoadingTareas: true,
        tareas: [],
        tareaActiva: null,
        usuariosDisponibles: [],
        filtroAsignado: 'todos',
        filtroEstado: 'todos',
        filtroPrioridad: 'todos',
        filtroBusqueda: '',
        vistaActiva: 'kanban' // 'kanban' | 'lista'
    },
    reducers: {
        onSetLoadingTareas: (state, { payload = true }) => {
            state.isLoadingTareas = payload;
        },
        onLoadTareas: (state, { payload }) => {
            state.isLoadingTareas = false;
            state.tareas = payload;
        },
        onLoadUsuariosDisponibles: (state, { payload }) => {
            state.usuariosDisponibles = payload;
        },
        onSetTareaActiva: (state, { payload }) => {
            state.tareaActiva = payload ? { ...payload } : null;
        },
        onClearTareaActiva: (state) => {
            state.tareaActiva = null;
        },
        onAddNewTarea: (state, { payload }) => {
            state.tareas.unshift(payload);
            state.isLoadingTareas = false;
            state.tareaActiva = null;
        },
        onUpdateTarea: (state, { payload }) => {
            state.tareas = state.tareas.map(t => {
                if (t._id === payload._id || t.id === payload._id) {
                    return payload;
                }
                return t;
            });
            state.tareaActiva = null;
            state.isLoadingTareas = false;
        },
        onDeleteTarea: (state, { payload }) => {
            state.tareas = state.tareas.filter(t => t._id !== payload && t.id !== payload);
            if (state.tareaActiva && (state.tareaActiva._id === payload || state.tareaActiva.id === payload)) {
                state.tareaActiva = null;
            }
            state.isLoadingTareas = false;
        },
        onSetFiltroAsignado: (state, { payload }) => {
            state.filtroAsignado = payload;
        },
        onSetFiltroEstado: (state, { payload }) => {
            state.filtroEstado = payload;
        },
        onSetFiltroPrioridad: (state, { payload }) => {
            state.filtroPrioridad = payload;
        },
        onSetFiltroBusqueda: (state, { payload }) => {
            state.filtroBusqueda = payload;
        },
        onSetVistaActiva: (state, { payload }) => {
            state.vistaActiva = payload;
        }
    }
});

export const {
    onSetLoadingTareas,
    onLoadTareas,
    onLoadUsuariosDisponibles,
    onSetTareaActiva,
    onClearTareaActiva,
    onAddNewTarea,
    onUpdateTarea,
    onDeleteTarea,
    onSetFiltroAsignado,
    onSetFiltroEstado,
    onSetFiltroPrioridad,
    onSetFiltroBusqueda,
    onSetVistaActiva
} = tareasSlice.actions;
