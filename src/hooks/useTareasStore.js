import { useDispatch, useSelector } from 'react-redux';
import { useMemo } from 'react';
import Swal from 'sweetalert2';
import { gogoApi } from '../api';
import {
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
} from '../store';

export const useTareasStore = () => {
    const dispatch = useDispatch();
    const {
        tareas,
        isLoadingTareas,
        tareaActiva,
        usuariosDisponibles,
        filtroAsignado,
        filtroEstado,
        filtroPrioridad,
        filtroBusqueda,
        vistaActiva
    } = useSelector(state => state.tareas);

    const { user } = useSelector(state => state.auth);

    // Cargar todas las tareas del backend
    const startLoadingTareas = async () => {
        dispatch(onSetLoadingTareas(true));
        try {
            const { data } = await gogoApi.get('/tareas');
            if (data?.ok) {
                dispatch(onLoadTareas(data.tareas || []));
            }
        } catch (error) {
            console.error('Error al cargar tareas:', error);
            dispatch(onSetLoadingTareas(false));
        }
    };

    // Cargar lista de usuarios para asignar tareas
    const startLoadingUsuarios = async () => {
        try {
            const { data } = await gogoApi.get('/auth/usuarios');
            if (data?.ok) {
                dispatch(onLoadUsuariosDisponibles(data.usuarios || []));
            }
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        }
    };

    // Guardar nueva tarea
    const startSaveTarea = async (tareaData) => {
        try {
            const { data } = await gogoApi.post('/tareas', tareaData);
            if (data?.ok && data.tarea) {
                dispatch(onAddNewTarea(data.tarea));
                Swal.fire({
                    icon: 'success',
                    title: 'Tarea creada',
                    text: 'La tarea ha sido asignada exitosamente.',
                    timer: 1800,
                    showConfirmButton: false
                });
                return data.tarea;
            }
        } catch (error) {
            console.error('Error al crear tarea:', error);
            Swal.fire('Error', error?.response?.data?.msg || 'No se pudo crear la tarea', 'error');
            throw error;
        }
    };

    // Actualizar tarea existente
    const startUpdateTarea = async (id, tareaData) => {
        try {
            const { data } = await gogoApi.put(`/tareas/${id}`, tareaData);
            if (data?.ok && data.tarea) {
                dispatch(onUpdateTarea(data.tarea));
                Swal.fire({
                    icon: 'success',
                    title: 'Tarea actualizada',
                    timer: 1500,
                    showConfirmButton: false
                });
                return data.tarea;
            }
        } catch (error) {
            console.error('Error al actualizar tarea:', error);
            Swal.fire('Error', error?.response?.data?.msg || 'No se pudo actualizar la tarea', 'error');
            throw error;
        }
    };

    // Cambiar estado rápido (pendiente, en_progreso, completada)
    const startCambiarEstado = async (id, nuevoEstado) => {
        // Actualización optimista local
        const tareaExistente = tareas.find(t => (t._id === id || t.id === id));
        if (tareaExistente) {
            dispatch(onUpdateTarea({
                ...tareaExistente,
                estado: nuevoEstado,
                fechaCompletada: nuevoEstado === 'completada' ? new Date().toISOString() : null
            }));
        }

        try {
            const { data } = await gogoApi.patch(`/tareas/${id}/estado`, { estado: nuevoEstado });
            if (data?.ok && data.tarea) {
                dispatch(onUpdateTarea(data.tarea));
            }
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            // Revertir recargando
            startLoadingTareas();
        }
    };

    // Alternar subtarea (checklist)
    const startToggleSubtarea = async (tareaId, subtareaId) => {
        try {
            const { data } = await gogoApi.patch(`/tareas/${tareaId}/subtarea`, { subtareaId });
            if (data?.ok && data.tarea) {
                dispatch(onUpdateTarea(data.tarea));
            }
        } catch (error) {
            console.error('Error al cambiar subtarea:', error);
        }
    };

    // Eliminar tarea
    const startDeleteTarea = async (id) => {
        const confirm = await Swal.fire({
            title: '¿Eliminar tarea?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (!confirm.isConfirmed) return false;

        try {
            const { data } = await gogoApi.delete(`/tareas/${id}`);
            if (data?.ok) {
                dispatch(onDeleteTarea(id));
                Swal.fire({
                    icon: 'success',
                    title: 'Tarea eliminada',
                    timer: 1500,
                    showConfirmButton: false
                });
                return true;
            }
        } catch (error) {
            console.error('Error al eliminar tarea:', error);
            Swal.fire('Error', 'No se pudo eliminar la tarea', 'error');
            return false;
        }
    };

    const setTareaActiva = (tarea) => dispatch(onSetTareaActiva(tarea));
    const limpiarTareaActiva = () => dispatch(onClearTareaActiva());
    const setFiltroAsignado = (f) => dispatch(onSetFiltroAsignado(f));
    const setFiltroEstado = (f) => dispatch(onSetFiltroEstado(f));
    const setFiltroPrioridad = (f) => dispatch(onSetFiltroPrioridad(f));
    const setFiltroBusqueda = (f) => dispatch(onSetFiltroBusqueda(f));
    const setVistaActiva = (v) => dispatch(onSetVistaActiva(v));

    // Filtrado de tareas según filtros activos
    const tareasFiltradas = useMemo(() => {
        return (tareas || []).filter(tarea => {
            // Filtro por Asignado
            if (filtroAsignado === 'mis-tareas') {
                const asigId = tarea.asignadoA?._id || tarea.asignadoA?.id || tarea.asignadoA;
                if (asigId !== user?.uid && asigId !== user?._id) return false;
            } else if (filtroAsignado === 'sin-asignar') {
                if (tarea.asignadoA) return false;
            } else if (filtroAsignado !== 'todos') {
                const asigId = tarea.asignadoA?._id || tarea.asignadoA?.id || tarea.asignadoA;
                if (asigId !== filtroAsignado) return false;
            }

            // Filtro por Estado
            if (filtroEstado !== 'todos') {
                if (tarea.estado !== filtroEstado) return false;
            }

            // Filtro por Prioridad
            if (filtroPrioridad !== 'todos') {
                if (tarea.prioridad !== filtroPrioridad) return false;
            }

            // Filtro por Búsqueda (título, descripción, etiqueta o nombre de asignado)
            if (filtroBusqueda && filtroBusqueda.trim() !== '') {
                const q = filtroBusqueda.toLowerCase().trim();
                const matchTitulo = (tarea.titulo || '').toLowerCase().includes(q);
                const matchDesc = (tarea.descripcion || '').toLowerCase().includes(q);
                const matchAsig = (tarea.asignadoA?.name || '').toLowerCase().includes(q);
                const matchTags = (tarea.etiquetas || []).some(t => t.toLowerCase().includes(q));
                if (!matchTitulo && !matchDesc && !matchAsig && !matchTags) return false;
            }

            return true;
        });
    }, [tareas, filtroAsignado, filtroEstado, filtroPrioridad, filtroBusqueda, user?.uid, user?._id]);

    // Tareas pendientes asignadas específicamente al usuario en sesión
    const tareasUsuarioLogueado = useMemo(() => {
        const uid = user?.uid || user?._id;
        return (tareas || []).filter(t => {
            const asigId = t.asignadoA?._id || t.asignadoA?.id || t.asignadoA;
            return asigId === uid;
        });
    }, [tareas, user?.uid, user?._id]);

    // Estadísticas generales y métricas rápidas
    const stats = useMemo(() => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const total = tareas.length;
        const pendientes = tareas.filter(t => t.estado === 'pendiente').length;
        const enProgreso = tareas.filter(t => t.estado === 'en_progreso').length;
        const completadas = tareas.filter(t => t.estado === 'completada').length;
        const urgentes = tareas.filter(t => t.prioridad === 'urgente' && t.estado !== 'completada').length;

        // Vencidas (no completadas con fecha anterior a hoy)
        const vencidas = tareas.filter(t => {
            if (t.estado === 'completada' || !t.fechaVencimiento) return false;
            const fv = new Date(t.fechaVencimiento);
            return fv < hoy;
        }).length;

        // Mis tareas pendientes
        const uid = user?.uid || user?._id;
        const misPendientes = tareas.filter(t => {
            const asigId = t.asignadoA?._id || t.asignadoA?.id || t.asignadoA;
            return asigId === uid && t.estado !== 'completada';
        }).length;

        return {
            total,
            pendientes,
            enProgreso,
            completadas,
            urgentes,
            vencidas,
            misPendientes
        };
    }, [tareas, user?.uid, user?._id]);

    return {
        tareas,
        tareasFiltradas,
        tareasUsuarioLogueado,
        isLoadingTareas,
        tareaActiva,
        usuariosDisponibles,
        filtroAsignado,
        filtroEstado,
        filtroPrioridad,
        filtroBusqueda,
        vistaActiva,
        stats,
        user,

        // Métodos
        startLoadingTareas,
        startLoadingUsuarios,
        startSaveTarea,
        startUpdateTarea,
        startCambiarEstado,
        startToggleSubtarea,
        startDeleteTarea,
        setTareaActiva,
        limpiarTareaActiva,
        setFiltroAsignado,
        setFiltroEstado,
        setFiltroPrioridad,
        setFiltroBusqueda,
        setVistaActiva
    };
};
