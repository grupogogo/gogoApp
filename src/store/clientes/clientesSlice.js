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
            kcg: '',
            kcp: '',
            kb: ''
        }, precioCirios: {
            cc: '',
            cb: ''
        },
        precioGuantes: {
            gb: '',
            gn: '',
            gm: ''
        }
    },
    listadoPedidos: []
}

const clientesBusqueda = [
    {
        NIT: "830121107",
        NOMBRE: "ADORNOS REMATEX",
        TELEFONO: "2436860",
        DOCUMENTO: "830121107",
        CONTACTO: "",
        DIRECCION: "CRA 13 No 11 - 02",
        OBSERVACION: "",
        CIUDAD: "BOGOTA"
    },
    {
        NIT: "800081042",
        NOMBRE: "EL REY DE LOS ADORNOS",
        TELEFONO: "3426529",
        DOCUMENTO: "800081042",
        CONTACTO: "",
        DIRECCION: "CALLE 11 No 11-85",
        OBSERVACION: "",
        CIUDAD: "BOGOTA"
    },
    {
        NIT: "24334402",
        NOMBRE: "ADORNOS EL UNIVERSO",
        TELEFONO: "2820253",
        DOCUMENTO: "24334402",
        CONTACTO: "",
        DIRECCION: "CRA 12 No 11-05",
        OBSERVACION: "",
        CIUDAD: "BOGOTA"
    },
    {
        NIT: "808207741",
        NOMBRE: "ADORNOS ECLIPSE",
        TELEFONO: "3138721323",
        DOCUMENTO: "808207741",
        CONTACTO: "",
        DIRECCION: "CRA 12 No 11-15",
        OBSERVACION: "",
        CIUDAD: "BOGOTA"
    },
    {
        NIT: "80820774",
        NOMBRE: "REMATICO ALQUERIA",
        TELEFONO: "3202722106",
        DOCUMENTO: "80820774",
        CONTACTO: "",
        DIRECCION: "CRA 52C No 41B-11",
        OBSERVACION: "",
        CIUDAD: "BOGOTA"
    },
    {
        NIT: "123456",
        NOMBRE: "PATRICIA PATIÑO",
        TELEFONO: "3112026661",
        DOCUMENTO: "123456",
        CONTACTO: "",
        DIRECCION: "CC . PONCE",
        OBSERVACION: "",
        CIUDAD: "BOGOTA"
    },
    {
        NIT: "1024496148",
        NOMBRE: "FREDY MAHECHA",
        TELEFONO: "3105619682",
        DOCUMENTO: "1024496148",
        CONTACTO: "",
        DIRECCION: "",
        OBSERVACION: "",
        CIUDAD: "BOGOTA"
    },
    {
        NIT: "900879470",
        NOMBRE: "BRAND DESIGN SAS",
        TELEFONO: "8102877",
        DOCUMENTO: "900879470",
        CONTACTO: "",
        DIRECCION: "CALLE 78 D No 110-98",
        OBSERVACION: "",
        CIUDAD: "BOGOTA"
    },
    {
        NIT: "900782949",
        NOMBRE: "TINTOTEX SAS",
        TELEFONO: "7434533",
        DOCUMENTO: "900782949",
        CONTACTO: "",
        DIRECCION: "CRA 128 No 15A-11",
        OBSERVACION: "",
        CIUDAD: "BOGOTA"
    },
    {
        NIT: "830136313",
        NOMBRE: "ADORNOS Y ENCAJES E.U",
        TELEFONO: "2861756",
        DOCUMENTO: "830136313",
        CONTACTO: "",
        DIRECCION: "CRA 12 No 11-46 PISO 2",
        OBSERVACION: "",
        CIUDAD: "BOGOTA"
    },
    {
        NIT: "8301211071",
        NOMBRE: "REMATICO 1",
        TELEFONO: "2436860",
        DOCUMENTO: "8301211071",
        CONTACTO: "",
        DIRECCION: "CRA 12 No 11-02",
        OBSERVACION: "",
        CIUDAD: "BOGOTA"
    },
    {
        NIT: "12345678",
        NOMBRE: "REMATICO SAN JOSE",
        TELEFONO: "5608675",
        DOCUMENTO: "12345678",
        CONTACTO: "",
        DIRECCION: "CALLE 11 No 21-42",
        OBSERVACION: "",
        CIUDAD: "BOGOTA"
    },
    {
        NIT: "101010",
        NOMBRE: "ELSA PERALTA",
        TELEFONO: "3112880355",
        DOCUMENTO: "101010",
        CONTACTO: "",
        DIRECCION: "LAS FERIAS",
        OBSERVACION: "",
        CIUDAD: "BOGOTA"
    },
    {
        NIT: "222222",
        NOMBRE: "CLIENTES VARIOS",
        TELEFONO: "000000",
        DOCUMENTO: "222222",
        CONTACTO: "",
        DIRECCION: "000000",
        OBSERVACION: "",
        CIUDAD: "00000"
    },
    {
        NIT: "13461724",
        NOMBRE: "GUSTAVO DAVILA BOHADA",
        TELEFONO: "3103347724",
        DOCUMENTO: "13461724",
        CONTACTO: "",
        DIRECCION: "CRA 16 No 61-22 CASA 16 CONJUNTO HACIEND",
        OBSERVACION: "",
        CIUDAD: "BUCARAMANGA - S/DER"
    },
    {
        NIT: "1234567",
        NOMBRE: "MACROLANAS Y ADORNOS",
        TELEFONO: "3343805",
        DOCUMENTO: "1234567",
        CONTACTO: "",
        DIRECCION: "CRA 9 No 12-26 CENTRO",
        OBSERVACION: "NOHORA CASALLAS",
        CIUDAD: "BOGOTA"
    },
    {
        NIT: "5555555",
        NOMBRE: "ADORNOS LA NOVEDAD",
        TELEFONO: "1111111",
        DOCUMENTO: "5555555",
        CONTACTO: "",
        DIRECCION: "CALLE 11 No 11-83",
        OBSERVACION: "",
        CIUDAD: "BOGOTA"
    },
    {
        NIT: "888888",
        NOMBRE: "EL BALCON",
        TELEFONO: "3118705987",
        DOCUMENTO: "888888",
        CONTACTO: "",
        DIRECCION: "CRA 12 No 11-15",
        OBSERVACION: "FRANCY",
        CIUDAD: "BOGOTA"
    },
    {
        NIT: "123456789",
        NOMBRE: "EL EMPERADOR",
        TELEFONO: "",
        DOCUMENTO: "123456789",
        CONTACTO: "",
        DIRECCION: "CARRE 11 No 11-15",
        OBSERVACION: "",
        CIUDAD: "BOGOTA"
    },
    {
        NIT: "999999",
        NOMBRE: "REMATICO FERIAS",
        TELEFONO: "",
        DOCUMENTO: "999999",
        CONTACTO: "",
        DIRECCION: "LAS FERIAS",
        OBSERVACION: "",
        CIUDAD: "BOGOTA"
    },
    {
        NIT: "5555556",
        NOMBRE: "LUZ ADRIANA GOMEZ",
        TELEFONO: "",
        DOCUMENTO: "5555556",
        CONTACTO: "",
        DIRECCION: "SAN VICTORINO",
        OBSERVACION: "",
        CIUDAD: "BOGOTA"
    },
    {
        NIT: "3156531424",
        NOMBRE: "BETTY IGUERA",
        TELEFONO: "3156531424",
        DOCUMENTO: "3156531424",
        CONTACTO: "",
        DIRECCION: "CALLE 162 No 8F-55 LOCAL 2 SAN CRISTOBAL",
        OBSERVACION: "",
        CIUDAD: "BOGOTA"
    },
    {
        NIT: "627",
        NOMBRE: "ANA CECILIA",
        TELEFONO: "3123638656",
        DOCUMENTO: "627",
        CONTACTO: "",
        DIRECCION: "SANTA LIBRADA",
        OBSERVACION: "",
        CIUDAD: "BOGOTA"
    },
    {
        NIT: "80747420",
        NOMBRE: "OSCAR GOMEZ",
        TELEFONO: "3182306083",
        DOCUMENTO: "80747420",
        CONTACTO: "",
        DIRECCION: "CRA 6 No 78-36 SUR",
        OBSERVACION: "",
        CIUDAD: "BOGOTA"
    },
    {
        NIT: "1212121",
        NOMBRE: "PROVEEDORES VARIOS",
        TELEFONO: "",
        DOCUMENTO: "1212121",
        CONTACTO: "",
        DIRECCION: "",
        OBSERVACION: "",
        CIUDAD: "BOGOTA"
    },
    {
        NIT: "444444",
        NOMBRE: "INVERSION NUEVO PUNTO",
        TELEFONO: "222222",
        DOCUMENTO: "444444",
        CONTACTO: "",
        DIRECCION: "",
        OBSERVACION: "",
        CIUDAD: ""
    }
];

export const clientesSlice = createSlice({//* 2. Crear Slice que controla los metodos e inicializa todo, aca estará la conexion con el backend
    name: 'clientes',
    initialState: {
        isLoadingClientes: true,
        clientes: [],
        clienteActivo: estadoInicial,
        datosClientes: clientesBusqueda
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