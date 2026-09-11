import { useSelector } from 'react-redux';
import { useAuthStore } from './useAuthStore';
import { useClientesStore } from './useClientesStore';
import numalet from 'numalet';

export const useFuntions = () => {
    const { clienteActivo } = useClientesStore();
    const { user } = useAuthStore();
    const precios = useSelector(state => state.precios);
    const UID_OSCAR = '679fce0ee8d1ed66d21d18c2';
    const UID_LEONARDO = '6789ce1b48932f890985d1f7';
    const UID_KAROL = '68cc3a0265f2a9ce640ba630';

    const esOscar = user?.uid === UID_OSCAR || user?.name?.toLowerCase().includes('oscar');
    const esLeonardo = user?.uid === UID_LEONARDO || user?.name?.toLowerCase().includes('leonardo');
    const esKarol = user?.uid === UID_KAROL || user?.name?.toLowerCase().includes('karol') || user?.email?.toLowerCase().includes('karol');

    const esUserOscar = (u, name = '', email = '', cliente = '', nit = '') => {
        if (!u && !cliente) return false;
        if (u?.esBrandDesign) return false;
        const id = (u?._id || u?.uid || u?.id || u)?.toString() || '';
        const n = (u?.name || u?.nombre || name || '').toLowerCase();
        const c = String(cliente || '').toUpperCase();
        const nt = String(nit || '');
        if (c && !c.includes('BRAND DESIGN') && !nt.includes('900879470') && !id && !n) return true;
        return id === UID_OSCAR || n.includes('oscar');
    };

    const esUserLeonardo = (u, name = '', email = '', cliente = '', nit = '') => {
        if (!u && !cliente) return false;
        if (u?.esBrandDesign) return true;
        const id = (u?._id || u?.uid || u?.id || u)?.toString() || '';
        const n = (u?.name || u?.nombre || name || '').toLowerCase();
        const c = String(cliente || '').toUpperCase();
        const nt = String(nit || '');
        if (c.includes('BRAND DESIGN') || nt.includes('900879470')) return true;
        return id === UID_LEONARDO || n.includes('leonardo');
    };

    const esUserKarol = (u, name = '', email = '') => {
        if (!u) return false;
        const id = (u._id || u.uid || u.id || u)?.toString() || '';
        const n = (u.name || u.nombre || name || '').toLowerCase();
        const em = (u.email || email || '').toLowerCase();
        return id === UID_KAROL || n.includes('karol') || em.includes('karol');
    };

    const esProductoGuante = (catKey = '', prodName = '') => {
        const c = String(catKey || '').toUpperCase().trim();
        const p = String(prodName || '').toLowerCase().trim();
        return c === 'GUANTES' || c.includes('GUANTE') || p.includes('guante');
    };

    const pastelColors = [
        'rgba(0, 123, 255, 0.8)',   // primary
        'rgba(40, 167, 69, 0.8)',   // success
        'rgba(255, 193, 7, 0.8)',   // warning
        'rgba(220, 53, 69, 0.8)',   // danger
        'rgba(23, 162, 184, 0.8)',  // info
        'rgba(108, 117, 125, 0.8)', // secondary
        'rgba(102, 16, 242, 0.8)',  // purple-like
        'rgba(255, 102, 204, 0.8)', // pink
        'rgba(0, 255, 204, 0.8)',   // turquoise
        'rgba(255, 153, 102, 0.8)', // peach
    ];

    const {
        precioKits: {
            kcg = 0,
            kcp = 0,
            kce = 0,
            kb = 0,
        } = {},
        precioCirios: {
            cc = 0,
            cb = 0,
        } = {},
        precioGuantes: {
            gb = 0,
            gn = 0,
            gm = 0,
        } = {},
    } = clienteActivo?.precios || {};

    const mesesAbrev = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const mapaMeses = {
        'enero': 'Ene', 'ene': 'Ene',
        'febrero': 'Feb', 'feb': 'Feb',
        'marzo': 'Mar', 'mar': 'Mar',
        'abril': 'Abr', 'abr': 'Abr',
        'mayo': 'May', 'may': 'May',
        'junio': 'Jun', 'jun': 'Jun',
        'julio': 'Jul', 'jul': 'Jul',
        'agosto': 'Ago', 'ago': 'Ago',
        'septiembre': 'Sep', 'setiembre': 'Sep', 'sep': 'Sep',
        'octubre': 'Oct', 'oct': 'Oct',
        'noviembre': 'Nov', 'nov': 'Nov',
        'diciembre': 'Dic', 'dic': 'Dic'
    };

    function limpiarFecha(fecha) {
        if (!fecha) return '—';
        if (fecha instanceof Date) {
            return isNaN(fecha.getTime()) ? '—' : `${mesesAbrev[fecha.getMonth()]} ${fecha.getDate()}`;
        }
        if (typeof fecha !== 'string') return String(fecha);

        const fechaTrim = fecha.trim();

        // Formato DD/MM/AAAA o DD-MM-AAAA (ej: "12/02/2026, 04:32 p. m." o "30-11-2019")
        const matchNum = fechaTrim.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
        if (matchNum) {
            const dia = parseInt(matchNum[1], 10);
            const mesIdx = parseInt(matchNum[2], 10) - 1;
            if (mesIdx >= 0 && mesIdx < 12) {
                return `${mesesAbrev[mesIdx]} ${dia}`;
            }
        }

        // Formato AAAA-MM-DD (ISO)
        const matchIso = fechaTrim.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
        if (matchIso) {
            const dia = parseInt(matchIso[3], 10);
            const mesIdx = parseInt(matchIso[2], 10) - 1;
            if (mesIdx >= 0 && mesIdx < 12) {
                return `${mesesAbrev[mesIdx]} ${dia}`;
            }
        }

        // Formato texto (ej: "julio 8, 2025" o "8 de Julio" o "Febrero 12")
        const palabras = fechaTrim.toLowerCase().replace(/,/g, '').split(/\s+/);
        let mesDetectado = null;
        let diaDetectado = null;

        for (const p of palabras) {
            if (mapaMeses[p]) {
                mesDetectado = mapaMeses[p];
            } else if (/^\d{1,2}$/.test(p)) {
                diaDetectado = parseInt(p, 10);
            }
        }

        if (mesDetectado && diaDetectado) {
            return `${mesDetectado} ${diaDetectado}`;
        }

        // Si ya viene como "Feb 12" o "Ene 05"
        if (/^[a-zA-Z]{3}\s*\d{1,2}$/i.test(fechaTrim)) {
            return capitalize(fechaTrim);
        }

        // Fallback: Si no se pudo parsear, toma lo que haya antes de la coma
        return capitalize(fechaTrim.split(',')[0].trim());
    }

    const fechaCorta = (fechaStr) => {
        return limpiarFecha(fechaStr);
    };

    const convertirOldFecha = (fechaStr) => {
        if (!fechaStr) return new Date();
        const [dia, mes, anio] = fechaStr.split('/').map(Number);
        return new Date(anio, mes - 1, dia);
    };

    function parsearFechaGasto(fechaStr) {
        if (!fechaStr || typeof fechaStr !== 'string') return null;

        const regexFecha1 = /^(\d{2})-(\d{2})-(\d{4})$/;
        const match1 = fechaStr.match(regexFecha1);
        if (match1) {
            const [_, dia, mes, anio] = match1;
            return new Date(`${anio}-${mes}-${dia}T00:00:00`);
        }

        const mesesES = {
            enero: 'January', febrero: 'February', marzo: 'March', abril: 'April',
            mayo: 'May', junio: 'June', julio: 'July', agosto: 'August',
            septiembre: 'September', octubre: 'October', noviembre: 'November', diciembre: 'December'
        };

        try {
            const partes = fechaStr.toLowerCase().split(' ');
            const nombreMes = partes[0];

            if (mesesES[nombreMes]) {
                const fechaTraducida = fechaStr.replace(
                    new RegExp(nombreMes, 'i'),
                    mesesES[nombreMes]
                );
                const fecha = new Date(fechaTraducida);
                return isNaN(fecha.getTime()) ? null : fecha;
            }
        } catch (e) {
            console.warn('Error al parsear fecha:', fechaStr, e);
            return null;
        }

        return null;
    }

    const convertirFechaIngles = (fechaStr) => {
        const meses = {
            enero: 'Jan',
            febrero: 'Feb',
            marzo: 'Mar',
            abril: 'Apr',
            mayo: 'May',
            junio: 'Jun',
            julio: 'Jul',
            agosto: 'Aug',
            septiembre: 'Sep',
            octubre: 'Oct',
            noviembre: 'Nov',
            diciembre: 'Dec',
        };

        // Reemplazar el nombre del mes en español por su versión en inglés
        const regexMes = new RegExp(Object.keys(meses).join("|"), "gi");
        const fechaIngles = fechaStr.replace(regexMes, (matched) => meses[matched.toLowerCase()]);

        return new Date(fechaIngles);
    };

    const formatearFechaConNombreMes = (fechaStr) => {
        if (!fechaStr) return "";

        const [dia, mes] = fechaStr.split('/');

        const nombresMeses = [
            "Ene", "Feb", "Mar", "Abr", "May", "Jun",
            "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
        ];

        const nombreMes = nombresMeses[parseInt(mes, 10) - 1];

        return `${nombreMes} ${dia}`;
    };
    const number_format = (number, decimals, dec_point, thousands_sep) => {
        number = (number + '').replace(',', '').replace(' ', '');
        const n = !isFinite(+number) ? 0 : +number;
        const prec = !isFinite(+decimals) ? 0 : Math.abs(decimals);
        const sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep;
        const dec = (typeof dec_point === 'undefined') ? '.' : dec_point;
        let s = '';
        const toFixedFix = (n, prec) => {
            const k = Math.pow(10, prec);
            return '' + Math.round(n * k) / k;
        };

        s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
        if (s[0].length > 3) {
            s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
        }
        if ((s[1] || '').length < prec) {
            s[1] = s[1] || '';
            s[1] += new Array(prec - s[1].length + 1).join('0');
        }
        return s.join(dec);
    };
    // Función para convertir "enero 7, 2025 23:26" a un objeto Date válido
    const convertirFecha = (fechaStr) => {
        if (!fechaStr) return new Date('Invalid Date');
        if (fechaStr instanceof Date) return fechaStr;

        const meses = {
            enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
            julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
        };

        // Si ya es formato ISO o parseable directamente
        if (typeof fechaStr === 'string' && (fechaStr.includes('T') || fechaStr.includes('Z'))) {
            const parsed = new Date(fechaStr);
            if (!isNaN(parsed.getTime())) return parsed;
        }

        // Si viene en formato dd-mm-yyyy o dd-mm-yyyy hh:mm
        const regexFechaGuiones = /^(\d{1,2})-(\d{1,2})-(\d{4})(?:\s+(\d{1,2}):(\d{1,2}))?$/;

        if (regexFechaGuiones.test(fechaStr)) {
            const match = fechaStr.match(regexFechaGuiones);
            const dia = parseInt(match[1], 10);
            const mes = parseInt(match[2], 10) - 1; // JavaScript usa meses 0-11
            const anio = parseInt(match[3], 10);
            const hora = match[4] ? parseInt(match[4], 10) : 0;
            const minutos = match[5] ? parseInt(match[5], 10) : 0;
            return new Date(anio, mes, dia, hora, minutos);
        }

        // Formato con nombre del mes: junio 24, 2025 18:38
        const partes = fechaStr.trim().split(' ');
        const mesNombre = partes[0]?.toLowerCase();
        const dia = parseInt(partes[1]?.replace(',', ''), 10);
        const anio = parseInt(partes[2], 10);
        let hora = 0, minutos = 0;

        if (partes.length > 3) {
            const [h, m] = partes[3].split(':');
            hora = parseInt(h, 10);
            minutos = parseInt(m, 10);
        }

        if (mesNombre in meses && !isNaN(dia) && !isNaN(anio)) {
            return new Date(anio, meses[mesNombre], dia, hora, minutos);
        }

        const fallback = new Date(fechaStr);
        if (!isNaN(fallback.getTime())) return fallback;

        // Si nada coincide, retornar fecha inválida
        return new Date('Invalid Date');
    };

    function capitalizarPrimeraLetra(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    function aTitulo(texto) {
        if (!texto) return '';
        const mapeos = {
            'KCG': 'Kit Comunión Grande',
            'KCP': 'Kit Comunión Pequeño',
            'KCE': 'Kit Comunión Económico',
            'KB': 'Kit de Bautizo',
            'CC': 'Cirio de Comunión',
            'CB': 'Cirio de Bautizo',
            'GUANTES-BLANCOS': 'Guantes Blancos',
            'GUANTES-NEGROS': 'Guantes Negros',
            'GUANTES-MITON': 'Guantes Mitón',
            'BLANCOS': 'Guantes Blancos',
            'NEGROS': 'Guantes Negros',
            'MITON': 'Guantes Mitón',
            'GUANTES': 'Guantes',
            'OTR': 'Otros Productos',
            'OTROS': 'Otros Productos',
            'OG': 'Oscar Gómez',
            'LG': 'Leonardo Gómez',
            'K': 'Kits',
            'G': 'Guantes',
        };

        const trimmed = texto.toString().trim();
        if (mapeos[trimmed]) return mapeos[trimmed];
        if (mapeos[trimmed.toUpperCase()]) return mapeos[trimmed.toUpperCase()];

        let limpio = trimmed
            .replace(/^OTR\s*-\s*/i, '')
            .replace(/^GUANTES\s*-\s*/i, '')
            .replace(/^GUANTES\s+/i, 'Guantes ');

        const menores = ['de', 'del', 'la', 'las', 'el', 'los', 'y', 'con', 'en', 'para'];

        return limpio
            .toLowerCase()
            .split(' ')
            .filter(Boolean)
            .map((palabra, idx) => {
                if (idx > 0 && menores.includes(palabra)) return palabra;
                return palabra.charAt(0).toUpperCase() + palabra.slice(1);
            })
            .join(' ');
    }
    function obtenerImagen(categoria, genero) {
        if (categoria === 'kce' || categoria === 'KCE') {
            return 'economico-unisex';
        }
        if (categoria === 'kcg' || categoria === 'kcp' || categoria === 'cc' || categoria === 'KCG' || categoria === 'KCP' || categoria === 'CC') {
            return 'comunion-nin' + (genero === '0' ? 'o' : 'a')
        } else {
            return 'bautizo-nin' + (genero === '0' ? 'o' : 'a')
        }
    }
    const handleBlur = ({ target }) => {
        // Eliminar ceros a la izquierda cuando el campo pierde el foco
        return (target.value).replace(/^0+/, '');
    };
    const formatearPrecio = (precio) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(precio);
    };
    const buscarPrecio = (categoria) => {
        switch (categoria) {
            case 'cb':
                return cb;
            case 'cc':
                return cc;
            case 'kb':
                return kb;
            case 'kcp':
                return kcp;
            case 'kce':
                return kce;
            case 'kcg':
                return kcg;
            case 'BLANCOS':
                return gb;
            case 'NEGROS':
                return gn;
            case 'MITON':
                return gm;
            default:
                return 0;
        }

    };
    const capitalize = (word) => {
        if (!word) return '';
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    };
    const totalizarPreciosFabrica = (categorias, cantidad, anio = new Date().getFullYear()) => {
        let totalFabrica = 0;
        if (categorias) {
            categorias.forEach((categoria, index) => {
                totalFabrica += buscarPrecioxCategoriaAnio(categoria, anio) * (cantidad[index] || 0);
            });
        }
        return totalFabrica;
    }
    const buscarPrecioxCategoriaAnio = (categoria, anio = new Date().getFullYear()) => { //Trae el precio de fabricacion segun el año y la categoria 
        // Buscar el precio según el año y la categoría
        const anioKey = `A${anio}`;
        const preciosAnio = precios[anioKey];
        let precioProducto = 0;
        if (!preciosAnio) return '';
        // Normalizar la categoría a minúsculas para coincidir con las claves

        precioProducto = (categoria === 'KIT COMUNIÓN GRANDE') ? preciosAnio.precioKits.kcg :
            (categoria === 'KIT COMUNIÓN PEQUEÑO') ? preciosAnio.precioKits.kcp :
                (categoria === 'KIT DE BAUTIZO') ? preciosAnio.precioKits.kb :
                    (categoria === 'KIT COMUNIÓN ECONOMICO (Nuevo producto)') ? preciosAnio.precioKits.kce :
                        (categoria === 'CIRIO DE COMUNIÓN') ? preciosAnio.precioCirios.cc :
                            (categoria === 'CIRIO DE BAUTIZO') ? preciosAnio.precioCirios.cb :
                                (categoria === 'GUANTES BLANCOS') ? preciosAnio.precioGuantes.gb :
                                    (categoria === 'GUANTES NEGROS') ? preciosAnio.precioGuantes.gn :
                                        (categoria === 'GUANTES MITON') ? preciosAnio.precioGuantes.gm : 0;

        return precioProducto;
    }
    const buscarNombre = (categoria) => { //Busca el nombre de la categoria por la categoria que llegue
        if (!categoria) return '';
        const nombre = (categoria === 'KCG') ? 'KIT COMUNIÓN GRANDE' :
            (categoria === 'KCP') ? 'KIT COMUNIÓN PEQUEÑO' :
                (categoria === 'KCE') ? 'KIT COMUNIÓN ECONOMICO (Nuevo producto)' :
                    (categoria === 'KB') ? 'KIT DE BAUTIZO' :
                        (categoria === 'CC') ? 'CIRIO DE COMUNIÓN' :
                            (categoria === 'CB') ? 'CIRIO DE BAUTIZO' :
                                (categoria === 'BLANCOS' || categoria === 'GUANTES-BLANCOS' || categoria === 'GB') ? 'GUANTES BLANCOS' :
                                    (categoria === 'NEGROS' || categoria === 'GN' || categoria === 'GUANTES-NEGROS') ? 'GUANTES NEGROS' :
                                        (categoria === 'MITON' || categoria === 'GM' || categoria === 'GUANTES-MITON') ? 'GUANTES MITON' :
                                            (categoria === 'GUANTES') ? 'GUANTES' :
                                                (categoria === 'G') ? 'GENERAL' :
                                                    categoria;

        return nombre;
    }
    const convertirNumeroATexto = (numero) => {
        const numaletInstance = numalet({
            moneda: 'PESOS',       // Aquí especificamos 'PESOS' como moneda
            prefijo: 'PESOS',           // Sin prefijo
            sufijo: 'PESOS.',        // Agregar 'M.N.' al final
            mayusculas: true       // Convertir todo a mayúsculas
        });

        return (numaletInstance(numero)).replace('MXN', 'PESOS');;
    };
    const calcularTotalesPedidos = (cat, pedidos, setData, setLables, datosUsuario, anio) => {
        // Objeto para almacenar las sumas por categoría
        const totalesPorCategoria = {};
        const labels = [];
        const data = [];
        let totalUnitarios = 0;

        if (!Array.isArray(pedidos)) return [];

        pedidos.forEach((venta) => {
            const idUserPedido = (venta.user?._id || venta.user)?.toString();
            const fecha = convertirFecha(venta.fechaCreacion);
            const aniofiltro = parseInt(fecha.getFullYear());

            if (aniofiltro !== anio) return;
            if (esKarol && idUserPedido !== user.uid) return;
            if (!datosUsuario && idUserPedido !== user.uid) return;

            const items = venta?.itemPedido || [];

            items.forEach(({ itemPedido }) => {
                if (!itemPedido) return;
                Object.entries(itemPedido).forEach(([categoria, { pedido }]) => {
                    if (!pedido || !Array.isArray(pedido)) return;

                    if (categoria === "GUANTES") {
                        if (esKarol && idUserPedido !== user.uid) return;
                        if (esLeonardo && !esUserLeonardo(idUserPedido) && !esUserKarol(idUserPedido)) return;
                        if (!esOscar && !esLeonardo && idUserPedido !== user.uid) return;
                        if (cat === "guantes" || cat === "todos") {
                            const subcategorias = {};

                            pedido.forEach((item) => {
                                const subcategoria = item.categoria;
                                const cantidad = parseInt(item.cantidad || 0);
                                const precio = Number(item.precioUnitario || item.precio || 0);

                                if (!subcategorias[subcategoria]) {
                                    subcategorias[subcategoria] = {
                                        cantidad: 0,
                                        totalPrecio: 0,
                                        precioUnitario: precio,
                                    };
                                }

                                subcategorias[subcategoria].cantidad += cantidad;
                                subcategorias[subcategoria].totalPrecio += precio * cantidad;

                                // acumular unitarios si no es distribuidor
                                if (!venta.cliente?.distribuidor) {
                                    totalUnitarios += cantidad;
                                }
                            });

                            Object.entries(subcategorias).forEach(([subcategoria, datosSubcategoria]) => {
                                if (!totalesPorCategoria[categoria]) {
                                    totalesPorCategoria[categoria] = {};
                                }

                                if (!totalesPorCategoria[categoria][subcategoria]) {
                                    totalesPorCategoria[categoria][subcategoria] = {
                                        cantidad: 0,
                                        totalPrecio: 0,
                                    };
                                }

                                totalesPorCategoria[categoria][subcategoria].cantidad += datosSubcategoria.cantidad;
                                totalesPorCategoria[categoria][subcategoria].totalPrecio += datosSubcategoria.totalPrecio;
                            });
                        }
                    } else if (categoria === "OTR" || categoria === "OTROS") {
                        pedido.forEach((item) => {
                            const producto = item.producto || '';
                            const esGuante = producto.toLowerCase().includes('guante');
                            if (esGuante) {
                                if (esKarol && idUserPedido !== user.uid) return;
                                if (esLeonardo && !esUserLeonardo(idUserPedido) && !esUserKarol(idUserPedido)) return;
                                if (!esOscar && !esLeonardo && idUserPedido !== user.uid) return;
                            }

                            const cantidad = parseInt(item.cantidad || 0);
                            const precio = Number(item.precioUnitario || item.precio || 0);

                            // Si es un producto que dice guante y se consultó guantes o todos
                            if (esGuante && (cat === "guantes" || cat === "todos")) {
                                if (!totalesPorCategoria["GUANTES"]) {
                                    totalesPorCategoria["GUANTES"] = {};
                                }
                                const guanteKey = producto.toUpperCase().startsWith('GUANTE') ? producto : `GUANTES ${producto}`;
                                if (!totalesPorCategoria["GUANTES"][guanteKey]) {
                                    totalesPorCategoria["GUANTES"][guanteKey] = {
                                        cantidad: 0,
                                        totalPrecio: 0,
                                        precioUnitario: precio,
                                    };
                                }
                                totalesPorCategoria["GUANTES"][guanteKey].cantidad += cantidad;
                                totalesPorCategoria["GUANTES"][guanteKey].totalPrecio += precio * cantidad;
                            }

                            // Si se consulta otros (o todos si no es guante)
                            if (cat === "otros" || (cat === "todos" && !esGuante)) {
                                if (!totalesPorCategoria[categoria]) {
                                    totalesPorCategoria[categoria] = {};
                                }
                                if (!totalesPorCategoria[categoria][producto]) {
                                    totalesPorCategoria[categoria][producto] = {
                                        cantidad: 0,
                                        totalPrecio: 0,
                                        precioUnitario: precio
                                    };
                                }
                                totalesPorCategoria[categoria][producto].cantidad += cantidad;
                                totalesPorCategoria[categoria][producto].totalPrecio += precio * cantidad;
                            }

                            if (!venta.cliente?.distribuidor) {
                                totalUnitarios += cantidad;
                            }
                        });
                    } else {
                        if (cat === "kits" || cat === "todos") {
                            if (!totalesPorCategoria[categoria]) {
                                totalesPorCategoria[categoria] = {
                                    cantidad: 0,
                                    totalPrecio: 0,
                                    distribuidor: venta.user?.distribuidor,
                                };
                            }

                            pedido.forEach((item) => {
                                const cantidad = parseInt(item.cantidad || 0);
                                const precio = Number(item.precioUnitario || item.precio || 0);

                                totalesPorCategoria[categoria].cantidad += cantidad;
                                totalesPorCategoria[categoria].totalPrecio += precio * cantidad;

                                if (!venta.cliente?.distribuidor) {
                                    totalUnitarios += cantidad;
                                }
                            });
                        }
                    }
                });
            });
        });

        const resultadoTotales = [];
        Object.entries(totalesPorCategoria).forEach(([categoria, subcategorias]) => {
            if (categoria === 'GUANTES') {
                if (cat === 'guantes' || cat === 'todos') {
                    Object.entries(subcategorias).forEach(([subcategoria, datosSubcategoria]) => {
                        resultadoTotales.push({
                            categoria: `${subcategoria}`,
                            cantidad: datosSubcategoria.cantidad,
                            totalPrecio: datosSubcategoria.totalPrecio,
                        });
                        labels.push(`${buscarNombre(subcategoria)}`);
                        data.push(datosSubcategoria.cantidad);
                    });
                }
            } else if (categoria === 'OTR' || categoria === 'OTROS') {
                if (cat === 'otros' || cat === 'todos') {
                    Object.entries(subcategorias).forEach(([producto, datosProducto]) => {
                        resultadoTotales.push({
                            categoria: `OTR - ${producto}`,
                            cantidad: datosProducto.cantidad,
                            totalPrecio: datosProducto.totalPrecio,
                        });
                        labels.push(`OTR - ${producto}`);
                        data.push(datosProducto.cantidad);
                    });
                }
            } else {
                if (cat === 'kits' || cat === 'todos') {
                    resultadoTotales.push({
                        categoria,
                        cantidad: subcategorias.cantidad,
                        totalPrecio: subcategorias.totalPrecio,
                        distribuidor: subcategorias.distribuidor || 'Sin definir'
                    });
                    labels.push(buscarNombre(categoria));
                    data.push(subcategorias.cantidad);
                }
            }
        });
        if (typeof setLables === 'function') setLables(labels);
        if (typeof setData === 'function') setData(data);
        return resultadoTotales;
    };
    const totalesPedidos = (pedidos, datosUsuario, anioFiltro) => {// Esto es para las estadisticas mensuales
        let totalSales = 0;
        let totalOrders = 0;
        let currentMonthSales = 0;
        let pendientes = 0;
        let pagado = 0;
        let enviado = 0;
        const currentMonth = new Date().getMonth();
        const currentYear = anioFiltro;
        const monthlySales2025 = Array(12).fill(0);
        const monthlyProductCounts = Array(12).fill(0);

        if (!Array.isArray(pedidos)) {
            return {
                totalSales: 0,
                totalOrders: 0,
                currentMonthSales: 0,
                monthlySales2025,
                monthlyProductCounts,
                pendientes: 0,
                pagado: 0,
                enviado: 0
            };
        }

        pedidos.forEach(order => {
            const orderDate = convertirFecha(order.fechaCreacion);

            if (orderDate.getFullYear() !== anioFiltro) {
                return; // Si el año de la orden no coincide con el año filtrado, salta a la siguiente orden
            }
            const orderUserId = (order.user?._id || order.user)?.toString();
            if (!datosUsuario && orderUserId !== user.uid) return;

            const orderDate2 = (convertirFecha(order.fechaCreacion)).getFullYear();
            if (orderDate2 === currentYear) {
                if (order.estado === "pendiente") { pendientes++ }
                if (order.estado === "pagado") { pagado++ }
                if (order.estado === 'enviado') { enviado++ }
                totalOrders++;

                (order.itemPedido || []).forEach(item => {
                    Object.entries(item.itemPedido || {}).forEach(([categoriaKey, category]) => {
                        (category.pedido || []).forEach(product => {
                            const prodName = product.producto || '';
                            const esGuante = categoriaKey === 'GUANTES' || categoriaKey.includes('GUANTE') || prodName.toLowerCase().includes('guante');
                            if (esGuante && !esOscar && orderUserId !== user.uid) return;

                            const price = Number(product.precioUnitario || product.precio || 0);
                            const quantity = parseInt(product.cantidad, 10) || 0;
                            const sale = price * quantity;
                            totalSales += sale;

                            const orderDate = convertirFecha(order.fechaCreacion);
                            if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
                                currentMonthSales += sale;
                            }
                            if (orderDate.getFullYear() === currentYear) {
                                monthlySales2025[orderDate.getMonth()] += sale;
                                monthlyProductCounts[orderDate.getMonth()] += quantity;
                            }
                        });
                    });
                });
            }
        });
        return {
            totalSales,
            totalOrders,
            currentMonthSales,
            monthlySales2025,
            monthlyProductCounts,
            pendientes,
            pagado,
            enviado
        };
    }
    const totalKitsXAnio = (pedidos, datosUsuario, anioFiltro = 2026) => {
        let totalSales = 0;
        const monthlySales = [...Array(12).fill(0)]; // Inicializa directamente con 12 meses

        if (!Array.isArray(pedidos)) return { monthlySales, totalSales };

        pedidos.forEach(order => {
            const orderDate = convertirFecha(order.fechaCreacion);
            if (orderDate.getFullYear() !== anioFiltro) {
                return; // Si el año de la orden no coincide con el año filtrado, salta a la siguiente orden
            }
            const orderUserId = (order.user?._id || order.user)?.toString();
            if (esKarol && orderUserId !== user.uid) return;
            const perteneceAlUsuario = datosUsuario !== true
                ? orderUserId === user.uid
                : true;

            if (!perteneceAlUsuario) return;

            (order.itemPedido || []).forEach(item => {
                Object.entries(item.itemPedido || {}).forEach(([categoriaItem, category]) => {
                    if (['KCG', 'KCP', 'KB', 'CC', 'CB', 'KCE'].includes(categoriaItem)) {
                        (category.pedido || []).forEach(product => {
                            const price = Number(product.precioUnitario || product.precio || 0);
                            const quantity = parseInt(product.cantidad, 10) || 0;
                            const sale = price * quantity;

                            totalSales += sale;

                            const orderDate = convertirFecha(order.fechaCreacion);
                            const month = orderDate.getMonth();
                            monthlySales[month] += sale;
                        });
                    }
                });
            });
        });
        return {
            monthlySales,
            totalSales
        };
    };
    const totalKitsXAnioResults = (pedidos, selectFechas = [new Date().getFullYear()]) => {
        if (pedidos.length === 0) return {};

        // Inicializar estructura para cada año solicitado
        const results = {};
        selectFechas.forEach(year => {
            results[year] = {
                monthlySales: Array(12).fill(0),
                monthlySalesBrand: Array(12).fill(0),
                monthlySalesOscar: Array(12).fill(0),
                totalSales: 0
            };
        });

        pedidos.forEach(order => {
            const orderDate = convertirFecha(order.fechaCreacion);
            const year = orderDate.getFullYear();

            // Si el año de la orden no está en los solicitados, saltar
            if (!results[year]) return;

            (order.itemPedido || []).forEach(item => {
                Object.entries(item.itemPedido || {}).forEach(([categoriaItem, category]) => {
                    if (['KCG', 'KCP', 'KB', 'CC', 'CB'/* , 'KCE' */].includes(categoriaItem)) {
                        (category.pedido || []).forEach(product => {
                            const price2 = buscarPrecioxCategoriaAnio(buscarNombre(categoriaItem), year);
                            const quantity = parseInt(product.cantidad, 10) || 0;
                            const sale = price2 * quantity;

                            const month = orderDate.getMonth();
                            results[year].monthlySales[month] += sale;
                            results[year].totalSales += sale;

                            const orderUserId = (order.user?._id || order.user)?.toString();
                            const clienteStr = String(order.cliente?.nombre || order.cliente || '').toUpperCase();
                            const esBrand = clienteStr.includes('BRAND DESIGN') || order.esBrandDesign;
                            if (orderUserId === '679fce0ee8d1ed66d21d18c2' || (!orderUserId && !esBrand && clienteStr)) {
                                results[year].monthlySalesOscar[month] += sale;
                            }
                            if (orderUserId === '6789ce1b48932f890985d1f7' || (!orderUserId && esBrand)) {
                                results[year].monthlySalesBrand[month] += sale;
                            }
                        });
                    }
                });
            });
        });

        return results;
    };
    const totalGuantesXAnio = (pedidos, datosUsuario, anioFiltro = 2026) => {
        let totalSales = 0;
        let totalSalesLeo = 0;
        let totalSalesKarol = 0;
        let totalSalesGuantesLeo = 0; // Para Oscar: guantes vendidos por Leonardo
        let unidadesLeo = 0;
        let unidadesKarol = 0;
        let unidadesGuantesLeo = 0;

        const monthlySales = [...Array(12).fill(0)];
        const monthlySalesLeo = [...Array(12).fill(0)];
        const monthlySalesKarol = [...Array(12).fill(0)];
        const monthlySalesGuantesLeo = [...Array(12).fill(0)];

        if (!Array.isArray(pedidos)) return {
            monthlySales,
            totalSales,
            totalSalesLeo,
            totalSalesKarol,
            totalSalesGuantesLeo,
            unidadesLeo,
            unidadesKarol,
            unidadesGuantesLeo,
            monthlySalesLeo,
            monthlySalesKarol,
            monthlySalesGuantesLeo
        };

        pedidos.forEach(order => {
            const orderDate = convertirFecha(order.fechaCreacion);
            if (orderDate.getFullYear() !== anioFiltro) return;

            const orderUserId = (order.user?._id || order.user)?.toString();
            const orderUserName = (order.user?.name || '').toLowerCase();
            const orderUserEmail = (order.user?.email || '').toLowerCase();

            // Si es Karol: estrictamente sus pedidos
            if (esKarol && orderUserId !== user.uid) return;

            // Si es Leonardo: solo pedidos de Leonardo y de Karol (se excluye Oscar u otros)
            if (esLeonardo && !esUserLeonardo(orderUserId, orderUserName) && !esUserKarol(orderUserId, orderUserName, orderUserEmail)) return;

            // Si no es Oscar ni Leonardo: solo pedidos propios si datosUsuario es false
            if (!esOscar && !esLeonardo && orderUserId !== user.uid) return;
            if (!datosUsuario && orderUserId !== user.uid) return;

            (order.itemPedido || []).forEach(item => {
                Object.entries(item.itemPedido || {}).forEach(([categoriaItem, category]) => {
                    const esCatGuantes = categoriaItem === 'GUANTES';
                    const esCatOtros = categoriaItem === 'OTR' || categoriaItem === 'OTROS';

                    if (esCatGuantes || esCatOtros) {
                        (category.pedido || []).forEach(product => {
                            const prodName = product.producto || '';
                            const esGuante = esCatGuantes || prodName.toLowerCase().includes('guante');
                            if (!esGuante) return;

                            const price = Number(product.precioUnitario || product.precio || 0);
                            const quantity = parseInt(product.cantidad, 10) || 0;
                            const sale = price * quantity;
                            const month = orderDate.getMonth();

                            totalSales += sale;
                            monthlySales[month] += sale;

                            // Atribución para Leonardo (separación Leo vs Karol)
                            if (esUserLeonardo(orderUserId, orderUserName)) {
                                totalSalesLeo += sale;
                                unidadesLeo += quantity;
                                monthlySalesLeo[month] += sale;
                            } else if (esUserKarol(orderUserId, orderUserName, orderUserEmail)) {
                                totalSalesKarol += sale;
                                unidadesKarol += quantity;
                                monthlySalesKarol[month] += sale;
                            }

                            // Atribución para Oscar (ventas de guantes de Leonardo)
                            if (esUserLeonardo(orderUserId, orderUserName)) {
                                totalSalesGuantesLeo += sale;
                                unidadesGuantesLeo += quantity;
                                monthlySalesGuantesLeo[month] += sale;
                            }
                        });
                    }
                });
            });
        });

        return {
            monthlySales,
            totalSales,
            totalSalesLeo,
            totalSalesKarol,
            totalSalesGuantesLeo,
            unidadesLeo,
            unidadesKarol,
            unidadesGuantesLeo,
            monthlySalesLeo,
            monthlySalesKarol,
            monthlySalesGuantesLeo
        };
    };
    const totalOtrosXAnio = (pedidos, datosUsuario, anioFiltro) => {
        let totalSales = 0;
        const monthlySales = Array(12).fill(0); // 12 meses

        if (!Array.isArray(pedidos)) return { monthlySales, totalSales };

        pedidos.forEach(order => {
            const orderDate = convertirFecha(order.fechaCreacion);
            if (orderDate.getFullYear() !== anioFiltro) {
                return; // Si el año de la orden no coincide con el año filtrado, salta a la siguiente orden
            }
            const orderUserId = (order.user?._id || order.user)?.toString();
            if (esKarol && orderUserId !== user.uid) return;
            if (!datosUsuario && orderUserId !== user.uid) return;

            (order.itemPedido || []).forEach(item => {
                Object.entries(item.itemPedido || {}).forEach(([categoriaItem, category]) => {
                    if (categoriaItem === 'OTR' || categoriaItem === 'OTROS') {
                        (category.pedido || []).forEach(product => {
                            const prodName = product.producto || '';
                            const esGuante = prodName.toLowerCase().includes('guante');
                            if (esGuante) return; // Se suma y totaliza en Guantes!

                            const price = Number(product.precioUnitario || product.precio || 0);
                            const quantity = parseInt(product.cantidad, 10) || 0;
                            const sale = price * quantity;

                            totalSales += sale;

                            const month = orderDate.getMonth();
                            monthlySales[month] += sale;
                        });
                    }
                });
            });
        });

        return {
            monthlySales,
            totalSales
        };
    };
    const totalesPedidosAnuales = (pedidos, datosUsuario, anioFiltro) => { //Para calculos por años
        const monthlySales = Array(12).fill(0);

        if (!Array.isArray(pedidos)) return { monthlySales };

        pedidos.forEach(order => {
            const orderDate = convertirFecha(order.fechaCreacion);
            if (orderDate.getFullYear() !== anioFiltro) return;

            const orderUserId = (order.user?._id || order.user)?.toString();
            if (esKarol && orderUserId !== user.uid) return;
            if (!datosUsuario && orderUserId !== user.uid) return;

            (order.itemPedido || []).forEach(item => {
                Object.entries(item.itemPedido || {}).forEach(([categoriaKey, category]) => {
                    (category.pedido || []).forEach(product => {
                        const prodName = product.producto || '';
                        const esGuante = categoriaKey === 'GUANTES' || categoriaKey.includes('GUANTE') || prodName.toLowerCase().includes('guante');
                        if (esGuante) {
                            if (esKarol && orderUserId !== user.uid) return;
                            if (esLeonardo && !esUserLeonardo(orderUserId) && !esUserKarol(orderUserId)) return;
                            if (!esOscar && !esLeonardo && orderUserId !== user.uid) return;
                        }

                        const price = Number(product.precioUnitario || product.precio || 0);
                        const quantity = parseInt(product.cantidad, 10) || 0;
                        const sale = price * quantity;
                        monthlySales[orderDate.getMonth()] += sale;
                    });
                });
            });
        });
        return {
            monthlySales
        };
    }
    const totalesPedidosAnualesPorCategoria = (
        pedidos,
        datosUsuario,
        categoria,
        oldOrders,
        anioFiltro
    ) => {
        if (!Array.isArray(pedidos)) return null;

        let totalSales = 0;
        const monthlySales = Array(12).fill(0);
        const currentYear = anioFiltro;
        let cont = 0;
        let totalNino = 0;
        let totalNina = 0;

        pedidos.forEach(order => {
            if (!order?.fechaCreacion) return;

            const orderDate = convertirFecha(order.fechaCreacion);
            if (orderDate.getFullYear() !== currentYear) return;

            const orderUserId = (order.user?._id || order.user)?.toString();
            if (esKarol && orderUserId !== user.uid) return;
            if (!datosUsuario && orderUserId !== user.uid) return;

            order.itemPedido?.forEach(item => {
                Object.entries(item.itemPedido || {}).forEach(([categoriaItem, category]) => {
                    if (!Array.isArray(category?.pedido)) return;

                    // ===== CATEGORÍAS PRINCIPALES =====
                    if (['KCG', 'KCP', 'KB', 'CC', 'CB', 'OTR', 'KCE'].includes(categoriaItem)) {
                        if (categoriaItem !== categoria) return;

                        category.pedido.forEach(product => {
                            const prodName = product.producto || '';
                            const esGuante = categoriaItem.includes('GUANTE') || prodName.toLowerCase().includes('guante');
                            if (esGuante) {
                                if (esKarol && orderUserId !== user.uid) return;
                                if (esLeonardo && !esUserLeonardo(orderUserId) && !esUserKarol(orderUserId)) return;
                                if (!esOscar && !esLeonardo && orderUserId !== user.uid) return;
                            }

                            const price =
                                parseInt(product.precioUnitario) ||
                                parseInt(product.precio) ||
                                0;

                            const quantity = parseInt(product.cantidad, 10) || 0;

                            totalSales += price * quantity;
                            monthlySales[orderDate.getMonth()] += quantity;
                            cont++;

                            if (String(product.genero) === '0') totalNino += quantity;
                            if (String(product.genero) === '1') totalNina += quantity;
                        });

                        return; // ← CORTE CLAVE (evita duplicación)
                    }

                    // ===== SUBCATEGORÍAS =====
                    const subCategoria = categoria.split('-')[1];
                    if (!subCategoria) return;

                    const esGuanteSub = categoria.toUpperCase().includes('GUANTE') || categoriaItem === 'GUANTES';
                    if (esGuanteSub) {
                        if (esKarol && orderUserId !== user.uid) return;
                        if (esLeonardo && !esUserLeonardo(orderUserId) && !esUserKarol(orderUserId)) return;
                        if (!esOscar && !esLeonardo && orderUserId !== user.uid) return;
                    }

                    category.pedido.forEach(product => {
                        if (product.categoria !== subCategoria) return;

                        const price =
                            parseInt(product.precioUnitario) ||
                            parseInt(product.precio) ||
                            0;

                        const quantity = parseInt(product.cantidad, 10) || 0;

                        totalSales += price * quantity;
                        monthlySales[orderDate.getMonth()] += quantity;
                        cont++;

                        if (String(product.genero) === '0') totalNino += quantity;
                        if (String(product.genero) === '1') totalNina += quantity;
                    });
                });
            });
        });

        return {
            monthlySales,
            totalSales,
            cont,
            totalNino,
            totalNina
        };
    };

    const calculaTotalPedido = (pedido, costoEnvio = 0) => {
        if (pedido?.itemPedido) {
            // Calcular el total general
            const total = pedido.itemPedido.reduce((acc, item) => {
                const totalPorItem = Object.values(item?.itemPedido || {}).reduce((subAcc, { pedido }) => {
                    const totalPorCategoria = pedido?.reduce((catAcc, pedidoItem) => {
                        const total = pedidoItem?.precioUnitario
                            ? pedidoItem?.precioUnitario * pedidoItem?.cantidad
                            : pedidoItem?.precio * pedidoItem?.cantidad || 0;
                        return catAcc + total;
                    }, 0);
                    return subAcc + totalPorCategoria;
                }, 0);
                return acc + totalPorItem;
            }, 0);
            return formatearPrecio(total + costoEnvio);
        }
    }
    const totalGastosUsuarios = (gastos, anioComparar, datosUsuario, categoria = 'K') => {
        if (!gastos) {
            const empty = [0, 0, 0];
            empty.data = [0, 0];
            empty.labels = ['OG', 'LG'];
            empty.title = 'GASTOS';
            empty.totalGastos = 0;
            return empty;
        }

        let totalGastos = 0;
        let gastosOG = 0;
        let gastosLG = 0;
        let gastosOtros = 0;

        if (datosUsuario) {
            // Modo Global: Distribución de gastos de la categoría (Kits por defecto) entre usuarios
            gastos.forEach(gasto => {
                if (categoria && gasto.categoria !== categoria) return;
                const fechaGasto = convertirFecha(gasto.fecha);
                const anio = fechaGasto.getFullYear();
                if (parseInt(anio) === parseInt(anioComparar)) {
                    const gastoUserId = (gasto.user?._id || gasto.user)?.toString();
                    const subtotal = (Number(gasto.precio) || 0) * (Number(gasto.cantidad) || 0);

                    if (gastoUserId === '679fce0ee8d1ed66d21d18c2') {
                        gastosOG += subtotal;
                        totalGastos += subtotal;
                    } else if (gastoUserId === '6789ce1b48932f890985d1f7') {
                        // En los gastos de Leonardo solamente ver lo referente a categoría KITS
                        if (gasto.categoria === 'K') {
                            gastosLG += subtotal;
                            totalGastos += subtotal;
                        }
                    } else {
                        gastosOtros += subtotal;
                        totalGastos += subtotal;
                    }
                }
            });

            const labels = ['OG', 'LG'];
            const data = [gastosOG, gastosLG];
            if (gastosOtros > 0) {
                labels.push('Otros');
                data.push(gastosOtros);
            }

            const catNombre = categoria === 'K' ? 'KITS' : categoria === 'G' ? 'GUANTES' : 'GENERAL';
            const title = `GASTOS ${catNombre}: ${formatearPrecio(totalGastos)}`;

            const result = [totalGastos, gastosOG, gastosLG];
            result.data = data;
            result.labels = labels;
            result.title = title;
            result.totalGastos = totalGastos;
            result.gastosOG = gastosOG;
            result.gastosLG = gastosLG;
            return result;
        } else {
            // Modo Usuario Logueado: Distribución de sus gastos por categorías
            let gastosKits = 0;
            let gastosGuantes = 0;
            let gastosOtrosCat = 0;
            const isLeonardo = user.uid === '6789ce1b48932f890985d1f7';

            gastos.forEach(gasto => {
                const fechaGasto = convertirFecha(gasto.fecha);
                const anio = fechaGasto.getFullYear();
                if (parseInt(anio) === parseInt(anioComparar)) {
                    const gastoUserId = (gasto.user?._id || gasto.user)?.toString();
                    if (gastoUserId === user.uid) {
                        const subtotal = (Number(gasto.precio) || 0) * (Number(gasto.cantidad) || 0);

                        if (isLeonardo) {
                            // En los gastos de Leonardo solamente ver los referentes a la categoría KITS
                            if (gasto.categoria === 'K') {
                                gastosKits += subtotal;
                                totalGastos += subtotal;
                            }
                        } else {
                            totalGastos += subtotal;
                            if (gasto.categoria === 'K') {
                                gastosKits += subtotal;
                            } else if (gasto.categoria === 'G') {
                                gastosGuantes += subtotal;
                            } else {
                                gastosOtrosCat += subtotal;
                            }
                        }
                    }
                }
            });

            const labels = isLeonardo ? ['KITS'] : ['KITS', 'GUANTES'];
            const data = isLeonardo ? [gastosKits] : [gastosKits, gastosGuantes];
            if (!isLeonardo && gastosOtrosCat > 0) {
                labels.push('OTROS');
                data.push(gastosOtrosCat);
            }

            const title = `GASTOS (${user.name || 'USUARIO'}): ${formatearPrecio(totalGastos)}`;

            const result = [totalGastos, gastosKits, gastosGuantes];
            result.data = data;
            result.labels = labels;
            result.title = title;
            result.totalGastos = totalGastos;
            result.gastosKits = gastosKits;
            result.gastosGuantes = gastosGuantes;
            result.gastosOtrosCat = gastosOtrosCat;
            return result;
        }
    };
    const mensualGastosUsuarios = (gastos, anioComparar, categoria) => {
        if (!gastos) return;

        // Inicializa 12 meses en 0
        const gastosMensualesO = new Array(12).fill(0);
        const gastosMensualesL = new Array(12).fill(0);

        gastos.forEach(gasto => {
            const fechaGasto = convertirFecha(gasto.fecha);
            const anio = fechaGasto.getFullYear();
            const mes = fechaGasto.getMonth(); // 0 = Enero, 11 = Diciembre

            if (anio !== anioComparar) return;
            if (gasto.categoria !== categoria) return;

            const subtotal = gasto.precio * gasto.cantidad;
            if (gasto.user === '679fce0ee8d1ed66d21d18c2') {
                gastosMensualesO[mes] += subtotal;
                return;
            }
            if (gasto.user === '6789ce1b48932f890985d1f7') {
                gastosMensualesL[mes] += subtotal;
                return;
            }
        });
        return { gastosMensualesO, gastosMensualesL };
    };
    const mensualGastos = (gastos, anioComparar, categoria) => {
        if (!gastos) return;

        // Inicializa 12 meses en 0
        const gastosMensuales = new Array(12).fill(0);

        gastos.forEach(gasto => {
            const fechaGasto = convertirFecha(gasto.fecha);
            const anio = fechaGasto.getFullYear();
            const mes = fechaGasto.getMonth(); // 0 = Enero, 11 = Diciembre

            if (anio !== anioComparar) return;
            if (gasto.categoria !== categoria) return;

            const subtotal = gasto.precio * gasto.cantidad;
            gastosMensuales[mes] += subtotal;
            return;
        });
        return gastosMensuales;
    };
    const calcularTotalesPedidoCxC = (pedido) => { /* retorna el total de cantidades y de venta por pedido */
        if (!pedido?.itemPedido) return;

        let totalItems = 0;
        let totalKits = [0, 0, 0, 0, 0, 0];
        let totalGuantes = [0, 0, 0];
        let totalOtros = 0;

        const total = pedido.itemPedido.reduce((acc, item) => {
            const subTotal = Object.entries(item?.itemPedido || {}).reduce((catAcc, [categoriaKey, categoria]) => {
                const categoriaTotal = (categoria?.pedido || []).reduce((prodAcc, pedidoItem) => {
                    const cantidad = pedidoItem?.cantidad || 0;
                    const precioUnitario = pedidoItem?.precioUnitario ?? pedidoItem?.precio ?? 0;
                    const totalPorProducto = precioUnitario * cantidad;
                    totalItems += parseInt(cantidad); // Contar cada cantidad
                    if (categoriaKey === 'GUANTES') {
                        if (pedidoItem.categoria === 'BLANCOS') {
                            totalGuantes[0] += totalPorProducto;
                        } else if (pedidoItem.categoria === 'NEGROS') {
                            totalGuantes[1] += totalPorProducto;
                        } else if (pedidoItem.categoria === 'MITON') {
                            totalGuantes[2] += totalPorProducto;
                        }
                    } else if (categoriaKey === 'OTR') {
                        totalOtros += totalPorProducto;
                    } else if (categoriaKey === 'KCG') {
                        totalKits[0] += totalPorProducto;
                    } else if (categoriaKey === 'KCP') {
                        totalKits[1] += totalPorProducto;
                    } else if (categoriaKey === 'KB') {
                        totalKits[2] += totalPorProducto;
                    } else if (categoriaKey === 'CC') {
                        totalKits[3] += totalPorProducto;
                    } else if (categoriaKey === 'CB') {
                        totalKits[4] += totalPorProducto;
                    } else if (categoriaKey === 'KCE') {
                        totalKits[5] += totalPorProducto;
                    }
                    return prodAcc + totalPorProducto;
                }, 0);
                return catAcc + categoriaTotal;
            }, 0);
            return acc + subTotal;
        }, 0);
        return {
            total,
            totalItems,
            totalKits,
            totalGuantes,
            totalOtros
        };
    };



    return {
        //*Parameters
        pastelColors,

        //*Methods
        buscarNombre,
        buscarPrecio,
        buscarPrecioxCategoriaAnio,
        calcularTotalesPedidoCxC,
        calcularTotalesPedidos,
        calculaTotalPedido,
        capitalizarPrimeraLetra,
        aTitulo,
        capitalize,
        convertirFecha,
        convertirFechaIngles,
        parsearFechaGasto,
        convertirNumeroATexto,
        formatearPrecio,
        handleBlur,
        limpiarFecha,
        fechaCorta,
        number_format,
        obtenerImagen,
        totalesPedidos,
        totalesPedidosAnuales,
        totalesPedidosAnualesPorCategoria,
        totalGastosUsuarios,
        mensualGastos,
        totalGuantesXAnio,
        totalizarPreciosFabrica,
        totalKitsXAnioResults,
        totalKitsXAnio,
        totalOtrosXAnio,
        formatearFechaConNombreMes,
        convertirOldFecha,
        mensualGastosUsuarios,
        esOscar,
        esLeonardo,
        esKarol,
        esUserOscar,
        esUserLeonardo,
        esUserKarol,
        esProductoGuante,
        UID_OSCAR,
        UID_LEONARDO,
        UID_KAROL
    }

}
