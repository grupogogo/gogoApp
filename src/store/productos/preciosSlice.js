import { createSlice } from '@reduxjs/toolkit';

export const preciosSlice = createSlice({
    name: 'precios',
    initialState: {
        A2021: {
            precioKits: {
                kcg: 17000,
                kcp: 13500,
                kb: 13500
            },
            precioCirios: {
                cc: 7500,
                cb: 7500
            },
            precioGuantes: {
                gb: 17000,
                gn: 18000,
                gm: 36000,
            },
        },
        A2022: {
            precioKits: {
                kcg: 17500,
                kcp: 13500,
                kb: 13500
            },
            precioCirios: {
                cc: 7500,
                cb: 7500
            },
            precioGuantes: {
                gb: 17000,
                gn: 18000,
                gm: 36000,
            },
        },
        A2023: {
            precioKits: {
                kcg: 17500,
                kcp: 13500,
                kb: 13500
            },
            precioCirios: {
                cc: 7500,
                cb: 7500
            },
            precioGuantes: {
                gb: 17000,
                gn: 18000,
                gm: 36000,
            },
        },
        A2024: {
            precioKits: {
                kcg: 17500,
                kcp: 13500,
                kb: 13500
            },
            precioCirios: {
                cc: 7500,
                cb: 7500
            },
            precioGuantes: {
                gb: 17000,
                gn: 18000,
                gm: 36000,
            },
        },
        A2025: {
            precioKits: {
                kcg: 19000,
                kcp: 14000,
                kb: 14000
            },
            precioCirios: {
                cc: 7500,
                cb: 7500
            },
            precioGuantes: {
                gb: 17000,
                gn: 18000,
                gm: 36000,
            },
        },
    },
    reducers: {
        onLoadPrecios: (state, /* action */ ) => {
        },
    }
});
export const { onLoadPrecios } = preciosSlice.actions;

