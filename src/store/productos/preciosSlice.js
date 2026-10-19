import { createSlice } from '@reduxjs/toolkit';

export const PRECIOS_INICIALES_DEFAULT = [
    {
        anio: 2021,
        fechaVigencia: '2021-01-01',
        descripcion: 'Tarifa General Fábrica 2021',
        precioKits: { kcg: 17000, kcp: 13500, kb: 13500, kce: 0 },
        precioCirios: { cc: 7500, cb: 7500, ccon: 7500 },
        precioGuantes: { gb: 17000, gn: 18000, gm: 36000 },
        activo: true
    },
    {
        anio: 2022,
        fechaVigencia: '2022-01-01',
        descripcion: 'Tarifa General Fábrica 2022',
        precioKits: { kcg: 17500, kcp: 13500, kb: 13500, kce: 0 },
        precioCirios: { cc: 7500, cb: 7500, ccon: 7500 },
        precioGuantes: { gb: 17000, gn: 18000, gm: 36000 },
        activo: true
    },
    {
        anio: 2023,
        fechaVigencia: '2023-01-01',
        descripcion: 'Tarifa General Fábrica 2023',
        precioKits: { kcg: 17500, kcp: 13500, kb: 13500, kce: 0 },
        precioCirios: { cc: 7500, cb: 7500, ccon: 7500 },
        precioGuantes: { gb: 17000, gn: 18000, gm: 36000 },
        activo: true
    },
    {
        anio: 2024,
        fechaVigencia: '2024-01-01',
        descripcion: 'Tarifa General Fábrica 2024',
        precioKits: { kcg: 17000, kcp: 12500, kb: 12500, kce: 0 },
        precioCirios: { cc: 7000, cb: 7000, ccon: 7000 },
        precioGuantes: { gb: 17000, gn: 18000, gm: 36000 },
        activo: true
    },
    {
        anio: 2025,
        fechaVigencia: '2025-01-01',
        descripcion: 'Tarifa General Fábrica 2025',
        precioKits: { kcg: 18500, kcp: 13500, kb: 13500, kce: 7400 },
        precioCirios: { cc: 7800, cb: 7800, ccon: 7800 },
        precioGuantes: { gb: 23000, gn: 24000, gm: 33600 },
        activo: true
    },
    {
        anio: 2026,
        fechaVigencia: '2026-01-01',
        descripcion: 'Tarifa General Fábrica 2026',
        precioKits: { kcg: 20500, kcp: 14500, kb: 14500, kce: 7400 },
        precioCirios: { cc: 9000, cb: 9000, ccon: 9000 },
        precioGuantes: { gb: 25200, gn: 26400, gm: 32000 },
        activo: true
    }
];

const sincronizarBloquesAnios = (state, lista) => {
    if (!Array.isArray(lista) || lista.length === 0) return;

    const porAnio = {};
    lista.forEach(item => {
        const a = item.anio;
        if (!porAnio[a]) porAnio[a] = [];
        porAnio[a].push(item);
    });

    Object.entries(porAnio).forEach(([anio, items]) => {
        const ordenados = [...items].sort((a, b) => new Date(b.fechaVigencia || 0) - new Date(a.fechaVigencia || 0));
        const masReciente = ordenados[0];
        if (masReciente) {
            state[`A${anio}`] = {
                precioKits: { ...(masReciente.precioKits || {}) },
                precioCirios: { ...(masReciente.precioCirios || {}) },
                precioGuantes: { ...(masReciente.precioGuantes || {}) },
            };
        }
    });
};

export const preciosSlice = createSlice({
    name: 'precios',
    initialState: {
        A2021: {
            precioKits: { kcg: 17000, kcp: 13500, kb: 13500, kce: 0 },
            precioCirios: { cc: 7500, cb: 7500, ccon: 7500 },
            precioGuantes: { gb: 17000, gn: 18000, gm: 36000 },
        },
        A2022: {
            precioKits: { kcg: 17500, kcp: 13500, kb: 13500, kce: 0 },
            precioCirios: { cc: 7500, cb: 7500, ccon: 7500 },
            precioGuantes: { gb: 17000, gn: 18000, gm: 36000 },
        },
        A2023: {
            precioKits: { kcg: 17500, kcp: 13500, kb: 13500, kce: 0 },
            precioCirios: { cc: 7500, cb: 7500, ccon: 7500 },
            precioGuantes: { gb: 17000, gn: 18000, gm: 36000 },
        },
        A2024: {
            precioKits: { kcg: 17500, kcp: 13500, kb: 13500, kce: 0 },
            precioCirios: { cc: 7500, cb: 7500, ccon: 7500 },
            precioGuantes: { gb: 17000, gn: 18000, gm: 36000 },
        },
        A2025: {
            precioKits: { kcg: 19500, kcp: 14500, kb: 14500, kce: 8400 },
            precioCirios: { cc: 7800, cb: 7800, ccon: 7800 },
            precioGuantes: { gb: 23000, gn: 24000, gm: 33000 },
        },
        A2026: {
            precioKits: { kcg: 20500, kcp: 14500, kb: 14500, kce: 7400 },
            precioCirios: { cc: 9000, cb: 9000, ccon: 9000 },
            precioGuantes: { gb: 25200, gn: 26400, gm: 32000 },
        },
        listaPrecios: PRECIOS_INICIALES_DEFAULT,
        isLoadingPrecios: false,
        precioActivoModal: null,
    },
    reducers: {
        onSetLoadingPrecios: (state, { payload }) => {
            state.isLoadingPrecios = payload;
        },
        onSetPrecioActivoModal: (state, { payload }) => {
            state.precioActivoModal = payload;
        },
        onLoadPrecios: (state, { payload }) => {
            state.isLoadingPrecios = false;
            state.listaPrecios = Array.isArray(payload) ? payload : [];
            sincronizarBloquesAnios(state, state.listaPrecios);
        },
        onAgregarPrecio: (state, { payload }) => {
            state.listaPrecios.unshift(payload);
            sincronizarBloquesAnios(state, state.listaPrecios);
        },
        onActualizarPrecio: (state, { payload }) => {
            const id = payload._id || payload.id;
            state.listaPrecios = state.listaPrecios.map(p => {
                if ((p._id && p._id === id) || (p.id && p.id === id)) {
                    return { ...p, ...payload };
                }
                return p;
            });
            sincronizarBloquesAnios(state, state.listaPrecios);
        },
        onEliminarPrecio: (state, { payload }) => {
            state.listaPrecios = state.listaPrecios.filter(p => p._id !== payload && p.id !== payload);
            sincronizarBloquesAnios(state, state.listaPrecios);
        }
    }
});

export const {
    onSetLoadingPrecios,
    onSetPrecioActivoModal,
    onLoadPrecios,
    onAgregarPrecio,
    onActualizarPrecio,
    onEliminarPrecio
} = preciosSlice.actions;
