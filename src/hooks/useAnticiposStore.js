import { useState, useCallback } from 'react';
import gogoApi from '../api/gogoApi';
import Swal from 'sweetalert2';

const STORAGE_KEY_ANTICIPOS = 'gogo_anticipos_cruce';

export const useAnticiposStore = () => {
    const [anticipos, setAnticipos] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_ANTICIPOS);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    const [isLoadingAnticipos, setIsLoadingAnticipos] = useState(false);

    /**
     * Cargar anticipos desde la base de datos (con filtro opcional de año)
     */
    const startLoadingAnticipos = useCallback(async (anio) => {
        setIsLoadingAnticipos(true);
        try {
            const params = (anio && anio !== 'TODOS') ? { anio } : {};
            const { data } = await gogoApi.get('/anticipos', { params });
            if (data.ok && Array.isArray(data.anticipos)) {
                setAnticipos(data.anticipos);
                try {
                    localStorage.setItem(STORAGE_KEY_ANTICIPOS, JSON.stringify(data.anticipos));
                } catch (e) {
                    console.error('Error guardando anticipos en localStorage', e);
                }
                return data.anticipos;
            }
            return [];
        } catch (error) {
            console.error('Error cargando anticipos desde BD:', error);
            // Fallback a localStorage
            try {
                const saved = localStorage.getItem(STORAGE_KEY_ANTICIPOS);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setAnticipos(parsed);
                    return parsed;
                }
            } catch (e) {
                // Ignore
            }
            return [];
        } finally {
            setIsLoadingAnticipos(false);
        }
    }, []);

    /**
     * Guardar nuevo anticipo en la base de datos
     */
    const startCrearAnticipo = async ({ detalle, cantidad, valor, total, tipo, anio }) => {
        try {
            const cantNum = Number(cantidad) > 0 ? Number(cantidad) : 1;
            const valorNum = Number(valor) >= 0 ? Number(valor) : 0;
            const totalNum = (total !== undefined && total !== null && total !== '') 
                ? Number(total) 
                : (cantNum * valorNum);

            const nuevo = {
                detalle: String(detalle).trim(),
                cantidad: cantNum,
                valor: valorNum,
                total: totalNum,
                tipo: (tipo === 'LEO_A_OSCAR') ? 'LEO_A_OSCAR' : 'OSCAR_A_LEO',
                anio: anio ? Number(anio) : new Date().getFullYear()
            };

            const { data } = await gogoApi.post('/anticipos', nuevo);
            if (data.ok && data.anticipo) {
                setAnticipos(prev => {
                    const actualizados = [data.anticipo, ...prev];
                    try {
                        localStorage.setItem(STORAGE_KEY_ANTICIPOS, JSON.stringify(actualizados));
                    } catch (e) {
                        console.error('Error guardando en localStorage', e);
                    }
                    return actualizados;
                });

                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: '¡Anticipo registrado!',
                    text: `${nuevo.detalle} por $${nuevo.total.toLocaleString()}`,
                    timer: 2300,
                    showConfirmButton: false,
                    timerProgressBar: true
                });

                return data.anticipo;
            }
            return null;
        } catch (error) {
            console.error('Error al guardar anticipo:', error);
            const msg = error.response?.data?.msg || 'No se pudo guardar el anticipo en la base de datos.';
            Swal.fire('Error', msg, 'error');
            return null;
        }
    };

    /**
     * Eliminar un anticipo de la base de datos
     */
    const startEliminarAnticipo = async (id, detalle = '') => {
        const confirm = await Swal.fire({
            title: '¿Eliminar anticipo?',
            html: `¿Estás seguro de eliminar el registro <strong>"${detalle}"</strong>?<br><small class="text-muted">Se descontará de los cálculos del cruce de cuentas.</small>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });

        if (!confirm.isConfirmed) return false;

        try {
            const { data } = await gogoApi.delete(`/anticipos/${id}`);
            if (data.ok) {
                setAnticipos(prev => {
                    const actualizados = prev.filter(a => a._id !== id && a.id !== id);
                    try {
                        localStorage.setItem(STORAGE_KEY_ANTICIPOS, JSON.stringify(actualizados));
                    } catch (e) {
                        console.error('Error guardando en localStorage', e);
                    }
                    return actualizados;
                });

                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Anticipo eliminado',
                    timer: 1800,
                    showConfirmButton: false
                });

                return true;
            }
            return false;
        } catch (error) {
            console.error('Error al eliminar anticipo:', error);
            Swal.fire('Error', 'No se pudo eliminar el anticipo.', 'error');
            return false;
        }
    };

    return {
        anticipos,
        isLoadingAnticipos,
        startLoadingAnticipos,
        startCrearAnticipo,
        startEliminarAnticipo,
        setAnticipos
    };
};
