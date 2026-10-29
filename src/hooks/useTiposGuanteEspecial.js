import { useState, useEffect, useCallback } from 'react';
import { gogoApi } from '../api';

/**
 * Hook para gestionar los tipos de guante especial desde la BD.
 * Carga automáticamente al montar y expone funciones para CRUD completo.
 */
export const useTiposGuanteEspecial = () => {
    const [tipos, setTipos] = useState([]);
    const [cargando, setCargando] = useState(false);

    const cargarTipos = useCallback(async () => {
        try {
            setCargando(true);
            const { data } = await gogoApi.get('/tiposGuanteEspecial');
            if (data.ok) setTipos(data.tipos);
        } catch (error) {
            console.error('Error al cargar tipos de guante especial:', error);
        } finally {
            setCargando(false);
        }
    }, []);

    const agregarTipo = async ({ nombre, precio = 0 }) => {
        if (!nombre?.trim()) return null;
        try {
            const { data } = await gogoApi.post('/tiposGuanteEspecial', {
                nombre: nombre.trim(),
                precio: Number(precio) || 0
            });
            if (data.ok) {
                await cargarTipos();
                return data.tipo;
            }
            return null;
        } catch (error) {
            console.error('Error al agregar tipo de guante especial:', error);
            return null;
        }
    };

    const editarTipo = async (id, { nombre, precio }) => {
        try {
            const updates = {};
            if (nombre?.trim()) updates.nombre = nombre.trim();
            if (precio !== undefined) updates.precio = Number(precio) || 0;

            const { data } = await gogoApi.put(`/tiposGuanteEspecial/${id}`, updates);
            if (data.ok) {
                // Actualizar localmente
                setTipos(prev => prev.map(t => (t.id === id || t._id === id) ? { ...t, ...updates, ...(data.tipo || {}) } : t));
                return data.tipo;
            }
            return null;
        } catch (error) {
            console.error('Error al editar tipo de guante especial:', error);
            return null;
        }
    };

    const eliminarTipo = async (id) => {
        try {
            const { data } = await gogoApi.delete(`/tiposGuanteEspecial/${id}`);
            if (data.ok) {
                setTipos(prev => prev.filter(t => t.id !== id && t._id !== id));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error al eliminar tipo de guante especial:', error);
            return false;
        }
    };

    useEffect(() => {
        cargarTipos();
    }, [cargarTipos]);

    return { tipos, cargando, agregarTipo, editarTipo, eliminarTipo, cargarTipos };
};
