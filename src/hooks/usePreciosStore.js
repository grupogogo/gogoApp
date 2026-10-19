import { useDispatch, useSelector } from 'react-redux';
import {
    onSetLoadingPrecios,
    onSetPrecioActivoModal,
    onLoadPrecios,
    onAgregarPrecio,
    onActualizarPrecio,
    onEliminarPrecio
} from '../store/productos/preciosSlice';
import gogoApi from '../api/gogoApi';
import Swal from 'sweetalert2';

export const usePreciosStore = () => {
    const dispatch = useDispatch();
    const { listaPrecios, isLoadingPrecios, precioActivoModal } = useSelector(state => state.precios);

    const setPrecioActivoModal = (precio) => {
        dispatch(onSetPrecioActivoModal(precio));
    };

    /**
     * Carga todas las tarifas de precios desde la base de datos MongoDB
     */
    const startLoadingPrecios = async () => {
        dispatch(onSetLoadingPrecios(true));
        try {
            const { data } = await gogoApi.get('/precios');
            if (data.ok && Array.isArray(data.precios)) {
                dispatch(onLoadPrecios(data.precios));
            }
        } catch (error) {
            console.error('Error al cargar precios desde la BD:', error);
            dispatch(onSetLoadingPrecios(false));
        }
    };

    /**
     * Guarda una nueva tarifa o actualiza una existente en MongoDB
     */
    const startGuardarPrecio = async (formData) => {
        try {
            const targetId = formData._id || formData.id;
            const esEdicion = Boolean(targetId);

            const datosLimpios = {
                anio: Number(formData.anio),
                fechaVigencia: formData.fechaVigencia,
                descripcion: formData.descripcion || '',
                precioKits: {
                    kcg: Number(formData.precioKits?.kcg || 0),
                    kcp: Number(formData.precioKits?.kcp || 0),
                    kb: Number(formData.precioKits?.kb || 0),
                    kce: Number(formData.precioKits?.kce || 0),
                },
                precioCirios: {
                    cc: Number(formData.precioCirios?.cc || 0),
                    ccon: Number(formData.precioCirios?.ccon || formData.precioCirios?.cc || formData.precioCirios?.cb || 0),
                    cb: Number(formData.precioCirios?.cb || 0),
                },
                precioGuantes: {
                    gb: Number(formData.precioGuantes?.gb || 0),
                    gn: Number(formData.precioGuantes?.gn || 0),
                    gm: Number(formData.precioGuantes?.gm || 0),
                }
            };

            if (esEdicion) {
                const { data } = await gogoApi.put(`/precios/${targetId}`, datosLimpios);
                if (data.ok && data.precio) {
                    dispatch(onActualizarPrecio(data.precio));
                    Swal.fire({
                        icon: 'success',
                        title: '¡Tarifa Actualizada en BD!',
                        text: `Tarifa de ${datosLimpios.anio} guardada exitosamente en la base de datos.`,
                        timer: 1800,
                        showConfirmButton: false,
                    });
                }
            } else {
                const { data } = await gogoApi.post('/precios', datosLimpios);
                if (data.ok && data.precio) {
                    dispatch(onAgregarPrecio(data.precio));
                    Swal.fire({
                        icon: 'success',
                        title: '¡Tarifa Creada en BD!',
                        text: `Nueva tarifa de ${datosLimpios.anio} registrada en la base de datos.`,
                        timer: 1800,
                        showConfirmButton: false,
                    });
                }
            }

            dispatch(onSetPrecioActivoModal(null));
            return true;
        } catch (error) {
            console.error('Error guardando precio en la BD:', error);
            const msg = error.response?.data?.msg || 'No se pudo guardar la tarifa en la base de datos.';
            Swal.fire('Error al guardar', msg, 'error');
            return false;
        }
    };

    /**
     * Elimina una tarifa de la base de datos MongoDB
     */
    const startEliminarPrecio = (id, anio = '') => {
        Swal.fire({
            title: '¿Eliminar de la base de datos?',
            text: `Se borrará permanentemente el registro de tarifa de ${anio} de la BD.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const { data } = await gogoApi.delete(`/precios/${id}`);
                    if (data.ok) {
                        dispatch(onEliminarPrecio(id));
                        Swal.fire({
                            icon: 'success',
                            title: 'Eliminado de la BD',
                            text: 'El registro de precio ha sido eliminado correctamente.',
                            timer: 1500,
                            showConfirmButton: false
                        });
                    }
                } catch (error) {
                    console.error('Error eliminando precio en BD:', error);
                    Swal.fire('Error', 'No se pudo eliminar el precio de la base de datos.', 'error');
                }
            }
        });
    };

    /**
     * Restablece las tarifas iniciales de fábrica en MongoDB
     */
    const startResetPrecios = () => {
        Swal.fire({
            title: '¿Restablecer tarifas en BD?',
            text: 'Se restablecerán las tarifas de fábrica originales (2021 a 2026) en la base de datos.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Restablecer en BD',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const { data } = await gogoApi.post('/precios/reset');
                    if (data.ok && Array.isArray(data.precios)) {
                        dispatch(onLoadPrecios(data.precios));
                        Swal.fire({
                            icon: 'success',
                            title: 'Restablecido en BD',
                            text: 'Las tarifas originales de fábrica fueron restauradas en la base de datos.',
                            timer: 1600,
                            showConfirmButton: false
                        });
                    }
                } catch (error) {
                    console.error('Error al restablecer precios en BD:', error);
                    Swal.fire('Error', 'No se pudieron restablecer las tarifas en la BD.', 'error');
                }
            }
        });
    };

    /**
     * Consulta el precio de fábrica vigente según la fecha de la venta
     */
    const obtenerPrecioPorFecha = (categoriaId, fechaVenta = new Date()) => {
        const d = fechaVenta instanceof Date ? fechaVenta : new Date(fechaVenta);
        if (isNaN(d.getTime())) return 0;

        const anio = d.getFullYear();
        const fechaStr = d.toISOString().split('T')[0];

        const candidatos = (listaPrecios || []).filter(p => Number(p.anio) === Number(anio));
        if (candidatos.length === 0) return 0;

        candidatos.sort((a, b) => new Date(b.fechaVigencia || 0) - new Date(a.fechaVigencia || 0));
        const tarifaAplicable = candidatos.find(c => (c.fechaVigencia || '1970-01-01') <= fechaStr) || candidatos[candidatos.length - 1];
        if (!tarifaAplicable) return 0;

        const cat = String(categoriaId || '').toLowerCase();
        if (cat === 'kcg') return tarifaAplicable.precioKits?.kcg || 0;
        if (cat === 'kcp') return tarifaAplicable.precioKits?.kcp || 0;
        if (cat === 'kb') return tarifaAplicable.precioKits?.kb || 0;
        if (cat === 'kce') return tarifaAplicable.precioKits?.kce || 0;
        if (cat === 'cc') return tarifaAplicable.precioCirios?.cc || 0;
        if (cat === 'ccon') return tarifaAplicable.precioCirios?.ccon || tarifaAplicable.precioCirios?.cc || tarifaAplicable.precioCirios?.cb || 0;
        if (cat === 'cb') return tarifaAplicable.precioCirios?.cb || 0;
        if (cat === 'gb') return tarifaAplicable.precioGuantes?.gb || 0;
        if (cat === 'gn') return tarifaAplicable.precioGuantes?.gn || 0;
        if (cat === 'gm') return tarifaAplicable.precioGuantes?.gm || 0;

        return 0;
    };

    /**
     * Carga todos los precios de fábrica para Otros desde la BD
     */
    const startLoadingPreciosOtros = async () => {
        try {
            const { data } = await gogoApi.get('/precios/otros');
            if (data.ok && Array.isArray(data.preciosOtros)) {
                return data.preciosOtros;
            }
            return [];
        } catch (error) {
            console.error('Error al cargar precios de otros desde la BD:', error);
            return [];
        }
    };

    /**
     * Guarda o edita el precio de fábrica para un producto de Otros
     */
    const startGuardarPrecioOtro = async ({ key, nombre, precioFabrica, anio }) => {
        try {
            const { data } = await gogoApi.post('/precios/otros', {
                key,
                nombre,
                precioFabrica: Number(precioFabrica) || 0,
                anio: anio ? Number(anio) : undefined
            });
            if (data.ok) {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `Precio guardado en BD`,
                    html: `<strong>${nombre}</strong>: $${(Number(precioFabrica) || 0).toLocaleString()}`,
                    timer: 2500,
                    showConfirmButton: false,
                    timerProgressBar: true
                });
                return data.precioOtro;
            }
            return null;
        } catch (error) {
            console.error('Error al guardar precio de otro en BD:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error al guardar',
                text: error.response?.data?.msg || 'No se pudo guardar el precio en la base de datos.'
            });
            return null;
        }
    };

    /**
     * Guarda o edita la categoría ('Kits' o 'Guantes') para un producto de Otros en BD
     */
    const startGuardarCategoriaOtro = async ({ key, nombre, categoria }) => {
        try {
            const { data } = await gogoApi.post('/precios/otros/categoria', {
                key,
                nombre,
                categoria
            });
            if (data.ok) {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `Categoría actualizada`,
                    html: `<strong>${nombre}</strong> asignado a <strong>${categoria}</strong>`,
                    timer: 2200,
                    showConfirmButton: false,
                    timerProgressBar: true
                });
                return data.precioOtro;
            }
            return null;
        } catch (error) {
            console.error('Error al actualizar categoría de otro en BD:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error al cambiar categoría',
                text: error.response?.data?.msg || 'No se pudo actualizar la categoría en la base de datos.'
            });
            return null;
        }
    };

    return {
        listaPrecios: listaPrecios || [],
        isLoadingPrecios,
        precioActivoModal,
        setPrecioActivoModal,
        startLoadingPrecios,
        startGuardarPrecio,
        startEliminarPrecio,
        startResetPrecios,
        startLoadingPreciosOtros,
        startGuardarPrecioOtro,
        startGuardarCategoriaOtro,
        obtenerPrecioPorFecha
    };
};
