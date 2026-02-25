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
                kcg: 19500,
                kcp: 14500,
                kb: 14500,
                kce: 8400
            },
            precioCirios: {
                cc: 7800,
                cb: 7800
            },
            precioGuantes: {
                gb: 23000,
                gn: 24000,
                gm: 33000,
            },
        },
        A2026: {
            precioKits: {
                kcg: 21450,
                kcp: 15950,
                kb: 15950,
                kce: 8400
            },
            precioCirios: {
                cc: 8580,
                cb: 8580
            },
            precioGuantes: {
                gb: 23000,
                gn: 24000,
                gm: 33000,
            },
        },
    },
    reducers: {
        onLoadPrecios: (state, /* action */) => {
        },
    }
});
export const { onLoadPrecios } = preciosSlice.actions;

