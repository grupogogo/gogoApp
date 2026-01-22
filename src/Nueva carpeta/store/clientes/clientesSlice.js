import { createSlice } from '@reduxjs/toolkit';

const estadoInicial = {
    user: {
        id_: '',
        name: ''
    },
    cliente_id: '',
    distribuidor: true,
    nombre: '',
    nitCC: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    detalle: '',
    precios: {
        precioKits: {
            kcg: 0,
            kcp: 0,
            kb: 0,
            kce: 0
        }, precioCirios: {
            cc: 0,
            cb: 0
        },
        precioGuantes: {
            gb: 0,
            gn: 0,
            gm: 0
        }
    },
    listadoPedidos: []
}

export const clientesSlice = createSlice({//* 2. Crear Slice que controla los metodos e inicializa todo, aca estará la conexion con el backend
    name: 'clientes',
    initialState: {
        isLoadingClientes: true,
        clientes: [],
        clienteActivo: estadoInicial,
        //datosClientes: clientesBusqueda
    },
    reducers: {
        setActiveClient: (state, { payload }) => {
            state.clienteActivo = payload;
        },
        onAddNewClient: (state, { payload }) => {
            state.clientes.push(payload);
            state.clienteActivo = payload;
        },
        onSetDefaultActiveClient: (state) => {
            state.clienteActivo = estadoInicial
        },
        onUpdateClient: (state, { payload }) => {
            state.clientes = state.clientes.map(cliente => {
                if (cliente.cliente_id === payload.cliente_id) {
                    return payload;
                }
                return cliente;
            });
        },
        onLoadClientes: (state, { payload = [] }) => {
            state.isLoadingClientes = false;
            state.clientes = payload.clientes;
        }
    }
});
export const { setActiveClient, onAddNewClient, onSetDefaultActiveClient, onUpdateClient, onLoadClientes } = clientesSlice.actions;